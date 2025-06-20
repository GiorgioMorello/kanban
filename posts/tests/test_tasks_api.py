import pytz
from rest_framework import test, status
from django.urls import reverse, resolve

from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

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
            title="Tarefa 1",
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


    def authenticate_user(self):
        self.user.is_active = True
        self.user.save()

        self.refresh = RefreshToken.for_user(self.user)
        self.access = self.refresh.access_token

        self.client.cookies['refresh'] = str(self.refresh)
        self.client.cookies['access'] = str(self.access)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(self.access)}')

    def setUp(self):

        self.create_users()
        self.create_tasks()

        self.authenticate_user()






    @patch('posts.tasks.notify_user_about_tasks.delay')
    def test_task_notify_users_about_expiring_tasks(self, mock_task):

        notify_users_about_expiring_tasks()
        mock_task.assert_called()



class TestListTaskAPI(TestTasks):

    def setUp(self):
        super(TestListTaskAPI, self).setUp()




    def get_valid_task_data(self):
        return {
            "title": "Task Test",
            "description": "Test Task",
            "task_status": "TO",
            "end_date": "2025-06-26",
            "owner": self.user.id
        }


    url = reverse('tasks:task_list')



    def test_get_user_tasks_by_id(self):
        self.url += f'?user_id={self.user.id}'

        resp = self.client.get(self.url)

        self.assertEqual(resp.status_code, 200)
        self.assertIsNotNone(resp.data[0]['title'])


    def test_create_task_view_is_successfully(self):
        task_data = self.get_valid_task_data()

        resp = self.client.post(self.url, data=self.get_valid_task_data())

        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["title"], task_data['title'])


    def test_create_task_returns_400_when_end_date_is_invalid(self):
        task_data = self.get_valid_task_data()
        task_data["end_date"] = "wrong date"

        resp = self.client.post(self.url, task_data)

        self.assertEqual(resp.status_code, 400)
        self.assertIsNotNone(resp.data['end_date'])






