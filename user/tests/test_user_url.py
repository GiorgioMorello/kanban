from django.test import TestCase
from rest_framework import test
from django.urls import reverse, resolve
from user import views as user_views



class TestUserAPIURLs(test.APITestCase):



    def test_register_url_is_correct(self):
        url = reverse("user_app:register_user")
        self.assertEqual(url, "/user/register/")

    def test_otp_verification_url_is_correct(self):
        url = reverse("user_app:otp_verification")
        self.assertEqual(url, "/user/otp-verification/")

    def test_edit_user_url_is_correct(self):
        url = reverse("user_app:edit_user")
        self.assertEqual(url, "/user/edit-user/")

    def test_is_authenticated_url_is_correct(self):
        url = reverse("user_app:is_auth")
        self.assertEqual(url, "/user/is-authenticated/")




    def test_edit_user_query_param_url_is_correct(self):
        url = reverse("user_app:edit_user") + '?user_id=6'
        self.assertEqual(url, "/user/edit-user/?user_id=6")

    def test_otp_verification_query_param_url_is_correct(self):
        url = reverse("user_app:otp_verification") + '?url_code=qwiuoea'
        self.assertEqual(url, "/user/otp-verification/?url_code=qwiuoea")





    def test_login_url_view_is_correct(self):
        view = resolve(reverse("user_app:login"))
        self.assertIs(view.func, user_views.login_view)

    def test_register_url_view_is_correct(self):
        view = resolve(reverse("user_app:register_user"))
        self.assertIs(view.func.view_class, user_views.APIListCreate)


    def test_otp_verification_url_view_is_correct(self):
        view = resolve(reverse("user_app:otp_verification"))
        self.assertIs(view.func.view_class, user_views.OtpVerifyView)

    def test_edit_user_url_view_is_correct(self):
        view = resolve(reverse("user_app:edit_user"))
        self.assertIs(view.func.view_class, user_views.APIUserProfile)

    def test_is_authenticated_url_view_is_correct(self):
        view = resolve(reverse("user_app:is_auth"))
        self.assertIs(view.func, user_views.is_authenticated)


