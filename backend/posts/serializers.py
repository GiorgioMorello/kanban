from collections import defaultdict

from rest_framework import serializers
from .models import Task

from django.contrib.auth import get_user_model

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'task_status', 'creation_date', 'end_date', 'task_status_display', 'owner',
        ]



    task_status_display = serializers.SerializerMethodField(read_only=True)

    def get_task_status_display(self, obj):
        # Aqui, 'obj' será a instância do modelo Task
        return obj.get_task_status_display()  # Chama o método na instância correta


    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=60, required=True, error_messages={'required': 'Esse campo não pode ser vazio', 'blank': 'Esse campo não pode ser vazio'})
    description = serializers.CharField(max_length=255, required=True, error_messages={'required': 'Esse campo não pode ser vazio', 'blank': 'Esse campo não pode ser vazio'})
    task_status = serializers.CharField(max_length=10, required=True)

    creation_date = serializers.DateTimeField(format='%d-%m-%Y', read_only=True)
    end_date = serializers.DateField(format='%d-%m-%Y', error_messages={'required': 'Esse campo não pode ser vazio'})
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True)





    def validate(self, attrs):
        super_validate = super().validate(attrs)
        my_errors = defaultdict(list)


        return super_validate



    def validate_title(self, value):
        if len(value) <= 1:
            raise serializers.ValidationError(['Digite um titulo maior que 1 caractere'])

        print('Validate title', value)
        return value










