import pytz
from rest_framework import test, status
from django.urls import reverse, resolve

from django.utils import timezone
from posts import views as tasks_views
from ..models import Task
from user.models import User
from unittest.mock import patch
from datetime import date, timedelta
from posts.tasks import notify_users_about_expiring_tasks

class TestTaskAPIURLs(test.APITestCase):



    def test_list_task_url_is_correct(self):
        url = reverse("tasks:task_list")
        self.assertEqual(url, "/api/class/task")



    def test_task_detail_url_is_correct(self):
        url = reverse("tasks:task_detail", kwargs={'id': 1})
        self.assertEqual(url, "/api/class/task/1")


    def test_list_task_url_view_is_correct(self):
        view = resolve(reverse("tasks:task_list"))
        self.assertEqual(tasks_views.APIListTask, view.func.view_class)


    def test_detail_task_url_view_is_correct(self):
        view = resolve(reverse("tasks:task_detail", kwargs={'id': 1}))
        self.assertEqual(tasks_views.TaskDetailAPI, view.func.view_class)



