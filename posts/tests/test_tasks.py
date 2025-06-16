import pytz
from rest_framework import test, status
from django.urls import reverse, resolve

from django.utils import timezone
from user import views as user_views
from ..models import Task
from user.models import User
from unittest.mock import patch
from datetime import date, timedelta
from posts.tasks import notify_users_about_expiring_tasks

class TestTasks(test.APITestCase):

    def create_users(self):
        # Criação de um usuário
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )

        self.user2 = User.objects.create_user(
            username="testuser2",
            email="test2@example.com",
            password="testpass123"
        )

        self.user3 = User.objects.create_user(
            username="testuser3",
            email="test3@example.com",
            password="testpass123"
        )


    def create_tasks(self):
        tz = pytz.timezone('America/Sao_Paulo')
        now_sp = timezone.now().astimezone(tz)

        yesterday = now_sp - timedelta(days=1)

        # Criação de 7 tasks com diferentes combinações de status e datas
        task1 = Task.objects.create(
            title="Arrumar a mesa",
            description="Descrição da tarefa 1",
            task_status="TO",
            end_date=now_sp + timedelta(days=1),
            owner=self.user
        )

        # atualizando creation_date para ontem para cair na task notify_users_about_expiring_tasks
        task1.creation_date = yesterday
        task1.save()

        Task.objects.create(
            title="Tarefa 2",
            description="Descrição da tarefa 2",
            task_status="DO",
            end_date=now_sp + timedelta(days=3),
            owner=self.user2
        )

        Task.objects.create(
            title="Tarefa 3",
            description="Descrição da tarefa 3",
            task_status="DN",
            end_date=now_sp,
            owner=self.user3
        )

        Task.objects.create(
            title="Tarefa 4",
            description="Tarefa sem data de entrega",
            task_status="TO",
            end_date=now_sp + timedelta(4),
            owner=self.user
        )

        Task.objects.create(
            title="Tarefa 5",
            description="Outra tarefa em andamento",
            task_status="DO",
            end_date=now_sp + timedelta(days=2),
            owner=self.user
        )

        task6 = Task.objects.create(
            title="Limpar sala",
            description="Tarefa 6",
            task_status="DO",
            end_date=now_sp + timedelta(days=1),
            owner=self.user2
        )

        # atualizando creation_date para ontem para cair na task notify_users_about_expiring_tasks
        task6.creation_date = yesterday
        task6.save()


        Task.objects.create(
            title="Tarefa 7",
            description="Tarefa futura",
            task_status="TO",
            end_date=now_sp + timedelta(days=10),
            owner=self.user3
        )




    def setUp(self):

        self.create_users()
        self.create_tasks()




    @patch('posts.tasks.notify_user_about_tasks.delay')
    def test_task_notify_users_about_expiring_tasks(self, mock_task):

        tz = pytz.timezone('America/Sao_Paulo')
        now_sp = timezone.now().astimezone(tz)
        yesterday = now_sp - timedelta(days=1)



        notify_users_about_expiring_tasks()
        mock_task.assert_called()







