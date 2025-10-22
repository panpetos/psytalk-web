# 🚀 Быстрый старт - PsychPlatform (Новая версия)

## Запуск за 5 минут

### Шаг 1: Установка зависимостей

```bash
# Установите пакеты для новой версии
npm install express express-session express-mysql-session mysql2 bcrypt
```

### Шаг 2: Настройка базы данных

Выберите один из вариантов:

#### Вариант А: Локальная MySQL база (для тестирования)

```bash
# Установите MySQL если ещё не установлен
# Создайте базу данных
mysql -u root -p
CREATE DATABASE psychplatform;
exit;

# Создайте .env файл
cp .env.example .env

# Отредактируйте .env с вашими локальными настройками:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=ваш_пароль
# DB_NAME=psychplatform
```

#### Вариант Б: База данных рег.ру (продакшен)

```bash
# Создайте .env файл
cp .env.example .env

# Используйте настройки из скриншота:
# DB_HOST=ваш_хост (обычно localhost или IP)
# DB_USER=u3105470_psyh_user
# DB_PASSWORD=xR3iA0zO0qwV9cF4
# DB_NAME=u3105470_psyh
```

### Шаг 3: Инициализация базы данных

```bash
# Перейдите в папку с новым сервером
cd server-new

# Создайте таблицы и заполните демо-данными
node seed.js
```

Вы должны увидеть:
```
✓ Successfully connected to MySQL database
✓ Database schema initialized
✓ Admin user created: admin@psychplatform.com
...
=== Database Seeding Completed Successfully! ===
```

### Шаг 4: Запуск сервера

```bash
# Из корневой папки проекта
node server-new/index.js
```

Или используя npm:
```bash
# Переименуйте package-new.json в package.json
mv package-new.json package.json

# Запустите
npm start
```

Сервер запустится на `http://0.0.0.0:5000`

### Шаг 5: Тестирование

Откройте браузер и перейдите на `http://localhost:5000`

**Демо-аккаунты для тестирования:**

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@psychplatform.com | admin123 |
| Психолог | anna.petrova@psychplatform.com | psychologist123 |
| Психолог | mikhail.sidorov@psychplatform.com | psychologist123 |
| Клиент | maria.ivanova@example.com | client123 |

## 🧪 Проверка функционала

### Для клиента:
1. ✅ Войдите как клиент
2. ✅ Найдите психолога на главной странице
3. ✅ Откройте профиль психолога
4. ✅ Запишитесь на консультацию
5. ✅ Проверьте раздел "Мои записи"

### Для психолога:
1. ✅ Войдите как психолог
2. ✅ Проверьте записи в личном кабинете
3. ✅ Отредактируйте профиль
4. ✅ Посмотрите отзывы (если есть)

### Для администратора:
1. ✅ Войдите как админ
2. ✅ Проверьте статистику
3. ✅ Одобрите/отклоните психолога (если есть на модерации)
4. ✅ Посмотрите список пользователей

## 🔧 Решение проблем

### База данных не подключается

```bash
# Проверьте, что MySQL запущен
sudo service mysql status

# Проверьте настройки в .env
cat .env

# Проверьте подключение вручную
mysql -u u3105470_psyh_user -p
```

### Ошибка "Cannot find module"

```bash
# Переустановите зависимости
rm -rf node_modules
npm install express express-session express-mysql-session mysql2 bcrypt
```

### Порт 5000 уже занят

```bash
# Измените порт в .env
echo "PORT=3000" >> .env

# Или остановите старое приложение
# (старое React приложение на порту 5000)
pkill -f "tsx server/index.ts"
```

### Таблицы не создаются

```bash
# Создайте таблицы вручную через phpMyAdmin или mysql
mysql -u root -p psychplatform < server-new/schema.sql
```

## 📁 Структура файлов

```
project/
├── server-new/           # Новый бекенд (MySQL + JS)
│   ├── index.js         # Сервер
│   ├── routes.js        # API endpoints
│   ├── storage.js       # Database layer
│   ├── db.js            # DB connection
│   ├── schema.sql       # Database schema
│   └── seed.js          # Demo data
│
├── public/              # Фронтенд (HTML/CSS/JS)
│   ├── css/styles.css
│   ├── js/
│   │   ├── api.js
│   │   └── auth.js
│   ├── index.html
│   ├── login.html
│   ├── client-dashboard.html
│   ├── psychologist-dashboard.html
│   ├── admin-dashboard.html
│   ├── psychologist-profile.html
│   ├── edit-profile.html
│   ├── consultation.html
│   └── leave-review.html
│
├── .env                 # Конфигурация (создать)
├── .env.example         # Пример конфигурации
├── package-new.json     # Зависимости новой версии
├── README_NEW.md        # Полная документация
└── DEPLOYMENT_REG_RU.md # Инструкция по деплою
```

## 🎯 Что дальше?

1. **Локальное тестирование**: Протестируйте все функции
2. **Настройка продакшена**: Следуйте `DEPLOYMENT_REG_RU.md`
3. **Миграция данных**: Если есть данные в старой БД, мигрируйте их
4. **Настройка HTTPS**: Установите SSL сертификат
5. **Мониторинг**: Настройте логирование и мониторинг

## 💡 Полезные команды

```bash
# Посмотреть логи
tail -f /var/log/psychplatform.log

# Перезапустить сервер
pm2 restart psychplatform

# Проверить статус БД
mysql -u root -p -e "SHOW DATABASES;"

# Создать бэкап БД
mysqldump -u root -p psychplatform > backup.sql

# Восстановить из бэкапа
mysql -u root -p psychplatform < backup.sql
```

## 📞 Помощь

Если что-то не работает:
1. Проверьте логи сервера
2. Проверьте подключение к БД
3. Убедитесь, что все зависимости установлены
4. Проверьте .env файл

---

**Успешного запуска! 🎉**
