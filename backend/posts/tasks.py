from django.conf import settings
from django.core.mail import send_mail
from time import sleep
from celery import shared_task
from .models import Task

from datetime import timedelta
from collections import defaultdict
from django.template.loader import render_to_string



@shared_task
def notify_user_about_tasks(user_email, subject, html_message):
    send_mail(subject, "", settings.EMAIL_HOST_USER, [user_email,], html_message=html_message)



# Iniciar Celery Beat: celery -A core beat -l INFO
@shared_task
def notify_users_about_expiring_tasks():
    email_to_tasks = Task.get_all_tasks_about_to_expire()


    user_tasks = defaultdict(list)

    for task in email_to_tasks: # Capturar as tasks de cada usuário
        user_email = task.owner.email
        user_tasks[user_email].append(task.title)


    for email, tasks in user_tasks.items():
        task_list = '\n• ' + '\n• '.join(tasks)


        html_message = render_to_string('notify_users_email.html', {
            'task_list': tasks
        })
        subject = "⏰ Lembrete: Suas tarefas expiram amanhã!"


        notify_user_about_tasks.delay(email, subject, html_message)

