# Course Management Feature

**Feature ID:** FEAT-003  
**Module:** Academic  
**Status:** ⚠️ Partial (API endpoints partial)  
**Last Updated:** June 12, 2026

---

## Overview

### Purpose
Manage course lifecycle (creation, scheduling, status management) and course content (sessions, materials).

### Key Capabilities
- Create courses with eligibility rules
- Schedule sessions within courses
- Manage course status (PLANNING → ACTIVE → COMPLETED)
- Upload learning materials to sessions
- View course details with enrolled students
- Assign teachers to courses
- Set enrollment capacity and minimum age

### Scope (Phase 1)
- ✅ Course CRUD operations
- ✅ Course status management
- ✅ Session creation and management
- ⚠️ Session material upload (entity ready, API partial)
- ✅ Course eligibility rules (age, entry level, prerequisites)
- ✅ Course listing with filters
- ❌ Recurring session automation (Phase 2)
- ❌ Course cloning (Phase 2)
- ❌ Course templates (Phase 2)

---

## User Stories

### US-1: Create Course
**As a** Teacher or Admin  
**I want to** create a new course  
**So that** students can enroll and learn

**Acceptance Criteria:**
- Course form validates: code (unique), name, dates, teacher, capacity
- startDate < endDate enforced
- Code immutable after creation
- Teacher auto-set if current user is teacher
- Default status: PLANNING
- Created course visible in course list

---

### US-2: Schedule Sessions
**As a** Course instructor  
**I want to** create sessions for my course  
**So that** students know when classes meet

**Acceptance Criteria:**
- Session form validates: date, time, title, topic
- sessionDate must be between course start/end dates
- startTime < endTime
- Can create multiple sessions
- Session number auto-incremented
- Sessions visible in course detail view

---

### US-3: Activate Course
**As an** Admin  
**I want to** activate a course from PLANNING to ACTIVE  
**So that** students can enroll

**Acceptance Criteria:**
- Status change button available on course detail
- Validates: course has at least one session, teacher assigned
- Status changed to ACTIVE
- Students can now enroll
- UI reflects status change

---

### US-4: View Course Details
**As a** Student or Teacher  
**I want to** see course details, sessions, and materials  
**So that** I know what I'm enrolling in or teaching

**Acceptance Criteria:**
- Course detail page shows: name, description, dates, teacher, capacity
- Sessions listed with date, time, topic
- Materials listed by session
- Enrolled students shown (if teacher/admin)
- Attendance summary shown (if teacher/admin)

---

### US-5: Upload Course Materials
**As a** Course instructor  
**I want to** upload documents, slides, videos to sessions  
**So that** students have learning resources

**Acceptance Criteria:**
- Material upload form allows file selection
- File size limit enforced (50MB)
- Supported formats: PDF, DOCX, PPTX, images, videos
- Material visible in session detail
- Only instructor/admin can upload
- Students can download materials

---

## Technical Architecture

### Entity Relationships

```
Course (1) ──→ (N) CourseSession
         ├─→ (N) Enrollment
         ├─→ (1) Teacher
         └─→ (N) SessionMaterial (via CourseSession)
```

### Controller Endpoints to Implement
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/courses` | List courses (paginated, filtered) |
| GET | `/courses/{id}` | Course detail with sessions |
| POST | `/courses` | Create course (teacher/admin) |
| PUT | `/courses/{id}` | Update course info |
| PUT | `/courses/{id}/status` | Change course status |
| GET | `/courses/{id}/sessions` | List sessions for course |
| POST | `/courses/{id}/sessions` | Create session |
| PUT | `/sessions/{id}` | Update session |
| DELETE | `/sessions/{id}` | Delete session |
| POST | `/sessions/{id}/materials` | Upload material (multipart) |
| GET | `/sessions/{id}/materials` | List materials for session |
| DELETE | `/materials/{id}` | Delete material |

### Frontend Pages

```
CoursesPage
├── CourseListView
│   ├── CourseCard
│   ├── CourseFilterBar
│   └── CourseCreateButton
└── CourseDetailPage
    ├── CourseHeader (info, status, actions)
    ├── SessionsList
    │   ├── SessionCard
    │   └── SessionDetailModal
    │       ├── MaterialsList
    │       └── MaterialUploadForm
    ├── EnrollmentsList (if teacher/admin)
    └── AttendanceSummary (if teacher/admin)
```

---

## Data Models

### Course Entity
```java
@Entity
public class Course extends BaseEntity {
  Long id;                          // PK
  String code;                      // UK (immutable)
  String name;
  LocalDate startDate;
  LocalDate endDate;
  Integer maxStudent;               // Enrollment capacity
  CourseStatus status;              // PLANNING, ACTIVE, COMPLETED, CANCELLED
  Integer minimumAge;               // Age eligibility
  String requiredEntryLevel;        // BEGINNER, ELEMENTARY, INTERMEDIATE, ADVANCED
  Boolean prerequisitesRequired;    // true/false
  Teacher teacher;                  // FK, not null, single teacher per course
  Roles availableRoleTeacher;       // Which role can teach (TEACHER, ADMIN, etc.)
}
```

### CourseSession Entity
```java
@Entity
public class CourseSession extends BaseEntity {
  Long id;                          // PK
  Course course;                    // FK, not null
  Integer sessionNo;                // Unique within course
  String title;                     // Session topic title
  LocalDate sessionDate;            // When
  LocalTime startTime;              // Start time
  LocalTime endTime;                // End time
  String topic;                     // What's being taught
}
```

### SessionMaterial Entity
```java
@Entity
public class SessionMaterial extends BaseEntity {
  Long id;                          // PK
  CourseSession session;            // FK
  String fileName;                  // Original filename
  String fileUrl;                   // URL/path to file
  String fileType;                  // MIME type (PDF, VIDEO, LINK, etc.)
  Long uploadedBy;                  // User ID who uploaded
}
```

---

## API Contracts

### GET /courses

**Query Parameters:**
```
?status=ACTIVE&page=0&size=10&search=beginner&sortBy=startDate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "ENG101",
        "name": "English for Beginners",
        "startDate": "2026-07-01",
        "endDate": "2026-08-31",
        "maxStudent": 20,
        "enrolledCount": 15,
        "status": "ACTIVE",
        "minimumAge": 18,
        "requiredEntryLevel": "BEGINNER",
        "prerequisitesRequired": false,
        "teacher": {
          "id": 1,
          "userId": 5,
          "user": { "fullName": "John Teacher" }
        },
        "sessions": [
          {
            "id": 1,
            "sessionNo": 1,
            "sessionDate": "2026-07-01",
            "startTime": "18:00",
            "endTime": "19:30",
            "title": "Introductions",
            "topic": "Basic greetings and introductions"
          }
        ]
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

---

### POST /courses

**Request:**
```json
{
  "code": "ENG101",
  "name": "English for Beginners",
  "startDate": "2026-07-01",
  "endDate": "2026-08-31",
  "maxStudent": 20,
  "minimumAge": 18,
  "requiredEntryLevel": "BEGINNER",
  "prerequisitesRequired": false,
  "teacherId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "ENG101",
    "name": "English for Beginners",
    "status": "PLANNING",
    "startDate": "2026-07-01",
    "endDate": "2026-08-31",
    "maxStudent": 20,
    "minimumAge": 18,
    "requiredEntryLevel": "BEGINNER",
    "prerequisitesRequired": false,
    "teacher": { "id": 1 },
    "createdAt": "2026-06-12T16:00:00Z"
  }
}
```

---

### POST /courses/{id}/sessions

**Request:**
```json
{
  "sessionNo": 1,
  "title": "Introductions",
  "sessionDate": "2026-07-01",
  "startTime": "18:00",
  "endTime": "19:30",
  "topic": "Basic greetings and introductions"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "courseId": 1,
    "sessionNo": 1,
    "title": "Introductions",
    "sessionDate": "2026-07-01",
    "startTime": "18:00",
    "endTime": "19:30",
    "topic": "Basic greetings and introductions",
    "createdAt": "2026-06-12T16:30:00Z"
  }
}
```

---

### POST /sessions/{id}/materials

**Request (Multipart form-data):**
```
file: <PDF/DOCX/PPTX file>
fileType: "PDF"
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sessionId": 1,
    "fileName": "lesson-notes.pdf",
    "fileUrl": "/uploads/sessions/lesson-notes.pdf",
    "fileType": "PDF",
    "uploadedBy": 5,
    "createdAt": "2026-06-12T17:00:00Z"
  }
}
```

---

## Business Rules

### Course Creation
- Course code must be unique (case-sensitive)
- startDate < endDate
- maxStudent > 0
- Teacher must exist and be ACTIVE
- minimumAge >= 0
- requiredEntryLevel must be valid (BEGINNER, ELEMENTARY, INTERMEDIATE, ADVANCED)

### Course Status Transitions
- PLANNING → ACTIVE (must have at least 1 session)
- ACTIVE → COMPLETED (automatic when endDate passed, or manual)
- Any → CANCELLED (emergency cancellation)
- No revert to previous status (COMPLETED ≠> ACTIVE)

### Session Constraints
- All sessions must fall between course.startDate and course.endDate
- startTime < endTime
- sessionNo unique within course
- Cannot add sessions after course status = COMPLETED

### Material Constraints
- Max file size: 50MB
- Supported formats: PDF, DOCX, PPTX, image/* (JPG, PNG), video/*
- Only course teacher or admin can upload
- Students can only see materials for enrolled courses

---

## Frontend Implementation

### Redux State
```typescript
coursesSlice {
  courses: CourseResponse[],
  selectedCourse: CourseResponse | null,
  sessions: CourseSession[],
  materials: SessionMaterial[],
  isLoading: boolean,
  error: string | null,
  filters: {
    status: string,
    searchText: string,
    entryLevel: string
  },
  pagination: { totalElements, currentPage, pageSize }
}
```

### Main Components

#### CoursesPage.tsx
- Lists all ACTIVE courses
- Filter by entry level
- Search by name/code
- "View Details" navigates to CourseDetailPage
- "Create Course" button (teacher/admin only)

#### CourseDetailPage.tsx
- Shows course info (name, dates, teacher, capacity)
- Lists sessions with times
- Shows enrolled students (if teacher/admin)
- Lists materials per session
- Material upload form (if teacher/admin)
- "Enroll" button (if student, not enrolled)

#### SessionMaterialsView.tsx
- Lists materials for session
- Download link for each material
- Delete button (if teacher/admin)
- Upload form (if teacher/admin)

---

## Validation Rules

### Backend Validation
- @NotBlank for code, name
- @Pattern for code (alphanumeric + numbers)
- Date range validation (startDate < endDate)
- Enum validation for status, entryLevel
- FK existence checks

### Frontend Validation (Zod)
```typescript
courseSchema = z.object({
  code: z.string().regex(/^[A-Z]{3}\d{3}$/),
  name: z.string().min(5).max(100),
  startDate: z.date(),
  endDate: z.date(),
  maxStudent: z.number().positive(),
  minimumAge: z.number().nonnegative()
}).refine(
  data => data.startDate < data.endDate,
  "Start date must be before end date"
)
```

---

## Error Handling

| Scenario | Status | Code |
|----------|--------|------|
| Course not found | 404 | COURSE_NOT_FOUND |
| Duplicate code | 409 | COURSE_CODE_EXISTS |
| Invalid date range | 400 | INVALID_DATE_RANGE |
| Session outside course dates | 400 | SESSION_DATE_OUT_OF_RANGE |
| Cannot activate: no sessions | 400 | COURSE_NOT_READY |
| File too large | 413 | FILE_TOO_LARGE |
| Unsupported file type | 400 | UNSUPPORTED_FILE_TYPE |

---

## Testing

### Manual Tests
- [ ] Create course with valid data
- [ ] Create course with duplicate code (error)
- [ ] Create course with invalid date range (error)
- [ ] Activate course (verify sessions exist)
- [ ] Create session within course
- [ ] Create session outside date range (error)
- [ ] Upload material to session
- [ ] Download material
- [ ] List courses with filters
- [ ] View course detail page

---

## Future Enhancements (Phase 2+)

- [ ] Recurring session automation (weekly, bi-weekly pattern)
- [ ] Course cloning (copy course with sessions)
- [ ] Course templates (predefined course structures)
- [ ] Prerequisite tracking (specific courses required)
- [ ] Course ratings and reviews
- [ ] Curriculum management
- [ ] Session recordings storage

---

**End of Course Management Feature Documentation**
