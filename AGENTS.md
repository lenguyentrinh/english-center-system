# AGENTS.md - AI Agent Workflow & Harness

This document defines how an AI coding agent should operate in this codebase.

## Workflow Overview

```
ANALYZE → PLAN → IMPLEMENT → VERIFY → REVIEW → COMPLETE
```

Each phase has objective exit criteria. A task is done only when ALL criteria are met.

---

## Phase 1: Analyze

**Objective:** Understand the request and identify impact scope.

### Analyze Checklist

- [ ] Identify which modules are affected (backend modules or frontend features)
- [ ] Check if RULE.md constraints apply (architecture rules, naming, etc.)
- [ ] Identify dependencies on other components
- [ ] Confirm environment (backend/frontend/both)
- [ ] Identify whether this is feature, fix, refactor, or chore
- [ ] Check git recent history for related changes
- [ ] Read PROGRESS.md to understand ongoing context

### Failure Prevention

If you identify any of these, STOP and ask for clarification:
- Request affects multiple unrelated modules
- Task requires schema migration strategy
- Task conflicts with in-progress work
- Scope is unclear or too large
- Rule violations are necessary to complete the task

---

## Phase 2: Plan

**Objective:** Define implementation strategy before writing code.

### When Planning is Mandatory

- Task affects 3+ files
- Task crosses module boundaries
- Task involves state management changes
- Task requires database schema changes
- Task is a refactor spanning multiple components
- User explicitly asks for a plan

### When Planning is Optional

- Straightforward bug fixes (1-3 files)
- Single-feature additions within one module
- Small UI changes

### Plan Requirements

A plan must answer:

1. **Scope**: Exactly which files will change?
   - List each file path and the nature of change (create/modify/delete)
2. **Dependencies**: What must happen first?
   - Build order, service initialization, config
3. **Testing**: How will changes be verified?
   - Which manual tests, which automated checks
4. **Rollback**: What breaks if this is reverted?
   - Data migration issues, API compatibility, client caching
5. **Review points**: Where should code be reviewed?
   - Critical sections, security boundaries, algorithm changes

### Plan Approval

Plans MUST be reviewed by the user before implementation if:
- Plan modifies architecture
- Plan affects shared components
- Plan requires significant refactoring
- Plan changes API contracts

Small plans (bug fixes, feature flags) can proceed without approval.

---

## Phase 3: Implement

**Objective:** Write code following rules and patterns.

### Scope Control

**Maximum file changes per task:**
- Bug fix: 5 files
- Feature: 10 files
- Refactor: 15 files (requires plan review first)
- Module migration: 20+ files (requires plan approval)

If exceeding limits, break into multiple tasks.

### Backend-Specific Guidelines

**Module Creation**
- New domain → new module under `modules/`
- Module must have: controller, service (interface + impl), repository, entity, dto, mapper
- Register service in Spring context

**Service Development**
- Always: Interface in `service/`, implementation in `service/impl/`
- Use `@RequiredArgsConstructor` for dependency injection
- Use `@Transactional` on methods that modify data
- Throw domain exceptions (R6), never RuntimeException

**Entity Development**
- Extend `BaseEntity` (R3)
- Use Lombok: `@Entity`, `@Data`, `@AllArgsConstructor`, `@NoArgsConstructor`
- Validation via `@Column` annotations, never in entity methods
- Use `@ManyToOne`, `@OneToMany` for relationships

**DTO Development**
- Request DTOs: `Create{Entity}Request`, `Update{Entity}Request`
- Response DTOs: `{Entity}Response`
- Use `@Valid` on all constraints
- Separate request/response (R4)

**Exception Handling**
- Throw from `shared/exception/` hierarchy (R6)
- Never catch exceptions in controllers (let GlobalExceptionHandler)
- Log at service level only

### Frontend-Specific Guidelines

**Feature Development**
- New domain → new folder under `src/features/{feature}/`
- Feature structure:
  ```
  features/myfeature/
    ├── myfeatureApi.ts         (API calls)
    ├── myfeatureThunks.ts      (createAsyncThunk operations)
    ├── myfeatureSlice.ts       (Redux slice)
    ├── types.ts                (TypeScript types)
    ├── pages/                  (route pages)
    └── components/             (feature components)
  ```

**State Management**
- Feature data in Redux slices
- Register slice in `src/app/store.ts`
- Use thunks for async operations
- UI state (modals, collapsed) OK in useState

**Component Development**
- Props fully typed (no `any`)
- Extract feature-specific components to `features/{feature}/components/`
- Extract reusable components to `src/components/`
- Use React Hook Form for forms with Zod validation

**API Layer**
- `*Api.ts` exports async functions
- Functions fully typed with request/response DTOs
- Error handling via try/catch (not throw to component)
- Use `apiClient` from `shared/api/client.ts`

**Type Safety**
- No `any` types (R13)
- TypeScript strict mode always
- Inference preferred where possible
- Response types match backend DTOs exactly

### Code Quality Checklist

Before moving to Verify:
- [ ] No `any` types (TypeScript)
- [ ] No `console.log` (use proper logging if needed)
- [ ] No commented-out code
- [ ] Naming follows conventions (R11, R12)
- [ ] No code duplication (DRY)
- [ ] No breaking changes to public APIs
- [ ] Module boundaries respected (R1)
- [ ] Dependencies are clear (no circular imports)

---

## Phase 4: Verify

**Objective:** Confirm changes work end-to-end.

### Build Validation

**Backend**
```bash
cd backend
./mvnw clean compile
./mvnw test              # Run all tests (once added)
```

**Frontend**
```bash
cd frontend
pnpm install             # If deps changed
pnpm run lint            # ESLint check
pnpm run build           # TypeScript + Vite build
```

### Runtime Validation

**Backend**
- Start via: `./mvnw spring-boot:run` or IntelliJ green Run button
- Check Swagger: `http://localhost:8080/api/swagger-ui/index.html`
- Test endpoints via Swagger or Postman
- Verify database changes via MySQL client

**Frontend**
- Start via: `pnpm run dev`
- Test feature in browser at `http://localhost:5173`
- Check browser console for errors
- Test against running backend (port 8080)

---------------------------------------------
Available project skills:

- .agents/skills/design-taste-frontend/SKILL.md

When generating or modifying frontend code:
- Read and apply this skill first
- Follow its design principles
- Explain which principles are being applied
----------------------------------------------

### Manual Testing Checklist

For each new/modified feature:
- [ ] Happy path works (normal user flow)
- [ ] Error cases handled (validation, API errors, network errors)
- [ ] Form validation visible and clear
- [ ] Loading states shown
- [ ] Redirects work correctly
- [ ] No console errors
- [ ] Responsive on mobile (if UI change)
- [ ] Previous features still work (regression check)

### Database Validation (Backend Only)

If entity changes:
- [ ] Hibernate auto-generates schema (check `application.yml` setting)
- [ ] Run migrations if custom SQL needed
- [ ] Data integrity constraints enforced
- [ ] Backward compatibility maintained

---

## Phase 5: Review

**Objective:** Ensure code meets standards before merge.

### Code Review Checklist

- [ ] Architecture boundaries respected (R1-R2)
- [ ] RULE.md constraints followed
- [ ] No hardcoded secrets (R15)
- [ ] Error handling complete (no swallowed exceptions)
- [ ] Type safety: no `any` (R13)
- [ ] Naming conventions (R11, R12)
- [ ] Module API contracts honored
- [ ] No unnecessary duplication
- [ ] Comments only for non-obvious logic
- [ ] Tests added if architecture enables testing
- [ ] PROGRESS.md updated

### Security Review

- [ ] No SQL injection risk (JPA handles this)
- [ ] No XSS risk (React escapes by default)
- [ ] Auth check on protected endpoints (backend)
- [ ] Role-based access enforced
- [ ] Secrets not in code
- [ ] Input validation at API boundary (R5)

### Performance Review

- [ ] No N+1 database queries
- [ ] No unnecessary list iterations
- [ ] Redux selectors memoized if used
- [ ] No memory leaks in React effects
- [ ] No excessive re-renders

---

## Phase 6: Complete

**Objective:** Task is done and documented.

### Definition of Done

A task is complete when:

#### Code Quality
- [ ] Code follows all patterns in RULE.md
- [ ] All files changed are listed
- [ ] No build warnings or errors
- [ ] TypeScript compilation successful (frontend)
- [ ] Maven compilation successful (backend)

#### Testing & Verification
- [ ] Feature tested manually (golden path)
- [ ] Error cases tested
- [ ] No regressions in related features
- [ ] Database schema (if changed) migrates cleanly
- [ ] Endpoints in Swagger (backend)

#### Documentation
- [ ] Commit message follows convention (R18)
- [ ] PROGRESS.md updated with completed work
- [ ] If new patterns introduced, RULE.md updated
- [ ] API documentation clear (Swagger comments if needed)

#### Git
- [ ] Branch created from `main`
- [ ] Commits atomic and descriptive
- [ ] No merge conflicts
- [ ] Branch pushed to remote
- [ ] PR created (if required)

### Completion Verification

Checklist for marking a task as complete:

**Backend Changes**
- [ ] `./mvnw clean compile` succeeds
- [ ] `./mvnw test` succeeds (if tests exist)
- [ ] Swagger UI shows new endpoints (if API changed)
- [ ] Module boundaries respected
- [ ] No circular dependencies

**Frontend Changes**
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run lint` shows no errors
- [ ] Dev server runs without errors
- [ ] Feature works in browser
- [ ] Redux DevTools shows correct state (if state added)

**Both**
- [ ] Recent git log shows clear commits
- [ ] PROGRESS.md updated
- [ ] RULE.md updated (if new patterns)

---

## Failure Modes & Guardrails

### Failure Mode: Module Contamination
**What:** Service logic added to wrong module or shared/ directory

**Prevention:**
- Analyze which module owns the domain
- Only add to shared/ if used by 2+ modules
- Ask user if unsure which module owns domain

---

### Failure Mode: Duplicate Service Pattern
**What:** Creating multiple implementations of same service logic

**Prevention:**
- Grep codebase before implementing
- Check existing services in all modules
- Extend existing patterns instead of duplicating

---

### Failure Mode: Scope Creep
**What:** Refactoring unrelated code while fixing a bug

**Prevention:**
- Limit file changes per phase (see Scope Control above)
- Resist urge to "clean up" while fixing bugs
- Create separate PR for refactoring

---

### Failure Mode: Missing Auth Checks
**What:** New endpoint doesn't check user authentication

**Prevention:**
- Every controller method: check `@PreAuthorize` or manually verify auth
- Check SPRING_SECURITY config in shared/config/
- Test as unauthenticated user (should 401)

---

### Failure Mode: Type Safety Regression
**What:** Using `any` type to avoid type errors

**Prevention:**
- Never use `any` (see R13)
- If stuck, ask for help on type definition
- Use `unknown` temporarily if needed, not `any`

---

### Failure Mode: Missing DTO Mapping
**What:** Returning entity directly from controller

**Prevention:**
- Controllers return DTOs only
- Use mapper in service layer
- Check all endpoints use DTOs

---

### Failure Mode: Forgot BaseEntity
**What:** New entity doesn't extend BaseEntity

**Prevention:**
- All JPA @Entity must extend BaseEntity
- Check entity file: first line after imports should be class extends BaseEntity

---

### Failure Mode: Breaking Changes
**What:** API change breaks frontend or vice versa

**Prevention:**
- Backend: update DTOs, then controller, then service
- Frontend: check Swagger before implementing
- Run manual test with both services running
- If breaking change necessary: coordinate with user

---

## Working with Specialized Agents

This repository supports specialized agents for expert help:

### spring-boot-engineer
When: Backend feature, service design, Spring Security, JPA query optimization
How: Ask "I need expert guidance on [backend topic]"

### react-ts-engineer  
When: Frontend component architecture, Redux, form validation, type design
How: Ask "I need expert guidance on [frontend topic]"

### fullstack-engineer
When: API design, backend ↔ frontend contract, authentication flow, deployment
How: Ask "I need expert guidance on [full-stack topic]"

---

## Handoff Protocol

When a task is incomplete and future session will continue:

1. **Commit current state** - Even incomplete work should be committed with WIP message
2. **Update PROGRESS.md** - What was done, what remains, blockers
3. **Tag for next session** - Leave clear notes on what's blocking/unfinished

Example handoff:
```
## In Progress
- feat: Add course scheduling API
  - [x] Created entity & service layer
  - [x] Implemented schedule controller
  - [ ] TODO: Add frontend course schedule page
  - [ ] TODO: Test with multiple time zones
  - Blocker: Need decision on recurring schedule pattern (R or cron expression)
```

---

## Quick Reference

| Phase | Time | Key Question | Exit Criteria |
|-------|------|--------------|---------------|
| Analyze | 2 min | Is scope clear? | Blockers identified |
| Plan | 5-10 min | What changes? | File list + testing strategy |
| Implement | Varies | Does code work? | Build succeeds |
| Verify | 5-10 min | Does it work end-to-end? | Manual tests pass |
| Review | 5 min | Does it meet standards? | Code review checklist |
| Complete | 2 min | Is it done? | Definition of Done met |

---

**Last Updated:** 2026-06-11  
**Audience:** AI coding agents
