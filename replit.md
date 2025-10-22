# Overview

This is a comprehensive online psychology platform called **"psytalk.pro"** that connects clients with qualified psychologists for remote consultations. The platform is built as a full-stack web application using **pure HTML/CSS/JavaScript** for the frontend and Express.js for the backend with MySQL database. The system supports three user roles: clients seeking psychological help, psychologists providing services, and administrators managing the platform.

The platform enables clients to search for psychologists, book appointments, and conduct sessions via video, audio, or chat. Psychologists can manage their profiles, schedules, and conduct consultations while receiving payments. Administrators oversee user verification, platform management, and analytics.

## Recent Changes (October 22, 2025)

### Latest Update - Login Page Redesign & Complete Branding Refresh
- **Login page (login.html) complete redesign**: Beautiful minimalist design matching register.html style
  - 3D purple gradient lock icon with shadow effects
  - Input fields with icons (email, password)
  - Purple button (#7C3AED) with hover effect (#6D28D9)
  - Quick registration buttons: "Я клиент" and "Я психолог"
  - Demo accounts info block with purple background (#F3E8FF)
- **Complete branding audit**: Replaced ALL remaining "PsychPlatform" mentions with "psytalk.pro"
  - Updated page titles across all HTML files
  - Fixed demo account emails: @psychplatform.com → @psytalk.pro
  - Corrected navigation logos on all pages (consultation, edit-profile, psychologist-profile, demo-notice, admin-dashboard, leave-review, psychologist-dashboard)
- **Navigation improvements**: 
  - Added working anchor links on index.html: #services, #offers, #blog
  - Fixed logo spacing across all pages using HTML comments to eliminate visual gaps
- **Hero image**: Added professional video call image from Freepik on main page

### Previous Update - Design Refinements and UX Improvements
- **Terminology standardization**: All instances of "сессия" replaced with "консультация" across all pages
- **Pricing corrections**: Updated first consultation price from 100₽ to 2500₽ everywhere
- **3D Icon System**: Added gradient icons with shadow effects and hover animations (class="icon-3d")
- **FAQ Enhancement**: Implemented smooth accordion animation (300ms transitions) with custom arrows
- **Dropdown Styling**: All select elements now have rounded corners (border-radius: 0.5rem) and custom purple arrows
- **Mobile Responsiveness**: 
  - Added mobile-friendly filter sidebar with slide-in animation
  - Floating filter button on mobile (purple gradient, bottom-right corner)
  - Mobile overlay for sidebar with smooth transitions
  - Responsive grid fixes for all breakpoints
- **Updated pages**:
  - **index.html**: 3D icons, correct pricing (2500₽), FAQ animations, "консультация" terminology
  - **search.html**: Mobile filters, styled dropdowns, filter labels redesign, responsive layout
  - **client-dashboard.html**: "консультация" terminology, promo code section text corrections

### Previous Update - psytalk.pro Rebranding
- **Complete platform rebranding**: PsychPlatform → psytalk.pro
- **New visual identity**: Purple color scheme (#7C3AED primary, #F3E8FF secondary)
- **Minimalist EgoDrive-style redesign**: Clean, modern aesthetics with focus on content
- **Logo redesign**: Text-based "psy" (black) + "talk.pro" (purple italic), no icons
- **Bug fixes**: Fixed API fetch method (POST → GET), corrected badge text

### Previous Changes
- **Completed HTML/CSS/JS migration** from React to pure web technologies
- **Migrated to MySQL** from PostgreSQL for reg.ru hosting compatibility
- **CSS Design System**: Complete CSS with HSL color variables, card/button/form components, skeleton loaders
- Server runs in DEMO mode without MySQL, serves static pages for UI preview
- Ready for deployment to reg.ru with MySQL database

# User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Russian (all communication should be in Russian).

# System Architecture

## Frontend Architecture
The client-side application is built with **pure HTML/CSS/JavaScript**, recreating the shadcn/ui design system without dependencies. The architecture follows a multi-page approach with:

- **Pages**: Static HTML files for each route (index.html, search.html, client-dashboard.html, etc.)
- **Styling**: Custom CSS design system inspired by shadcn/ui with HSL color variables, responsive grid, utility classes
- **Components**: Card, Button, Badge, Form, Modal components built with pure CSS
- **Icons**: Lucide icons via CDN for consistent iconography
- **Interactivity**: Vanilla JavaScript for tabs, filters, modals, and dynamic content
- **API Integration**: Fetch API for backend communication

The frontend provides a beautiful, responsive UI that matches the original React design quality.

## Backend Architecture
The server uses Express.js in ES module format, providing a RESTful API architecture:

- **Framework**: Express.js with middleware for JSON parsing, session management, and error handling
- **Database**: MySQL for production (reg.ru compatible), with DEMO mode fallback when unavailable
- **Authentication**: bcrypt for password hashing with express-session for session management
- **Storage**: In-memory storage or MySQL depending on environment
- **API Design**: RESTful endpoints organized by feature areas (auth, appointments, reviews, etc.)
- **DEMO Mode**: Server serves static HTML/CSS/JS pages when MySQL is unavailable

## Data Storage Solutions
The application uses a PostgreSQL database with a well-structured schema managed through Drizzle ORM:

- **Database**: PostgreSQL hosted on Neon Database
- **ORM**: Drizzle ORM providing type-safe database operations and migrations
- **Schema**: Comprehensive relational design supporting users, psychologists, appointments, reviews, messages, and availability
- **File Storage**: Google Cloud Storage for static assets and document uploads

Key database relationships include user-to-psychologist profiles, appointment bookings with client-psychologist connections, and review systems with proper referential integrity.

## Authentication and Authorization
The platform implements role-based access control with three distinct user types:

- **Authentication**: Email/password authentication with bcrypt password hashing
- **Authorization**: Role-based access control (client, psychologist, admin) enforced at both API and UI levels
- **Session Management**: Client-side auth state management with persistent sessions
- **Security**: Password validation, secure routes, and user verification workflows

## Communication Features
Real-time consultation capabilities are built into the platform:

- **Video Consultations**: Browser-based video calling interface with camera/microphone controls
- **Audio Sessions**: Audio-only consultation mode for privacy or preference
- **Chat Messaging**: Text-based communication system for sessions or follow-ups
- **Session Recording**: Optional session recording capabilities with consent management

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL hosting service for production database
- **Drizzle Kit**: Database migration and schema management tools

## Cloud Storage
- **Google Cloud Storage**: Document storage for psychologist certifications, user avatars, and session-related files

## UI and Component Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework for styling

## File Upload and Management
- **Uppy**: Modern file uploader with support for multiple upload sources and cloud storage integration
- **AWS S3 Uppy Plugin**: Integration for cloud storage uploads

## Development Tools
- **Vite**: Build tool and development server for frontend
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **React Query**: Server state management and caching

## Authentication and Validation
- **bcrypt**: Password hashing for secure authentication
- **Zod**: Schema validation for API inputs and form validation
- **React Hook Form**: Form state management with validation

The platform is designed for deployment on Replit with development-specific integrations and error handling overlays for the development environment.