# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**English Center System** is a monorepo containing:
- **Backend**: Spring Boot 3.5.7 REST API with modular architecture (Java 24)
- **Frontend**: React 19 + Vite + TypeScript SPA with TailwindCSS

**Development Environment**: Windows 11 with PowerShell; commands below use PowerShell syntax. Bash equivalents work via Git Bash or Windows Subsystem for Linux.

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.7
- **Language**: Java 24
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jjwt)
- **Data Access**: Spring Data JPA with Hibernate
- **API Documentation**: SpringDoc OpenAPI (Swagger UI)
- **Validation**: Spring Validation
- **Utilities**: Lombok for boilerplate reduction
- **Build**: Maven with Java 24 compiler target
- **Testing**: Spring Boot Test framework

### Frontend
- **Runtime**: React 19 + React Router 7
- **Build Tool**: Vite
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS with @tailwindcss/vite
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Server State**: TanStack Query (`useQuery` / `useMutation`); Redux is no longer used
- **UI Notifications**: React Toastify
- **Linting**: ESLint (flat config) with TypeScript & React Hooks plugins

## Architecture

### Backend Module Structure
Backend follows a **modular architecture** organized by domain. Each module under `backend/src/main/java/com/trinh/english_center_be/modules/` contains:
- **controller/**: REST endpoints
- **service/**: Business logic (interface + impl)
- **repository/**: Spring Data JPA data access
- **entity/**: JPA domain models
- **dto/**: Data transfer objects (Request/Response)
- **mapper/**: Entity ↔ DTO conversion

Current modules: `academic`, `attendance`, `auth`, `student`, `teacher`, `user`

**Shared utilities** in `backend/src/main/java/com/trinh/english_center_be/shared/`:
- `BaseEntity`: Abstract base for JPA entities (id, createdAt, updatedAt)
- `config/`: Spring configuration (security, OpenAPI/Swagger, etc.)
- `exception/`: Custom exceptions and global error handling
- `response/`: Standard API response wrappers
- `util/`: Common utilities
- `enums/`: Shared enumerations

### Frontend Structure
- **`src/app/`**: Core app setup (routing, providers, state, hooks)
  - `router.tsx`: React Router configuration
  - `providers.tsx`: TanStack Query provider
- **`src/features/`**: Feature modules (auth, courses, admin, teachers)
  - Feature-based organization (one folder per domain)
  - Typically includes API calls (`*Api.ts`), types (`types.ts`), and feature-specific state
- **`src/pages/`**: Page components (route destinations)
- **`src/components/`**: Shared, reusable UI components
- **`src/shared/`**: Shared utilities, hooks, constants, and API client configuration
- **TypeScript Config**: Split across three files:
  - `tsconfig.json`: Root config with references
  - `tsconfig.app.json`: App-specific settings (strict mode, module resolution, path alias `@` → `src/`)
  - `tsconfig.node.json`: Tooling config (Vite, build scripts)

### Authentication & Security
- Backend: JWT-based authentication (SpringSecurity) with configurable expiration
- Frontend: Token stored and sent in API requests via Axios interceptors
- Cookie support configurable via `COOKIE_SECURE` env var
- API secured with standard Spring Security patterns

## Development Commands

### Backend
```bash
# From backend/ directory or open in IntelliJ IDEA
# Run via IntelliJ: Open EnglishCenterBeApplication.java, click green Run icon
# Or use Maven wrapper:
./mvnw spring-boot:run               # Run dev server (port 8080)
./mvnw clean compile                 # Compile
./mvnw test                          # Run tests
```

### Frontend
```bash
# From frontend/ directory
pnpm install                         # Install dependencies
pnpm run dev                         # Dev server (port 5173)
pnpm run build                       # Production build to dist/
pnpm run lint                        # Check linting (ESLint)
pnpm run preview                     # Preview production build locally
```

### Database
Create MySQL database before running backend:
```sql
CREATE DATABASE english_center_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Configuration

### Environment Variables
Both backend and frontend require `.env` files (see `.env.example` in each directory):

**Backend** (`.env` in `backend/`):
- `SERVER_PORT`: API port (default: 8080)
- `DB_URL`: MySQL JDBC URL
- `DB_USERNAME`, `DB_PASSWORD`: Database credentials
- `JWT_SECRET`: JWT signing key (min 32 chars for HS256)
- `JWT_EXPIRATION`: Token expiration in ms (default: 3600000 = 1 hour)
- `TIMEZONE`: Server timezone (default: Asia/Ho_Chi_Minh)

**Frontend** (`.env` in `frontend/`):
- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:8080/api)

### Backend Configuration
- Spring configuration in `backend/src/main/resources/application.yml`
- Hibernate auto-schema update enabled (`ddl-auto: update`)
- SQL logging enabled in dev profile
- CORS and security configured via Spring Security

### Frontend Configuration
- Vite config with path alias `@` → `src/`
- TailwindCSS utility-first CSS included
- TypeScript strict mode enabled
- Modern ESLint config (flat format) with TypeScript & React Hooks plugins

## API Documentation

Once backend is running, access Swagger UI at:
```
http://localhost:8080/api/swagger-ui/index.html
```

REST API is at `http://localhost:8080/api/v1/*`

## Common Development Patterns

### Backend
- **DTOs for API contracts**: Use `dto/` classes for request/response, map via mapper
- **Service layer for logic**: Business logic in service, repository for data access
- **Entity lifecycle**: Use `BaseEntity` for audit fields (`id`, `createdAt`, `updatedAt`)
- **Error handling**: Throw custom exceptions, caught by global `@ControllerAdvice` handler
- **Validation**: Use `@Valid` + annotation-based validation on request DTOs

### Frontend
- **Feature-based organization**: One folder per domain feature
- **Zod for validation**: Typed schema validation with type inference
- **TanStack Query for server state**: Fetch with `useQuery`, write with `useMutation` and invalidate related query keys
- **API layer**: Separate API calls in `*Api.ts` files, consumed by components
- **Component reuse**: Put shared UI components in `components/`
- **Type safety**: Strict TypeScript with separate `types.ts` per feature

## Testing

- **Backend**: Spring Boot Test framework available (`spring-boot-starter-test`)
- **Frontend**: TypeScript compilation checked at build time (`tsc -b`)

## Notes

- Lombok annotation processor configured in Maven compiler
- IntelliJ: Install Lombok plugin for IDE support
- Frontend path alias `@` resolves to `src/` directory
- Tailwind CSS is the only CSS framework used
- No uncommitted `.env` files (they're ignored in git)
