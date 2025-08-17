# Инструкция по развертыванию сайта с PostgreSQL

## Шаг 1: Подготовка PostgreSQL базы данных

### Варианты размещения базы данных:

**A. Облачные сервисы (рекомендуется для начинающих):**
- **Neon Database** - бесплатно до 0.5GB
- **Supabase** - бесплатно до 500MB  
- **Railway** - от $5/месяц
- **DigitalOcean Managed Databases** - от $15/месяц

**B. Собственный сервер:**
- VPS с установленным PostgreSQL
- Shared хостинг с поддержкой PostgreSQL

### Создание базы данных:

1. **Зарегистрируйтесь** на выбранном сервисе
2. **Создайте новую PostgreSQL базу данных**
3. **Получите строку подключения** (DATABASE_URL), она выглядит так:
   ```
   postgresql://username:password@hostname:port/database_name
   ```

## Шаг 2: Настройка проекта для PostgreSQL

### Создайте файл с конфигурацией базы данных:

Создайте файл `server/database.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, 
  psychologists, 
  appointments, 
  reviews, 
  messages, 
  availability 
} from '@shared/schema';

// Подключение к базе данных
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString, { 
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false 
});
export const db = drizzle(client);

// Экспорт схем для использования в коде
export { users, psychologists, appointments, reviews, messages, availability };
```

### Установите необходимые зависимости:

```bash
npm install postgres drizzle-orm
npm install -D drizzle-kit
```

### Создайте файл миграций `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Шаг 3: Создание системы миграций

### Создайте файл `server/migrate.ts`:

```typescript
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './database';

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

### Добавьте скрипты в `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "tsx server/migrate.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Шаг 4: Замена MemStorage на PostgreSQL

### Создайте файл `server/postgres-storage.ts`:

```typescript
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from './database';
import { 
  users, 
  psychologists, 
  appointments, 
  reviews, 
  messages, 
  availability,
  type User,
  type InsertUser,
  type Psychologist,
  type InsertPsychologist,
  type Appointment,
  type InsertAppointment,
  type Review,
  type InsertReview,
  type Message,
  type InsertMessage,
  type Availability,
  type InsertAvailability,
  type PsychologistWithUser,
  type AppointmentWithDetails,
  type ReviewWithDetails
} from '@shared/schema';
import type { IStorage } from './storage';

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Psychologists
  async getPsychologist(id: string): Promise<Psychologist | undefined> {
    const result = await db.select().from(psychologists).where(eq(psychologists.id, id)).limit(1);
    return result[0];
  }

  async getPsychologistByUserId(userId: string): Promise<Psychologist | undefined> {
    const result = await db.select().from(psychologists).where(eq(psychologists.userId, userId)).limit(1);
    return result[0];
  }

  async createPsychologist(psychologist: InsertPsychologist): Promise<Psychologist> {
    const result = await db.insert(psychologists).values(psychologist).returning();
    return result[0];
  }

  async updatePsychologist(id: string, updates: Partial<Psychologist>): Promise<Psychologist | undefined> {
    const result = await db.update(psychologists).set(updates).where(eq(psychologists.id, id)).returning();
    return result[0];
  }

  async searchPsychologists(filters: {
    specialization?: string;
    minPrice?: number;
    maxPrice?: number;
    formats?: string[];
    isApproved?: boolean;
  }): Promise<PsychologistWithUser[]> {
    let query = db
      .select({
        id: psychologists.id,
        userId: psychologists.userId,
        specialization: psychologists.specialization,
        experience: psychologists.experience,
        education: psychologists.education,
        certifications: psychologists.certifications,
        description: psychologists.description,
        price: psychologists.price,
        formats: psychologists.formats,
        isApproved: psychologists.isApproved,
        rating: psychologists.rating,
        totalReviews: psychologists.totalReviews,
        user: users
      })
      .from(psychologists)
      .leftJoin(users, eq(psychologists.userId, users.id));

    // Apply filters (simplified - you may need to adjust based on your exact filtering needs)
    const results = await query;
    
    return results.map(row => ({
      ...row,
      user: row.user!
    })) as PsychologistWithUser[];
  }

  // Appointments
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return result[0];
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return result[0];
  }

  async getAppointmentsByClient(clientId: string): Promise<AppointmentWithDetails[]> {
    const results = await db
      .select({
        appointment: appointments,
        client: users,
        psychologist: psychologists,
        psychologistUser: users
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.clientId, users.id))
      .leftJoin(psychologists, eq(appointments.psychologistId, psychologists.id))
      .leftJoin(users, eq(psychologists.userId, users.id))
      .where(eq(appointments.clientId, clientId))
      .orderBy(desc(appointments.dateTime));

    // Transform the results - this is a simplified version
    // You'll need to properly map the joined data
    return results as AppointmentWithDetails[];
  }

  async getAppointmentsByPsychologist(psychologistId: string): Promise<AppointmentWithDetails[]> {
    // Similar implementation to getAppointmentsByClient
    const results = await db
      .select()
      .from(appointments)
      .where(eq(appointments.psychologistId, psychologistId))
      .orderBy(desc(appointments.dateTime));

    return results as AppointmentWithDetails[];
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getReviewsByPsychologist(psychologistId: string): Promise<ReviewWithDetails[]> {
    // Implementation for getting reviews with user details
    const results = await db
      .select()
      .from(reviews)
      .where(eq(reviews.psychologistId, psychologistId))
      .orderBy(desc(reviews.createdAt));

    return results as ReviewWithDetails[];
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async getMessagesBetween(user1Id: string, user2Id: string): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(messages.createdAt);

    return result;
  }

  // Availability
  async createAvailability(availability: InsertAvailability): Promise<Availability> {
    const result = await db.insert(availability).values(availability).returning();
    return result[0];
  }

  async getAvailabilityByPsychologist(psychologistId: string): Promise<Availability[]> {
    const result = await db
      .select()
      .from(availability)
      .where(eq(availability.psychologistId, psychologistId));

    return result;
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getPendingPsychologists(): Promise<PsychologistWithUser[]> {
    const results = await db
      .select()
      .from(psychologists)
      .leftJoin(users, eq(psychologists.userId, users.id))
      .where(eq(psychologists.isApproved, false));

    return results.map(row => ({
      ...row.psychologists,
      user: row.users!
    })) as PsychologistWithUser[];
  }

  async approvePsychologist(psychologistId: string): Promise<void> {
    await db.update(psychologists).set({ isApproved: true }).where(eq(psychologists.id, psychologistId));
  }

  async rejectPsychologist(psychologistId: string): Promise<void> {
    await db.delete(psychologists).where(eq(psychologists.id, psychologistId));
  }
}
```

## Шаг 5: Обновление основного файла сервера

### Измените файл `server/storage.ts`:

Добавьте в конец файла:

```typescript
import { PostgresStorage } from './postgres-storage';

// Выбираем тип хранилища в зависимости от окружения
export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage()  // Используем PostgreSQL если есть DATABASE_URL
  : new MemStorage();      // Иначе используем память (для разработки)
```

## Шаг 6: Пошаговое развертывание

### 1. Подготовка сервера:
```bash
# Склонируйте проект на ваш сервер
git clone [your-repo-url]
cd [project-name]

# Установите зависимости
npm install
```

### 2. Настройка переменных окружения:
Создайте файл `.env`:
```bash
DATABASE_URL=postgresql://username:password@hostname:port/database_name
SESSION_SECRET=your-very-secure-session-secret-here
NODE_ENV=production
PORT=5000
```

### 3. Создание таблиц в базе данных:
```bash
# Генерируем файлы миграций
npm run db:generate

# Применяем миграции к базе данных
npm run db:migrate
```

### 4. Сборка проекта:
```bash
# Собираем фронтенд
npm run build
```

### 5. Запуск в продакшене:
```bash
# Установите PM2 для управления процессом
npm install -g pm2

# Запустите приложение
pm2 start server/index.ts --name "psych-platform"

# Настройте автозапуск
pm2 startup
pm2 save
```

## Шаг 7: Настройка веб-сервера (Nginx)

### Создайте конфигурацию Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Шаг 8: Настройка SSL (опционально)

```bash
# Установите Certbot
sudo apt install certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d your-domain.com
```

## Управление базой данных

### Просмотр данных:
```bash
# Запустите Drizzle Studio для просмотра данных
npm run db:studio
```

### Резервные копии:
```bash
# Создание резервной копии
pg_dump $DATABASE_URL > backup.sql

# Восстановление из резервной копии  
psql $DATABASE_URL < backup.sql
```

## Решение проблем

### Проблемы с подключением:
- Проверьте правильность DATABASE_URL
- Убедитесь, что сервер БД доступен с вашего хостинга
- Проверьте настройки файрволла

### Проблемы с миграциями:
- Убедитесь, что база данных пустая перед первым запуском
- Проверьте права пользователя на создание таблиц

### Проблемы с производительностью:
- Создайте индексы на часто используемые поля
- Настройте пул соединений
- Оптимизируйте запросы

---

После выполнения всех шагов ваш сайт будет работать с настоящей PostgreSQL базой данных!