# PsychPlatform - Новая версия (MySQL + Vanilla JS)

## 🎯 Описание

Полная миграция PsychPlatform с PostgreSQL на MySQL и с React на чистый HTML/CSS/JavaScript.

## 📋 Что изменилось

### Бекенд
- ✅ PostgreSQL → MySQL
- ✅ Drizzle ORM → mysql2 с кастомным storage слоем
- ✅ TypeScript → JavaScript
- ✅ Express-session → Express-MySQL-Session
- ✅ Все API endpoints сохранены

### Фронтенд
- ✅ React + TypeScript → Vanilla HTML/CSS/JavaScript
- ✅ Vite → Нет сборщика (чистые файлы)
- ✅ Tailwind CSS → Кастомная CSS дизайн-система
- ✅ React Router → Многостраничное приложение
- ✅ TanStack Query → Fetch API
- ✅ shadcn/ui → Кастомные компоненты

## 🚀 Запуск на Replit

### 1. Настройка базы данных

Если вы хотите использовать вашу базу данных на рег.ру, создайте файл `.env`:

```env
DB_HOST=ваш_хост_mysql
DB_USER=u3105470_psyh_user
DB_PASSWORD=xR3iA0zO0qwV9cF4
DB_NAME=u3105470_psyh
SESSION_SECRET=ваш_секретный_ключ
```

Или используйте локальную базу данных для тестирования (по умолчанию).

### 2. Инициализация базы данных

```bash
cd server-new
node seed.js
```

Это создаст таблицы и заполнит демо-данными.

### 3. Запуск сервера

```bash
cd server-new
node index.js
```

Сервер запустится на `http://0.0.0.0:5000`

## 👥 Демо-аккаунты

После выполнения `seed.js`:

- **Админ:** admin@psychplatform.com / admin123
- **Психолог:** anna.petrova@psychplatform.com / psychologist123
- **Психолог:** mikhail.sidorov@psychplatform.com / psychologist123
- **Клиент:** maria.ivanova@example.com / client123

## 📁 Структура проекта

```
├── server-new/           # Новый бекенд
│   ├── index.js         # Главный файл сервера
│   ├── routes.js        # API роуты
│   ├── storage.js       # MySQL storage
│   ├── db.js            # Подключение к БД
│   ├── schema.sql       # SQL схема
│   └── seed.js          # Заполнение демо-данными
│
├── public/              # Фронтенд (статические файлы)
│   ├── css/
│   │   └── styles.css   # Дизайн-система
│   ├── js/
│   │   ├── api.js       # API клиент
│   │   └── auth.js      # Аутентификация
│   ├── index.html       # Главная (поиск)
│   ├── login.html       # Вход/регистрация
│   ├── client-dashboard.html
│   ├── psychologist-dashboard.html
│   ├── admin-dashboard.html
│   ├── psychologist-profile.html
│   ├── edit-profile.html
│   └── consultation.html
│
├── MIGRATION_STATUS.md  # Статус миграции
└── README_NEW.md        # Этот файл
```

## 🎨 Функционал

### Для клиентов
- ✅ Поиск психологов по фильтрам
- ✅ Просмотр профилей психологов
- ✅ Бронирование консультаций
- ✅ Управление записями
- ✅ Просмотр истории
- 🔄 Оставление отзывов (в разработке)

### Для психологов
- ✅ Управление профилем
- ✅ Просмотр записей
- ✅ Просмотр отзывов
- 🔄 Управление расписанием (в разработке)
- 🔄 Видео/аудио консультации (в разработке)

### Для администраторов
- ✅ Модерация психологов
- ✅ Просмотр всех пользователей
- ✅ Статистика платформы

## 🔧 API Endpoints

Все API endpoints сохранены из оригинальной версии:

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/auth/logout` - Выход

### Users
- `GET /api/users/:id` - Получить пользователя
- `PUT /api/users/:id` - Обновить пользователя

### Psychologists
- `GET /api/psychologists/search` - Поиск психологов
- `GET /api/psychologists/:id` - Получить психолога
- `GET /api/psychologists/user/:userId` - Получить по userId
- `PUT /api/psychologists/:id` - Обновить психолога

### Appointments
- `POST /api/appointments` - Создать запись
- `GET /api/appointments/client/:clientId` - Записи клиента
- `GET /api/appointments/psychologist/:psychologistId` - Записи психолога
- `PUT /api/appointments/:id` - Обновить запись

### Reviews
- `POST /api/reviews` - Создать отзыв
- `GET /api/reviews/psychologist/:psychologistId` - Отзывы психолога

### Admin
- `GET /api/admin/users` - Все пользователи
- `GET /api/admin/psychologists/pending` - На модерации
- `PUT /api/admin/psychologists/:id/approve` - Одобрить
- `DELETE /api/admin/psychologists/:id/reject` - Отклонить
- `GET /api/admin/stats` - Статистика

## 🌐 Деплой на рег.ру (через FTP)

См. файл `DEPLOYMENT_GUIDE.md` для детальных инструкций.

Краткие шаги:
1. Создайте MySQL базу данных в панели рег.ру
2. Загрузите файлы через FTP
3. Выполните `schema.sql` и `seed.js` на сервере
4. Настройте переменные окружения
5. Запустите `node index.js` через SSH или панель управления

## ❓ FAQ

**Q: Можно ли использовать phpMyAdmin?**  
A: Да! phpMyAdmin - это инструмент для управления MySQL базой данных. Он уже доступен в панели рег.ру.

**Q: Нужен ли Node.js на хостинге?**  
A: Да, для работы бекенда нужен Node.js. Проверьте, поддерживает ли ваш хостинг Node.js.

**Q: Как мигрировать существующие данные?**  
A: Данные из старой PostgreSQL базы нужно экспортировать в SQL, преобразовать для MySQL и импортировать. Подробнее в DEPLOYMENT_GUIDE.md.

## 📝 TODO

- [ ] WebRTC для видео/аудио консультаций
- [ ] Управление расписанием психологов
- [ ] Загрузка файлов (аватары, сертификаты)
- [ ] Система уведомлений
- [ ] Платежи

## 📄 Лицензия

MIT
