from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm
from .models import *



class UserAdmin(DefaultUserAdmin):


    list_display = ('id', 'username', 'email', 'is_staff', 'is_active')
    search_fields = ('email', 'username')



class ProfileAdmin(admin.ModelAdmin):

    list_display = ('user', 'full_name', 'verified')
    list_editable = ['verified']



class OtpTokenAdmin(admin.ModelAdmin):

    list_display = ('user', 'created_at', 'otp_expires_at', 'otp_token')


admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(OtpToken, OtpTokenAdmin)
