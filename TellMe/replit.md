# Overview

This is a modern full-stack web application that implements a "Lennon Wall" - a digital platform for posting anonymous messages and community interaction. The application allows users to create, view, like, and report messages in a social media-like interface. Built with a React frontend and Express backend, it features real-time interactions with message posting, liking functionality, and content moderation through reporting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Storage**: In-memory storage implementation with interface for future database integration
- **API Design**: RESTful endpoints for CRUD operations on messages, likes, and reports
- **Validation**: Zod schemas for request validation and type safety
- **Development**: Hot reload with Vite integration for seamless full-stack development

## Data Storage Solutions
- **Current**: In-memory storage using Maps for messages, likes, and reports
- **Schema**: Drizzle ORM schema definitions ready for PostgreSQL migration
- **Database Planned**: PostgreSQL with Neon Database serverless connection
- **Migrations**: Drizzle Kit for database schema management

## Authentication and Authorization
- **User Identification**: Browser fingerprinting for anonymous user tracking
- **Session Management**: LocalStorage-based fingerprint persistence
- **Security**: No traditional authentication - relies on device fingerprinting for like/report tracking

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting (configured but not yet active)
- **Drizzle ORM**: Type-safe database queries and schema management
- **Connection**: PostgreSQL dialect with connection pooling support

### UI and Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment optimization with error handling
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### State Management
- **TanStack React Query**: Server state caching, synchronization, and background updates
- **React Hook Form**: Form state management with validation
- **Wouter**: Minimalist routing solution

### Validation and Utilities
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Utility for managing component variants
- **clsx/twMerge**: Conditional CSS class composition