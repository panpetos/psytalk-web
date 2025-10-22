-- PsychPlatform MySQL Database Schema
-- Created for migration from PostgreSQL to MySQL

-- Drop tables if exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS psychologists;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('client', 'psychologist', 'admin') NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_frozen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Psychologists table
CREATE TABLE psychologists (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  experience INT NOT NULL,
  education TEXT NOT NULL,
  certifications JSON,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  formats JSON,
  is_approved BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE appointments (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  psychologist_id VARCHAR(36) NOT NULL,
  date_time DATETIME NOT NULL,
  duration INT DEFAULT 50,
  format ENUM('video', 'audio', 'chat') NOT NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (psychologist_id) REFERENCES psychologists(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  appointment_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(36) NOT NULL,
  psychologist_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (psychologist_id) REFERENCES psychologists(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Availability table
CREATE TABLE availability (
  id VARCHAR(36) PRIMARY KEY,
  psychologist_id VARCHAR(36) NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (psychologist_id) REFERENCES psychologists(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_psychologists_user_id ON psychologists(user_id);
CREATE INDEX idx_psychologists_approved ON psychologists(is_approved);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_datetime ON appointments(date_time);
CREATE INDEX idx_reviews_psychologist ON reviews(psychologist_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_availability_psychologist ON availability(psychologist_id);
