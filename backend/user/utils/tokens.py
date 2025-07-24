from django.middleware import csrf
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from urllib.parse import urljoin
from decouple import config



def get_profile_pic(profile):
    is_using_cloudinary = config('USE_CLOUDINARY', cast=bool, default=False)
    cloudinary_base_url = config('CLOUDINARY_PROFILE_PIC_URL',
                                 default='https://res.cloudinary.com/your-cloud-name/image/upload/')

    default_pic_url = cloudinary_base_url + 'default.jpg' if is_using_cloudinary \
        else '/media/profile_pic/default.jpg'

    try:
        url = profile.profile_pic.url
    except Exception as e:
        print(e)
        url = default_pic_url

    if is_using_cloudinary:
        url = url.replace('/upload/', '/upload/w_300,h_300,c_fill,f_auto,q_auto/')
        return url

    return urljoin(settings.DOMAIN_NAME, url)


def create_jwt_token(user):
    tokens = RefreshToken.for_user(user)

    tokens['full_name'] = user.profile.full_name
    tokens['username'] = user.username
    tokens['email'] = user.email
    tokens['bio'] = user.profile.bio

    tokens['profile_pic'] = get_profile_pic(user.profile)

    #print("IMAGEM SALVA: ", urljoin(settings.DOMAIN_NAME, user.profile.profile_pic.url))

    tokens['verified'] = user.profile.verified

    #print(user.profile.profile_pic.url)


    return {'access': str(tokens.access_token), 'refresh': str(tokens)}


def create_cookies(user, request):
    tokens = create_jwt_token(user)
    resp = Response()

    resp.set_cookie(
        key='access',
        value=tokens["access"],
        expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
        secure=True,
        httponly=True,
        samesite="None"
    )

    resp.set_cookie(
        key='refresh',
        value=tokens["refresh"],
        expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
        secure=True,
        httponly=True,
        samesite="None"
    )

    resp.data = tokens
    resp.status_code = 200
    resp['X-CSRFToken'] = csrf.get_token(request)


    return resp



