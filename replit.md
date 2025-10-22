# Overview

psytalk.pro is a comprehensive online psychology platform connecting clients with qualified psychologists for remote consultations. It's a full-stack web application with a pure HTML/CSS/JavaScript frontend and an Express.js backend. The platform supports three user roles: clients, psychologists, and administrators. It enables clients to search for, book, and conduct sessions via video, audio, or chat. Psychologists can manage profiles, schedules, and services, while administrators oversee verification, platform management, and analytics. The project aims to provide a modern, accessible, and user-friendly experience for remote psychological support.

# User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Russian (all communication should be in Russian).

# System Architecture

## Frontend Architecture
The client-side is built with pure HTML/CSS/JavaScript, recreating a shadcn/ui-inspired design system without external dependencies. It uses a multi-page approach with static HTML files, custom CSS styling with HSL variables, Lucide icons via CDN, and Vanilla JavaScript for interactivity (tabs, filters, modals, dynamic content). API integration is handled via Fetch API.

## Backend Architecture
The server uses Express.js in ES module format, providing a RESTful API. It integrates with MySQL for production (reg.ru compatible) and includes a DEMO mode fallback. Authentication uses bcrypt for password hashing and express-session for session management. The backend is designed with RESTful endpoints organized by feature areas.

## Data Storage Solutions
The application utilizes a PostgreSQL database (Neon Database) managed with Drizzle ORM for type-safe operations and migrations. The schema supports users, psychologists, appointments, reviews, messages, and availability. Google Cloud Storage is used for static assets and document uploads.

## Authentication and Authorization
The platform implements role-based access control for client, psychologist, and admin roles. Authentication uses email/password with bcrypt hashing and client-side session management. Authorization is enforced at both API and UI levels, including password validation and secure routes.

## Communication Features
Real-time consultation capabilities include:
- Browser-based video calling with camera/microphone controls.
- Audio-only consultation mode.
- Text-based chat messaging for sessions or follow-ups.
- Optional session recording with consent management.

# External Dependencies

## UI and Component Libraries
- Lucide icons (via CDN)

# Recent Changes (October 22, 2025)

## Latest Update - Auth Pages Mobile Fix
- **Added burger menu to login and register pages**: Full navigation on all pages
  - Added complete navigation menu with burger button on login.html and register.html
  - Menu includes: услуги, психологи, блог, спец. предложения + auth button
  - Same mobile menu functionality as other pages (scroll lock, auto-close, click outside)
- **Fixed auth buttons for mobile**: Buttons now stack vertically on mobile devices
  - "Я клиент" / "Я психолог" buttons on login.html display vertically (<768px)
  - Role selection buttons on register.html adapt to vertical layout
  - Added .auth-buttons responsive class with flex-direction: column

## Previous Updates
- **Mobile Card Layout**: Fixed psychologist card order - Button before Price on mobile
- **Navigation**: Fixed position with z-index hierarchy, removed backdrop-filter blur
- **Standardized Buttons**: All buttons use border-radius: 0.5rem consistently
- **Icon Fixes**: 3D icons (.icon-3d) don't stretch - flex-shrink: 0, min-width/height: 4rem