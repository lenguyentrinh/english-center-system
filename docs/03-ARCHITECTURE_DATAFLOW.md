# English Center System - Architecture & Data Flow Document

**Version:** 1.0  
**Last Updated:** June 12, 2026  
**Status:** Active

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Entity Relationship Model](#entity-relationship-model)
4. [API Contract Examples](#api-contract-examples)
5. [Security & Authentication Flow](#security--authentication-flow)

---

## System Architecture

### High-Level System Architecture

```mermaid
graph TB
    Client["Client Layer<br/>(Web Browser)"]
    Frontend["Frontend<br/>(React 19 + Redux)<br/>Port 5173"]
    APIGateway["API Gateway<br/>(Vite Dev Server)"]
    Backend["Backend<br/>(Spring Boot 3.5.7)<br/>Port 8080"]
    Database["Database<br/>(MySQL 8.0)<br/>Port 3306"]
    FileStorage["File Storage<br/>(Local Filesystem)"]
    
    Client -->|HTTP/HTTPS| Frontend
    Frontend -->|REST API| Backend
    Backend -->|JDBC| Database
    Backend -->|Read/Write| FileStorage
    Backend -->|Response| Frontend
    Frontend -->|Render| Client
    
    style Client fill:#e3f2fd
    style Frontend fill:#fff3e0
    style APIGateway fill:#f3e5f5
    style Backend fill:#e8f5e9
    style Database fill:#ffe0b2
    style FileStorage fill:#ffccbc
```

### Backend Layered Architecture

```mermaid
graph TB
    Controller["Controller Layer<br/>(REST Endpoints)"]
    Service["Service Layer<br/>(Business Logic)"]
    Repository["Repository Layer<br/>(Data Access)"]
    Entity["Entity Layer<br/>(Domain Models)"]
    Database["MySQL Database"]
    
    Controller -->|calls| Service
    Service -->|queries via| Repository
    Repository -->|persists| Entity
    Entity -->|mapped to| Database
    
    SharedLayer["Shared Layer<br/>(Config, Utils, Exceptions)"]
    SharedLayer -.->|used by all layers| Controller
    SharedLayer -.->|used by all layers| Service
    SharedLayer -.->|used by all layers| Repository
    
    style Controller fill:#bbdefb
    style Service fill:#c8e6c9
    style Repository fill:#fff9c4
    style Entity fill:#f0f4c3
    style Database fill:#ffccbc
    style SharedLayer fill:#f5f5f5
```

### Frontend Component Architecture

```mermaid
graph TB
    Router["Router<br/>(React Router 7)"]
    Pages["Pages<br/>(Route Destinations)"]
    Features["Features<br/>(Domain-Specific)"]
    SharedComponents["Shared Components<br/>(Button, Input, Modal)"]
    ReduxStore["Redux Store<br/>(Slices, Thunks)"]
    APILayer["API Layer<br/>(Axios Client)"]
    Server["Backend Server"]
    
    Router -->|defines routes| Pages
    Pages -->|use| Features
    Features -->|use| SharedComponents
    Features -->|dispatch actions| ReduxStore
    Features -->|call functions| APILayer
    APILayer -->|HTTP requests| Server
    ReduxStore -->|state updates| Features
    
    style Router fill:#fff3e0
    style Pages fill:#e0f2f1
    style Features fill:#c8e6c9
    style SharedComponents fill:#bbdefb
    style ReduxStore fill:#f3e5f5
    style APILayer fill:#ffccbc
    style Server fill:#e8f5e9
```

### Module Dependency Graph

```mermaid
graph LR
    Shared["Shared<br/>(Base, Exceptions,<br/>Utils, Config)"]
    Auth["Auth<br/>(Login, JWT)"]
    User["User<br/>(Profiles, Roles)"]
    Academic["Academic<br/>(Courses, Sessions,<br/>Enrollments)"]
    Attendance["Attendance<br/>(Records)"]
    Teacher["Teacher<br/>(Profiles)"]
    Student["Student<br/>(Profiles)"]
    
    Auth -->|uses| Shared
    Auth -->|uses| User
    User -->|uses| Shared
    Academic -->|uses| Shared
    Academic -->|uses| Teacher
    Academic -->|uses| Student
    Attendance -->|uses| Shared
    Attendance -->|uses| Academic
    Attendance -->|uses| Student
    Teacher -->|uses| Shared
    Teacher -->|uses| User
    Student -->|uses| Shared
    Student -->|uses| User
    
    style Shared fill:#f5f5f5
    style Auth fill:#ffccbc
    style User fill:#fff9c4
    style Academic fill:#c8e6c9
    style Attendance fill:#f8bbd0
    style Teacher fill:#b2dfdb
    style Student fill:#bbdefb
```

---

## Data Flow Diagrams

### 1. User Login Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Frontend as React App
    participant Backend as Spring Boot
    participant DB as MySQL
    
    Browser->>Frontend: 1. Opens login page
    Frontend->>Frontend: 2. Display login form
    Browser->>Frontend: 3. Enters credentials
    Frontend->>Backend: 4. POST /auth/login (username, password)
    Backend->>DB: 5. Query user by username
    DB-->>Backend: User entity
    Backend->>Backend: 6. Validate password (bcrypt)
    
    alt Password Valid
        Backend->>Backend: 7. Generate JWT token
        Backend-->>Frontend: 8. HTTP 200 + JWT token + user info
        Frontend->>Frontend: 9. Store token in sessionStorage
        Frontend->>Frontend: 10. Set Redux auth state
        Frontend->>Frontend: 11. Redirect to dashboard
        Browser->>Frontend: 12. Dashboard renders
    else Password Invalid
        Backend-->>Frontend: HTTP 401 + error message
        Frontend->>Frontend: Show error toast
    end
```

### 2. Course Creation & Enrollment Flow

```mermaid
sequenceDiagram
    participant Teacher
    participant Frontend as React App
    participant Backend as Spring Boot
    participant DB as MySQL
    
    Teacher->>Frontend: 1. Click "Create Course"
    Frontend->>Frontend: 2. Display course form
    Teacher->>Frontend: 3. Fill in course details, select teacher
    Frontend->>Backend: 4. POST /courses (courseData)
    Backend->>Backend: 5. Validate request (dates, capacity, etc.)
    Backend->>DB: 6. INSERT course entity
    DB-->>Backend: New course ID
    Backend-->>Frontend: HTTP 201 + course data
    Frontend->>Frontend: 7. Update Redux courses list
    Frontend->>Frontend: 8. Show success toast
    Teacher->>Frontend: 9. Click "Back to courses"
    Frontend->>Frontend: 10. Render updated course list
```

### 3. Student Enrollment with Eligibility Check

```mermaid
sequenceDiagram
    participant Student
    participant Frontend as React App
    participant Backend as Spring Boot
    participant DB as MySQL
    
    Student->>Frontend: 1. View available courses
    Frontend->>Backend: 2. GET /courses (status=ACTIVE)
    Backend->>DB: 3. Query courses
    DB-->>Backend: List of ACTIVE courses
    Backend-->>Frontend: HTTP 200 + courses
    Frontend->>Frontend: 4. Display course list with "Enroll" button
    Student->>Frontend: 5. Click "Enroll" for course
    Frontend->>Frontend: 6. Show enrollment form
    Frontend->>Backend: 7. POST /enrollments (studentId, courseId)
    Backend->>DB: 8. Query student, course, check eligibility
    DB-->>Backend: Student + Course data
    
    Backend->>Backend: 9. Run eligibility checks:
    Note over Backend: ✓ Age check (DOB + min age <= today)
    Note over Backend: ✓ Entry level (student level = course level)
    Note over Backend: ✓ Prerequisites (if required, student.completed=true)
    
    alt All Eligible
        Backend->>Backend: 10. Set enrollment.status = APPROVED
        Backend->>DB: 11. INSERT enrollment (APPROVED)
        Backend-->>Frontend: HTTP 201 + success
        Frontend->>Frontend: 12. Show success + enroll confirmation
    else Not Eligible
        Backend->>Backend: 10. Set enrollment.status = PENDING
        Backend->>DB: 11. INSERT enrollment (PENDING)
        Backend-->>Frontend: HTTP 201 + pending message
        Frontend->>Frontend: 12. Show "Pending admin review"
    end
    
    Student->>Frontend: 13. View enrolled courses
    Frontend->>Frontend: 14. Filter courses by enrollment status
```

### 4. Attendance Marking Flow

```mermaid
sequenceDiagram
    participant Teacher
    participant Frontend as React App
    participant Backend as Spring Boot
    participant DB as MySQL
    
    Teacher->>Frontend: 1. Click "Session"
    Frontend->>Backend: 2. GET /courses/{id}/sessions
    Backend->>DB: 3. Query sessions for course
    DB-->>Backend: List of sessions
    Backend-->>Frontend: HTTP 200 + sessions
    Frontend->>Frontend: 4. Display sessions
    Teacher->>Frontend: 5. Click session to mark attendance
    Frontend->>Backend: 6. GET /enrollments?courseId=X
    Backend->>DB: 7. Query enrolled students for course
    DB-->>Backend: List of enrolled students
    Backend-->>Frontend: HTTP 200 + students
    Frontend->>Frontend: 8. Display attendance form (student list with status dropdowns)
    Teacher->>Frontend: 9. Mark each student: PRESENT/ABSENT/EXCUSED/LATE
    Frontend->>Frontend: 10. User selects status for each student
    Teacher->>Frontend: 11. Click "Save Attendance"
    Frontend->>Backend: 12. POST /attendance (batch: [{studentId, sessionId, status}, ...])
    
    Backend->>DB: 13. For each record:
    Note over Backend: INSERT INTO attendance(sessionId, studentId, status)
    
    Backend-->>Frontend: HTTP 201 + saved count
    Frontend->>Frontend: 14. Show success toast
```

### 5. Session Material Upload Flow

```mermaid
sequenceDiagram
    participant Teacher
    participant Frontend as React App
    participant Backend as Spring Boot
    participant FileSystem as File Storage
    
    Teacher->>Frontend: 1. Click "Upload Material"
    Frontend->>Frontend: 2. Display file upload form
    Teacher->>Frontend: 3. Select PDF/DOCX file
    Frontend->>Frontend: 4. Validate file size < 50MB
    
    alt File Valid
        Frontend->>Backend: 5. POST /session/{id}/materials (multipart, file)
        Backend->>FileSystem: 6. Save file to disk
        FileSystem-->>Backend: File path
        Backend->>Backend: 7. Extract metadata (fileName, fileType, uploadedBy)
        Backend->>Backend: 8. Save SessionMaterial entity
        Backend-->>Frontend: HTTP 201 + material metadata
        Frontend->>Frontend: 9. Add to materials list, show success
    else File Invalid
        Frontend->>Frontend: Show validation error
    end
```

---

## Entity Relationship Model

### Complete ER Diagram with All Fields

```mermaid
erDiagram
    USER {
        long id PK
        string username UK
        string password
        string email UK
        string fullName
        string phone
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    
    STUDENT {
        long id PK
        long userId FK
        date dateOfBirth
        enum gender
        string address
        string parentName
        string parentPhone
        enum entryLevel
        boolean prerequisitesCompleted
        timestamp createdAt
        timestamp updatedAt
    }
    
    TEACHER {
        long id PK
        long userId FK
        decimal salary
        timestamp createdAt
        timestamp updatedAt
    }
    
    COURSE {
        long id PK
        string code UK
        string name
        date startDate
        date endDate
        int maxStudent
        enum status
        int minimumAge
        string requiredEntryLevel
        boolean prerequisitesRequired
        long teacherId FK
        enum availableRoleTeacher
        timestamp createdAt
        timestamp updatedAt
    }
    
    COURSE_SESSION {
        long id PK
        long courseId FK
        int sessionNo
        string title
        date sessionDate
        time startTime
        time endTime
        string topic
        timestamp createdAt
        timestamp updatedAt
    }
    
    ENROLLMENT {
        long id PK
        long studentId FK
        long courseId FK
        date enrollDate
        string status
        boolean ageEligible
        boolean entryLevelEligible
        boolean prerequisitesEligible
        timestamp eligibilityCheckDate
        timestamp createdAt
        timestamp updatedAt
    }
    
    ATTENDANCE {
        long id PK
        long sessionId FK
        long studentId FK
        string status
        string note
        timestamp createdAt
        timestamp updatedAt
    }
    
    SESSION_MATERIAL {
        long id PK
        long sessionId FK
        string fileName
        string fileUrl
        string fileType
        long uploadedBy
        timestamp createdAt
        timestamp updatedAt
    }
    
    ROLE {
        long id PK
        enum code UK
        string description
        long businessRoleId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    BUSINESS_ROLE {
        long id PK
        enum code UK
        string description
        timestamp createdAt
        timestamp updatedAt
    }
    
    USER_ROLE {
        long userId FK
        long roleId FK
        timestamp assignedAt
    }
    
    USER_BUSINESS_ROLE {
        long userId FK
        long businessRoleId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    USER ||--o{ STUDENT : "1:0..1"
    USER ||--o{ TEACHER : "1:0..1"
    USER ||--o{ USER_ROLE : "1:*"
    USER ||--o{ USER_BUSINESS_ROLE : "1:*"
    
    ROLE ||--o{ USER_ROLE : "1:*"
    BUSINESS_ROLE ||--o{ ROLE : "1:*"
    BUSINESS_ROLE ||--o{ USER_BUSINESS_ROLE : "1:*"
    
    COURSE ||--o{ COURSE_SESSION : "1:*"
    COURSE ||--o{ ENROLLMENT : "1:*"
    COURSE }o--|| TEACHER : "N:1"
    
    STUDENT ||--o{ ENROLLMENT : "1:*"
    STUDENT ||--o{ ATTENDANCE : "1:*"
    
    COURSE_SESSION ||--o{ ATTENDANCE : "1:*"
    COURSE_SESSION ||--o{ SESSION_MATERIAL : "1:*"
```

### Key Relationships

#### One-to-One Relationships

| From | To | Constraint | Note |
|------|----|-----------:|------|
| User | Student | unique foreign key | Each user can be at most one student |
| User | Teacher | unique foreign key | Each user can be at most one teacher |

#### One-to-Many Relationships

| From | To | Cardinality | Note |
|------|----|-----------:|------|
| Course | Session | 1:N | A course has many sessions |
| Course | Enrollment | 1:N | A course has many enrollments |
| Student | Enrollment | 1:N | A student has many enrollments |
| Student | Attendance | 1:N | A student has many attendance records |
| Session | Attendance | 1:N | A session has many attendance records |
| Session | Material | 1:N | A session has many materials |
| Teacher | Course | 1:N | A teacher teaches many courses |
| User | Role | 1:N | A user has many system roles |
| User | BusinessRole | 1:N | A user can have multiple business roles (history) |
| BusinessRole | Role | 1:N | A business role contains many system roles |

#### Many-to-Many Relationships (via Junction Tables)

| Left | Junction | Right | Purpose |
|------|----------|-------|---------|
| User | UserRole | Role | Assign granular permissions to users |
| User | UserBusinessRole | BusinessRole | Assign organizational roles |

---

## API Contract Examples

### Authentication API

#### POST /auth/login
**Request:**
```json
{
  "username": "teacher1",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "teacher1",
      "email": "teacher1@center.com",
      "fullName": "John Teacher",
      "status": "ACTIVE",
      "roles": ["TEACHER"],
      "businessRole": "TEACHER"
    },
    "expiresIn": 3600000
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Username or password is incorrect"
  }
}
```

---

### Course API

#### POST /courses
**Request:**
```json
{
  "code": "ENG101",
  "name": "English for Beginners",
  "startDate": "2026-07-01",
  "endDate": "2026-08-31",
  "maxStudent": 20,
  "status": "PLANNING",
  "minimumAge": 18,
  "requiredEntryLevel": "BEGINNER",
  "prerequisitesRequired": false,
  "teacherId": 1,
  "availableRoleTeacher": "TEACHER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "ENG101",
    "name": "English for Beginners",
    "startDate": "2026-07-01",
    "endDate": "2026-08-31",
    "maxStudent": 20,
    "status": "PLANNING",
    "minimumAge": 18,
    "requiredEntryLevel": "BEGINNER",
    "prerequisitesRequired": false,
    "teacher": {
      "id": 1,
      "userId": 5,
      "salary": "5000.00"
    },
    "createdAt": "2026-06-12T10:30:00Z",
    "updatedAt": "2026-06-12T10:30:00Z"
  }
}
```

---

#### GET /courses
**Query Parameters:**
```
GET /courses?status=ACTIVE&page=0&size=10&sort=startDate,desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "ENG102",
        "name": "English for Intermediate",
        "startDate": "2026-06-15",
        "status": "ACTIVE",
        "maxStudent": 25,
        "enrolledCount": 18,
        "teacher": {
          "id": 1,
          "userId": 5,
          "user": {
            "fullName": "John Teacher"
          }
        }
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

---

### Enrollment API

#### POST /enrollments
**Request:**
```json
{
  "studentId": 10,
  "courseId": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student": {
      "id": 10,
      "userId": 20,
      "entryLevel": "BEGINNER",
      "dateOfBirth": "2000-01-15",
      "prerequisitesCompleted": false
    },
    "course": {
      "id": 1,
      "code": "ENG101",
      "name": "English for Beginners",
      "minimumAge": 18,
      "requiredEntryLevel": "BEGINNER",
      "prerequisitesRequired": false
    },
    "enrollDate": "2026-06-12",
    "status": "APPROVED",
    "ageEligible": true,
    "entryLevelEligible": true,
    "prerequisitesEligible": true,
    "eligibilityCheckDate": "2026-06-12T10:35:00Z"
  }
}
```

**Response (400 Bad Request - Eligibility Failed):**
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_ELIGIBILITY_FAILED",
    "message": "Student does not meet course requirements",
    "details": {
      "ageEligible": true,
      "entryLevelEligible": false,
      "prerequisitesEligible": false
    }
  }
}
```

---

### Attendance API

#### POST /attendance
**Request (Batch):**
```json
{
  "sessionId": 5,
  "records": [
    {
      "studentId": 10,
      "status": "PRESENT"
    },
    {
      "studentId": 11,
      "status": "ABSENT",
      "note": "Sick leave"
    },
    {
      "studentId": 12,
      "status": "EXCUSED",
      "note": "Doctor appointment"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "sessionId": 5,
    "recordsCreated": 3,
    "records": [
      {
        "id": 1,
        "studentId": 10,
        "sessionId": 5,
        "status": "PRESENT",
        "note": null,
        "createdAt": "2026-06-12T15:00:00Z"
      },
      {
        "id": 2,
        "studentId": 11,
        "sessionId": 5,
        "status": "ABSENT",
        "note": "Sick leave",
        "createdAt": "2026-06-12T15:00:00Z"
      },
      {
        "id": 3,
        "studentId": 12,
        "sessionId": 5,
        "status": "EXCUSED",
        "note": "Doctor appointment",
        "createdAt": "2026-06-12T15:00:00Z"
      }
    ]
  }
}
```

---

## Security & Authentication Flow

### JWT Token Structure

```
Header.Payload.Signature

Example Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Decoded Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Decoded Payload:**
```json
{
  "userId": 1,
  "username": "teacher1",
  "email": "teacher1@center.com",
  "roles": ["TEACHER"],
  "businessRole": "TEACHER",
  "iat": 1686484800,
  "exp": 1686488400
}
```

**Token Generation (Backend):**
```java
@Service
public class JwtTokenProvider {
  public String generateToken(User user) {
    long expirationTime = System.currentTimeMillis() + JWT_EXPIRATION_MS;
    return Jwts.builder()
        .setSubject(user.getUsername())
        .claim("userId", user.getId())
        .claim("email", user.getEmail())
        .claim("roles", user.getRoles())
        .setIssuedAt(new Date())
        .setExpiration(new Date(expirationTime))
        .signWith(SignatureAlgorithm.HS256, JWT_SECRET)
        .compact();
  }
}
```

---

### Authentication & Authorization Flow

#### Request with JWT Token

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Interceptor
    participant Backend
    participant SecurityFilter
    
    Client->>Frontend: Make API request
    Frontend->>Interceptor: Request goes through Axios interceptor
    Interceptor->>Interceptor: Get token from sessionStorage
    Interceptor->>Interceptor: Add Authorization header: "Bearer {token}"
    Interceptor->>Backend: POST /courses with header
    
    Backend->>SecurityFilter: Request received by JwtAuthenticationFilter
    SecurityFilter->>SecurityFilter: Extract token from header
    SecurityFilter->>SecurityFilter: Validate token signature & expiration
    
    alt Token Valid
        SecurityFilter->>SecurityFilter: Parse claims (userId, roles)
        SecurityFilter->>SecurityFilter: Create Authentication object
        SecurityFilter->>Backend: Spring Security context set
        Backend->>Backend: Method checks @PreAuthorize("hasRole('TEACHER')")
        Backend->>Backend: Role check passes
        Backend->>Backend: Execute endpoint logic
        Backend-->>Frontend: HTTP 200 + response
    else Token Invalid/Expired
        SecurityFilter-->>Frontend: HTTP 401 Unauthorized
        Frontend->>Frontend: Clear sessionStorage token
        Frontend->>Frontend: Redirect to login page
    end
```

---

### Role-Based Access Control (RBAC)

#### Authorization Annotation Examples

```java
// Admin only
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/users")
public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest req) { }

// Teacher or Admin
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@PostMapping("/courses")
public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CreateCourseRequest req) { }

// Student only
@PreAuthorize("hasRole('STUDENT')")
@PostMapping("/enrollments")
public ResponseEntity<EnrollmentResponse> enrollCourse(@Valid @RequestBody CreateEnrollmentRequest req) { }

// Any authenticated user
@PreAuthorize("isAuthenticated()")
@GetMapping("/users/{id}")
public ResponseEntity<UserResponse> getUserDetail(@PathVariable Long id) { }
```

#### Role Hierarchy

```
ADMIN
  └─ Can do everything (super-user)

TEACHER
  ├─ Create/edit own courses
  ├─ Mark attendance
  ├─ Upload materials
  └─ View student progress

STUDENT
  ├─ Enroll in courses
  ├─ View own attendance
  ├─ Access course materials
  └─ View own grades/progress

STAFF (future)
  ├─ View reports
  ├─ Audit logs
  └─ No data modification
```

---

### Security Best Practices Implemented

1. **Password Hashing**
   - Passwords hashed using bcrypt via Spring Security
   - Never transmitted in plain text
   - Salt generated per password

2. **JWT Signing**
   - HS256 algorithm with minimum 32-character secret
   - Token expiration: 1 hour (configurable)
   - Secret stored in environment variables

3. **Input Validation**
   - @Valid annotations on all request DTOs
   - Custom validators for complex rules
   - Validation at API boundary only

4. **SQL Injection Prevention**
   - JPA parameterized queries only
   - No raw SQL string concatenation

5. **XSS Prevention**
   - React automatic HTML escaping
   - User-generated content treated as text

6. **CORS Configuration**
   - Configured in Spring Security
   - Allows frontend origin only

7. **Secrets Management**
   - No hardcoded secrets
   - Environment variables for all sensitive config

---

**End of Architecture & Data Flow Document**
