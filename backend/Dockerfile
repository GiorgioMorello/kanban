#/backend/Dockerfile

FROM python:3.11

ENV PYTHONUNBUFFERED=1
WORKDIR /kanban_app

# Instalar dependências do sistema (libmariadb-dev)
RUN apt update && apt install -y netcat-openbsd \
    libmariadb-dev \
    gcc \
    default-libmysqlclient-dev \
    build-essential


COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


COPY . .

EXPOSE 8000
