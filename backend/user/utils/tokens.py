from django.middleware import csrf
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from urllib.parse import urljoin


def create_jwt_token(user):
    tokens = RefreshToken.for_user(user)

    tokens['full_name'] = user.profile.full_name
    tokens['username'] = user.username
    tokens['email'] = user.email
    tokens['bio'] = user.profile.bio
    tokens['profile_pic'] = urljoin(settings.DOMAIN_NAME, user.profile.profile_pic.url)
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
