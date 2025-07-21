from django.http import JsonResponse
from rest_framework.exceptions import ParseError, ValidationError
from django.middleware import csrf
from django.utils import timezone
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.exceptions import NotFound, AuthenticationFailed
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from .models import Profile, OtpToken
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserSerializer, RegisterSerializer, TokenObtain, ProfileSerializer, OtpSerializer, LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from .utils.tokens import create_jwt_token, create_cookies
from .utils.otp_token import generate_otp
from .tasks import send_otp_to_user
from django.conf import settings
from .signals import send_otp_to_email
import time

User = get_user_model()



# GET JWT token
class MyTokenObtainPairView(TokenObtainPairView):

    serializer_class = TokenObtain



class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None


    def validate(self, attrs):
        attrs['refresh'] = self.context["request"].COOKIES.get('refresh')

        if attrs['refresh']:
            return super().validate(attrs)

        else:
            raise InvalidToken(detail="Refresh Token inválido")


class CookieRefreshView(TokenRefreshView):
    serializer_class = CookieTokenRefreshSerializer



    def finalize_response(self, request, response, *args, **kwargs):

        if response.data.get('refresh'):
            response.set_cookie(
                key='refresh',
                value=response.data.get('refresh'),
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=False,
                httponly=True,
                samesite="Lax"
            )

            del response.data['refresh']

        response["X-CSRFToken"] = request.COOKIES.get("csrftoken")

        return super().finalize_response(request, response, *args, **kwargs)







class OtpVerifyView(APIView):



    permission_classes = [AllowAny]


    def get_otp(self, url_code, otp_token=None):
        """
        Busca um objeto OtpToken com base no código da URL e, opcionalmente, no token OTP.

        :param url_code: Código único enviado na URL para identificar o token.
        :param otp_token: (Opcional) Código numérico OTP digitado pelo usuário.
        :return: Instância de OtpToken correspondente aos filtros fornecidos.
        :raises NotFound: Se nenhum OTPToken for encontrado com os parâmetros informados.
        """
        filters = {"url_code": url_code}

        if otp_token:
            filters['otp_token'] = otp_token

        try:
            otp = OtpToken.objects.get(**filters)

        except OtpToken.DoesNotExist:

            raise NotFound(detail="Código inválido")


        return otp

    # Quando o usuário entrar na página de confirmação de email, será enviado uma request para essa view para verificar se o url OTP é valido
    def get(self, r):
        """
        Verifica se o código da URL ainda é válido e se o usuário já confirmou o e-mail.

        :param r: Objeto da requisição HTTP contendo o parâmetro 'url_code' na query string.
        :return: Mensagem indicando se o código é válido, expirado ou se o usuário já confirmou o e-mail.
        """
        url_code = r.GET.get('url_code')

        otp = self.get_otp(url_code=url_code)


        if otp.is_otp_expired():
            return Response(data="Código inválido ou expirado", status=status.HTTP_400_BAD_REQUEST)


        elif otp.user.is_active:
            return Response(data="Usuário já confirmou E-mail", status=status.HTTP_403_FORBIDDEN)


        return Response(data="Insira o código de confirmação", status=status.HTTP_200_OK)


    def post(self, r):
        """
        Confirma o e-mail do usuário com base no código URL e no código OTP fornecidos.

        :param r: Objeto da requisição HTTP contendo 'url_code' e 'otp_code' no corpo da requisição.
        :return: Tokens JWT se a verificação for bem-sucedida, ou mensagem de erro se o código for inválido ou expirado.
        """
        url_code = r.data.get('url_code')
        otp_code = r.data.get('otp_code')

        otp = self.get_otp(url_code, otp_code)


        if not otp.is_otp_expired():

            otp.user.is_active = True
            otp.user.save()


            otp.delete()

            resp = create_cookies(otp.user, request=r)


            return resp

        return Response(data='Código inválido ou expirado', status=status.HTTP_400_BAD_REQUEST)



    def patch(self, r):
        """
        Gera e reenvia um novo código OTP caso o anterior tenha expirado e o e-mail ainda não tenha sido confirmado.

        :param r: Objeto da requisição HTTP contendo 'url_code' no corpo da requisição.
        :return: Mensagem indicando o reenvio do código, se o código anterior expirou, ou que o código atual ainda é válido.
        """

        url_code = r.data.get('url_code')
        otp = self.get_otp(url_code=url_code)


        if otp.user.is_active:
            return Response(data="Usuário já cadastrado", status=status.HTTP_200_OK)



        if otp.is_otp_expired():
            otp.otp_token = generate_otp(4)
            otp.otp_expires_at = timezone.now() + timezone.timedelta(minutes=5)

            otp.save()
            send_otp_to_user.delay(otp.otp_token, otp.user.email, otp.user.first_name, url_code)

            return Response(data="Código reenviado para seu E-mail", status=status.HTTP_200_OK)

        return Response(data="Esse código ainda permanece válido, envie novamente", status=status.HTTP_400_BAD_REQUEST)






@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    start = time.time()
    t1 = time.time()
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    print("Serializer Val: ", time.time() - t1)

    email = serializer.validated_data['email']
    pwd = serializer.validated_data['password']

    t2 = time.time()
    user = authenticate(request, email=email, password=pwd)
    print("Ayth: ", time.time() - t2)

    if user is not None:
        t3 = time.time() 
        resp = create_cookies(user, request)
        
        print("Create cookies: ", time.time() - t3)

        print("Total: ", time.time() - start)
        return resp


    return Response({"detail": "Usuário não ativo"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:

        refresh_token = request.COOKIES.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()

        resp = Response()
        resp.delete_cookie('refresh', samesite="None", path="/")
        resp.delete_cookie('access', samesite="None", path="/")
        resp.delete_cookie("X-CSRFToken", samesite="None", path="/")
        resp.delete_cookie("csrftoken", samesite="None", path="/")
        resp["X-CSRFToken"] = None

        resp.status_code = 204

        return resp
    except Exception as e:
        print(e)
        raise ParseError("Token Invalid")




class APIListCreate(APIView):




    permission_classes = [AllowAny]


    def is_user_not_active(self, email):

        user_qs = User.objects.filter(email=email)
        if user_qs.first() and not user_qs.first().is_active:
            return user_qs.first()

        return False


    def get(self, r):
        return Response({'Ok': 'Done!'}, status=status.HTTP_200_OK)


    def post(self, r):
        data = r.data

        # Caso o usuário já tenha criado uma conta, mas não fez a confirmação de email e está tentando criar a conta novamente
        user_not_active = self.is_user_not_active(data.get('email'))
        if user_not_active:
            user_not_active.otp_token.delete() # OTP antigo
            # Criar OTP
            send_otp_to_email(instance=user_not_active)
            return Response(data={'url_code': user_not_active.otp_token.url_code}, status=status.HTTP_201_CREATED)


        user = RegisterSerializer(data=data)

        user.is_valid(raise_exception=True)
        user.save()
        # print(user.data.get('id'))



        otp = OtpToken.objects.filter(user__id=user.data.get('id')).first() # Código OTP é criado através de um signal


        resp_data = {
            'user': user.data,
            'url_code': otp.url_code, # Código que será usado para levar o usuário para pagina de confirmação de email
        }


        return Response(data=resp_data, status=status.HTTP_201_CREATED)



class APIUserProfile(APIView):

    permission_classes = [IsAuthenticated]




    def patch(self, r):
        """
        Atualiza parcialmente os dados do perfil e do usuário, e retorna novos tokens de autenticação.

        :param r: Objeto da requisição HTTP contendo os dados do usuário e do perfil a serem atualizados.
        :return: Novos tokens JWT após a atualização bem-sucedida dos dados, com status HTTP 200.
        """

        data = r.data.copy()
        print("profile: ", r.FILES.get('profile_pic'))

        user_id = int(r.GET.get('user_id'))


        profile_data = {
            'profile_pic': r.FILES.get('profile_pic', None),
            'full_name': data.pop('full_name')[0],
        }

        user_data = {
                'username':  data.get('username'),
                'email': data.get('email')
            }


        user = User.objects.get(id=user_id)


        profile_serializer = ProfileSerializer(instance=user.profile, data=profile_data, partial=True)

        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()



        serializer = UserSerializer(instance=user, data=user_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        resp = create_cookies(user=user, request=r)

        print(user.profile.profile_pic.url)


        return resp




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_authenticated(request):
    print(request.user)
    return JsonResponse({'status': 'True'})





