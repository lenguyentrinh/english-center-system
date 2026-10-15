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
- **Database**: MongoDB 7+
- **Authentication**: JWT (jjwt)
- **Data Access**: Spring Data MongoDB
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
- **repository/**: Spring Data MongoDB data access
- **entity/**: MongoDB document models (`@Document`, String ObjectId ids)
- **dto/**: Data transfer objects (Request/Response)
- **mapper/**: Entity ↔ DTO conversion

Current modules: `academic`, `attendance`, `auth`, `category`, `student`, `teacher`, `user`

**Shared utilities** in `backend/src/main/java/com/trinh/english_center_be/shared/`:
- `BaseEntity`: Abstract base for documents (createdAt, updateAt, active)
- `config/`: Spring configuration (security, OpenAPI/Swagger, etc.)
- `exception/`: Custom exceptions and global error handling
- `response/`: Standard API response wrappers
- `util/`: Common utilities
- `enums/`: Shared enumerations

### Backend Domain Rules
- **Categories** (`/categories`, any authenticated user reads, ADMIN writes): admin-managed tags (name unique case-insensitively, hex color). Delete is soft and returns 409 while a live course uses it. `Course.categoryId` is optional; a teacher can be assigned only if `Teacher.categoryIds` contains it (`PUT /teachers/{id}/categories`); a course without a category accepts any teacher. `Course.availableRoleTeacher` is legacy and no longer used for qualification. Only ADMIN/TEACHER/STUDENT (+ legacy TEACHER_* codes) are fixed roles. `DataSeeder` seeds IELTS/TOEIC/Giao tiếp only into an empty categories collection.
- **Enrollment**: `GET/POST /courses/{id}/students`, `DELETE /courses/{id}/students/{userId}` (cancel = status `CANCELLED`, history kept), `GET /users/{id}/enrollments`. Enrolling requires an ACTIVE user with the STUDENT role, a non-CLOSE course, no active duplicate (409) and room left (`maxStudent`, else 409 "Class is full"). Assigning/removing the STUDENT role creates/deactivates the `Student` profile (removal cancels active enrollments). `CourseResponse.enrolledCount` = active enrollments.
- **Course schedule**: `Course` has `room`, `daysOfWeek` (ISO 1=Mon..7=Sun), `startTime`/`endTime` (07:00–22:00). Assigning a teacher (create/update/`assign-teacher`) returns 409 naming the clashing course codes when another live non-CLOSE course of that teacher overlaps in dates + weekday + time, unless `force=true` (admin confirmed). `GET /courses/schedule?teacherId&from&to` returns per-teacher dated sessions and `conflictCount` (default current week, max 62 days; non-admins only get their own row). Course create/update/delete/assign are ADMIN-only; `startDate` must not be in the past only on create.
- **Users**: admin email change sets `emailVerified=false` and mails a code to the new address (login is blocked until verified); locking/deactivating/deleting revokes all refresh tokens and is refused for yourself and for the last active admin; admin-created ACTIVE users get a password-setup code by email (use "Forgot password"); `phone` is normalised (spaces stripped, blank → null), `fullName` min 2 chars; `UserResponse.roles` lists effective role codes; `GET /users/search?q&role&status&page&size` returns `{items,total,page,size}`.

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
- **Cookies only, no token in JSON**: `AUTH_TOKEN` (JWT access, 15 min, path `/`) and `REFRESH_TOKEN` (opaque `id.secret`, 7 days, path `<context-path>/auth`), both HttpOnly. `COOKIE_SECURE` / `COOKIE_SAMESITE` configurable.
- **Refresh rotation** (`RefreshTokenServiceImpl`): each `POST /auth/refresh` revokes the old token and issues a new one via a conditional update (no Mongo transaction needed). Reusing a revoked token outside a 10 s grace window revokes every session of that user.
- **Endpoints** (`/auth/*`): `signup`, `login` (username or email), `refresh`, `logout`, `me`, `change-password`, `forgot-password`, `verify-otp`, `reset-password`. Login errors share one message; `forgot-password` always answers the same.
- **Password reset**: 6-digit code, HMAC-hashed, 5 min TTL, 5 attempts, 60 s resend cooldown; `verify-otp` does not consume it, `reset-password` re-checks and consumes it, then revokes all sessions. Without `spring.mail.host` the code is logged (dev only); prod refuses to start without SMTP.
- **Email verification**: self-signup creates `emailVerified=false` and emails a code (`POST /auth/verify-email`, `/auth/resend-verification`, same OTP safeguards, separate collection). Login with a correct password but unverified email returns 401 with `origin: "email-not-verified"`. `User.emailVerified == null` (legacy) counts as verified; admin-created users and completed password resets are verified.
- **User profile update** (`PUT /users/{id}`, `UserUpdateRequest`) never touches the password; only admins can change `status` and `email`.
- `AuthRateLimitFilter`: 10 POST/min per IP on login/signup/forgot/verify/reset (in-memory, per instance).
- Principal is `AuthUserDetails` (has `id`), so `#id == authentication.principal.id` works. Roles/status are re-read from the DB on every request.
- Anonymous access to protected URLs returns **401** (custom entry point); the frontend relies on that to refresh.
- Frontend: `useAuth()` (TanStack Query key `["auth","me"]`) is the single source of session state; `RequireAuth roles={[...]}` guards routes and redirects to `/auth/login?return=<path>` (validated by `safeReturnPath`). The axios interceptor in `shared/api/client.ts` does one shared refresh then replays the request; menus hidden by role are UX only, the backend enforces permissions.

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
Start MongoDB before running the backend. The database and collections are created automatically on first use:
```bash
docker run -d --name english-center-mongo -p 27017:27017 mongo:7
```

## Configuration

### Environment Variables
Both backend and frontend require `.env` files (see `.env.example` in each directory):

**Backend** (`.env` in `backend/`):
- `SERVER_PORT`: API port (default: 8080)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/english_center_db)
- `JWT_SECRET`: JWT signing key (min 32 chars for HS256)
- `JWT_EXPIRATION_MS`: Access token lifetime in ms (default: 900000 = 15 min)
- `JWT_REFRESH_EXPIRATION_MS`: Refresh token lifetime in ms (default: 604800000 = 7 days)
- `spring.mail.host/port/username/password`, `MAIL_FROM`: SMTP for password-reset emails (optional in dev)
- `TIMEZONE`: Server timezone (default: Asia/Ho_Chi_Minh)

**Frontend** (`.env` in `frontend/`):
- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:8080/api)

### Backend Configuration
- Spring configuration in `backend/src/main/resources/application.yml`
- MongoDB indexes are created automatically (`auto-index-creation: true`)
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
