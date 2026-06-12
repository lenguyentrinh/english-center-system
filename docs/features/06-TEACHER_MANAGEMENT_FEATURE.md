# Teacher Management Feature

**Feature ID:** FEAT-006  
**Module:** Teacher  
**Status:** ⚠️ Minimal (Entity exists, CRUD partial)  
**Last Updated:** June 12, 2026

---

## Overview

### Purpose
Manage teacher profiles, assignments, and teaching-related information.

### Key Capabilities
- Create teacher accounts linked to users
- Assign teachers to courses
- View teacher workload (courses teaching)
- Manage teacher salary/compensation
- Teacher dashboard with teaching schedule
- View student roster per course

### Scope (Phase 1)
- ✅ Teacher entity and profile
- ⚠️ Teacher CRUD operations (partial)
- ✅ Course assignment (via Course entity)
- ❌ Teacher availability/scheduling (Phase 2)
- ❌ Teacher performance ratings (Phase 3)
- ❌ Salary management (Phase 2)

---

## User Stories

### US-1: Create Teacher Account
**As an** Admin  
**I want to** create a teacher account  
**So that** the teacher can login and teach courses

**Acceptance Criteria:**
- Create teacher via User creation (auto-linked)
- Set initial salary (optional)
- Teacher gets TEACHER role automatically
- Teacher can login immediately
- Appears in teacher list

---

### US-2: View Teachers
**As an** Admin  
**I want to** see all teachers  
**So that** I can manage staff

**Acceptance Criteria:**
- Teacher list shows: name, email, courses teaching, salary
- Can filter by active/inactive
- Can search by name/email
- Pagination support

---

### US-3: Teacher Dashboard
**As a** Teacher  
**I want to** see my courses and schedule  
**So that** I know what I'm teaching

**Acceptance Criteria:**
- Dashboard shows courses currently teaching
- Shows upcoming sessions for each course
- Shows total students enrolled per course
- Links to create sessions, mark attendance
- View student roster

---

### US-4: Update Teacher Info
**As an** Admin  
**I want to** update teacher salary and contact  
**So that** compensation records are current

**Acceptance Criteria:**
- Edit form shows: salary, phone, address
- Can update salary
- Cannot change username/email (use User module)
- Changes saved successfully

---

## Technical Architecture

### Entity Relationships

```
User (1) ──→ (0..1) Teacher
Teacher (1) ──→ (N) Course
```

### API Endpoints to Implement
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/teachers` | List teachers (paginated, filtered) |
| GET | `/teachers/{id}` | Teacher detail with courses |
| POST | `/teachers` | Create teacher (admin) |
| PUT | `/teachers/{id}` | Update teacher info |
| PUT | `/teachers/{id}/salary` | Update salary (admin) |
| GET | `/teachers/{id}/courses` | Courses taught by teacher |
| GET | `/teachers/{id}/dashboard` | Teacher dashboard (sessions, students, stats) |
| DELETE | `/teachers/{id}` | Deactivate teacher |

---

## Data Models

### Teacher Entity
```java
@Entity
public class Teacher extends BaseEntity {
  Long id;                          // PK
  User user;                        // FK, 1:1, not null
  BigDecimal salary;                // Compensation
  // Audit fields inherited from BaseEntity
}
```

### Teacher DTO (Response)
```java
@Data
@Builder
public class TeacherResponse {
  private Long id;
  private Long userId;
  private String username;
  private String email;
  private String fullName;
  private String phone;
  private BigDecimal salary;
  private Integer courseCount;
  private Integer studentCount;
  private LocalDateTime createdAt;
}
```

---

## Business Rules

### Teacher Creation
- User must exist and have TEACHER or ADMIN role
- One user = one teacher profile (one-to-one)
- Teacher created with ACTIVE status (inherited from User)

### Course Assignment
- Each course assigned to exactly one teacher
- Teacher can teach multiple courses
- Teacher reassignment requires course status < ACTIVE (planning only)

### Salary Management
- BigDecimal(12,2) precision for accuracy
- Optional field (null allowed)
- Only admin can view/update

### Inactivity
- Cannot delete teacher (use User status = INACTIVE)
- Inactive teacher cannot login or teach
- Existing enrollments preserved

---

## API Contracts

### GET /teachers

**Query Parameters:**
```
?page=0&size=10&status=ACTIVE&search=john
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "userId": 5,
        "username": "teacher1",
        "email": "teacher1@center.com",
        "fullName": "John Teacher",
        "phone": "0912345678",
        "salary": "5000.00",
        "courseCount": 2,
        "studentCount": 35,
        "createdAt": "2026-06-01T10:00:00Z"
      }
    ],
    "totalElements": 5,
    "totalPages": 1
  }
}
```

---

### GET /teachers/{id}/dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "id": 1,
      "fullName": "John Teacher",
      "email": "teacher1@center.com"
    },
    "courses": [
      {
        "id": 1,
        "code": "ENG101",
        "name": "English for Beginners",
        "status": "ACTIVE",
        "enrolledCount": 18,
        "totalCapacity": 20,
        "startDate": "2026-07-01",
        "endDate": "2026-08-31"
      }
    ],
    "upcomingSessions": [
      {
        "id": 1,
        "courseId": 1,
        "courseName": "ENG101",
        "sessionNo": 1,
        "sessionDate": "2026-07-01",
        "startTime": "18:00",
        "endTime": "19:30",
        "enrolledCount": 18
      }
    ],
    "stats": {
      "totalCoursesTeaching": 2,
      "totalStudents": 35,
      "totalSessions": 20,
      "sessionsThisWeek": 5
    }
  }
}
```

---

### PUT /teachers/{id}

**Request:**
```json
{
  "salary": "5500.00"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "teacher1",
    "salary": "5500.00",
    "updatedAt": "2026-06-12T16:00:00Z"
  }
}
```

---

## Frontend Implementation

### Pages & Components

#### TeachersListPage
- Table: Teacher name, email, courses, students
- Filter by active/inactive
- Search by name
- Edit/deactivate buttons
- "Create Teacher" button (admin)

#### TeacherDetailPage
- Teacher info (name, email, phone, salary)
- Courses teaching (with enrollment counts)
- Edit button (admin)
- Deactivate button (admin)

#### TeacherDashboardPage
- Welcome message with name
- Current courses (active)
- Upcoming sessions for next 7 days
- Quick stats (total students, sessions)
- Quick actions (mark attendance, view roster)
- Recently added students

---

## Redux State

```typescript
teachersSlice {
  teachers: TeacherResponse[],
  selectedTeacher: TeacherResponse | null,
  teacherDashboard: TeacherDashboardData | null,
  isLoading: boolean,
  error: string | null,
  filters: {
    status: string,
    searchText: string
  }
}
```

---

## Validation

### Backend
- User must exist
- Email must be unique (inherited from User)
- Username must be unique (inherited from User)
- Salary decimal format (12,2)
- Cannot create duplicate teacher for same user

---

## Workflows

### Create Teacher Workflow

```
Admin selects "Create Teacher"
  ↓
Create User first (via User feature)
  ↓
Enter teacher-specific info (salary)
  ↓
POST /teachers
  ↓
Backend creates Teacher entity linked to User
  ↓
Assign TEACHER role to User
  ↓
Return success
  ↓
Redirect to teacher list
```

### Teacher Login & Dashboard

```
Teacher logs in (via Auth feature)
  ↓
Redirected to dashboard
  ↓
GET /teachers/{currentUserId}/dashboard
  ↓
Backend fetches:
  ✓ Teacher info
  ✓ Courses assigned
  ✓ Upcoming sessions
  ✓ Enrollment stats
  ↓
Display dashboard with quick actions
```

---

## Testing

### Manual Tests
- [ ] Create teacher (link to user)
- [ ] View teacher list
- [ ] Edit teacher salary
- [ ] Deactivate teacher (via User status)
- [ ] View teacher dashboard
- [ ] See assigned courses
- [ ] See upcoming sessions
- [ ] See student roster

---

## TODO (Phase 1)

- [ ] Complete TeacherController CRUD operations
- [ ] Complete TeacherService implementation
- [ ] Add TeacherDashboardController endpoint
- [ ] Create TeacherResponse DTO
- [ ] Create frontend TeacherListPage
- [ ] Create frontend TeacherDetailPage
- [ ] Create frontend TeacherDashboardPage
- [ ] Add Redux thunks for teacher operations

---

## Future Enhancements (Phase 2+)

- [ ] Teacher availability calendar
- [ ] Teaching schedule conflicts detection
- [ ] Teacher performance ratings
- [ ] Salary history tracking
- [ ] Teaching certifications management
- [ ] Teacher peer reviews
- [ ] Professional development tracking

---

**End of Teacher Management Feature Documentation**
