from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_otp_to_user(token, user_email, first_name, url_token):


    message = f"""
        Olá {first_name} 👋,
        
        Seu código para confirmação de e-mail é: **{token}**
        
        ⚠️ Este código expira em **5 minutos**.
        
        Para concluir a verificação, acesse o link abaixo:
        {settings.DOMAIN_NAME}/verify-email/{url_token}
        
        Se você não solicitou essa verificação, por favor ignore este e-mail.
    """


    send_mail('🔐 Verificação de E-mail - Código de Confirmação', message, settings.EMAIL_HOST_USER, [user_email,])





