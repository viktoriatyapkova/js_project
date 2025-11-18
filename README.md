<<<<<<< HEAD
# js_project
=======
# ChoreoNotes API 💃

RESTful API для личного дневника хореографа. Позволяет создавать, организовывать и управлять хореографическими движениями и связками.

## Возможности (Features)
- **CRUD Operations** для движений и связок
- **Аутентификация** пользователей
- **Поиск** движений по названию
- **Управление составом** связок

## Технологии (Tech Stack)
- Node.js + Express.js
- PostgreSQL
- JWT Authentication

## Database Schema

### Users
```javascript
{
  id: { // Уникальный идентификатор
    type: Integer,
    primaryKey: true
  },
  email: { // Email пользователя
    type: String,
    required: true,
    unique: true
  },
  password_hash: { // Хеш пароля
    type: String,
    required: true
  },
  username: { // Имя пользователя
    type: String,
    required: true
  },
  created_at: { // Дата создания
    type: Timestamp,
    default: Date.now
  }
}
```
### Moves

```javascript
{
  id: { // Уникальный идентификатор
    type: Integer,
    primaryKey: true
  },
  name: { // Название движения
    type: String,
    required: true,
    maxlength: 200
  },
  description: { // Описание движения
    type: Text
  },
  video_url: { // Ссылка на видео
    type: String,
    maxlength: 500
  },
  difficulty_level: { // Уровень сложности
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  user_id: { // Владелец движения
    type: Integer,
    required: true,
    foreignKey: true
  },
  created_at: { // Дата создания
    type: Timestamp,
    default: Date.now
  }
}
```
### Routines
```javascript
{
  id: { // Уникальный идентификатор
    type: Integer,
    primaryKey: true
  },
  name: { // Название связки
    type: String,
    required: true,
    maxlength: 200
  },
  description: { // Описание связки
    type: Text
  },
  duration_minutes: { // Продолжительность в минутах
    type: Integer
  },
  user_id: { // Владелец связки
    type: Integer,
    required: true,
    foreignKey: true
  },
  created_at: { // Дата создания
    type: Timestamp,
    default: Date.now
  }
}
```

## API Endpoints
### Аутентификация
- **POST** ```/api/auth/register``` - Регистрация пользователя
- **POST** ```/api/auth/login``` - Вход в систему
- **POST** ```/api/auth/logout``` - Выход из системы
- **GET** ```/api/auth/me``` - Получить текущего пользователя

### Движения (Moves)
- **GET** ```/api/moves``` - Получить все движения пользователя
- **GET** ```/api/moves/search``` - Поиск движений по названию
- **GET** ```/api/moves/:id``` - Получить движение по ID
- **POST** ```/api/moves``` - Создать новое движение
- **PUT** ```/api/moves/:id``` - Обновить движение
- **DELETE** ```/api/moves/:id``` - Удалить движение

### Связки (Routines)
- **GET** ```/api/routines``` - Получить все связки пользователя
- **GET** ```/api/routines/:id``` - Получить связку по ID
- **POST** ```/api/routines``` - Создать новую связку
- **PUT** ```/api/routines/:id``` - Обновить связку
- **DELETE** ```/api/routines/:id``` - Удалить связку

### Движения в связках
- **GET** ```/api/routines/:id/moves``` - Получить движения связки
- **POST** ```/api/routines/:id/moves``` - Добавить движение в связку
- **PUT** ```/api/routines/:id/moves/:moveId ```- Обновить движение в связке
- **DELETE** ```/api/routines/:id/moves/:moveId``` - Удалить движение из связки
>>>>>>> 8442625 (Add README file)
