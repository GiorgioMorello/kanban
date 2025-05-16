from django.test import TestCase
from rest_framework import test, status
from django.urls import reverse, resolve

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


        data = {
            "username": "Teste",
            "email": "test2@example.com",
            "password": "123456789",
            "password_2": "123456789"
        }


        resp = self.client.post(self.url, data, format='json')

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED) # Verificar status code

        self.assertTrue(User.objects.filter(email=data['email']).exists()) # Verificar se o usuário foi criado


        # Verifica se o OTP foi criado via signal
        user = User.objects.get(email=data['email'])

        otp = OtpToken.objects.filter(user=user).first()
        self.assertIsNotNone(otp)


        # Verificar response data
        self.assertIn("user", resp.data)
        self.assertIn("url_code", resp.data)



    def test_register_fails_when_email_already_exists(self):
        data = {
            "username": "Teste",
            "email": "test@example.com",
            "password": "123456789",
            "password_2": "123456789"
        }

        resp = self.client.post(self.url, data, format='json')



        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST) # Verificar status code

        self.assertTrue(resp.data['email']) # Verifica se há alguma mensagem de erro





class TestOtpVerificationAPI(TestAPI):


    url = reverse('user_app:otp_verification')

    def get_otp(self):
        return OtpToken.objects.get(user=User.objects.get(email="test@example.com"))




    def test_otp_get_view_url_code_is_200(self):

        resp = self.client.get(f"{self.url}?url_code={self.get_otp().url_code}")

        self.assertEqual(resp.status_code, 200)

    def test_otp_get_view_url_code_is_403(self):
        # User has already confirmed e-mail
        otp = self.get_otp()

        otp.user.is_active = True
        otp.user.save()

        resp = self.client.get(f"{self.url}?url_code={otp.url_code}")

        self.assertEqual(resp.status_code, 403)

    def test_otp_get_view_url_code_status_code_is_400(self):
        # OTP is expired
        otp = self.get_otp()

        otp.otp_expires_at = timezone.now() - timezone.timedelta(minutes=5)
        otp.save()

        resp = self.client.get(f"{self.url}?url_code={otp.url_code}")

        self.assertEqual(resp.status_code, 400)




    def test_otp_post_view_is_creating_jwt_cookies(self):

        otp = self.get_otp()
        data = {
            'url_code': otp.url_code,
            'otp_code': otp.otp_token,
        }


        resp = self.client.post(f"{self.url}?url_code={otp.url_code}", data)

        self.assertIn("access", resp.cookies)
        self.assertIn("refresh", resp.cookies)

        self.assertEqual(resp.status_code, 200)



    def test_otp_post_view_sends_jwt_tokens(self):
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
    def test_otp_patch_view_is_resending_otp_code(self, mock_send_otp):
        otp = self.get_otp()
        data = {
            'url_code': otp.url_code,
        }

        #print(otp.otp_token)
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



    def test_otp_patch_view_if_user_is_active_response(self):
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
        otp = self.get_otp()
        data = {
            'url_code': otp.url_code,
        }

        resp = self.client.patch(f"{self.url}", data)

        self.assertEqual(resp.status_code, 400)



class TestLoginView(TestAPI):

    url = reverse('user_app:login')




    def test_login_successful(self):
        data = {
            'email': "test@example.com",
            "password": "123456789"
        }

        user = User.objects.get(email="test@example.com")
        user.is_active = True
        user.save()

        resp = self.client.post(self.url, data, format='json')

        self.assertEqual(resp.status_code, 200)



        self.assertIn("access", resp.cookies)
        self.assertIn("refresh", resp.cookies)





















