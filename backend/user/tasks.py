from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from decouple import config
from django.template.loader import render_to_string


CLIENT_SIDE_DOMAIN = config('CLIENT_SIDE_DOMAIN')

@shared_task
def send_otp_to_user(token, user_email, first_name, url_token):
    html_message = render_to_string('otp_email.html', {
        'first_name': first_name,
        'token': token,
        'verification_link': f"{CLIENT_SIDE_DOMAIN}/verify-email/{url_token}"
    })
    send_mail('🔐 Verificação de E-mail - Código de Confirmação', "", settings.EMAIL_HOST_USER, [user_email,], html_message=html_message)





