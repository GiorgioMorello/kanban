from typing import Optional, Tuple

from rest_framework.request import Request
from rest_framework_simplejwt import authentication as jwt_authentication
from django.conf import settings
from rest_framework import authentication, exceptions
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


def enforce_csrf(request):
    check = authentication.CSRFCheck(request)
    reason = check.process_view(request, None, (), {})
    #print(request.headers.get('X-CSRFToken'))
    if reason:
        #print(reason)
        raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)


class CustomAuthentication(jwt_authentication.JWTAuthentication):

    def authenticate(self, request: Request) -> Optional[Tuple]:
        try:
            header = self.get_header(request)
            if header is not None:
                raw_token = self.get_raw_token(header)
            else:
                raw_token = request.COOKIES.get('access')

            print(raw_token)
            if not raw_token:
                return None

            validated_token = self.get_validated_token(raw_token)
            enforce_csrf(request)  # Só verifica CSRF se o token for válido
            return self.get_user(validated_token), validated_token

        except (InvalidToken, TokenError) as e:
            # Token inválido ou expirado → retorna None para tentar o próximo backend de autenticação
            return None
        except Exception as e:
            print(e)
            # Outros erros (ex: CSRF falhou) → levanta exceção para retornar 403
            raise exceptions.AuthenticationFailed(str(e))


