# 🗂️ TaskBoard - Kanban App com Django + React(em desenvolvimento) 
#### Projeto: <a href="https://kanban-task-project.netlify.app/register" target="_blank">TaskBoard</a>


Um sistema completo de gerenciamento de tarefas no estilo **Kanban**, desenvolvido com **Django Rest Framework** no backend e **React.js** no frontend. Permite a criação, organização e acompanhamento de tarefas em colunas, com funcionalidades modernas e notificações automáticas por e-mail.

---

## 🚀 Funcionalidades

- ✅ Cadastro e login de usuários com confirmação por e-mail
- 🛡️ Autenticação com JWT + cookies HttpOnly
- 📌 CRUD de tarefas
- 📅 Notificações por e-mail para tarefas próximas da expiração
- 🔔 Avisos automáticos usando Celery e Redis
- 🧪 Testes automatizados no backend (Django) e frontend (React)
- 🔐 Proteção de rotas privadas no React

---

## 🛠️ Tecnologias Utilizadas

### Backend
- Python 3.x
- Django 4.x + Django Rest Framework
- Celery + Redis (mensageria assíncrona)
- JWT Authentication
- pytest

### Frontend
- React.js + Vite
- Axios + React Router DOM
- CSS
- Vitest + Testing Library + Jest




## 🚀 Executando o projeto localmente com Docker e docker-compose


### 📦 Clonando o repositório

```bash
git clone git@github.com:GiorgioMorello/kanban.git
cd kanban
```

### ⚙️ Configurando as variáveis de ambiente

#### 1. Crie o arquivo .env na raiz do projeto:
```bash
cp .env.example .env
```

Configure as variáveis da sua maneira

```bash
DB_NAME=kanban_db
DB_USER=user
DB_PASS=teste1234
DB_PORT=3306
MYSQL_ROOT_PASSWORD=teste1234
```

#### 2. Crie o arquivo .env no diretório backend/
```bash
cp backend/.env.example backend/.env
```

Configure as variáveis de ambiente
```bash
# DJANGO
SECRET_KEY=your_key
DEBUG=True
SERVER_SIDE_DOMAIN=http://127.0.0.1:8000
CLIENT_SIDE_DOMAIN=http://127.0.0.1:3000
ALLOWED_HOSTS=127.0.0.1


# CELERY
CELERY_BROKER_URL=redis://127.0.0.1:6379/0


# E-MAIL
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=password
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False


# MySQL (precisam ser iguais ao .env que está na razi)
USE_MYSQL=1
DB_HOST=db
DB_NAME=kanban_db
DB_USER=your_username
DB_PASS=your_password
DB_PORT=3306
```
#### 3. Crie o arquivo .env no diretório frontend/:


```bash
cp frontend/.env.example frontend/.env
```

<b>Não é necessário alterar este arquivo, ele já vem pronto:</b>
```bash
VITE_API_URL=http://127.0.0.1:8000
```

#### ▶️ 4. Inicie os containers com Docker Compose
```bash
docker-compose up --build -d
```

#### Para acessar a aplicação:
| Serviço      | URL                                                        |
| ------------ | ---------------------------------------------------------- |
| Frontend     | [http://localhost:3000](http://localhost:3000)             |
| Backend API  | [http://localhost:8000](http://localhost:8000)             |
| Django Admin | [http://localhost:8000/admin](http://localhost:8000/admin) |

