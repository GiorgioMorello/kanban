from django.contrib import admin
from .models import *
from django.contrib.auth import admin as django_admin



class TaskAdmin(admin.ModelAdmin):

    list_display = ('id', 'title', 'creation_date', 'end_date', 'task_status', 'owner')

    list_editable = ('task_status',)

    list_filter = ('owner',)






admin.site.register(Task, TaskAdmin)