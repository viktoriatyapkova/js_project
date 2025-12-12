# Choreo Notes - CRUD Web Application

Полнофункциональное CRUD веб-приложение для управления хореографическими движениями и связками.

## Технологический стек

### Backend
- **Node.js** + **Express.js** - серверная часть
- **PostgreSQL** - база данных
- **JWT** - аутентификация (срок действия 24 часа)
- **bcrypt** - хеширование паролей
- **Joi** - валидация данных
- **Swagger/OpenAPI 3.0** - документация API
- **Jest + Supertest** - тестирование

### Frontend
- **React** с хуками
- **Vite** - сборка проекта
- **React Router** - маршрутизация
- **Tailwind CSS** - стилизация
- **Axios** - HTTP клиент
- **React Hot Toast** - уведомления

## Структура проекта

```
choreo-notes/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Контроллеры для обработки запросов
│   │   ├── models/          # Модели данных (User, Move, Routine)
│   │   ├── routes/          # Маршруты API
│   │   ├── services/        # Бизнес-логика
│   │   ├── middleware/      # Middleware (auth, validation, error)
│   │   ├── utils/           # Утилиты (database, jwt, validators)
│   │   ├── docs/            # Swagger документация
│   │   └── server.js        # Точка входа сервера
│   ├── tests/               # Тесты
│   ├── docker-compose.yml   # Docker Compose конфигурация
│   ├── Dockerfile           # Docker образ для backend
│   ├── init.sql             # SQL скрипт для инициализации БД
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # React компоненты
    │   ├── pages/           # Страницы приложения
    │   ├── services/        # API сервисы
    │   ├── context/         # React Context (AuthContext)
    │   └── App.jsx          # Главный компонент
    └── package.json
```

## Установка и запуск

### Требования
- Node.js 18+
- Docker и Docker Compose
- PostgreSQL (через Docker)

### Быстрый старт

1. **Клонируйте репозиторий** (если есть) или используйте текущую директорию

2. **Настройте переменные окружения**

   Создайте файл `backend/.env` на основе `backend/.env.example`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=choreo_user
   DB_PASSWORD=choreo_password
   DB_NAME=choreo_notes
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Запустите базу данных**
   ```bash
   cd backend
   docker-compose up -d
   ```

4. **Установите зависимости backend**
   ```bash
   cd backend
   npm install
   ```

5. **Запустите backend сервер**
   ```bash
   npm run dev
   ```
   Backend будет доступен на `http://localhost:3000`
   Swagger документация: `http://localhost:3000/api-docs`

6. **Установите зависимости frontend**
   ```bash
   cd frontend
   npm install
   ```

7. **Запустите frontend**
   ```bash
   npm run dev
   ```
   Frontend будет доступен на `http://localhost:5173`

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получить текущего пользователя

### Движения (Moves)

- `GET /api/moves` - Получить все движения пользователя
- `GET /api/moves/search?q=название` - Поиск движений
- `GET /api/moves/:id` - Получить движение по ID
- `POST /api/moves` - Создать новое движение
- `PUT /api/moves/:id` - Обновить движение
- `DELETE /api/moves/:id` - Удалить движение

### Связки (Routines)

- `GET /api/routines` - Получить все связки пользователя
- `GET /api/routines/:id` - Получить связку по ID
- `POST /api/routines` - Создать новую связку
- `PUT /api/routines/:id` - Обновить связку
- `DELETE /api/routines/:id` - Удалить связку

### Движения в связках

- `GET /api/routines/:id/moves` - Получить движения связки
- `POST /api/routines/:id/moves` - Добавить движение в связку
- `PUT /api/routines/:id/moves/:moveId` - Обновить порядок движения
- `DELETE /api/routines/:id/moves/:moveId` - Удалить движение из связки

## Структура базы данных

### Users
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE NOT NULL)
- `password_hash` (VARCHAR NOT NULL)
- `username` (VARCHAR NOT NULL)
- `created_at` (TIMESTAMP DEFAULT NOW())

### Moves
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(200) NOT NULL)
- `description` (TEXT)
- `video_url` (VARCHAR(500))
- `difficulty_level` (ENUM: 'beginner', 'intermediate', 'advanced')
- `user_id` (INTEGER REFERENCES users(id))
- `created_at` (TIMESTAMP DEFAULT NOW())

### Routines
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(200) NOT NULL)
- `description` (TEXT)
- `duration_minutes` (INTEGER)
- `user_id` (INTEGER REFERENCES users(id))
- `created_at` (TIMESTAMP DEFAULT NOW())

### Routine_Moves
- `routine_id` (INTEGER REFERENCES routines(id))
- `move_id` (INTEGER REFERENCES moves(id))
- `order_index` (INTEGER NOT NULL)
- `created_at` (TIMESTAMP DEFAULT NOW())
- PRIMARY KEY (routine_id, move_id, order_index)

## Тестирование

Запуск тестов:
```bash
cd backend
npm test
```

Запуск тестов с покрытием:
```bash
npm test -- --coverage
```

