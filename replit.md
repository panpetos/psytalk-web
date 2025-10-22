# Overview

This is a comprehensive online psychology platform called "PsychPlatform" that connects clients with qualified psychologists for remote consultations. The platform is built as a full-stack web application using **pure HTML/CSS/JavaScript** for the frontend and Express.js for the backend with MySQL database. The system supports three user roles: clients seeking psychological help, psychologists providing services, and administrators managing the platform.

The platform enables clients to search for psychologists, book appointments, and conduct sessions via video, audio, or chat. Psychologists can manage their profiles, schedules, and conduct consultations while receiving payments. Administrators oversee user verification, platform management, and analytics.

## Recent Changes (October 22, 2025)
- **Completed HTML/CSS/JS migration** from React to pure web technologies
- **Recreated shadcn/ui design** - all pages now have the same beautiful design quality as the original React version
- **Migrated to MySQL** from PostgreSQL for reg.ru hosting compatibility
- **New page designs:**
  - Landing page: Hero section with gradients, features cards, CTA sections, footer
  - Search page: Sticky sidebar filters, responsive grid of psychologist cards, live filtering
  - Client Dashboard: Tabs navigation, appointment cards, sidebar statistics
  - All pages use Lucide icons, shadcn/ui-inspired components, responsive layouts
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