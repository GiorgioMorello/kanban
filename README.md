# 🗂️ TaskBoard - Kanban App com Django + React(em desenvolvimento) 
#### Projeto: https://kanban-task-project.netlify.app/register


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

