# Student Enrollment Feature

**Feature ID:** FEAT-004  
**Module:** Academic  
**Status:** ⚠️ Partial (Service logic needs completion)  
**Last Updated:** June 12, 2026

---

## Overview

### Purpose
Manage student course enrollment with automatic eligibility verification and enrollment status tracking.

### Key Capabilities
- Students can enroll in active courses
- Automatic eligibility checking (age, entry level, prerequisites)
- Enrollment status tracking (PENDING, APPROVED, REJECTED, COMPLETED, WITHDRAWN)
- Admin can approve pending enrollments
- Prevent duplicate enrollments (one per student per course)
- Track enrollment and eligibility check dates
- Capacity management (first-come, first-served or waitlist)

### Scope (Phase 1)
- ✅ Enrollment creation with eligibility check
- ✅ Enrollment status management
- ⚠️ Capacity management (basic)
- ✅ Eligibility verification logic
- ❌ Waitlist management (Phase 2)
- ❌ Auto-approval on eligibility (Phase 2)
- ❌ Payment before enrollment (Phase 2)
- ❌ Prerequisites tracking by course (Phase 2)

---

## User Stories

### US-1: Enroll in Course
**As a** Student  
**I want to** enroll in a course  
**So that** I can attend classes and learn

**Acceptance Criteria:**
- Enrollment form shows available ACTIVE courses
- Student selects course and submits
- System auto-checks eligibility (age, level, prereqs)
- If all checks pass → enrollment status = APPROVED
- If any check fails → enrollment status = PENDING (admin review)
- Duplicate enrollment prevented (409 error)
- Success message shows enrollment status

---

### US-2: View Enrolled Courses
**As a** Student  
**I want to** see my enrolled courses  
**So that** I know where I need to attend

**Acceptance Criteria:**
- Page lists all APPROVED enrollments
- Shows course name, schedule, teacher
- Shows enrollment status
- Shows attendance summary (if course active)
- Can click to view course details

---

### US-3: Approve Pending Enrollment
**As an** Admin  
**I want to** review and approve pending enrollments  
**So that** students who didn't auto-approve can attend

**Acceptance Criteria:**
- Pending enrollments page shows:
  - Student name, date of birth, current level
  - Course name, minimum age, required level
  - Eligibility check results (why pending?)
- Admin can APPROVE or REJECT
- Email notification to student
- Student can then attend if APPROVED

---

### US-4: Withdraw from Course
**As a** Student  
**I want to** withdraw from a course  
**So that** I can stop attending if needed

**Acceptance Criteria:**
- Withdraw button available on enrolled course
- Enrollment status changes to WITHDRAWN
- Cannot withdraw after course completion
- Confirmation dialog before withdrawing
- Course seat becomes available (if at capacity)

---

### US-5: Check Eligibility
**As a** Student  
**I want to** see why my enrollment was pending  
**So that** I know what I need to do to complete enrollment

**Acceptance Criteria:**
- Enrollment detail page shows eligibility check results:
  - ✓ Age: Pass/Fail (e.g., "You are 20, course requires 18")
  - ✓ Entry Level: Pass/Fail (e.g., "You are BEGINNER, required ELEMENTARY")
  - ✓ Prerequisites: Pass/Fail (e.g., "No prior course completed")
- Admin can manually approve despite failed checks

---

## Technical Architecture

### Entity Relationships

```
Course (1) ──→ (N) Enrollment
Student (1) ──→ (N) Enrollment
Enrollment contains eligibility status and check results
```

### API Endpoints

```
POST   /enrollments                    → Create enrollment (auto-check eligibility)
GET    /enrollments                    → List enrollments (filters: status, student, course)
GET    /enrollments/{id}               → Enrollment detail with eligibility results
PUT    /enrollments/{id}/status        → Update status (admin) or withdraw (student)
GET    /students/{id}/enrollments      → List student's enrollments
GET    /courses/{id}/enrollments       → List course's enrollments (teacher/admin)
GET    /courses/{id}/enrollment-summary → Enrollment stats
```

---

## Data Models

### Enrollment Entity
```java
@Entity
public class Enrollment extends BaseEntity {
  Long id;                          // PK
  Student student;                  // FK, not null
  Course course;                    // FK, not null
  LocalDate enrollDate;             // When enrolled
  String status;                    // PENDING, APPROVED, REJECTED, COMPLETED, WITHDRAWN
  Boolean ageEligible;              // Age check pass/fail
  Boolean entryLevelEligible;       // Level check pass/fail
  Boolean prerequisitesEligible;    // Prerequisites check pass/fail
  LocalDateTime eligibilityCheckDate; // When checked
  
  // Composite unique: (student_id, course_id)
}
```

---

## Business Rules

### Eligibility Verification
```java
boolean ageEligible = calculateAge(student.dateOfBirth) >= course.minimumAge;
boolean entryLevelEligible = student.entryLevel.equals(course.requiredEntryLevel);
boolean prerequisitesEligible = 
  !course.prerequisitesRequired || student.prerequisitesCompleted;

if (ageEligible && entryLevelEligible && prerequisitesEligible) {
  enrollment.status = APPROVED;
} else {
  enrollment.status = PENDING; // Admin must review
}
```

### Status Transitions
```
PENDING ──→ APPROVED ──→ COMPLETED
         ──→ REJECTED

APPROVED ──→ WITHDRAWN
PENDING ──→ WITHDRAWN
```

### Capacity Management
- If course.maxStudent set and reached → new enrollments pending regardless of eligibility
- If at capacity, APPROVED status becomes WAITLIST (Phase 2)

### Duplicate Prevention
- Composite unique constraint: (student_id, course_id)
- Cannot enroll twice in same course
- Must WITHDRAW first to re-enroll

---

## API Contracts

### POST /enrollments

**Request:**
```json
{
  "studentId": 10,
  "courseId": 1
}
```

**Response (201) - Auto-Approved:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student": { "id": 10, "fullName": "Jane Student" },
    "course": { "id": 1, "code": "ENG101", "name": "Beginners" },
    "enrollDate": "2026-06-12",
    "status": "APPROVED",
    "ageEligible": true,
    "entryLevelEligible": true,
    "prerequisitesEligible": true,
    "eligibilityCheckDate": "2026-06-12T16:00:00Z",
    "message": "Enrollment approved! You can start attending."
  }
}
```

**Response (201) - Pending Review:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "student": { "id": 11, "fullName": "John Student" },
    "course": { "id": 1, "code": "ENG101" },
    "enrollDate": "2026-06-12",
    "status": "PENDING",
    "ageEligible": true,
    "entryLevelEligible": false,
    "prerequisitesEligible": true,
    "eligibilityCheckDate": "2026-06-12T16:00:00Z",
    "failureReasons": [
      "Your current entry level (BEGINNER) doesn't match course requirement (ELEMENTARY)"
    ],
    "message": "Enrollment pending admin review. You'll be notified of decision."
  }
}
```

**Response (409) - Duplicate Enrollment:**
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_EXISTS",
    "message": "You are already enrolled in this course",
    "data": { "existingEnrollmentId": 1, "status": "APPROVED" }
  }
}
```

---

### GET /enrollments
**Query Parameters:**
```
?status=PENDING&courseId=1&page=0&size=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 2,
        "student": {
          "id": 11,
          "userId": 20,
          "fullName": "John Student",
          "dateOfBirth": "2000-05-15",
          "entryLevel": "BEGINNER",
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
        "status": "PENDING",
        "ageEligible": true,
        "entryLevelEligible": false,
        "prerequisitesEligible": true,
        "eligibilityCheckDate": "2026-06-12T16:00:00Z",
        "enrollDate": "2026-06-12"
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

### PUT /enrollments/{id}/status

**Request (Admin approving):**
```json
{
  "status": "APPROVED"
}
```

**Request (Student withdrawing):**
```json
{
  "status": "WITHDRAWN"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "status": "APPROVED",
    "updatedAt": "2026-06-12T17:00:00Z"
  }
}
```

---

## Frontend Implementation

### Redux State
```typescript
enrollmentSlice {
  myEnrollments: Enrollment[],      // Current user's enrollments
  pendingEnrollments: Enrollment[], // Admin view of pending
  selectedEnrollment: Enrollment | null,
  isLoading: boolean,
  error: string | null
}
```

### Pages & Components

#### EnrollmentPage (Student)
- Search available ACTIVE courses
- Course list with "Enroll" button
- My Enrollments list
- Enrollment status badge
- Withdraw button (for APPROVED enrollments)

#### EnrollmentApprovalPage (Admin)
- List PENDING enrollments
- Show student vs course requirements (side-by-side)
- Highlight failed eligibility checks
- APPROVE / REJECT buttons
- Notes field for rejection reason

#### EnrollmentDetailModal
- Student info (name, age, level, prior courses)
- Course info (dates, level, capacity)
- Eligibility check results (✓/✗ for each check)
- Failure reasons listed
- Timestamps

---

## Validation Rules

### Backend Validation
- Student exists and ACTIVE
- Course exists and status = ACTIVE
- Dates valid (enrollment before course end)
- Not already enrolled (composite unique check)
- Capacity not exceeded (if maxStudent set)

### Frontend Validation (Zod)
```typescript
enrollmentSchema = z.object({
  studentId: z.number().positive(),
  courseId: z.number().positive()
})
```

---

## Error Handling

| Scenario | Status | Code |
|----------|--------|------|
| Student not found | 404 | STUDENT_NOT_FOUND |
| Course not found | 404 | COURSE_NOT_FOUND |
| Course not active | 400 | COURSE_NOT_ACTIVE |
| Already enrolled | 409 | ENROLLMENT_EXISTS |
| Course capacity reached | 400 | COURSE_FULL |
| Student inactive | 403 | STUDENT_INACTIVE |
| Student too young | 400 | AGE_INELIGIBLE |

---

## Workflows

### Enrollment Creation Workflow

```
Student selects course
  ↓
POST /enrollments
  ↓
Backend validates:
  ✓ Course is ACTIVE
  ✓ Student not already enrolled
  ✓ Course has capacity
  ↓
Auto-check eligibility:
  ✓ Age calculation
  ✓ Entry level match
  ✓ Prerequisites check
  ↓
If all pass → status = APPROVED
Else → status = PENDING
  ↓
INSERT enrollment
  ↓
Return response with status & reasons
  ↓
Frontend shows success/pending message
```

### Admin Approval Workflow

```
Admin views pending enrollments
  ↓
Clicks APPROVE on enrollment
  ↓
PUT /enrollments/{id}/status (APPROVED)
  ↓
Backend updates enrollment.status
  ↓
Student notified (future: email)
  ↓
Frontend refreshes, removes from pending
```

---

## Testing

### Manual Tests
- [ ] Enroll with all eligibility checks passing
- [ ] Enroll with age failing
- [ ] Enroll with entry level failing
- [ ] Enroll with prerequisites failing
- [ ] Enroll twice in same course (error)
- [ ] View my enrollments
- [ ] View pending enrollments (admin)
- [ ] Approve pending enrollment
- [ ] Reject pending enrollment
- [ ] Withdraw from course
- [ ] Cannot enroll in PLANNING or COMPLETED courses

---

## Future Enhancements (Phase 2+)

- [ ] Waitlist management (queue when full)
- [ ] Automatic approval on eligibility (no pending)
- [ ] Auto-completion when course ends
- [ ] Payment before enrollment
- [ ] Specific prerequisite courses tracking
- [ ] Multi-level prerequisites
- [ ] Enrollment deadline enforcement
- [ ] Batch enrollment import

---

**End of Enrollment Feature Documentation**
