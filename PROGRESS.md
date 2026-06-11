# PROGRESS.md - Session State & Continuity

This document tracks ongoing work and enables seamless handoffs between sessions.

**Last Updated:** 2026-06-11  
**Status:** Repository foundation complete, ready for feature development

---

## Project Summary

**English Center System** — Full-stack educational management platform

- **Backend**: Spring Boot 3.5.7, Java 24, MySQL, modular architecture (6 domains)
- **Frontend**: React 19, Vite, TypeScript strict, Redux Toolkit, TailwindCSS
- **Status**: MVP foundation ready, API documented via Swagger
- **Development**: Windows 11 + PowerShell, IntelliJ (backend), VSCode (frontend)

---

## Completed Work

### Infrastructure & Setup
- ✅ Project structure established (monorepo, backend + frontend)
- ✅ Spring Boot configuration (security, JPA, Lombok, OpenAPI/Swagger)
- ✅ Frontend setup (React 19, Vite, TypeScript strict mode, Redux Toolkit)
- ✅ Database schema (MySQL, Hibernate auto-update)
- ✅ Authentication (JWT + sessionStorage, Spring Security)
- ✅ Error handling (GlobalExceptionHandler, custom exceptions)
- ✅ API documentation (Swagger UI at /api/swagger-ui/index.html)

### Modules Implemented
- **auth**: Login, signup, JWT token management
- **user**: User management, roles, role assignments
- **teacher**: Teacher entities and basic CRUD
- **academic**: Courses, sessions (SessionController exists)
- **student**: Student management (entity exists)
- **attendance**: Attendance tracking (entity exists)

### Frontend Features Implemented
- **auth**: Login/logout, session management via sessionStorage
- **courses**: Course list and management (Redux slice + thunks connected)
- **admin**: Full CRUD for users/roles/business roles via Redux (14 thunks + slice)
- **teachers**: Teacher list via Redux (thunks + slice connected)
- **session**: Session list by course via Redux thunks
- **UI components**: Shared Button component used across 15+ pages
- **Form schemas**: Extracted to feature-level files (businessRoleSchema, roleSchema)

### Developer Experience
- ✅ CLAUDE.md - Developer guidance and setup instructions
- ✅ RULE.md - Architectural constraints and patterns
- ✅ AGENTS.md - AI agent workflow and harness
- ✅ PROGRESS.md - This file, continuity document
- ✅ Swagger documentation auto-generated from API

---

## In Progress

None currently. (Refactoring: shared Button + Redux thunks/slices for admin/teachers/sessions complete)

---

## Pending Work

### High Priority

#### 1. **API Completeness** (Backend)
- Status: Partial
- Details:
  - CourseController exists but may need endpoints for:
    - GET /courses/{id} (fetch single course)
    - POST /courses (create course)
    - PUT /courses/{id} (update course)
    - DELETE /courses/{id} (delete course)
  - SessionController endpoints need verification
  - Missing CRUD for: attendance, student detail routes
- Action: Review CourseController and SessionController, complete REST endpoints per OpenAPI standard
- Modules affected: academic, attendance, student
- Owner: spring-boot-engineer

#### 2. **Frontend Course Pages** (Frontend)
- Status: Partial — pages exist and connected to Redux, forms need UI polish
- Details:
  - CourseListPage (HomePage/CoursesPage): exists, connected via Redux thunks
  - CourseDetailPage: exists with session list, connected via Redux
  - Course creation/edit form: CourseModal exists but may need UX improvement
  - All connected to courseApi.ts endpoints via Redux thunks
- Action: Review UI/UX of course forms and detail pages
- Modules affected: courses feature
- Owner: react-ts-engineer

#### 3. **Form Validation & Error Handling** (Frontend)
- Status: Partial
- Details:
  - Auth forms have validation (email, password)
  - Course creation form needs Zod schema
  - Error display needs consistent toast notifications
  - API errors should show user-friendly messages
- Action: Create Zod schemas for each feature, implement error toast display
- Modules affected: all features
- Owner: react-ts-engineer

#### 4. **Testing Infrastructure** (Both)
- Status: Not started
- Details:
  - Backend: No unit/integration tests yet
  - Frontend: No Jest/React Testing Library setup
  - Both: No CI/CD pipeline configured
- Action: Set up test frameworks, write test examples for each module
- Modules affected: all
- Priority: Medium (MVP works without tests, but critical for scalability)

#### 5. **Data Seeding / Demo Content** (Backend)
- Status: Not started
- Details:
  - Need sample courses, teachers, students for demo
  - Seed data for roles (admin, teacher, student)
  - SQL script or Java @Bean data loader
- Action: Create data.sql or SeedDataLoader class
- Modules affected: academic, user, teacher, student
- Owner: spring-boot-engineer

### Medium Priority

#### 6. **Teacher & Student Features** (Full-stack)
- Status: Entity layer complete, API/UI incomplete
- Details:
  - Teacher list page and detail view
  - Student enrollment management
  - Attendance marking UI
  - Grade tracking (if in scope)
- Action: Complete CRUD for teachers, students
- Modules affected: teacher, student, attendance
- Owner: fullstack-engineer

#### 7. **Session Management (Schedule)** (Full-stack)
- Status: SessionController exists, needs feature completion
- Details:
  - Create recurring sessions for courses
  - View session calendar
  - Manage session times, instructors
  - Pattern: recurring schedule (daily, weekly, etc.)
- Action: Design session schedule pattern, implement API and UI
- Modules affected: academic
- Owner: fullstack-engineer

#### 8. **Dashboard Analytics** (Frontend)
- Status: admin feature exists, needs implementation
- Details:
  - Show statistics: total courses, teachers, students
  - Recent activity feed
  - Quick action shortcuts
- Action: Create dashboard page with mock data, integrate with Redux
- Modules affected: admin feature
- Owner: react-ts-engineer

#### 9. **Role-Based Access Control (RBAC)** (Both)
- Status: Backend: user module has roles; Frontend: not fully implemented
- Details:
  - Protect frontend routes by role (admin only, teacher only)
  - Protect backend endpoints via @PreAuthorize
  - Display/hide UI elements by role
- Action: Implement role checking in both layers
- Modules affected: auth, user (backend); auth (frontend)
- Owner: fullstack-engineer

### Low Priority

#### 10. **Performance Optimization**
- Status: Not started
- Details:
  - Database indexing on frequently queried fields
  - Frontend code-splitting by feature
  - Redux selector memoization
  - API response caching strategy
- Action: Profile and optimize after feature completeness

#### 11. **Documentation & Onboarding**
- Status: CLAUDE.md exists, needs expansion
- Details:
  - Architecture diagrams (module dependencies, data flow)
  - API client library documentation
  - Frontend component catalog/storybook
  - Database schema diagram
- Action: Generate visuals and expand CLAUDE.md

#### 12. **Deployment & CI/CD**
- Status: Not started
- Details:
  - GitHub Actions workflow for testing + build
  - Docker containerization (if cloud deployment needed)
  - Environment-specific configs (dev, staging, prod)
  - Database migration strategy
- Action: Design deployment pipeline

---

## Known Issues & Blockers

### Issue: SessionController Exists but No Example Tests
- **Severity**: Low (not blocking)
- **Description**: SessionController in academic module but no test coverage
- **Impact**: Difficult to verify API behavior
- **Resolution**: Add unit tests once test framework set up

### Issue: Frontend Auth State in Both Redux + SessionStorage
- **Severity**: Low (by design)
- **Description**: Auth state stored in both places for persistence
- **Impact**: Minor duplication but necessary for page reload survival
- **Resolution**: Document in RULE.md (R8) — this is intentional

### Issue: No Attendance Module Service
- **Severity**: Medium
- **Description**: Attendance entity exists but no controller/service
- **Impact**: Can't track attendance via API
- **Resolution**: Complete AttendanceService, AttendanceController in next phase

### Issue: StudentEntity Minimal
- **Severity**: Medium  
- **Description**: StudentEntity exists but lacks proper relationships (courses enrolled, grades)
- **Impact**: Can't implement student course enrollment
- **Resolution**: Extend StudentEntity with @ManyToMany courses, @OneToMany grades

---

## Technical Decisions

### Decision: Modular Backend Architecture
- **Why**: Enables independent development, testing, scaling per domain
- **How**: Each module: controller → service → repository, shared utilities
- **Trade-off**: More boilerplate initially, but clear boundaries
- **Status**: Implemented, working well

### Decision: Redux for Frontend State
- **Why**: Predictable state management, time-travel debugging, SSR-ready
- **How**: One slice per feature (courses, admin, teachers), thunks for async, sessionStorage for auth
- **Trade-off**: More boilerplate than useState, but better for shared state
- **Status**: Implemented for courses, admin (14 thunks), teachers (thunks + slices), sessions

### Decision: JWT + SessionStorage (No Refresh Tokens)
- **Why**: Simpler for MVP, suitable for same-site SPA
- **How**: Token in httpOnly cookie + sessionStorage (for checking auth status)
- **Trade-off**: Shorter expiration recommended, refresh token pattern better for scale
- **Status**: Implemented, document refresh token migration path for future

### Decision: Hibernate Auto-Schema Update
- **Why**: Fast iteration during development
- **How**: `spring.jpa.hibernate.ddl-auto: update`
- **Trade-off**: Not suitable for production (use migrations instead)
- **Status**: Implemented for dev, document migration strategy for prod

### Decision: Feature-Based Frontend Organization
- **Why**: Self-contained features, easier team parallel development
- **How**: One folder per domain (auth, courses, teachers, admin)
- **Trade-off**: More folders, potential duplication in shared components
- **Status**: Implemented, working well

### Decision: TailwindCSS Only (No UI Library)
- **Why**: Lightweight, customizable, no excess dependencies
- **How**: Utility classes, custom components (Button, Input, etc.)
- **Trade-off**: More CSS writing than Material UI, but cleaner HTML
- **Status**: Implemented, component library emerging in src/components/

---

## Next Actions (For Next Session)

1. **Choose Priority**: Which feature to tackle next?
   - Option A: Complete API endpoints (backend focus)
   - Option B: Build course management UI (frontend focus)
   - Option C: Set up testing infrastructure (quality focus)

2. **Kick Off Selected Feature**: 
   - Create feature branch
   - Define scope with Plan phase (AGENTS.md)
   - Follow Workflow: Analyze → Plan → Implement → Verify → Review → Complete

3. **Database Decision**:
   - Finalize StudentEntity relationships before student enrollment feature
   - Create seed data for demo courses/teachers

4. **Testing Setup**:
   - Consider adding test framework early (JUnit, Jest) to enable TDD

---

## Session Handoff Notes

### What's Working Well
- Clear project structure with separated concerns
- RULE.md and AGENTS.md provide clear guidance
- Swagger auto-documentation is valuable
- Feature-based frontend organization scales well
- Module pattern backend is maintainable

### What Needs Attention
- Test coverage completely absent (priority: add framework)
- Some entities incomplete (Student needs relationships)
- Attendance module exists but no service layer
- Frontend error handling needs consistent approach
- Form validation partial (only auth + business roles + roles done)
- 27 pre-existing ESLint errors (mostly `no-explicit-any` in API files) — needs cleanup

### For Next AI Session
- Read RULE.md first (architectural constraints)
- Read AGENTS.md second (workflow)
- Check this PROGRESS.md for context
- Use specialized agents (spring-boot-engineer, react-ts-engineer) when needed
- Update PROGRESS.md when work completes

---

## File Locations Quick Reference

| Component | Location |
|-----------|----------|
| Backend modules | `backend/src/main/java/com/trinh/english_center_be/modules/{module}/` |
| Shared utils | `backend/src/main/java/com/trinh/english_center_be/shared/` |
| Frontend features | `frontend/src/features/{feature}/` |
| Frontend components | `frontend/src/components/` |
| Frontend pages | `frontend/src/pages/` |
| Frontend app setup | `frontend/src/app/` |
| Configuration | `backend/src/main/resources/application.yml`, `frontend/vite.config.ts` |
| Environment | `.env.example` in each directory |

---

## Key Contacts / Decision Makers

- **Backend Decisions**: spring-boot-engineer (or consult RULE.md)
- **Frontend Decisions**: react-ts-engineer (or consult RULE.md)
- **Architecture Decisions**: fullstack-engineer (or consult RULE.md)
- **Project Owner**: User (quanghuy12c6@gmail.com)

---

**README for Next Session**

This PROGRESS.md is your map. Read it before starting work to:
- Understand what's done
- See what's blocked
- Know the technical decisions
- Learn what's pending

Combined with RULE.md (constraints), AGENTS.md (workflow), and CLAUDE.md (setup), you have everything needed to continue development effectively.

Good luck! 🚀
