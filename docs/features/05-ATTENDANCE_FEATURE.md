# Attendance Tracking Feature

**Feature ID:** FEAT-005  
**Module:** Attendance  
**Status:** ❌ Not Started (Entity exists, no service/controller)  
**Last Updated:** June 12, 2026

---

## Overview

### Purpose
Track student attendance at course sessions for accountability, reporting, and course completion eligibility.

### Key Capabilities
- Mark student attendance (PRESENT, ABSENT, EXCUSED, LATE)
- Batch mark attendance for entire session
- View attendance records by student or session
- Attendance history and editing
- Attendance rate calculation (for course completion)
- Attendance summary reporting

### Scope (Phase 1)
- ✅ Attendance entity defined
- ❌ Attendance service (TODO)
- ❌ Attendance controller (TODO)
- ❌ Batch marking interface (Phase 1.5)
- ❌ Attendance reporting/analytics (Phase 2)
- ❌ Export attendance (Phase 2)

---

## User Stories

### US-1: Mark Session Attendance
**As a** Course instructor  
**I want to** mark attendance for students in a session  
**So that** we track participation

**Acceptance Criteria:**
- Attendance form shows all enrolled students
- Instructor can mark: PRESENT, ABSENT, EXCUSED, LATE
- Can add notes for absences
- Batch save all records
- Confirmation of save
- Only instructor/admin can mark

---

### US-2: View Student Attendance
**As a** Student  
**I want to** see my attendance records  
**So that** I know my attendance rate

**Acceptance Criteria:**
- Page lists all attended sessions
- Shows status for each session
- Shows attendance percentage
- Shows required attendance threshold (80%)
- Indicates if eligible for completion

---

### US-3: Attendance Reporting
**As a** Teacher or Admin  
**I want to** see attendance summary by course  
**So that** I can monitor student engagement

**Acceptance Criteria:**
- Summary shows: total sessions, present count, absent count
- Calculates attendance percentage per student
- Identifies students below 80% threshold
- Can export as CSV (Phase 2)

---

## Technical Architecture

### Entities

```
CourseSession (1) ──→ (N) Attendance
Student (1) ──→ (N) Attendance
```

### API Endpoints to Implement
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/attendance` | Batch mark attendance for session |
| GET | `/attendance` | List attendance records (filters) |
| PUT | `/attendance/{id}` | Update single attendance record |
| GET | `/sessions/{id}/attendance` | Attendance for session |
| GET | `/students/{id}/attendance` | Attendance for student |
| GET | `/courses/{id}/attendance` | Course attendance summary with percentages |

---

## Data Models

### Attendance Entity
```java
@Entity
public class Attendance extends BaseEntity {
  Long id;                          // PK
  CourseSession session;            // FK, not null
  Student student;                  // FK, not null
  String status;                    // PRESENT, ABSENT, EXCUSED, LATE
  String note;                      // Reason if absent/excused
  LocalDateTime createdAt;          // Audit
  LocalDateTime updatedAt;          // Audit
  
  // Composite unique: (session_id, student_id)
}
```

---

## Business Rules

### Attendance Status Meanings

| Status | Meaning | Counts for % | Note |
|--------|---------|-------------|------|
| PRESENT | Full session attended | YES | Normal attendance |
| ABSENT | Did not attend | NO | No valid reason |
| EXCUSED | Absent with valid reason | NO | Must have note |
| LATE | Arrived after start | YES | Still counts as attended |

### Recording Rules
- Only enrolled students have attendance records
- Only after session date can attendance be recorded
- Can edit up to 7 days after session
- Teacher or admin can mark/edit

### Completion Eligibility
- Student must have >= 80% PRESENT + LATE attendance
- EXCUSED and ABSENT do NOT count
- Calculated when course ends or requested

---

## API Contracts

### POST /attendance
**Request (Batch):**
```json
{
  "sessionId": 1,
  "records": [
    { "studentId": 10, "status": "PRESENT" },
    { "studentId": 11, "status": "ABSENT", "note": "Sick" },
    { "studentId": 12, "status": "EXCUSED", "note": "Doctor appointment" },
    { "studentId": 13, "status": "LATE" }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "recordsCreated": 4,
    "records": [
      {
        "id": 1,
        "studentId": 10,
        "status": "PRESENT",
        "createdAt": "2026-06-12T18:00:00Z"
      }
    ]
  }
}
```

---

### GET /courses/{id}/attendance
**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": 1,
    "courseName": "ENG101",
    "totalSessions": 10,
    "students": [
      {
        "studentId": 10,
        "studentName": "Jane Student",
        "presentCount": 9,
        "absentCount": 1,
        "excusedCount": 0,
        "lateCount": 0,
        "attendancePercentage": 90,
        "eligible": true
      }
    ]
  }
}
```

---

## Frontend Implementation

### Pages & Components

#### AttendanceMarkingPage (Teacher)
- Session selector
- Student list with radio buttons (PRESENT, ABSENT, EXCUSED, LATE)
- Notes textarea for absences
- Save button (batch insert)
- Success/error feedback

#### AttendanceViewPage (Student)
- My sessions listed
- Status badge for each (✓ PRESENT, ✗ ABSENT, ~ EXCUSED)
- Attendance percentage
- Progress bar (80% threshold marked)

#### CourseAttendanceSummaryPage (Teacher/Admin)
- Course name and dates
- Table: Student | Present | Absent | Excused | %
- Sort by attendance
- Export button (Phase 2)

---

## Validation

### Backend
- Session exists and date <= today
- Student enrolled in course
- Cannot edit after 7 days (configurable)
- Status is valid enum
- EXCUSED status requires note

### Frontend (Zod)
```typescript
attendanceRecordSchema = z.object({
  studentId: z.number().positive(),
  status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED', 'LATE']),
  note: z.string().optional()
}).refine(
  data => !(data.status === 'EXCUSED' && !data.note),
  "Excused status requires a note"
)
```

---

## Workflows

### Attendance Marking Workflow

```
Teacher opens session
  ↓
System loads enrolled students
  ↓
Teacher marks each student: P/A/E/L
  ↓
Teacher clicks Save
  ↓
POST /attendance (batch)
  ↓
Backend validates:
  ✓ Session exists, date <= today
  ✓ Student enrolled in course
  ✓ Composite unique not violated
  ↓
INSERT attendance records
  ↓
Return 201 + record count
  ↓
Show "Marked for 15 students"
```

### View Attendance Workflow

```
Student clicks Attendance
  ↓
GET /students/{id}/attendance
  ↓
Backend calculates:
  ✓ Present + Late count
  ✓ Percentage = (present + late) / total
  ↓
Return with status badges
  ↓
Show table with percentages
```

---

## Configuration

```yaml
attendance:
  completionThreshold: 0.80      # 80% required
  editableWithinDays: 7           # Can edit 7 days after
  countAsPresent: [PRESENT, LATE] # For percentage calculation
```

---

## Testing

### Manual Tests
- [ ] Mark attendance for session
- [ ] Mark some ABSENT, some EXCUSED
- [ ] Add note for EXCUSED
- [ ] Verify batch save
- [ ] View student attendance
- [ ] Check attendance percentage
- [ ] View course attendance summary
- [ ] Cannot mark future sessions
- [ ] Cannot edit after 7 days

---

## Backend TODO (Phase 1)

- [ ] Create AttendanceService interface
- [ ] Implement AttendanceServiceImpl
  - markAttendance(sessionId, records)
  - getStudentAttendance(studentId)
  - getSessionAttendance(sessionId)
  - getCourseAttendanceSummary(courseId)
  - getAttendancePercentage(studentId, courseId)
- [ ] Create AttendanceController
- [ ] Write DTOs: MarkAttendanceRequest, AttendanceResponse, AttendanceSummaryResponse
- [ ] Create AttendanceRepository
  - findBySessionAndStudent(sessionId, studentId)
  - findByStudent(studentId)
  - findBySession(sessionId)
- [ ] Add validation rules
- [ ] Add error handling

---

## Frontend TODO (Phase 1.5)

- [ ] Create attendanceApi.ts
- [ ] Create attendanceSlice.ts & thunks
- [ ] Create AttendanceMarkingPage
- [ ] Create AttendanceViewPage
- [ ] Create CourseAttendanceSummaryPage
- [ ] Add Redux integration

---

## Future Enhancements (Phase 2+)

- [ ] Attendance patterns (habitual absence alert)
- [ ] Auto-generate excuses (calendar integration)
- [ ] Attendance export (CSV, Excel, PDF)
- [ ] Attendance trends/analytics
- [ ] Mobile attendance marking (QR code)
- [ ] Real-time attendance notifications
- [ ] Classroom integration (auto-mark via device)

---

**End of Attendance Feature Documentation**
