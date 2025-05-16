from django.urls import path, include
from . import views


app_name = 'tasks'
urlpatterns = [
    #path('', views.list_task, name='list'),
    #path('task/<int:id>', views.task_detail, name='task'),



    # Class Based API View
    path('class/task', views.APIList.as_view(), name='class_list'),
    path('class/task/<int:id>', views.APIDetail.as_view(), name='class_individual'),


    # Generic API View
    path('class/generic/<int:pk>', views.TaskAPIDetailGeneric.as_view(), name='class_list'),

    #path('nada/', views.nada, name='nada'),

]
