from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import *
from .serializers import *
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from user.models import Profile
from rest_framework.exceptions import NotFound






class APIListTask(APIView):



    permission_classes = [IsAuthenticated]

    # Listar tarefas de um usuário específico
    def get(self, r):
        """
            Retorna todas as tarefas de um usuário específico, ordenadas por status e data de criação.

            :param r: Objeto da requisição HTTP contendo o parâmetro 'user_id' na query string.
            :return: Lista de tarefas serializadas pertencentes ao usuário informado, com status HTTP 200.
        """
        user_id = r.user.id
        tasks = Task.objects.get_sorted_tasks(user_id=user_id)

        serializer = TaskSerializer(instance=tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



    def post(self, r):
        """
            Cria uma nova tarefa com base nos dados fornecidos pelo usuário.

            title: str,
            description: str,
            task_status: str,
            end_date: "2025-01-27",

            :param r: Objeto da requisição HTTP contendo os dados da nova tarefa no corpo (JSON).
            :return: Dados da tarefa recém-criada, serializados.
        """
        serializer = TaskSerializer(data=r.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(owner=r.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)




class TaskDetailAPI(APIView):

    permission_classes = [IsAuthenticated]


    def get_task(self, id):
        """
        Captura a task específica de um usuário já autenticado
        :param id: str
        :return: Objeto Task correspondente ao ID informado e ao usuário autenticado.
        :raise NotFound: Caso a task não existir ou não pertencer ao usuário
        """
        user = self.request.user

        try:

            task = Task.objects.get(Q(owner=user) & Q(id=id))
        except user.tasks.model.DoesNotExist:
            raise NotFound(detail='Task não enontrada')


        return task


    def get(self, r, id):
        """
        Retorna os dados detalhados de uma tarefa específica do usuário.

        :param r: Objeto da requisição HTTP.
        :param id: ID da tarefa a ser retornada.
        :return: Dados da tarefa serializados.
        """

        serializer = TaskSerializer(instance=self.get_task(id), many=False)
        return Response(serializer.data)

    def patch(self, r, id):

        """
        Atualiza parcialmente uma tarefa específica do usuário.

        :param r: Objeto da requisição HTTP contendo os dados a serem atualizados.
        :param id: ID da tarefa a ser modificada.
        :return: Dados da tarefa atualizados, serializados.
        """

        data = r.data
        serializer = TaskSerializer(instance=self.get_task(id), data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)


    def delete(self, r, id):
        """
        Remove uma task específica do usuário

        :param r: Objeto da requisição HTTP.
        :param id: ID da task a ser excluída.
        :return: Dicionário cotendo somente o ID da task que foi removida
        """


        task = self.get_task(id)
        task.delete()

        return Response(data={'id': id}, status=status.HTTP_200_OK)












