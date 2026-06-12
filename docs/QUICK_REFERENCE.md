# English Center System - Quick Reference Card

**Print this page or keep open in second monitor!**

---

## System Overview (One Sentence Each)

| Component | Summary |
|-----------|---------|
| **What** | Educational management platform for English language center |
| **Who** | Admins, Teachers, Students, Staff |
| **Key Flow** | User Login → Course Enrollment (with eligibility check) → Session Attendance → Reporting |
| **Tech Stack** | Spring Boot + React 19 + MySQL + JWT |

---

## Key Entities & Relationships

```
User ←→ Student (0..1)
User ←→ Teacher (0..1)
User ←→ Roles (*)
User ←→ BusinessRole (*)

Course ← Teacher (1..*)
Course → Sessions (1..*)
Course ← Enrollments (1..*)

Student → Enrollments (1..*)
Enrollment → Course (N..1)

Session → Attendance (1..*)
Session → Materials (1..*)

Enrollment has Eligibility:
  ✓ Age check: student.age >= course.minimumAge
  ✓ Entry level: student.level == course.level
  ✓ Prerequisites: student.completed OR !course.required
```

---

## Critical Business Rules

| Rule | What It Means |
|------|---------------|
| **Age Check** | Student can only enroll if age >= course minimum |
| **Entry Level Match** | Student language level must match course level |
| **Prerequisites** | Must complete previous level before advanced course |
| **One Profile Per User** | User = Student XOR Teacher (not both) |
| **Eligibility Auto-Check** | Enrollment status = APPROVED if all checks pass, else PENDING |
| **80% Attendance** | Student must attend 80%+ of sessions to complete course |
| **Course Status** | PLANNING → ACTIVE → COMPLETED (one-way, no revert) |
| **One Teacher Per Course** | Each course has exactly one assigned teacher |

---

## API Response Format (All Endpoints)

```json
{
  "success": true,
  "data": { /* entity or list */ },
  "error": null
}
```

**Or on error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## Common Endpoints (Reference)

### Auth
- `POST /auth/login` - {username, password} → {token, user, expiresIn}
- `POST /auth/signup` - {username, email, password} → {user}
- `GET /auth/validate` - Check if token valid

### Courses
- `GET /courses` - List courses (paginated)
- `GET /courses/{id}` - Single course with sessions
- `POST /courses` - Create course (teacher/admin)
- `PUT /courses/{id}` - Update course
- `PUT /courses/{id}/status` - Change status

### Enrollments
- `POST /enrollments` - Enroll student (auto-eligibility check)
- `GET /enrollments` - List enrollments (filters: status, student, course)
- `PUT /enrollments/{id}` - Update status (admin)

### Attendance
- `POST /attendance` - Batch mark attendance
- `GET /courses/{id}/attendance` - Course attendance summary

### Users & Roles
- `GET /users` - List users (admin)
- `POST /users` - Create user (admin)
- `POST /users/{id}/roles` - Assign role

---

## Role-Based Access (Quick Lookup)

### ADMIN Role
- Can: Everything
- Cannot: Nothing (super-user)

### TEACHER Role
- Can: Create/edit own courses, schedule sessions, mark attendance, upload materials
- Cannot: Manage users, change system config

### STUDENT Role
- Can: Enroll in courses, view own attendance, access course materials
- Cannot: Create courses, mark attendance, manage other students

---

## Key Validations

### At API Boundary (Request DTOs)
- ✓ @NotNull, @NotBlank required fields
- ✓ @Size, @Length for strings
- ✓ @Email for email
- ✓ Date ranges (startDate < endDate)
- ✗ No entity validation
- ✗ No @Valid on response DTOs

### In Business Logic (Service)
- ✓ Eligibility checks (age, entry level, prerequisites)
- ✓ Course capacity checks
- ✓ Status transition rules
- ✓ Unique constraint checks (student + course enrollment)
- ✓ Temporal constraints (dates, times)

---

## Module Quick Map

| Module | Owns | Endpoints | Status |
|--------|------|-----------|--------|
| **auth** | Login, JWT | /auth/* | ✅ Complete |
| **user** | Users, Roles, Perms | /users/*, /roles/*, /business-roles/* | ✅ Complete |
| **academic** | Courses, Sessions, Enrollments | /courses/*, /enrollments/* | ⚠️ Partial |
| **teacher** | Teacher profiles | /teachers/* | ⚠️ Minimal |
| **student** | Student profiles | /students/* | ⚠️ Minimal |
| **attendance** | Attendance records | /attendance/* | ❌ Missing |

---

## File Locations

### Backend Entity by Domain
```
auth       → No entity
user       → User, Role, BusinessRole, UserRole, UserBusinessRole
academic   → Course, CourseSession, Enrollment, SessionMaterial
student    → Student (extends User)
teacher    → Teacher (extends User)
attendance → Attendance
```

### Frontend Feature Modules
```
src/features/
├── auth/      → Login form, session management
├── courses/   → Course list, detail, CRUD
├── admin/     → User/role management
├── teachers/  → Teacher list, profiles
└── {feature}/ → {components, pages, types, api, slices, thunks}
```

---

## Common Development Tasks (Process)

### Add New Endpoint
1. Create DTO in `{module}/dto/`
2. Create method in `{module}/service/impl/`
3. Create @PostMapping in `{module}/controller/`
4. Add @PreAuthorize("hasRole('...')")
5. Test in Swagger: http://localhost:8080/api/swagger-ui/index.html

### Add Frontend Feature
1. Create `src/features/{feature}/`
2. Create: `{feature}Api.ts`, `types.ts`, `{feature}Slice.ts`, `{feature}Thunks.ts`
3. Create pages in `pages/` and components in `components/`
4. Register slice in `src/app/store.ts`
5. Add route in `src/app/router.tsx`

### Change Entity/Schema
1. Edit entity in `{module}/entity/{Entity}.java`
2. Extend BaseEntity (inherits id, createdAt, updatedAt)
3. Run backend, Hibernate auto-creates tables
4. Test with sample data
5. Document change in Core Specification

---

## Debug Checklist

### Backend Not Starting?
- [ ] Check MySQL is running: `mysql -u root -p`
- [ ] Check .env exists with DB_URL, DB_USERNAME, DB_PASSWORD
- [ ] Check JWT_SECRET is >= 32 characters
- [ ] Check port 8080 is not in use: `netstat -ano | findstr :8080`
- [ ] Check logs for specific error message

### Frontend Not Loading?
- [ ] Check backend is running on port 8080
- [ ] Check .env has VITE_API_BASE_URL=http://localhost:8080/api
- [ ] Check pnpm install completed: `pnpm install`
- [ ] Check port 5173 is not in use
- [ ] Check browser console for errors (F12)

### API Call Failing?
- [ ] Check token is valid (not expired)
- [ ] Check user has required role (@PreAuthorize)
- [ ] Check request body matches DTO fields
- [ ] Check Swagger shows endpoint exists
- [ ] Check error response in Network tab (F12)

### Database Issues?
- [ ] Check MySQL is running: `mysql --version`
- [ ] Check database exists: `SHOW DATABASES;`
- [ ] Check tables created: `SHOW TABLES FROM english_center_db;`
- [ ] Check Hibernate logs for schema creation
- [ ] Check for FK constraint errors

---

## Essential Commands

### Backend
```bash
cd backend
./mvnw clean compile        # Compile
./mvnw spring-boot:run      # Run dev server (port 8080)
./mvnw test                 # Run tests (when added)
```

### Frontend
```bash
cd frontend
pnpm install                # Install dependencies
pnpm run dev                # Dev server (port 5173)
pnpm run build              # Production build
pnpm run lint               # ESLint check
pnpm run type-check         # TypeScript compile
```

### Database
```sql
CREATE DATABASE english_center_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
USE english_center_db;
SHOW TABLES;
```

### Git
```bash
git checkout -b fe/feat/{description}   # Feature branch
git add .
git commit -m "feat: {description}"     # Atomic commit
git push -u origin fe/feat/{description}
```

---

## Configuration Files

### Backend Config
**File:** `backend/src/main/resources/application.yml`
```yaml
server.port: 8080 (default)
spring.datasource.url: {DB_URL from .env}
spring.jpa.hibernate.ddl-auto: update (dev only!)
jwt.secret: {JWT_SECRET from .env}
jwt.expiration-ms: 3600000 (1 hour)
```

### Frontend Config
**File:** `frontend/vite.config.ts`
```
API_BASE_URL: http://localhost:8080/api (dev)
```

### Environment Files
**Backend:** `backend/.env` (DO NOT COMMIT)
```
DB_URL=jdbc:mysql://localhost:3306/english_center_db
DB_USERNAME=root
DB_PASSWORD=...
JWT_SECRET=...
JWT_EXPIRATION_MS=3600000
SERVER_PORT=8080
```

**Frontend:** `frontend/.env` (DO NOT COMMIT)
```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Key HTTP Status Codes

| Code | Meaning | Common Reason |
|------|---------|---------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created (POST) |
| **400** | Bad Request | Invalid request body (validation failed) |
| **401** | Unauthorized | Token missing or expired |
| **403** | Forbidden | User lacks permission (wrong role) |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Unique constraint violation (duplicate) |
| **500** | Server Error | Backend crashed (check logs) |

---

## JWT Token Anatomy

```
Header.Payload.Signature

Payload contains:
{
  "userId": 1,
  "username": "teacher1",
  "email": "teacher1@center.com",
  "roles": ["TEACHER"],
  "businessRole": "TEACHER",
  "exp": 1686488400  ← Expiration time (unix timestamp)
}
```

**Token flow:**
1. Login returns token + expiresIn (milliseconds)
2. Frontend stores in sessionStorage
3. Axios interceptor adds to header: `Authorization: Bearer {token}`
4. Backend validates signature and expiration
5. On 401, frontend clears token and redirects to login

---

## Testing with Swagger

1. Open: http://localhost:8080/api/swagger-ui/index.html
2. Scroll to /auth/login endpoint
3. Click "Try it out"
4. Enter username/password, click "Execute"
5. Copy token from response
6. Click "Authorize" button (top right)
7. Paste token in format: `Bearer {token}`
8. Now try protected endpoints (they'll include token automatically)

---

## Performance Limits (Phase 1)

| Metric | Limit | Notes |
|--------|-------|-------|
| Max concurrent users | 50 | Single instance |
| Max database size | 1000 students, 100 courses | Then optimize queries |
| API response time | < 500ms p95 | Target for optimization |
| File upload size | 50MB | SessionMaterial |
| Token expiration | 1 hour | Re-login required |

---

## Development Workflow (TLDR)

1. **Analyze** (2 min) - Read RULE.md, understand scope
2. **Plan** (5-10 min) - If 3+ files, create plan
3. **Implement** (varies) - Write code, follow patterns
4. **Verify** (5-10 min) - Test manually, check build
5. **Review** (5 min) - Self-code-review against RULE.md
6. **Complete** (2 min) - Commit, update PROGRESS.md

**Reference:** [AGENTS.md](../AGENTS.md) for detailed phases

---

## Key Architectural Rules (Top 5)

| # | Rule | Why |
|---|------|-----|
| **R1** | Don't import between modules (use published API only) | Prevents tangled dependencies |
| **R4** | Always use DTOs in API contracts, never entities | Decouples database from API |
| **R6** | Throw domain exceptions only (never RuntimeException) | Enables consistent error handling |
| **R13** | No `any` types in TypeScript | Catches bugs at compile time |
| **R18** | Commit message format: `{type}: {description}` | Readable git history |

**All rules:** [RULE.md](../RULE.md)

---

## Support Resources

| Need | Resource |
|------|----------|
| Setup help | [CLAUDE.md](../CLAUDE.md) |
| Architecture questions | [Core Specification](./01-CORE_SPECIFICATION.md) |
| What's next? | [Planning Document](./02-PLANNING_DOCUMENT.md) |
| How does X work? | [Architecture & Data Flow](./03-ARCHITECTURE_DATAFLOW.md) |
| Code standards | [RULE.md](../RULE.md) |
| Stuck? | [PROGRESS.md](../PROGRESS.md) Known Issues section |

---

**Last Updated:** June 12, 2026  
**Print-Friendly:** Yes ✅  
**Keep Handy:** Absolutely! 📌
