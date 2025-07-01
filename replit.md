# Mundo Divertido - PWA for Neurodivergent Children

## Overview

This is a Progressive Web App (PWA) designed specifically for neurodivergent children (autism, Down syndrome) to provide accessible, engaging educational activities. The application features a clean, child-friendly interface with large buttons, high contrast colors, and simple navigation patterns optimized for tablet use.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server:

- **Frontend**: React with TypeScript using Vite as build tool
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

The architecture prioritizes accessibility and simplicity, with large touch targets, clear visual hierarchy, and intuitive navigation flows designed for children with special needs.

## Key Components

### Frontend Architecture
- **Component Structure**: Uses Shadcn/ui component library for consistent, accessible UI components
- **Styling**: Tailwind CSS with custom child-friendly color palette and sizing utilities
- **PWA Features**: Service worker for offline capability, manifest for app-like experience
- **Accessibility**: High contrast colors, large touch targets, keyboard navigation support

### Backend Architecture
- **API Design**: RESTful endpoints with session-based authentication
- **Data Layer**: Drizzle ORM for type-safe database operations
- **Session Management**: Express-session with secure cookie configuration
- **Activity Tracking**: Real-time monitoring of user engagement and time spent

### Database Schema
- **Users**: Parent/guardian accounts with authentication
- **Children**: Child profiles with customizable avatars and settings
- **Activities**: Time tracking for different activity types (music, coloring, photos)
- **Content**: Photos and songs with metadata for the educational activities

## Data Flow

1. **Authentication Flow**: Users can log in as parents or enter as guests
2. **Child Profile**: Each session is associated with a child profile for personalization
3. **Activity Selection**: Simple menu with three main activities (music, coloring, photos)
4. **Activity Tracking**: Real-time monitoring of engagement duration
5. **Parent Dashboard**: Settings and analytics for parent/guardian oversight

The data flow emphasizes simplicity and immediate feedback, with minimal loading states and clear visual indicators of progress.

## External Dependencies

### Core Framework Dependencies
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool with hot module replacement
- **Express**: Web server framework for API endpoints
- **Drizzle**: Type-safe ORM for PostgreSQL

### UI and Styling
- **Shadcn/ui**: Pre-built accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Primitive components for accessibility
- **Lucide React**: Icon library with consistent styling

### Database and Storage
- **PostgreSQL**: Primary database via Neon serverless
- **Bcrypt**: Password hashing for security
- **Express-session**: Session management middleware

## Deployment Strategy

The application is configured for deployment with:

- **Build Process**: Vite builds the client, esbuild bundles the server
- **Environment**: NODE_ENV-based configuration for development/production
- **Database**: Drizzle migrations for schema management
- **Static Assets**: Client build output served by Express in production
- **PWA Support**: Service worker and manifest for offline capabilities

The deployment strategy supports both development (with hot reload) and production environments with optimized bundles.

## Changelog

```
Changelog:
- June 30, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```