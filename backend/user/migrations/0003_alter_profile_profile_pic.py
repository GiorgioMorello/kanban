# Generated by Django 5.1.4 on 2025-02-07 20:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_alter_profile_bio_alter_profile_profile_pic'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='profile_pic',
            field=models.ImageField(default='media/profile_pic/default.jpg', upload_to='profile_pic'),
        ),
    ]
