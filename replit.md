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

## Latest Update - Psychologist Avatars + Mobile Fixes (October 22, 2025)
- **Replaced photos with gradient avatars**: Psychologists now have beautiful gradient avatars with initials
  - Removed external Unsplash images that didn't load on mobile
  - Each psychologist has unique gradient color (6 gradient variations)
  - Initials displayed in white on gradient background
  - Avatars are always visible and load instantly
- **Fixed psychologist photos on mobile**: Avatars protected from compression
  - Added min-width and min-height to prevent squishing on all screen sizes
  - Desktop: 80x80px, Tablet: 70x70px, Mobile: 60x60px
  - Added display: block for reliability
- **Centered login icon**: Lock icon now properly centered with margin-left/right: auto
- **Unified auth buttons**: "Зарегистрироваться" button now matches "Войти" button colors
  - Background: #7C3AED, Hover: #6D28D9, White text

## Previous Update - Blog Page Mobile Adaptation
- **Mobile-responsive blog grid**: Articles now display in single column on mobile
  - Changed from multi-column grid to single column (<768px)
  - Reduced gap between articles from 2rem to 1.5rem
- **Optimized typography for mobile**:
  - Hero title: 3rem → 2rem
  - Hero description: 1.25rem → 1rem
  - Article titles: 1.25rem → 1.125rem
- **Adjusted card layout**:
  - Article image height: 200px → 160px on mobile
  - Card padding: 1.5rem → 1rem on mobile
- **Result**: Blog page is now fully responsive and comfortable to read on all devices

## Previous Update - How It Works Section Fix
- **Fixed step order on mobile**: Steps now display in correct 1→2→3 order
  - Changed CSS selector from `.section .grid > div:last-child` to `section:first-of-type .grid > div:last-child`
  - This prevents order change in "Как это работает" section while keeping Hero image first on mobile
- **Fixed step number circles**: Circles are now perfectly round and don't squish
  - Added flex-shrink: 0, min-width: 3rem, min-height: 3rem to prevent compression
  - Circles maintain shape on all screen sizes

## Previous Update - Auth Pages Mobile Fix
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