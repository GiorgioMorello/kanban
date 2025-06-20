import pytest
from django.test import TestCase
from rest_framework import test, status
from django.urls import reverse, resolve
from rest_framework_simplejwt.tokens import RefreshToken

from django.utils import timezone
from user import views as user_views
from user.models import User, Profile, OtpToken
from ..utils.otp_token import generate_otp
from unittest.mock import patch





class TestAPI(test.APITestCase):

    def setUp(self) -> None:
        user_error = User.objects.create(username="TESTE", email="test@example.com", first_name="Giorigo")
        user_error.set_password("123456789")
        user_error.save()

        #self.url = reverse('user_app:register_user')


class TestRegisterUserAPI(TestAPI):

    url = reverse('user_app:register_user')


    def test_user_registration_and_otp_creation(self):
        """
        Testa se o endpoint de registro cria um usuário com sucesso,
        gera o OTP via signal, e retorna dados corretos no response.
        """

        data = {
            "username": "Teste",
            "email": "test2@example.com",
            "password": "123456789",
            "password_2": "123456789"
        }


        resp = self.client.post(self.url, data, format='json')

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED) # Verificar status code

        self.assertTrue(User.objects.filter(email=data['email']).exists()) # Verificar se o usuário foi criado



        user = User.objects.get(email=data['email'])

        # Verificar se o OTP foi criado via signal
        otp = OtpToken.objects.filter(user=user).first()
        self.assertIsNotNone(otp)


        # Verificar response data
        self.assertIn("user", resp.data)
        self.assertIn("url_code", resp.data)



    def test_register_fails_when_email_already_exists(self):
        """
        Testa se o registro falha ao tentar cadastrar um usuário com email já existente
        e ativo, retornando erro 400 com mensagem na chave 'email'.
        """
        data_user_test = {
            "username": "Teste",
            "email": "test@example.com",
            "password": "123456789",
            "password_2": "123456789"
        }
        user = User.objects.get(email=data_user_test['email'])
        user.is_active = True # Deve ser True para não reenviar o OTP
        user.save()

        #print(user)
        resp = self.client.post(self.url, data_user_test, format='json')


        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST) # Verificar status code

        self.assertTrue(resp.data['email']) # Verifica se há alguma mensagem de erro





class TestOtpVerificationAPI(TestAPI):


    url = reverse('user_app:otp_verification')

    def get_otp(self):
        return OtpToken.objects.get(user=User.objects.get(email="test@example.com"))


    def test_if_otp_get_view_url_code_status_code_is_200(self):
        """
            Testa GET da verificação OTP com url_code válido e usuário não ativo,
            espera status 200.
        """
        resp = self.client.get(f"{self.url}?url_code={self.get_otp().url_code}")
        self.assertEqual(resp.status_code, 200)

    def test_if_otp_get_view_url_code_status_code_is_403(self):
        """
            Testa GET da verificação OTP quando usuário já está ativo,
            espera status 403 e mensagem de usuário já confirmado.
        """
        otp = self.get_otp()

        otp.user.is_active = True
        otp.user.save()

        resp = self.client.get(f"{self.url}?url_code={otp.url_code}")

        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.data, "Usuário já confirmou E-mail")


    def test_if_otp_get_view_url_code_status_code_is_400(self):
        """
        Testa GET da verificação OTP quando o código está expirado,
        espera status 400 e mensagem de código inválido ou expirado.
        """
        otp = self.get_otp()

        otp.otp_expires_at = timezone.now() - timezone.timedelta(minutes=5)
        otp.save()

        resp = self.client.get(f"{self.url}?url_code={otp.url_code}")

        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data, "Código inválido ou expirado")




    def test_if_otp_post_view_is_creating_access_and_refresh_cookies(self):
        """
        Testa POST para confirmar OTP com dados corretos,
        verifica se os cookies 'access' e 'refresh' são setados na resposta.
        """
        otp = self.get_otp()
        data = {
            'url_code': otp.url_code,
            'otp_code': otp.otp_token,
        }


        resp = self.client.post(f"{self.url}?url_code={otp.url_code}", data)

        self.assertIn("access", resp.cookies)
        self.assertIn("refresh", resp.cookies)

        self.assertEqual(resp.status_code, 200)



    def test_if_otp_post_view_sends_jwt_tokens(self):
        """
        Testa POST para confirmação OTP e checa se tokens JWT estão no corpo da resposta.
        """
        otp = self.get_otp()
        data = {
            'url_code': otp.url_code,
            'otp_code': otp.otp_token,
        }

        resp = self.client.post(f"{self.url}?url_code={otp.url_code}", data)

        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

        self.assertEqual(resp.status_code, 200)




    # Aponta para celery task
    @patch('user.tasks.send_otp_to_user.delay')
    def test_if_otp_patch_view_is_resending_otp_code(self, mock_send_otp):
        """
        Testa PATCH para reenvio de OTP quando o código está expirado,
        verifica se a task Celery para enviar o OTP é chamada.
        """
        otp = self.get_otp()
        data = {
            'url_code': otp.url_code,
        }

        otp.otp_expires_at = timezone.now() - timezone.timedelta(minutes=5) # Forçar expirar otp
        otp.save()

        resp = self.client.patch(f"{self.url}", data)

        self.assertEqual(resp.status_code, 200)

        otp.refresh_from_db()  # força pegar os dados atualizados do banco

        # Verificar se a celery task foi chamado com os parâmetros correto
        mock_send_otp.assert_called_once_with(
            otp.otp_token,
            otp.user.email,
            otp.user.first_name,
            otp.url_code

        )



    def test_patch_view_returns_success_when_user_already_active(self):
        """
            Testa PATCH para reenvio de OTP quando o usuário já está ativo,
            deve retornar 200 e uma mensagem indicando que usuário já está cadastrado.
        """
        otp = self.get_otp()
        data = {
            'url_code': otp.url_code,
        }

        # print(otp.otp_token)
        otp.user.is_active = True
        otp.user.save()

        resp = self.client.patch(f"{self.url}", data)

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, "Usuário já cadastrado")




    def test_otp_patch_view_returns_error_if_token_still_valid(self):
        """
            Testa PATCH para reenvio de OTP quando o código atual ainda é válido,
            espera status 400 e mensagem que código ainda está válido.
            """
        otp = self.get_otp()
        data = {
            'url_code': otp.url_code,
        }

        resp = self.client.patch(f"{self.url}", data)

        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data, "Esse código ainda permanece válido, envie novamente")



class TestLoginView(TestAPI):

    def setUp(self) -> None:
        super().setUp()
        self.user = User.objects.get(email="test@example.com")
        self.user.is_active = True
        self.user.save()

        self.login_data = {
            'email': self.user.email,
            "password": "123456789"
        }
    url = reverse('user_app:login')






    def test_login_view_user_can_login_successfully(self):
        """
            Testa o login com credenciais válidas de usuário ativo,
            verifica status 200 e se os cookies JWT foram setados.
        """

        resp = self.client.post(self.url, self.login_data, format='json')

        self.assertEqual(resp.status_code, 200)

        self.assertIn("access", resp.cookies)
        self.assertIn("refresh", resp.cookies)



    def test_login_view_with_invalid_credentials(self):
        """
            Testa o login com credenciais válidas de usuário ativo,
            verifica status 400 e se mensagem de erro foi enviada.
        """
        self.login_data['password'] = 'incorrect pwd'
        resp = self.client.post(self.url, self.login_data, format='json')

        self.assertEqual(resp.status_code, 401)

        self.assertEqual(resp.data['detail'], 'E-mail ou Senha incorreto')







class TestLogoutView(TestAPI):

    def setUp(self) -> None:
        super().setUp()


        self.user = User.objects.get(email='test@example.com')
        self.user.is_active = True
        self.user.save()

        self.refresh = RefreshToken.for_user(self.user)
        self.access = self.refresh.access_token


    def test_authenticated_user_can_logout_successfully(self):
        """
        Testa se um usuário autenticado com tokens válidos consegue realizar logout com sucesso,
        recebendo status 204 e tendo os cookies 'access' e 'refresh' removidos corretamente.
        """
        logout_url = reverse('user_app:logout')

        self.client.cookies['refresh'] = str(self.refresh)
        self.client.cookies['access'] = str(self.access)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(self.access)}')
        resp = self.client.post(logout_url)


        self.assertEqual(resp.status_code, 204)

        self.assertEqual(resp.cookies.get('access').value, '')
        self.assertEqual(resp.cookies.get('refresh').value, '')



    def test_logout_view_returns_401_when_tokens_are_invalid(self):

        logout_url = reverse('user_app:logout')

        invalid_token = 'invalid token'

        self.client.cookies['refresh'] = invalid_token
        self.client.cookies['access'] = invalid_token

        self.client.credentials(HTTP_AUTHORIZATION=invalid_token)
        resp = self.client.post(logout_url)

        self.assertEqual(resp.status_code, 401)

