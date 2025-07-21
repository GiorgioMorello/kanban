from django.db.models import signals
from django.dispatch import receiver
from .models import *
from django.utils import timezone
from django.contrib.auth import get_user_model
from .tasks import send_otp_to_user
from .utils.otp_token import generate_otp

User = get_user_model()


# The created parameter indicates whether the instance is being created or modified
# instance parameter is the instance of what we are creating or modifying
# def envia_sinal(sender, instance, created, **kwargs):
#     if created:
#         print(f'Instancia {instance} criada')
#     else:
#         print(f'Instancia {instance} modificada')


def send_otp_to_email(instance):
    token = generate_otp(4)
    url_code = generate_otp(26)
    otp = OtpToken.objects.create(user=instance, otp_token=token, url_code=url_code,otp_expires_at=timezone.now() + timezone.timedelta(minutes=5))

    instance.is_active = False
    instance.save()
    #print(otp)
    send_otp_to_user.delay(token=otp.otp_token, user_email=instance.email, first_name=instance.first_name, url_token=url_code)


@receiver(signals.post_save, sender=User)
def create_profile_and_send_otp(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, full_name=f'{instance.first_name} {instance.last_name}')

        send_otp_to_email(instance)


