# RULE.md - Repository-Specific Constraints

This document defines architectural rules that AI agents must follow in this codebase.

## Architecture & Modularity

### R1: Honor Modular Boundaries
**Why:** Monorepos fail when modules become tangled. Clear boundaries enable independent testing and scaling.

**Rule:** 
- Backend modules (`academic`, `attendance`, `auth`, `student`, `teacher`, `user`) own their domain logic
- Each module is self-contained: controller → service → repository → entity → DTO
- Direct imports between modules are FORBIDDEN except through published APIs
- Shared logic lives ONLY in `shared/` directory

**Prevents:** Cross-module coupling, circular dependencies, accidental service duplication

**How to apply:**
- Never add domain logic to `shared/` unless it's used by 2+ modules
- Never import `modules/X/service` from `modules/Y/controller`
- If you need to reference another module's data, use its public DTO, not entity

---

### R2: Follow the Spring Service Pattern (Interface + Implementation)
**Why:** Spring's interface/impl pattern enables testability, mocking, and alternative implementations.

**Rule:**
- Every service MUST be declared as an interface
- Implementations live in `impl/` subfolder with `Impl` suffix
- Inject service INTERFACE, never implementation
- Use `@Service` on implementation only

**Example:** 
```
service/AuthService.java (interface)
service/impl/AuthServiceImpl.java (@Service)
```

**Prevents:** Hard-to-test code, tight coupling, difficulty mocking in tests

---

### R3: Extend BaseEntity for All JPA Entities
**Why:** Audit fields (id, createdAt, updatedAt) are needed on every entity. BaseEntity centralizes this.

**Rule:**
- All JPA entities MUST extend `shared/BaseEntity`
- Never add `id`, `createdAt`, `updatedAt` fields directly to entities
- Never skip inheritance just to avoid annotations

**Prevents:** Inconsistent audit trails, migration nightmares, data integrity issues

---

## DTO & Validation

### R4: Use DTOs for All API Contracts
**Why:** DTOs decouple API contracts from database models. Schema changes don't break clients.

**Rule:**
- Controllers accept/return DTOs, never entities
- Use mappers to convert entity ↔ DTO
- Validation annotations (`@Valid`) go on DTOs, never entities
- Request DTOs: separate from response DTOs (e.g., `CreateUserRequest`, `UserResponse`)

**Prevents:** API brittleness, validation logic in wrong layer, coupling DB schema to client contracts

---

### R5: Validate at API Boundaries Only
**Why:** Database and service layers should trust valid input. Validation at boundaries saves round-trips.

**Rule:**
- Validation annotations only on request DTOs
- Use `@Valid` on controller `@RequestBody` parameters
- Never validate entities or response DTOs
- Custom validators via `@ValueObject` annotations in shared/

**Prevents:** Redundant validation, performance overhead, inconsistent error messages

---

## Exception Handling

### R6: Throw Domain-Specific Exceptions
**Why:** Generic exceptions hide intent. Domain exceptions enable consistent error responses.

**Rule:**
- Throw from `shared/exception/` hierarchy only:
  - `ResourceNotFoundException` - entity not found
  - `BusinessException` - domain violation (invalid state, constraint)
  - `UnauthorizedException` - missing auth
  - `ForbiddenException` - auth exists but insufficient permissions
  - `InvalidCredentialException` - login failed
  - `ExistByFieldException` - unique constraint violation
  - `DatabaseException` - DB layer failures
- Never throw `RuntimeException` or `Exception` directly
- Services throw, controllers do NOT catch (let GlobalExceptionHandler handle it)

**Prevents:** Inconsistent error responses, swallowed exceptions, client confusion

**How to apply:**
- `service/impl/` throws domain exceptions
- `controller/` receives them and returns via GlobalExceptionHandler
- GlobalExceptionHandler converts to HTTP response

---

## Frontend: State & Organization

### R7: Feature-Folder Isolation
**Why:** Features are independent domains. Tangled features are hard to modify and test.

**Rule:**
- Each feature folder owns its domain: `src/features/{feature}/`
- Feature contains: `*Api.ts`, `types.ts`, state slices, validation
- Features do NOT import from other features (share via Redux or shared components)
- Cross-feature communication via Redux only

**Current features:** `auth`, `admin`, `courses`, `teachers`

**Prevents:** Circular imports, domain logic in wrong place, hard-to-track dependencies

---

### R8: Redux State Location
**Why:** Centralized, consistent state management enables time-travel debugging and server sync.

**Rule:**
- Domain state lives in Redux slices (one per feature)
- Slices registered in `src/app/store.ts`
- No useState for data that multiple components need
- useState OK only for UI state (collapsed, modal open, etc.)
- Use thunks for async API calls
- Auth state lives in BOTH Redux AND `sessionStorage` (for persistence across tabs)

**Prevents:** Prop drilling, state synchronization bugs, lost auth on page reload

---

### R9: Typing in Feature Types.ts
**Why:** Centralized types per feature enable type sharing and easy refactoring.

**Rule:**
- All feature-specific types in `types.ts`
- Request/response payloads match backend DTOs exactly
- Use type inference where possible (Zod schemas generate types)
- Never use `any`

**Prevents:** Type safety regression, duplicate type definitions, API contract mismatches

---

## API & HTTP

### R10: Axios Interceptors for Authentication
**Why:** Centralizes token handling, prevents accidental unauth requests.

**Rule:**
- Token injection via Axios interceptor in `shared/api/client.ts`
- No manual `Authorization` header in feature code
- Cookie support configured via `COOKIE_SECURE` env var
- HTTP errors caught globally, not in individual API calls

**Prevents:** Inconsistent auth headers, token replay, missing auth on new endpoints

---

## Naming Conventions

### R11: Backend Naming
**Why:** Consistent naming prevents confusion and enables easy refactoring.

**Rule:**

| Artifact | Convention | Example |
|----------|-----------|---------|
| Classes | PascalCase | `AuthController`, `CourseService`, `StudentEntity` |
| Methods | camelCase | `authenticateUser()`, `findById()` |
| Constants | UPPER_SNAKE_CASE | `AUTH_SUCCESS`, `MAX_RETRY_COUNT` |
| Packages | reverse-domain.module.layer | `com.trinh.english_center_be.modules.auth.service` |
| DTOs | `{Entity}{Direction}` | `CreateUserRequest`, `UserResponse`, `LoginPayload` |
| Tests | `{Class}{Scenario}Test.java` | `AuthServiceLoginTest.java` |

**Prevents:** IDE refactoring errors, inconsistent API names, confusion

---

### R12: Frontend Naming
**Why:** Clear naming makes the codebase self-documenting.

**Rule:**

| Artifact | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase | `LoginForm.tsx`, `CourseCard.tsx` |
| Functions/hooks | camelCase | `useAuthSession()`, `formatDate()` |
| Files | kebab-case or match export | `auth-form.tsx` OR `AuthForm.tsx` (export) |
| Types | PascalCase | `LoginPayload`, `CourseDTO` |
| Constants | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| API functions | camelCase | `login()`, `fetchCourses()` |
| Redux slices | `{feature}Slice` | `courseSlice.ts` |

**Prevents:** Import confusion, inconsistent component references

---

## Testing & Build

### R13: TypeScript Strict Mode Always
**Why:** Strict mode catches bugs at compile time, prevents runtime errors.

**Rule:**
- Frontend builds with `tsc -b` before Vite build (see package.json)
- Never use `any` types
- Never suppress TypeScript errors with `// @ts-ignore`
- Strict null checks enforced: `null` and `undefined` explicit

**Prevents:** Runtime type errors, `null` reference exceptions, undefined behavior

---

### R14: No Uncommitted Dependencies
**Why:** Reproducible builds require locked versions.

**Rule:**
- Backend: pom.xml locked (Maven)
- Frontend: pnpm-lock.yaml committed (do NOT use npm or yarn)
- No manual version bumps without testing against other modules

**Prevents:** CI/CD surprises, incompatible dependency hell

---

## Security

### R15: Never Expose Secrets
**Why:** Secrets in code or history enable compromise.

**Rule:**
- All secrets in `.env` files (not committed)
- `JWT_SECRET` minimum 32 characters
- Auth tokens in HttpOnly cookies or sessionStorage (NOT localStorage)
- No hardcoded passwords, API keys, or endpoints

**Prevents:** Security breaches, credential exposure, compliance violations

---

### R16: Authentication & Authorization
**Why:** Weak auth enables account takeover and privilege escalation.

**Rule:**
- Backend: JWT expiration configured via `JWT_EXPIRATION` env var (default 3600000 ms)
- Backend: All protected endpoints use Spring Security
- Frontend: Failed auth redirects to login (no silent failures)
- All user-modifying operations check ownership or role

**Prevents:** Token replay, expired-token bugs, unauthorized access

---

## Git & CI/CD

### R17: Branch Naming & PR Scope
**Why:** Organized PRs are reviewable and revertable.

**Rule:**
- Branch naming: `{type}/{domain}/{description}`
  - Types: `fe` (frontend), `be` (backend), `fix` (hotfix), `chore` (maintenance)
  - Domain: feature domain (auth, courses, teachers) or general
  - Example: `fe/feat/login-form`, `be/fix/jwt-expiration`
- One logical change per PR (not multiple unrelated features)
- Max 300 lines changed per PR (excludes auto-generated, lock files)
- No refactoring + feature in same PR

**Prevents:** Accidental reverts, hard-to-review code, merge conflicts

---

### R18: Commit Message Convention
**Why:** Clear history enables blame/bisect and release notes.

**Rule:**
- Format: `{type}: {description}`
  - Types: `feat` (feature), `fix` (bug), `refactor` (structure), `test` (test), `docs` (docs), `chore` (maintenance)
  - Example: `feat: add login form validation`, `fix: jwt expiration check`
- First line under 50 characters
- Reference issue numbers: `fix #123: ...`

**Prevents:** Unreadable history, rollback difficulty

---

## Module Patterns & Anti-Patterns

### R19: Module API Exports
**Why:** Clear APIs prevent unintended coupling.

**Rule:**
- Each module exposes a "facade" interface for cross-module use
- Other modules import ONLY the facade, not internal services
- Internal services use default visibility (package-private)
- Facade lives at module root level

**Example:**
```
modules/auth/service/AuthService.java (public interface - facade)
modules/auth/service/impl/AuthServiceImpl.java (package-private @Service)
```

**Prevents:** Leaky abstractions, hidden dependencies

---

## Deployment & Configuration

### R20: Environment-Specific Configuration
**Why:** Code works in dev but fails in prod without env config.

**Rule:**
- All config via environment variables (no hardcoded values)
- Backend reads from `.env` or system properties
- Frontend reads from `VITE_*` env vars at build time
- Database migrations run automatically (Hibernate `ddl-auto: update`)

**Required env vars:**
- Backend: `SERVER_PORT`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION`, `TIMEZONE`
- Frontend: `VITE_API_BASE_URL`

**Prevents:** Configuration drift, prod failures

---

## Summary of Key Guardrails

| Guardrail | Applies To | Action |
|-----------|-----------|--------|
| Module isolation | Backend | No cross-module imports (except through public API) |
| Service pattern | Backend | Interface + impl, inject interface |
| BaseEntity | Backend | All JPA entities extend BaseEntity |
| DTO validation | Backend | Validation only on request DTOs at API boundary |
| Exception throwing | Backend | Domain exceptions only, never swallow |
| Feature folders | Frontend | Each feature self-contained, no feature-to-feature imports |
| Redux state | Frontend | All shared state in Redux, UI state in useState |
| Type safety | Frontend | No `any`, strict mode always |
| Auth | Both | JWT + sessionStorage (frontend), Spring Security (backend) |
| Secrets | Both | Never in code, always in .env |
| Branch scope | Both | One logical change per PR, feature branches only |

---

**Last Updated:** 2026-06-11  
**Audience:** AI coding agents, code reviewers, future maintainers
