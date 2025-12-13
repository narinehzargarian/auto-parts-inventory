# JunkYard Pro - Inventory Management System

## Overview

JunkYard Pro is a web-based inventory management system designed for junkyard operations. It enables tracking of salvaged auto parts and machines with features for categorization, location tracking, stock level monitoring, and condition assessment. The application follows a Material Design approach optimized for data-dense interfaces with high contrast for outdoor/workshop visibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Build Tool**: Vite with React plugin

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Dashboard, Inventory, Low Stock, Settings)
- Reusable UI components in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`
- Centralized API client in `client/src/lib/queryClient.ts`

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful JSON API under `/api` prefix
- **Validation**: Zod schemas for request/response validation

The server structure includes:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Data storage abstraction layer
- `server/vite.ts` - Vite dev server integration
- `server/static.ts` - Production static file serving

### Data Layer
- **Schema Definition**: Zod schemas in `shared/schema.ts` for type-safe data models
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Current Storage**: In-memory storage implementation (MemStorage class)
- **Database Ready**: Drizzle config present for PostgreSQL migration when needed

The inventory item schema includes fields for name, SKU, category, quantity, condition, location (row/section/bin), price, and notes.

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- Type definitions and Zod schemas
- Constants (CATEGORIES, CONDITIONS arrays)
- Validation logic

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database toolkit with `drizzle-kit` for migrations
- **connect-pg-simple**: PostgreSQL session store (available for session management)

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-styled components using Radix + Tailwind
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant styling

### Frontend Libraries
- **TanStack React Query**: Server state management
- **React Hook Form**: Form handling with `@hookform/resolvers`
- **date-fns**: Date formatting utilities
- **embla-carousel-react**: Carousel component
- **cmdk**: Command palette component
- **vaul**: Drawer component

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **Tailwind CSS**: Utility-first CSS with PostCSS/Autoprefixer

### Fonts
- **Roboto**: Primary UI font (loaded from Google Fonts)
- **Roboto Mono**: Monospace font for codes/SKUs