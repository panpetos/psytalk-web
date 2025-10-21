# Инструкция по развертыванию на рег.ру

## 📋 Предварительные требования

1. Хостинг с поддержкой Node.js
2. MySQL база данных (уже создана: u3105470_psyh)
3. FTP доступ (уже есть: u3105470_psyh_us)
4. SSH доступ (опционально, но желательно)

## 🔧 Шаг 1: Подготовка базы данных

### 1.1 Откройте phpMyAdmin
- Войдите в панель управления рег.ру
- Перейдите в раздел "Базы данных"
- Откройте phpMyAdmin для базы `u3105470_psyh`

### 1.2 Создайте таблицы
Выполните SQL скрипт из файла `server-new/schema.sql`:

1. Откройте вкладку "SQL" в phpMyAdmin
2. Скопируйте содержимое `server-new/schema.sql`
3. Вставьте и нажмите "Выполнить"

## 📁 Шаг 2: Загрузка файлов через FTP

### 2.1 Подключитесь к FTP
```
Хост: ftp.ваш_домен.ru
Пользователь: u3105470_psyh_us
Пароль: vC7mU1fG0waP8uE0
Директория: /www/psyh.vakulskiy.team
```

### 2.2 Загрузите файлы
Загрузите следующие папки и файлы:

```
/www/psyh.vakulskiy.team/
├── server-new/      (все файлы)
├── public/          (все файлы)
├── package.json     (создайте на сервере)
└── .env             (создайте на сервере)
```

### 2.3 Создайте package.json
На сервере создайте файл `package.json`:

```json
{
  "name": "psychplatform",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "start": "node server-new/index.js",
    "seed": "node server-new/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "express-mysql-session": "^3.0.0",
    "mysql2": "^3.6.5",
    "bcrypt": "^5.1.1"
  }
}
```

### 2.4 Создайте .env файл
Создайте файл `.env` с настройками базы данных:

```env
DB_HOST=localhost
DB_USER=u3105470_psyh_user
DB_PASSWORD=xR3iA0zO0qwV9cF4
DB_NAME=u3105470_psyh
SESSION_SECRET=ваш_случайный_секретный_ключ_минимум_32_символа
PORT=5000
```

## 🚀 Шаг 3: Установка зависимостей

### Через SSH (рекомендуется)
```bash
cd /www/psyh.vakulskiy.team
npm install
```

### Через панель управления рег.ру
Если SSH недоступен, обратитесь в поддержку рег.ру для установки npm пакетов.

## 🌱 Шаг 4: Заполнение демо-данными

### Через SSH
```bash
cd /www/psyh.vakulskiy.team
npm run seed
```

### Через phpMyAdmin (альтернатива)
Если SSH недоступен, вручную создайте демо-данные через SQL:

1. Скопируйте хеши паролей из `server-new/seed.js`
2. Вставьте SQL INSERT команды в phpMyAdmin

**Демо-пароли (для bcrypt):**
```
admin123 -> $2b$10$...
psychologist123 -> $2b$10$...
client123 -> $2b$10$...
```

## ▶️ Шаг 5: Запуск приложения

### Вариант A: Через SSH
```bash
cd /www/psyh.vakulskiy.team
npm start
```

### Вариант Б: Через PM2 (рекомендуется для продакшена)
```bash
npm install -g pm2
pm2 start server-new/index.js --name psychplatform
pm2 save
pm2 startup
```

### Вариант В: Через панель управления рег.ру
Настройте автозапуск Node.js приложения в панели управления:
- Путь к файлу: `server-new/index.js`
- Порт: `5000`

## 🔍 Шаг 6: Проверка

1. Откройте браузер и перейдите на `http://psyh.vakulskiy.team`
2. Проверьте, что открывается главная страница с поиском психологов
3. Попробуйте войти с демо-аккаунтом:
   - Email: `admin@psychplatform.com`
   - Пароль: `admin123`

## ⚙️ Шаг 7: Настройка веб-сервера

### Nginx конфигурация (если используется)
```nginx
server {
    listen 80;
    server_name psyh.vakulskiy.team;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache .htaccess (если используется)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
```

## 🔐 Безопасность

### Обязательные настройки для продакшена:

1. **Измените SESSION_SECRET** в `.env` на уникальный ключ
2. **Включите HTTPS** через панель рег.ру (SSL сертификат)
3. **Обновите настройки cookie** в `server-new/index.js`:
   ```javascript
   cookie: {
     secure: true,  // Только HTTPS
     httpOnly: true,
     sameSite: 'strict'
   }
   ```

4. **Удалите демо-аккаунты** после тестирования
5. **Настройте firewall** для MySQL (только localhost)

## 🔄 Обновление приложения

При обновлении кода:

```bash
cd /www/psyh.vakulskiy.team
git pull  # если используете git
pm2 restart psychplatform  # если используете pm2
# или
npm start  # перезапустите вручную
```

## 📊 Мониторинг

### Просмотр логов
```bash
pm2 logs psychplatform  # если используется pm2
# или
tail -f /path/to/logs/node.log
```

### Проверка статуса
```bash
pm2 status  # если используется pm2
```

## ❗ Решение проблем

### Приложение не запускается
1. Проверьте логи: `pm2 logs` или `tail -f logs/error.log`
2. Проверьте подключение к MySQL: `mysql -u u3105470_psyh_user -p`
3. Проверьте права на файлы: `chmod -R 755 /www/psyh.vakulskiy.team`

### База данных не подключается
1. Проверьте credentials в `.env`
2. Проверьте, что MySQL сервис запущен
3. Проверьте firewall настройки

### Статические файлы не отдаются
1. Проверьте путь к `public/` в `server-new/index.js`
2. Проверьте права доступа к папке `public/`

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи приложения
2. Проверьте логи веб-сервера (Nginx/Apache)
3. Обратитесь в поддержку рег.ру для вопросов по хостингу

## ✅ Чек-лист финального развертывания

- [ ] MySQL база данных создана
- [ ] Таблицы созданы через schema.sql
- [ ] Файлы загружены через FTP
- [ ] package.json создан
- [ ] .env файл настроен
- [ ] npm install выполнен
- [ ] Демо-данные загружены (seed.js)
- [ ] Приложение запущено (npm start / pm2)
- [ ] Сайт доступен в браузере
- [ ] Вход с демо-аккаунтом работает
- [ ] HTTPS настроен (SSL сертификат)
- [ ] SESSION_SECRET изменен
- [ ] Демо-аккаунты удалены (после тестирования)

## 🎉 Готово!

Ваше приложение теперь работает на `http://psyh.vakulskiy.team`!
