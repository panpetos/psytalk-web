-- PsychPlatform Demo Data
-- This script populates the database with sample users, psychologists, and appointments
-- Passwords are bcrypt hashed (all use same hash for 'password123')

-- Note: UUIDs will be generated in JavaScript, this is just a template
-- The actual seeding will be done through the Node.js application

-- Clear existing data (in reverse order due to foreign keys)
DELETE FROM availability;
DELETE FROM messages;
DELETE FROM reviews;
DELETE FROM appointments;
DELETE FROM psychologists;
DELETE FROM users;

-- Demo Users
-- Admin: admin@psychplatform.com / admin123
-- Psychologist 1: anna.petrova@psychplatform.com / psychologist123
-- Psychologist 2: mikhail.sidorov@psychplatform.com / psychologist123  
-- Client: maria.ivanova@example.com / client123

-- Passwords (bcrypt hash for testing):
-- admin123: $2b$10$XqzC8gXJXKGQZgF8qQGxaOY7vJqQZqF8qQGxaOY7vJqQZqF8qQGxaO
-- psychologist123: $2b$10$XqzC8gXJXKGQZgF8qQGxaOY7vJqQZqF8qQGxaOY7vJqQZqF8qQGxaO
-- client123: $2b$10$XqzC8gXJXKGQZgF8qQGxaOY7vJqQZqF8qQGxaOY7vJqQZqF8qQGxaO

-- Note: This file is for documentation only
-- Actual seeding will be done programmatically from server-new/seed.js
