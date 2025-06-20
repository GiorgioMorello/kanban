
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')


app = Celery('core')

# Celery Beat
app.conf.enable_utc = False
app.conf.update(timezone="America/Sao_Paulo")




app.config_from_object('django.conf.settings', namespace='CELERY')

app.autodiscover_tasks()


# Celery Beat
app.conf.beat_schedule = {
    'expired_end_date_task': {
        'task': 'posts.tasks.notify_users_about_expiring_tasks',
        'schedule': crontab(minute='0', hour='12')
    },
}



@app.task(bind=True)
def debug_task(self):
    print(f'{self.request!r}')
