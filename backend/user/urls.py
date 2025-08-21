from django.urls import path, include
from . import views


app_name = 'user_app'




urlpatterns = [
    path('token/refresh/', views.CookieRefreshView.as_view(), name='refresh_jwt_token'),

    path('register/', views.APIListCreate.as_view(), name='register_user'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('otp-verification/', views.OtpVerifyView.as_view(), name='otp_verification'),

    path('edit-user/', views.APIUserProfile.as_view(), name='edit_user'),
    #path('teste/', views.test_view, name='edit_user'),
    path('is-authenticated/', views.is_authenticated, name='is_auth'),

]
