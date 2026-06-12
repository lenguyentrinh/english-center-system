# English Center System - Documentation Index

**Project:** English Center System (Educational Management Platform)  
**Version:** 1.0  
**Last Updated:** June 12, 2026  
**Status:** Active Development - Phase 1

---

## Documentation Overview

This directory contains comprehensive documentation for the English Center System, a full-stack educational management platform built with Spring Boot 3.5.7 (backend) and React 19 (frontend).

### Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| [**01-CORE_SPECIFICATION.md**](./01-CORE_SPECIFICATION.md) | System requirements, domain model, business rules | Product Managers, Architects, Developers |
| [**02-PLANNING_DOCUMENT.md**](./02-PLANNING_DOCUMENT.md) | Development roadmap, modules, phases, risks | Project Managers, Tech Leads, Developers |
| [**03-ARCHITECTURE_DATAFLOW.md**](./03-ARCHITECTURE_DATAFLOW.md) | System architecture, data flows, API contracts | Architects, Backend/Frontend Engineers |
| [**README.md**](./README.md) | This file - navigation guide | Everyone |

---

## System at a Glance

**English Center System** is a comprehensive platform for managing English language education delivery:

```
┌─────────────────────────────────────────────────┐
│         English Center System                   │
├─────────────────────────────────────────────────┤
│  User Management  │  Course Management          │
│  • Profiles       │  • Create courses           │
│  • Roles & Perms  │  • Schedule sessions        │
│  • Auth/JWT       │  • Assign teachers          │
├─────────────────────────────────────────────────┤
│  Student Features │  Teacher Features           │
│  • Enrollment     │  • Course management        │
│  • Attendance     │  • Attendance marking       │
│  • Materials      │  • Material upload          │
├─────────────────────────────────────────────────┤
│  Admin Dashboard  │  Reporting (Phase 2)        │
│  • KPIs           │  • Enrollment stats         │
│  • Quick actions  │  • Attendance reports       │
│  • System health  │  • Performance metrics      │
└─────────────────────────────────────────────────┘
```

---

## Key Features (Phase 1)

### ✅ Implemented
- User authentication (JWT-based login)
- Role-based access control (RBAC)
- User and role management
- Course creation and management
- Basic session scheduling
- Student enrollment with eligibility verification
- Attendance tracking (entity ready, API pending)
- Swagger API documentation

### ⚠️ Partially Complete
- Student profile management (entity exists, CRUD partial)
- Teacher profile management (entity exists, CRUD partial)
- Session material management (entity exists, API pending)
- Enrollment API (entity ready, service logic partial)

### ❌ Pending (Phase 2+)
- Advanced reporting and analytics
- Recurring session automation
- Grades and assessments
- Notifications and reminders
- Mobile app
- Payment/billing system

---

## Architecture Overview

### Technology Stack

**Backend:**
- Spring Boot 3.5.7, Java 24
- Spring Data JPA + Hibernate
- MySQL 8.0+
- JWT authentication (jjwt)
- SpringDoc-OpenAPI (Swagger)

**Frontend:**
- React 19 with React Router 7
- TypeScript (strict mode)
- Redux Toolkit (state management)
- TailwindCSS (styling)
- React Hook Form + Zod (validation)
- Axios (HTTP client)

**Infrastructure:**
- Windows 11 development environment
- MySQL database
- Local file storage (Phase 2: S3)
- Single instance deployment (Phase 3: Kubernetes)

### Module Structure

```
Backend (6 modules):
├── auth       (Login, JWT token generation)
├── user       (Users, roles, role assignments)
├── academic   (Courses, sessions, enrollments)
├── teacher    (Teacher profiles, management)
├── student    (Student profiles, management)
├── attendance (Attendance tracking)
└── shared     (Config, exceptions, utilities)

Frontend (4+ features):
├── auth       (Login, session management)
├── courses    (Course list, detail, CRUD)
├── admin      (User/role management)
├── teachers   (Teacher list, profiles)
└── more...
```

---

## Document Summaries

### 1. Core Specification Document (01-CORE_SPECIFICATION.md)

**Contents:**
- System Overview & Purpose
- Domain Model with ER diagram
- Entity descriptions (User, Student, Teacher, Course, etc.)
- Business Rules & Constraints
- Role Hierarchy & Access Control
- Data Integrity Rules
- Glossary (44 terms)
- System Assumptions
- Security Assumptions

**Key Diagrams:**
- Entity Relationship Model (complete)
- Role Hierarchy Tree
- Business Rule Decision Tables

**For Whom:** Product managers, architects, new team members understanding scope

**How to Use:**
- Read "Executive Summary" for quick overview
- Reference "Business Rules & Constraints" for implementation details
- Check "Glossary" when unfamiliar with terms
- Review "System Assumptions" for gaps and Phase 2 planning

---

### 2. Planning Document (02-PLANNING_DOCUMENT.md)

**Contents:**
- Module Overview (7 modules detailed)
- Feature Roadmap (Phase 1, 2, 3)
- Development Phases (8-week MVP + 16-week enhancement + 24-week scale)
- Scope & Constraints (in/out of scope)
- Risk Assessment (9 identified risks, mitigation strategies)
- Technical Decisions (10 design decisions logged)
- Success Metrics (development, product, performance)

**Key Tables:**
- Module Maturity Status
- Risk Matrix & Tracking
- Deliverables by Phase

**For Whom:** Project managers, tech leads, developers planning work

**How to Use:**
- Check "Feature Roadmap" to understand what's next
- Reference "Risk Assessment" before starting risky work
- Review "Technical Decisions" to understand why things are done a certain way
- Use "Success Metrics" to define phase completion criteria

---

### 3. Architecture & Data Flow Document (03-ARCHITECTURE_DATAFLOW.md)

**Contents:**
- System Architecture diagrams (high-level, layered, modular)
- Data Flow Diagrams (5 key flows: login, enrollment, attendance, etc.)
- Complete Entity Relationship Model with all fields
- API Contract Examples (JSON request/response samples)
- Security & Authentication Flow (JWT, RBAC, interceptors)

**Key Diagrams:**
- 4-layer system architecture (client, frontend, backend, database)
- 3-layer backend (controller, service, repository)
- Frontend component architecture (router, pages, features, Redux)
- Module dependency graph
- 5 detailed sequence diagrams
- Complete ER diagram with field specs

**For Whom:** Architects, backend/frontend engineers, security reviewers

**How to Use:**
- Read system architecture before starting feature implementation
- Reference data flow diagrams when designing API contracts
- Check ER diagram for field types, constraints, relationships
- Use API contract examples as templates for new endpoints

---

## Quick Start for New Developers

### 1. **First Day - Understanding the System**
   - Read [CLAUDE.md](../CLAUDE.md) - Development environment setup
   - Read [Core Specification Executive Summary](#) - What the system does
   - Skim [Architecture Overview](#) - How it's built

### 2. **Second Day - Setting Up Development**
   - Follow CLAUDE.md setup instructions
   - Get backend running: `./mvnw spring-boot:run`
   - Get frontend running: `pnpm run dev`
   - Access Swagger at http://localhost:8080/api/swagger-ui/index.html

### 3. **Third Day - Understanding Code Structure**
   - Read [Planning Document - Module Overview](#)
   - Navigate backend: `backend/src/main/java/com/trinh/english_center_be/modules/`
   - Navigate frontend: `frontend/src/features/`
   - Read [RULE.md](../RULE.md) - Architectural constraints

### 4. **Starting Feature Development**
   - Read [AGENTS.md](../AGENTS.md) - Workflow (Analyze → Plan → Implement → Verify → Review → Complete)
   - Identify which module your feature belongs to
   - Check "Feature Roadmap" in Planning Document for priority
   - Create feature branch: `git checkout -b {type}/{domain}/{description}`
   - Follow RULE.md constraints while coding

---

## Key Concepts

### Business Domains

| Domain | Responsibility | Key Entities |
|--------|----------------|--------------|
| **Auth** | User authentication | User, JWT Token |
| **User** | User & role management | User, Role, BusinessRole, UserRole |
| **Academic** | Courses, sessions, enrollment | Course, CourseSession, Enrollment, SessionMaterial |
| **Student** | Student profiles | Student (extends User) |
| **Teacher** | Teacher profiles | Teacher (extends User) |
| **Attendance** | Attendance tracking | Attendance (links Session × Student) |

### Key Business Rules

1. **Enrollment Eligibility:** Student's age, entry level, and prerequisites auto-checked on enrollment
2. **One Profile Per User:** User cannot be both student and teacher simultaneously
3. **Course Lifecycle:** PLANNING → ACTIVE → COMPLETED (one-way progression)
4. **Role Hierarchy:** BusinessRole (admin/teacher/student) → SystemRole (granular permissions)
5. **Attendance Impact:** 80%+ attendance required for course completion

### API Design Patterns

- **REST endpoints:** Standard CRUD operations (GET, POST, PUT, DELETE)
- **Response format:** `{success: boolean, data: object, error: object}`
- **Validation:** @Valid on all request DTOs, validation errors in 400 response
- **Authentication:** JWT in Authorization header: `Bearer {token}`
- **Authorization:** @PreAuthorize("hasRole('ROLE_NAME')") on controllers
- **Pagination:** limit/offset query parameters (cursor-based in Phase 2)

---

## Common Development Tasks

### Add a New Endpoint

**Process:**
1. Define request/response DTOs in `{module}/dto/`
2. Create/update service method in `{module}/service/impl/`
3. Create/update controller method in `{module}/controller/`
4. Add @PreAuthorize for role check
5. Validate end-to-end with Swagger UI
6. Update PROGRESS.md

**Reference:** [AGENTS.md Phase 3 - Implement](#)

### Add a Frontend Feature

**Process:**
1. Create feature folder: `frontend/src/features/{feature}/`
2. Create `{feature}Api.ts` with API calls
3. Create `types.ts` with TypeScript interfaces
4. Create `{feature}Slice.ts` and `{feature}Thunks.ts` for Redux
5. Create pages and components in `pages/` and `components/`
6. Register slice in `src/app/store.ts`
7. Test in browser at http://localhost:5173

**Reference:** [RULE.md R7 - Feature Folders](#)

### Change Database Schema

**Process:**
1. Update JPA Entity in `{module}/entity/`
2. Add audit fields via BaseEntity inheritance (not manual)
3. Run backend, Hibernate auto-creates schema (development only)
4. Test with sample data
5. For production: Use Liquibase migration (Phase 1.5)
6. Update ER diagram in this documentation

**Reference:** [Core Specification - Entity Descriptions](#)

---

## Important Files & Directories

### Backend
```
backend/
├── src/main/java/com/trinh/english_center_be/
│   ├── modules/
│   │   ├── auth/        (Login, JWT)
│   │   ├── user/        (User, Role, BusinessRole)
│   │   ├── academic/    (Course, Session, Enrollment)
│   │   ├── student/     (Student profile)
│   │   ├── teacher/     (Teacher profile)
│   │   └── attendance/  (Attendance records)
│   └── shared/
│       ├── config/      (Spring config, security, OpenAPI)
│       ├── exception/   (Custom exceptions, GlobalExceptionHandler)
│       ├── response/    (StandardResponse, error DTOs)
│       ├── util/        (Utility functions)
│       ├── enums/       (UserStatus, CourseStatus, etc.)
│       └── BaseEntity   (Audit fields: id, createdAt, updatedAt)
├── src/main/resources/
│   └── application.yml  (Database, JWT, server config)
└── pom.xml             (Maven dependencies)
```

### Frontend
```
frontend/
├── src/
│   ├── app/
│   │   ├── router.tsx      (React Router configuration)
│   │   ├── store.ts        (Redux store)
│   │   ├── providers.tsx   (Redux Provider)
│   │   └── hooks/          (Custom hooks like useAppDispatch)
│   ├── features/           (Feature modules by domain)
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── admin/
│   │   ├── teachers/
│   │   └── ...
│   ├── pages/              (Route page components)
│   ├── components/         (Shared UI components)
│   │   └── Button.tsx, Input.tsx, etc.
│   ├── shared/
│   │   ├── api/client.ts   (Axios configuration)
│   │   ├── constants/      (Constants, enums)
│   │   ├── types/          (Shared TypeScript types)
│   │   └── utils/          (Utility functions)
│   └── index.css           (TailwindCSS)
├── vite.config.ts          (Build configuration)
├── tsconfig.json           (TypeScript configuration)
└── package.json            (Dependencies)
```

### Documentation
```
docs/
├── 01-CORE_SPECIFICATION.md    (THIS DOCUMENT)
├── 02-PLANNING_DOCUMENT.md     (Roadmap, phases, risks)
├── 03-ARCHITECTURE_DATAFLOW.md (Diagrams, data flows, API contracts)
└── README.md                   (This navigation guide)
```

### Project Files
```
/
├── CLAUDE.md                   (Development setup & guidelines)
├── RULE.md                     (Architectural constraints)
├── AGENTS.md                   (AI agent workflow)
├── PROGRESS.md                 (Session continuity & status)
└── docs/                       (This directory)
```

---

## Viewing Diagrams

All documents use **Mermaid** for diagrams. They render automatically on:
- GitHub (web UI)
- GitLab (web UI)
- Notion, Confluence (with plugins)

To view locally, use:
1. VS Code: Install "Markdown Preview Mermaid Support" extension
2. Online: https://mermaid.live/ (paste diagram code)

---

## Getting Help

### For Questions About...

| Topic | Document | Section |
|-------|----------|---------|
| System requirements & rules | [Core Specification](./01-CORE_SPECIFICATION.md) | Business Rules |
| What's being built next | [Planning Document](./02-PLANNING_DOCUMENT.md) | Feature Roadmap |
| How entities relate | [Architecture Document](./03-ARCHITECTURE_DATAFLOW.md) | ER Diagram |
| API endpoints & contracts | [Architecture Document](./03-ARCHITECTURE_DATAFLOW.md) | API Contract Examples |
| How authentication works | [Architecture Document](./03-ARCHITECTURE_DATAFLOW.md) | Security & Auth Flow |
| Architectural rules | [RULE.md](../RULE.md) | All sections |
| Development workflow | [AGENTS.md](../AGENTS.md) | Workflow Overview |
| Project status & blockers | [PROGRESS.md](../PROGRESS.md) | In Progress / Known Issues |
| Development setup | [CLAUDE.md](../CLAUDE.md) | All sections |

### Reporting Issues

If you find:
- **Documentation unclear:** Add a comment in the relevant section or create a GitHub issue
- **Diagram wrong/outdated:** Note the section title and date; report to project lead
- **Code doesn't match documentation:** Report as bug; documentation takes precedence until code fixed
- **Missing documentation:** Add section title to the "TODO" list at end of README

---

## Documentation Maintenance

### How to Update

1. **Add new section:** Edit relevant document (01-03), update table of contents
2. **Update roadmap:** Modify [Planning Document Feature Roadmap](./02-PLANNING_DOCUMENT.md#feature-roadmap)
3. **Update entity:** Modify [Core Specification - Entity Descriptions](./01-CORE_SPECIFICATION.md#core-entity-descriptions) and [Architecture - ER Diagram](./03-ARCHITECTURE_DATAFLOW.md#entity-relationship-model)
4. **Update API contract:** Modify [Architecture - API Contract Examples](./03-ARCHITECTURE_DATAFLOW.md#api-contract-examples)

### Update Frequency

- **Core Specification:** Quarterly (schema changes, new entities)
- **Planning Document:** Bi-weekly (progress, risk updates)
- **Architecture Document:** Monthly (API changes, new flows)
- **README (this file):** As needed (links, quick references)

### Version Control

Each document has a "Last Updated" date at the top. Before committing changes:
1. Update "Last Updated" to today's date
2. Add git commit message: `docs: update {document-name} - {change-summary}`

---

## TODO: Future Documentation

- [ ] Deployment Guide (Phase 2)
- [ ] Testing Strategy & Examples (Phase 1.5)
- [ ] Performance Tuning Guide (Phase 2)
- [ ] API Migration Guide (for Phase 2 changes)
- [ ] Troubleshooting FAQ (Phase 1 end)
- [ ] Database Backup & Recovery (Phase 1.5)
- [ ] Security Audit Checklist (Phase 1 end)

---

## Document Statistics

| Document | Pages | Words | Diagrams |
|----------|-------|-------|----------|
| Core Specification | ~20 | 8,500+ | 5 |
| Planning Document | ~25 | 10,000+ | 4 |
| Architecture & Data Flow | ~15 | 6,500+ | 12 |
| **Total** | **~60** | **~25,000+** | **~21** |

---

## Acknowledgments

**Documentation Generated:** June 12, 2026  
**System Analysis by:** AI Code Assistant  
**Project Owner:** quanghuy12c6@gmail.com  
**Repository:** english-center-system (monorepo)

---

**Welcome to the English Center System! Happy coding! 🚀**
