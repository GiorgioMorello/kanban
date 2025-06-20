from django.urls import path, include
from . import views


app_name = 'tasks'
urlpatterns = [



    # Class Based API View
    path('class/task', views.APIListTask.as_view(), name='task_list'),
    path('class/task/<int:id>', views.TaskDetailAPI.as_view(), name='task_detail'),



]
