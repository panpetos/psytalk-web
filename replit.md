# Overview

This is a comprehensive online psychology platform called "PsychPlatform" that connects clients with qualified psychologists for remote consultations. The platform is built as a full-stack web application using React for the frontend and Express.js for the backend, with PostgreSQL as the database. The system supports three user roles: clients seeking psychological help, psychologists providing services, and administrators managing the platform.

The platform enables clients to search for psychologists, book appointments, and conduct sessions via video, audio, or chat. Psychologists can manage their profiles, schedules, and conduct consultations while receiving payments. Administrators oversee user verification, platform management, and analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing modern UI components from shadcn/ui built on Radix UI primitives. The architecture follows a component-based approach with:

- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Styling**: Tailwind CSS with CSS variables for theming support
- **UI Components**: Comprehensive component library with accessible Radix UI primitives
- **File Upload**: Uppy integration for handling document uploads (psychologist certifications, etc.)

The frontend is structured with clear separation between pages, components, and utilities, with path aliases configured for clean imports.

## Backend Architecture
The server uses Express.js with TypeScript in ES module format, providing a RESTful API architecture:

- **Framework**: Express.js with middleware for JSON parsing, logging, and error handling
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: bcrypt for password hashing with session-based authentication
- **File Storage**: Google Cloud Storage integration for handling uploaded documents
- **API Design**: RESTful endpoints organized by feature areas (auth, appointments, reviews, etc.)

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