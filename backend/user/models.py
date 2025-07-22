import datetime

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    username = models.CharField(max_length=65, unique=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=70)
    last_name = models.CharField(max_length=70)


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ('username',)


    def __str__(self):
        return self.email



class Profile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=150)
    bio = models.TextField(max_length=300, default='', null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pic', default="profile_pic/default.jpg", blank=True, null=True)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return self.full_name



class OtpToken(models.Model):

    user = models.OneToOneField(to=User, related_name='otp_token', on_delete=models.CASCADE)
    otp_token = models.CharField(max_length=8, null=True, blank=True, default=None, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField(null=True, blank=True, default=None)
    url_code = models.CharField(max_length=60, null=True, blank=True, default=None, db_index=True)


    def __str__(self):
        return f"{self.user}'s OTP"



    def is_otp_expired(self):
        return timezone.now() > self.otp_expires_at

