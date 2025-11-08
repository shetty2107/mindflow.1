# MindFlow - AI-Powered Mental Wellness Study Companion

## Overview

MindFlow is a web application that helps students create personalized study plans adapted to their emotional state and learning needs. The application uses AI (Claude/Anthropic) to generate customized study schedules based on user input about their tasks, available time, subject matter, and personal challenges. It emphasizes mental wellness by adapting plans to emotional states and providing wellness tips throughout the study process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 19 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for client-side routing with the following pages:
- Home (landing page with features)
- Login/Signup (authentication)
- Brain Dump (study plan creation form)
- Dashboard (task management and progress tracking)

**State Management**: TanStack React Query for server state management with custom query client configuration. Session-based authentication state managed via HTTP-only cookies.

**UI Component System**: shadcn/ui component library based on Radix UI primitives with Tailwind CSS for styling. Uses the "new-york" style variant with a custom design system featuring:
- Light mode: Cream backgrounds (#FCFCF9), teal primary color (#21808D)
- Dark mode: Charcoal backgrounds (#1F2121), light teal primary (#32B8C6)
- Custom CSS variables for theming with HSL color format
- Inter font for body text, Poppins for headings

**Design Philosophy**: Preserves existing visual design exactly - this is a backend rebuild project maintaining the same frontend appearance. Features emoji-driven UI elements and emotion-aware interfaces.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**Session Management**: Express-session with MemoryStore for development. Sessions stored in-memory with 7-day cookie expiration. Session includes `userId` for authentication tracking.

**Authentication**: Custom username/password authentication using bcrypt for password hashing (10 salt rounds). No JWT - relies on server-side sessions with HTTP-only cookies.

**API Structure**: RESTful API with the following endpoints:
- `/api/auth/register` - User registration
- `/api/auth/login` - User login  
- `/api/auth/logout` - User logout
- `/api/auth/user` - Get current user
- `/api/study-plans` - CRUD operations for study plans
- `/api/tasks` - CRUD operations for tasks
- `/api/study-sessions` - Manage study sessions
- `/api/emotions` - Track emotional states
- `/api/ai/generate-plan` - Generate AI study plan
- `/api/ai/adapt-plan` - Adapt plan based on emotion

**Data Storage**: In-memory storage implementation (`MemStorage` class) during development. The schema is defined using Drizzle ORM with PostgreSQL dialect, indicating production will use PostgreSQL (likely via Neon serverless). Storage interface (`IStorage`) provides abstraction for future database migration.

**AI Integration**: Groq API (using `llama-3.1-8b-instant` model via groq-sdk) for:
- Generating personalized study plans from user input
- Adapting plans based on emotional check-ins
- Providing wellness-focused, empathetic guidance

The AI considers: subject matter, available hours, raw task descriptions, user challenges (procrastination, focus issues, etc.), and current emotional state to create adaptive study schedules with built-in breaks and encouragement.

**AI Configuration**: Temperature set to 0.7 for balanced creativity/consistency, max_tokens of 1500 for comprehensive plans, and wellness-focused system prompts to maintain empathetic tone.

### Data Models

**Users**: Simple username/password model with UUID primary keys

**Study Plans**: Contains subject, custom subject option, available hours, challenges array, raw task input, AI-generated plan text, and timestamps

**Tasks**: Individual task items with title, description, duration, completed status, priority, and associations to users/plans

**Study Sessions**: Tracking actual study time with start/end times, breaks, and productivity notes

**Emotions**: Emotional check-ins with type (stressed, calm, motivated, overwhelmed, confident, anxious) and optional notes

All models use UUID primary keys generated via PostgreSQL's `gen_random_uuid()`.

## External Dependencies

### Third-Party APIs
- **Groq API**: Core AI functionality for study plan generation and adaptation using the llama-3.1-8b-instant model. Requires `GROQ_API_KEY` environment variable.

### Database
- **PostgreSQL** (production): Configured via Drizzle ORM with Neon serverless driver (`@neondatabase/serverless`). Requires `DATABASE_URL` environment variable.
- **In-Memory Storage** (development): Temporary storage implementation until database is provisioned.

### Authentication & Session
- **bcrypt**: Password hashing with 10 salt rounds
- **express-session**: Session management with memory store (development) or connect-pg-simple (production PostgreSQL sessions)

### UI Component Libraries
- **Radix UI**: Accessible component primitives for dialogs, dropdowns, checkboxes, etc.
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization for progress tracking

### Build & Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database schema management and migrations
- **Wouter**: Lightweight client-side routing

### Environment Variables Required
- `GROQ_API_KEY`: For AI plan generation using Groq's llama-3.1-8b-instant model
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key (defaults to development value)
- `NODE_ENV`: Environment flag (development/production)