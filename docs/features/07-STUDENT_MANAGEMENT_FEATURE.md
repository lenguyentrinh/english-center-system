# Student Management Feature

**Feature ID:** FEAT-007  
**Module:** Student  
**Status:** ⚠️ Minimal (Entity exists, CRUD partial)  
**Last Updated:** June 12, 2026

---

## Overview

### Purpose
Manage student profiles, track academic progress, and maintain student-specific information including demographics and learning level.

### Key Capabilities
- Create student accounts linked to users
- Store student demographics (age, address, parent info)
- Track entry level (proficiency level)
- Monitor prerequisites completion
- View student's enrolled courses
- Student dashboard with enrollment and attendance

### Scope (Phase 1)
- ✅ Student entity and profile
- ⚠️ Student CRUD operations (partial)
- ✅ Entry level tracking
- ✅ Prerequisites tracking
- ❌ Grade tracking (Phase 2)
- ❌ Performance analytics (Phase 2)
- ❌ Student progress reports (Phase 2)

---

## User Stories

### US-1: Create Student Account
**As an** Admin  
**I want to** create a student account  
**So that** the student can enroll in courses

**Acceptance Criteria:**
- Create student via User creation (auto-linked)
- Collect demographics: DOB, gender, address
- Collect parent/guardian info: name, phone
- Set initial entry level (BEGINNER, ELEMENTARY, INTERMEDIATE, ADVANCED)
- Student automatically gets STUDENT role
- Student can login immediately

---

### US-2: View Students
**As an** Admin  
**I want to** see all students  
**So that** I can manage enrollment

**Acceptance Criteria:**
- Student list shows: name, email, entry level, courses enrolled
- Can filter by entry level
- Can search by name/email
- Pagination support

---

### US-3: Student Dashboard
**As a** Student  
**I want to** see my courses and progress  
**So that** I know what I'm learning

**Acceptance Criteria:**
- Dashboard shows enrolled courses
- Shows attendance status per course
- Shows course progress (sessions attended / total)
- Quick links to access course materials
- Eligibility to upgrade level indicator (when 80%+ attendance)

---

### US-4: Update Student Profile
**As a** Student  
**I want to** update my profile info  
**So that** my records are current

**Acceptance Criteria:**
- Can update: address, phone, parent name/phone
- Cannot update: username, email (use User module)
- Cannot update: DOB, entry level (admin only)
- Changes saved successfully

---

### US-5: Upgrade Entry Level
**As an** Admin  
**I want to** upgrade student's entry level  
**So that** they can enroll in advanced courses

**Acceptance Criteria:**
- Admin can set prerequisites to completed
- Admin can manually upgrade entry level
- Student notified of upgrade
- Student can now enroll in next level

---

## Technical Architecture

### Entity Relationships

```
User (1) ──→ (0..1) Student
Student (1) ──→ (N) Enrollment
```

### API Endpoints to Implement
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/students` | List students (paginated, filtered) |
| GET | `/students/{id}` | Student detail |
| POST | `/students` | Create student (admin) |
| PUT | `/students/{id}` | Update student profile |
| PUT | `/students/{id}/entry-level` | Update entry level (admin) |
| PUT | `/students/{id}/prerequisites` | Mark prerequisites done (admin) |
| GET | `/students/{id}/enrollments` | Student's enrolled courses |
| GET | `/students/{id}/dashboard` | Student dashboard (progress, courses, stats) |
| GET | `/students/{id}/attendance` | Student attendance summary |
| DELETE | `/students/{id}` | Deactivate student |

---

## Data Models

### Student Entity
```java
@Entity
public class Student extends BaseEntity {
  Long id;                          // PK
  User user;                        // FK, 1:1, not null
  LocalDate dateOfBirth;            // Age calculation
  Gender gender;                    // Demographic
  String address;                   // Contact address
  String parentName;                // Emergency contact
  String parentPhone;               // Emergency contact
  EntryLevel entryLevel;            // BEGINNER, ELEMENTARY, INTERMEDIATE, ADVANCED
  Boolean prerequisitesCompleted;   // Completion flag for prerequisites
}
```

### Student DTO (Response)
```java
@Data
@Builder
public class StudentResponse {
  private Long id;
  private Long userId;
  private String username;
  private String email;
  private String fullName;
  private LocalDate dateOfBirth;
  private Integer age; // calculated
  private Gender gender;
  private String address;
  private String parentName;
  private String parentPhone;
  private EntryLevel entryLevel;
  private Boolean prerequisitesCompleted;
  private Integer courseCount;
  private LocalDateTime createdAt;
}
```

---

## Business Rules

### Student Creation
- User must exist and have STUDENT role
- One user = one student profile (one-to-one)
- Student created with ACTIVE status (inherited from User)
- Entry level must be valid enum

### Entry Level Progression
```
BEGINNER
  ↓ (when prerequisites done + 80% attendance in BEGINNER course)
ELEMENTARY
  ↓ (when prerequisites done + 80% attendance in ELEMENTARY course)
INTERMEDIATE
  ↓ (when prerequisites done + 80% attendance in INTERMEDIATE course)
ADVANCED
```

### Age Calculation
- Calculated from dateOfBirth
- Age = today - dateOfBirth (in years)
- Used for course enrollment eligibility

### Prerequisites Tracking
- Simple flag: Boolean (not course-specific in Phase 1)
- Set to true when admin marks as completed
- Prevents enrollment in prerequisite-required courses

---

## API Contracts

### GET /students

**Query Parameters:**
```
?page=0&size=10&entryLevel=BEGINNER&search=jane
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 10,
        "userId": 20,
        "username": "jane_student",
        "email": "jane@email.com",
        "fullName": "Jane Student",
        "age": 22,
        "gender": "FEMALE",
        "entryLevel": "BEGINNER",
        "prerequisitesCompleted": false,
        "courseCount": 1,
        "createdAt": "2026-06-01T10:00:00Z"
      }
    ],
    "totalElements": 45,
    "totalPages": 5
  }
}
```

---

### GET /students/{id}/dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 10,
      "fullName": "Jane Student",
      "entryLevel": "BEGINNER",
      "age": 22
    },
    "enrolledCourses": [
      {
        "id": 1,
        "courseId": 1,
        "courseName": "English for Beginners",
        "enrollmentStatus": "APPROVED",
        "sessionCount": 10,
        "attendedCount": 7,
        "attendancePercentage": 70,
        "eligible": false,
        "message": "Need 8 more attended sessions to complete course"
      }
    ],
    "stats": {
      "totalCourses": 1,
      "completedCourses": 0,
      "averageAttendance": 70
    }
  }
}
```

---

### PUT /students/{id}/entry-level

**Request:**
```json
{
  "entryLevel": "ELEMENTARY",
  "prerequisitesCompleted": true,
  "reason": "Completed beginner course with 85% attendance"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "entryLevel": "ELEMENTARY",
    "prerequisitesCompleted": true,
    "updatedAt": "2026-06-12T16:00:00Z"
  }
}
```

---

## Frontend Implementation

### Pages & Components

#### StudentsListPage
- Table: Student name, email, entry level, courses
- Filter by entry level
- Search by name
- Edit/deactivate buttons
- "Create Student" button (admin)

#### StudentDetailPage
- Student info (demographics, contact, parent info)
- Entry level and prerequisites status
- Enrolled courses list
- Edit button (student can edit own, admin can edit all)

#### StudentDashboardPage
- Welcome message with name
- Current enrollments with progress bars
- Attendance percentage per course
- Eligibility indicators (80% attendance shown)
- Quick actions (view course, mark attendance)
- Entry level upgrade prompt (if eligible)

#### StudentProfileEditPage
- Form for student to update own info
- Fields: address, phone, parent name/phone
- Cannot change: username, email, DOB, entry level

---

## Redux State

```typescript
studentsSlice {
  students: StudentResponse[],
  selectedStudent: StudentResponse | null,
  studentDashboard: StudentDashboardData | null,
  myProfile: StudentResponse | null,
  isLoading: boolean,
  error: string | null,
  filters: {
    entryLevel: string,
    searchText: string
  }
}
```

---

## Validation

### Backend
- User must exist
- Email must be unique (inherited from User)
- DOB must be valid date and in past
- Entry level must be valid enum
- Age calculated correctly (no negative ages)
- Phone format validation (10 digits)

### Frontend (Zod)
```typescript
studentSchema = z.object({
  dateOfBirth: z.date().max(new Date(), "DOB must be in past"),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  entryLevel: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED'])
})
```

---

## Workflows

### Create Student Workflow

```
Admin selects "Create Student"
  ↓
Create User first (via User feature)
  ↓
Enter student demographics:
  ✓ DOB, Gender, Address
  ✓ Parent info
  ✓ Entry level
  ↓
POST /students
  ↓
Backend creates Student entity linked to User
  ↓
Assign STUDENT role to User
  ↓
Return success
  ↓
Redirect to student list
```

### Student Dashboard Workflow

```
Student logs in
  ↓
Redirected to dashboard (StudentDashboardPage)
  ↓
GET /students/{currentUserId}/dashboard
  ↓
Backend fetches:
  ✓ Student profile
  ✓ Enrolled courses (with enrollment status)
  ✓ Attendance data per course
  ✓ Eligibility status
  ↓
Display dashboard
  ├─ Enrollments with progress bars
  ├─ Attendance percentage
  └─ Next actions (enroll in more courses)
```

### Entry Level Upgrade Workflow

```
Admin reviews student (attended 80%+ of course)
  ↓
Admin on StudentDetailPage clicks "Upgrade Level"
  ↓
Modal shows:
  ✓ Current level: BEGINNER
  ✓ New level: ELEMENTARY
  ✓ Prerequisite marked as done?
  ↓
Admin clicks Confirm
  ↓
PUT /students/{id}/entry-level
  ↓
Backend updates:
  ✓ entryLevel = ELEMENTARY
  ✓ prerequisitesCompleted = true
  ↓
Frontend shows success
  ↓
Student can now enroll in ELEMENTARY courses
```

---

## Testing

### Manual Tests
- [ ] Create student (link to user)
- [ ] View student list
- [ ] Filter by entry level
- [ ] Edit student profile (student view)
- [ ] Edit student profile (admin view)
- [ ] View student dashboard
- [ ] See enrolled courses
- [ ] Check attendance percentage
- [ ] Upgrade student entry level
- [ ] Deactivate student (via User status)

---

## TODO (Phase 1)

- [ ] Complete StudentController CRUD operations
- [ ] Complete StudentService implementation
- [ ] Add StudentDashboardController endpoint
- [ ] Create StudentResponse DTO
- [ ] Create frontend StudentsListPage
- [ ] Create frontend StudentDetailPage
- [ ] Create frontend StudentDashboardPage
- [ ] Create frontend StudentProfileEditPage
- [ ] Add Redux thunks for student operations

---

## Future Enhancements (Phase 2+)

- [ ] Grade tracking and report cards
- [ ] Student performance analytics
- [ ] Learning progress insights
- [ ] Skills tracking (what English skills mastered)
- [ ] Certificate generation
- [ ] Student cohort management
- [ ] Learning path recommendations
- [ ] Student peer groups

---

**End of Student Management Feature Documentation**
