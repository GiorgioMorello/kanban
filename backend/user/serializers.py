from collections import defaultdict
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework import status
from django.conf import settings
from .models import Profile, OtpToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name')


class TokenObtain(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['full_name'] = user.profile.full_name
        token['username'] = user.username
        token['email'] = user.email
        token['bio'] = user.profile.bio
        token['profile_pic'] = settings.DOMAIN_NAME + user.profile.profile_pic.url
        token['verified'] = user.profile.verified

        return token


class RegisterSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=65, required=True,
                                     error_messages={'required': 'Esse campo não pode ser vazio'})
    email = serializers.EmailField(required=True, error_messages={'required': 'Esse campo não pode ser vazio'})
    password = serializers.CharField(write_only=True, required=True,
                                     error_messages={'required': 'Esse campo não pode ser vazio'})
    password_2 = serializers.CharField(write_only=True, required=True,
                                       error_messages={'required': 'Esse campo não pode ser vazio'})

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_2',)

    def validate(self, attrs):

        super_validate = super().validate(attrs)

        username = super_validate.get('username')
        email = super_validate.get('email')
        password = super_validate.get('password')
        password_2 = super_validate.get('password_2')

        if password != password_2:
            raise ValidationError({'password': 'Confirmação de senha incorreta'})

        return super_validate

    def validate_username(self, value):
        if len(value) <= 1:
            raise serializers.ValidationError('Seu nome de usuário deve ter mais de um caractere')

        return value

    def validate_email(self, value):
        email = value
        user_qs = User.objects.filter(email=email)

        if user_qs.exists():
            raise ValidationError('Esse e-mail já está em uso')

        return email

    def validate_password(self, value):
        if len(value) <= 7:
            raise serializers.ValidationError('Sua senha deve conter pelos menos 8 caracteres')

        return value

    def create(self, validated_data):
        username = validated_data.get('username')
        email = validated_data.get('email')
        password = validated_data.get('password')



        user = User.objects.create(email=email, username=username, first_name=username.upper(), last_name='')
        user.set_password(password)
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={'required': 'Esse campo não pode ser vazio'})
    password = serializers.CharField(write_only=True, required=True,
                                     error_messages={'required': 'Esse campo não pode ser vazio'})








class ProfileSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(required=False)
    profile_pic = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ('full_name', 'profile_pic')




    def update(self, instance, validated_data):
        profile_pic = validated_data.get('profile_pic', instance.profile_pic)
        print(profile_pic)


        full_name = validated_data.get('full_name', instance.full_name)
        if instance.full_name == full_name and instance.profile_pic == profile_pic:
            print('Não é necessário atualizar os dados')
            return instance

        instance.full_name = full_name
        if profile_pic is not None:
            instance.profile_pic = validated_data.get('profile_pic')

        instance.save()


        return instance



class OtpSerializer(serializers.ModelSerializer):


    class Meta:
        model = OtpToken
        fields = ('otp_token', 'otp_expires_at', 'url_code', 'is_expired')

    is_expired = serializers.SerializerMethodField(method_name='is_otp_expired', read_only=True)


    def is_otp_expired(self, otp):
        return otp.is_otp_expired()



    otp_token = serializers.CharField(max_length=8, read_only=True)
    url_code = serializers.CharField(max_length=60, read_only=True)
    otp_expires_at = serializers.DateTimeField(format='%d-%m-%Y', read_only=True)











