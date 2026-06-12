# User & Role Management Feature

**Feature ID:** FEAT-002  
**Module:** User  
**Status:** ✅ Complete (MVP)  
**Last Updated:** June 12, 2026

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [User Stories](#user-stories)
3. [Technical Architecture](#technical-architecture)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [API Contracts](#api-contracts)
7. [Data Models](#data-models)
8. [Business Rules](#business-rules)
9. [Workflows](#workflows)
10. [Testing](#testing)

---

## Feature Overview

### Purpose
Manage system users, assign roles and permissions, and control access to features through role-based access control (RBAC).

### Key Capabilities
- Create, read, update, delete users (CRUD)
- Assign system roles (ADMIN, TEACHER, STUDENT, USER)
- Assign business roles (ADMIN, TEACHER, STUDENT, STAFF)
- Change user status (ACTIVE, INACTIVE, SUSPENDED)
- View user details and permissions
- List all users with filters and pagination
- Audit user changes (createdAt, updatedAt)

### Scope (Phase 1)
- ✅ User CRUD operations
- ✅ System role assignment
- ✅ Business role assignment
- ✅ User status management
- ✅ User listing with pagination
- ❌ Permission-level granularity (Phase 2)
- ❌ Role templates (Phase 2)
- ❌ Bulk user import (Phase 2)
- ❌ User audit trail (Phase 2)

### Success Criteria
- Admin can create users with role assignment
- Admin can list users with filters
- Admin can update user information
- Admin can change user status
- Admin can assign/remove roles
- Roles are enforced on API endpoints
- User permissions visible in UI

---

## User Stories

### US-1: Create User
**As an** Admin  
**I want to** create new user accounts  
**So that** teachers, students, and staff can access the system

**Acceptance Criteria:**
- User creation form validates all required fields
- Duplicate email/username prevented with 409 error
- User created with ACTIVE status by default
- Default role (STUDENT) assigned automatically
- Admin can select specific role at creation
- Created user receives success notification

**Implementation:** [Backend](#backend-implementation), [Frontend](#frontend-implementation)

---

### US-2: List & Filter Users
**As an** Admin  
**I want to** see all users with filtering and pagination  
**So that** I can manage the user base

**Acceptance Criteria:**
- List shows all users with pagination (10 per page)
- Filter by status (ACTIVE, INACTIVE, SUSPENDED)
- Filter by role (ADMIN, TEACHER, STUDENT)
- Search by username, email, fullName
- Sortable by created date, name, role
- Responsive table design

---

### US-3: Edit User
**As an** Admin  
**I want to** update user information  
**So that** I can keep records current

**Acceptance Criteria:**
- User edit form shows current values
- Can change email, fullName, phone
- Cannot change username (immutable)
- Cannot change password (use separate flow)
- Changes saved successfully
- Version conflict handled (optimistic/pessimistic locking)

---

### US-4: Change User Status
**As an** Admin  
**I want to** activate, deactivate, or suspend user accounts  
**So that** I can control access

**Acceptance Criteria:**
- Status dropdown shows options: ACTIVE, INACTIVE, SUSPENDED
- Status change saved immediately
- UI reflects status change
- User cannot login if INACTIVE or SUSPENDED
- Status change creates audit log

---

### US-5: Assign Roles
**As an** Admin  
**I want to** assign system roles to users  
**So that** users have appropriate permissions

**Acceptance Criteria:**
- Modal shows available roles
- Can assign multiple roles to single user
- Can remove roles
- Role assignment immediate (no save button)
- Prevents user from losing all roles

---

### US-6: Assign Business Role
**As an** Admin  
**I want to** assign organizational role (ADMIN, TEACHER, STUDENT)  
**So that** the system knows their primary responsibility

**Acceptance Criteria:**
- Business role selector available in user edit
- Only one business role at a time
- Changing business role updates available system roles
- Business role determines endpoint access

---

## Technical Architecture

### Component Hierarchy (Frontend)

```
AdminPage
├── UserListPage
│   ├── UserFilterBar
│   ├── UserTable
│   └── UserDetailModal
│       ├── UserFormFields
│       ├── RoleAssignment
│       └── StatusSelector
├── UserCreatePage
│   └── UserForm
│       ├── UserFormFields
│       ├── RoleSelector
│       └── BusinessRoleSelector
└── UserDetailPage
    ├── UserInfo
    └── UserEditForm
```

### Redux State Structure (Frontend)

```typescript
usersSlice {
  users: {
    id: number,
    username: string,
    email: string,
    fullName: string,
    phone: string,
    status: string,
    roles: string[],
    businessRole: string,
    createdAt: string,
    updatedAt: string
  }[],
  selectedUser: User | null,
  isLoading: boolean,
  error: string | null,
  pagination: {
    totalElements: number,
    totalPages: number,
    currentPage: number,
    pageSize: number
  },
  filters: {
    status: string | null,
    role: string | null,
    searchText: string | null,
    sortBy: string,
    sortDirection: string
  }
}
```

### Backend Layers

```
UserController
├── GET /users
├── GET /users/{id}
├── POST /users
├── PUT /users/{id}
├── PUT /users/{id}/status
├── POST /users/{id}/roles
├── DELETE /users/{id}/roles/{roleId}
├── POST /users/{id}/business-role
└── GET /roles, POST /roles
   + GET /business-roles, POST /business-roles

↓ calls ↓

UserService (interface)
├── getAllUsers(filters, pagination)
├── getUserById(id)
├── createUser(request)
├── updateUser(id, request)
├── changeUserStatus(id, status)
├── assignRole(userId, roleId)
├── removeRole(userId, roleId)
└── assignBusinessRole(userId, businessRoleId)

↓ uses ↓

UserRepository, RoleRepository, BusinessRoleRepository
```

---

## Backend Implementation

### Module Structure
```
backend/modules/user/
├── controller/
│   ├── UserController.java
│   ├── RoleController.java
│   └── BusinessRoleController.java
├── service/
│   ├── UserService.java
│   ├── RoleService.java
│   ├── BusinessRoleService.java
│   └── impl/
│       ├── UserServiceImpl.java
│       ├── RoleServiceImpl.java
│       └── BusinessRoleServiceImpl.java
├── dto/
│   ├── CreateUserRequest.java
│   ├── UpdateUserRequest.java
│   ├── UserResponse.java
│   ├── RoleResponse.java
│   ├── BusinessRoleResponse.java
│   └── AssignRoleRequest.java
├── mapper/
│   ├── UserMapper.java
│   └── RoleMapper.java
└── entity/
    ├── User.java
    ├── Role.java
    ├── BusinessRole.java
    ├── UserRole.java
    └── UserBusinessRole.java
```

### Controller Endpoints to Implement
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users` | List users (paginated, filtered) |
| GET | `/users/{id}` | Get user details |
| POST | `/users` | Create user (admin only) |
| PUT | `/users/{id}` | Update user info |
| PUT | `/users/{id}/status` | Change user status (admin) |
| POST | `/users/{id}/roles` | Assign role to user |
| DELETE | `/users/{id}/roles/{roleId}` | Remove role from user |
| POST | `/users/{id}/business-role` | Assign business role |
| GET | `/roles` | List all system roles |
| POST | `/roles` | Create role |
| GET | `/business-roles` | List business roles |
| POST | `/business-roles` | Create business role |

### Service Layer Requirements
| Method | Purpose |
|--------|---------|
| `getAllUsers(page, size, status, search)` | List users with pagination |
| `getUserById(id)` | Get single user |
| `createUser(request)` | Create new user |
| `updateUser(id, request)` | Update user info |
| `changeUserStatus(id, status)` | Change user status |
| `assignRole(userId, roleId)` | Assign system role |
| `removeRole(userId, roleId)` | Remove system role |
| `assignBusinessRole(userId, businessRoleId)` | Assign organizational role |

### Request/Response DTO Structure

**CreateUserRequest:**
- `username` (required, 3-50 chars, unique)
- `email` (required, valid email, unique)
- `fullName` (required)
- `phone` (optional)
- `businessRoleId` (required)
- `roleId` (required)

**UpdateUserRequest:**
- `email` (required, valid email)
- `fullName` (required)
- `phone` (optional)

**UserResponse:**
- `id` (number)
- `username` (string, immutable)
- `email` (string)
- `fullName` (string)
- `phone` (string)
- `status` (ACTIVE, INACTIVE, SUSPENDED)
- `roles` (array of role codes)
- `businessRole` (ADMIN, TEACHER, STUDENT, STAFF)
- `createdAt` (datetime)
- `updatedAt` (datetime)

### Error Scenarios
| Scenario | HTTP Status | Error Code |
|----------|------------|-----------|
| User not found | 404 | USER_NOT_FOUND |
| Username already exists | 409 | USERNAME_EXISTS |
| Email already exists | 409 | EMAIL_EXISTS |
| Role not found | 404 | ROLE_NOT_FOUND |
| Insufficient permissions | 403 | FORBIDDEN |
| User has no roles | 400 | NO_ROLES_ASSIGNED |

---

## Frontend Implementation

### Feature Structure
```
frontend/src/features/admin/
├── adminApi.ts          (API calls for users, roles)
├── adminSlice.ts        (Redux slice)
├── adminThunks.ts       (Async thunks)
├── types.ts             (TypeScript types)
├── pages/
│   ├── UserListPage.tsx
│   ├── UserCreatePage.tsx
│   └── UserDetailPage.tsx
└── components/
    ├── UserTable.tsx
    ├── UserForm.tsx
    ├── UserFilterBar.tsx
    ├── RoleSelector.tsx
    ├── StatusBadge.tsx
    └── UserModal.tsx
```

### Redux Thunks to Implement
| Thunk | Purpose |
|-------|---------|
| `fetchUsers(params)` | GET /users with pagination and filters |
| `createUser(data)` | POST /users |
| `updateUser(id, data)` | PUT /users/{id} |
| `changeUserStatus(id, status)` | PUT /users/{id}/status |
| `assignRole(userId, roleId)` | POST /users/{id}/roles |
| `removeRole(userId, roleId)` | DELETE /users/{id}/roles/{roleId} |
| `assignBusinessRole(userId, businessRoleId)` | POST /users/{id}/business-role |

### Pages to Implement
- **UserListPage.tsx** - List users with pagination, filters (status, search), action buttons
- **UserCreatePage.tsx** - Form to create new user with role/business role selection
- **UserDetailPage.tsx** - Show user details, edit form, role management

### Components to Implement
- **UserTable.tsx** - Display users in table format with Edit/Delete buttons
- **UserForm.tsx** - Reusable form for create/edit user
- **UserFilterBar.tsx** - Filter controls (status dropdown, search input)
- **RoleSelector.tsx** - Component to assign/remove roles
- **StatusBadge.tsx** - Display status with appropriate styling
- **UserModal.tsx** - Modal for user detail/edit view

### Form Validation (Use Zod)
**CreateUserForm:**
- username: 3-50 chars, required, check uniqueness
- email: valid format, required, check uniqueness
- fullName: required
- phone: optional
- businessRoleId: required
- roleId: required

**UpdateUserForm:**
- email: valid format, required
- fullName: required
- phone: optional

---

## API Contracts

### GET /users
**Query Parameters:**
```
GET /users?page=0&size=10&status=ACTIVE&search=john
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "username": "admin1",
        "email": "admin@center.com",
        "fullName": "Admin User",
        "phone": "0987654321",
        "status": "ACTIVE",
        "roles": ["ADMIN"],
        "businessRole": "ADMIN",
        "createdAt": "2026-06-01T10:00:00Z",
        "updatedAt": "2026-06-12T15:30:00Z"
      },
      {
        "id": 2,
        "username": "teacher1",
        "email": "teacher@center.com",
        "fullName": "John Teacher",
        "phone": "0912345678",
        "status": "ACTIVE",
        "roles": ["TEACHER"],
        "businessRole": "TEACHER",
        "createdAt": "2026-06-01T11:00:00Z",
        "updatedAt": "2026-06-10T09:15:00Z"
      }
    ],
    "totalElements": 2,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

---

### POST /users
**Request:**
```json
{
  "username": "newteacher",
  "email": "teacher@email.com",
  "fullName": "Jane Teacher",
  "phone": "0909090909",
  "businessRoleId": 2,
  "roleId": 3
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "username": "newteacher",
    "email": "teacher@email.com",
    "fullName": "Jane Teacher",
    "phone": "0909090909",
    "status": "ACTIVE",
    "roles": ["TEACHER"],
    "businessRole": "TEACHER",
    "createdAt": "2026-06-12T16:00:00Z",
    "updatedAt": "2026-06-12T16:00:00Z"
  }
}
```

---

### PUT /users/{id}
**Request:**
```json
{
  "email": "newemail@center.com",
  "fullName": "Updated Name",
  "phone": "0999999999"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "username": "newteacher",
    "email": "newemail@center.com",
    "fullName": "Updated Name",
    "phone": "0999999999",
    "status": "ACTIVE",
    "roles": ["TEACHER"],
    "businessRole": "TEACHER",
    "updatedAt": "2026-06-12T16:30:00Z"
  }
}
```

---

### PUT /users/{id}/status
**Request:**
```
PUT /users/10/status?status=SUSPENDED
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "SUSPENDED"
  }
}
```

---

### POST /users/{id}/roles
**Request:**
```json
{
  "roleId": 5
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": null
}
```

---

## Data Models

### User Entity
```
User {
  id: Long (PK)
  username: String (UK, immutable)
  password: String (hashed)
  email: String (UK)
  fullName: String
  phone: String
  status: UserStatus (ACTIVE, INACTIVE, SUSPENDED)
  createdAt: DateTime (auto)
  updatedAt: DateTime (auto)
}
```

### Role Entity
```
Role {
  id: Long (PK)
  code: Enum(ADMIN, TEACHER, STUDENT, USER) (UK)
  description: String
  businessRoleId: FK(BusinessRole)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### BusinessRole Entity
```
BusinessRole {
  id: Long (PK)
  code: Enum(ADMIN, TEACHER, STUDENT, STAFF) (UK)
  description: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

### UserRole Junction Table
```
UserRole {
  userId: FK(User) (PK1)
  roleId: FK(Role) (PK2)
  assignedAt: DateTime
}
```

### UserBusinessRole Junction Table
```
UserBusinessRole {
  userId: FK(User) (PK1)
  businessRoleId: FK(BusinessRole) (PK2)
  createdAt: DateTime
}
```

---

## Business Rules

### User Creation
- Username must be unique
- Email must be unique
- User created with ACTIVE status by default
- Cannot create user without business role
- Cannot create user without at least one system role

### User Status
- User can be: ACTIVE, INACTIVE, SUSPENDED
- Only ACTIVE users can login
- Inactive/Suspended users cannot access any endpoint
- Status can be changed by admin anytime

### Roles
- User can have 0 or more system roles
- User has exactly one business role
- Assigning business role overrides previous one (no history)
- Cannot remove all roles from user

### Immutable Fields
- Username cannot be changed after creation
- User ID never changes
- Role assignment date (createdAt) is permanent

---

## Workflows

### Create User Workflow
```
Admin fills form
  ↓
Validate input (frontend)
  ↓
POST /users
  ↓
Backend validates:
  ✓ Unique username
  ✓ Unique email
  ✓ Valid businessRoleId
  ✓ Valid roleId
  ↓
Create User entity
Create UserRole junction
Create UserBusinessRole junction
  ↓
Return UserResponse
  ↓
Redirect to user list
Show success toast
```

### Assign Role Workflow
```
Admin selects role from dropdown
  ↓
POST /users/{id}/roles
  ↓
Backend checks:
  ✓ User exists
  ✓ Role exists
  ✓ User doesn't already have role
  ↓
Insert UserRole junction record
  ↓
Return 201 Created
  ↓
Refresh user detail
Show role added in UI
```

---

## Testing

### Backend Unit Tests (Planned)
```
✅ CreateUserRequest validation
✅ UpdateUserRequest validation
✅ UserService.getAllUsers with filters
✅ UserService.createUser success
✅ UserService.createUser duplicate username error
✅ UserService.createUser duplicate email error
✅ UserService.updateUser success
✅ UserService.changeUserStatus success
✅ UserService.assignRole success
✅ UserService.assignRole duplicate error
```

### Frontend Integration Tests (Planned)
```
✅ UserListPage renders table
✅ UserTable displays users
✅ UserFilterBar filters by status
✅ UserForm validates required fields
✅ UserForm submits valid data
✅ Create user success
✅ Update user success
✅ Status change success
✅ Role assignment success
```

### Manual Testing Checklist
- [ ] Create user with all fields
- [ ] Create user with duplicate email (error)
- [ ] List users with pagination
- [ ] Filter users by status
- [ ] Edit user info
- [ ] Change user status
- [ ] Assign role to user
- [ ] Remove role from user
- [ ] Verify user cannot login if INACTIVE
- [ ] Verify only admin can access /users endpoint

---

**End of User Management Feature Documentation**
