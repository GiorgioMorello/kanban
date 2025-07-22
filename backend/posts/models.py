from typing import List

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import datetime
from django.utils import timezone
import pytz
from django.db.models.query import QuerySet

User = get_user_model()



class TaskManager(models.Manager):


    def get_sorted_tasks(self, user_id: str) -> QuerySet:
        """
        Capturar todas as tasks ordenada por ordem de criação

        :param user_id: str
        :return: QuerySet
        """

        return self.filter(owner__id=int(user_id)).order_by('-creation_date')


class Task(models.Model):
    status = (
        ('TO', 'TO DO'),
        ('DO', 'DOING'),
        ('DN', 'DONE'),
    )

    title = models.CharField(max_length=60)
    description = models.TextField()
    task_status = models.CharField(max_length=10, choices=status, default='TO')

    end_date = models.DateField(
        null=True, default=None, blank=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, related_name='tasks', default=None, null=True, on_delete=models.CASCADE, db_index=True)

    objects = TaskManager()

    def __str__(self):
        return self.title





    @classmethod
    def now_sp(cls) -> datetime:

        return timezone.now().astimezone(pytz.timezone('America/Sao_Paulo'))

    @classmethod
    def is_not_created_today(cls, tasks) -> bool:

        """
        Verificar quais tasks não foram criados no dia de hoje

        :param tasks: Task
        :return: bool
        """

        tz = pytz.timezone('America/Sao_Paulo')
        return tasks.creation_date.astimezone(tz).date() != cls.now_sp().date()

    @classmethod
    def get_all_tasks_about_to_expire(cls) -> List:

        """
        :return: Retorna uma lista de tarefas que irão expirar amanhã e que não foram criadas na data atual.
        """

        # Capturar todas as tasks
        tasks = Task.objects.select_related('owner')

        # tasks que irão expirar amanhã
        tasks_about_to_expire = tasks.filter(end_date=cls.now_sp().date() + timezone.timedelta(days=1), task_status__in=['TO', 'DO'])

        # Verificar quais das tasks que estão preste a expirar não foi criado hoje
        email_to_tasks = list(filter(cls.is_not_created_today, tasks_about_to_expire))

        return email_to_tasks

