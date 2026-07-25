# User Management Module

Backend Team — User Management APIs by Gaurav.

Only admins can create, update, or delete user accounts.
Every endpoint requires a valid JWT token in the `Authorization` header.

## Security

- **JWT Required**: All routes verify `Authorization: Bearer <token>` via the shared `auth` module before processing.
- **Role-Based Access Control (RBAC)**: Write operations (POST, PATCH, DELETE) require the `admin` role, enforced at both the route level (`authorizeRoles`) and the service level (`requireAdmin`).
- **Cross-Role Isolation**: `/api/students/:id` will never return or modify a teacher/parent record (and vice versa).
- **Input Sanitization**: Name fields reject special characters — only letters, spaces, hyphens, apostrophes, and periods allowed.
- **Response Sanitization**: Sensitive fields (`password`, `passwordHash`, `password_hash`, `token`, `failedLoginAttempts`, `accountLockedUntil`, etc.) are stripped from all API responses automatically.

## Dependencies

This module depends on the shared **`auth`** module (`backend/auth`) for:

- `authenticateToken` — JWT verification middleware
- `authorizeRoles` — Role-based access control middleware
- `ROLES` — Centralised role constants (`admin`, `teacher`, `student`, `parent`)
- `AUTH_MESSAGES` — Standardised error/success messages

## Setup

Requires the `auth` module's dependencies:

```bash
npm install jsonwebtoken bcryptjs express-validator
```

Set environment variables:

```bash
JWT_SECRET=secret-here
JWT_EXPIRES_IN=1h           # optional, defaults to 1h
BCRYPT_SALT_ROUNDS=10       # optional, defaults to 10
```

## APIs

Mount these routers in the main Express app:

```js
const {
  userRoutes,
  studentRoutes,
  teacherRoutes,
  parentRoutes,
} = require('./backend/user-management');

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
```

> **Note**: JWT auth and role middleware are already built into every route. No need to add middleware at mount time. But if you want to reuse them for other modules:
>
> ```js
> const { authenticateToken, authorizeRoles } = require('./backend/user-management');
> app.use('/api/other', authenticateToken, authorizeRoles('admin'), otherRoutes);
> ```

The JWT payload should contain at least:

```json
{
  "id": "user-uuid",
  "role": "admin",
  "email": "user@school.edu"
}
```

---

### Create User

`POST /api/users`  
**Requires**: `admin` role

```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@school.edu",
  "role": "student"
}
```

Valid roles: `admin`, `teacher`, `student`, `parent`.

**Validation rules:**
- `fullName`: Required, 2-100 chars, letters/spaces/hyphens/apostrophes/periods only
- `email`: Required, must be valid format, must be unique
- `role`: Required, must be one of the valid roles

### List Users

`GET /api/users`

Optional filters:

- `role=student`
- `role=teacher`
- `role=parent`
- `status=active`
- `status=inactive`

### Get User by ID

`GET /api/users/:id`

### Update User

`PATCH /api/users/:id`  
**Requires**: `admin` role

```json
{
  "fullName": "Rahul K. Sharma",
  "email": "rahul.sharma@school.edu"
}
```

### Delete User

`DELETE /api/users/:id`  
**Requires**: `admin` role

### Toggle Account Status

`PATCH /api/users/:id/status`  
**Requires**: `admin` role

Toggles between `active` and `inactive`. No request body needed.

---

## Role-Specific Endpoints

Convenience routes that scope all operations to a single role. The role is auto-set on creation, and cross-role access is blocked on read/update/delete.

### Students

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/api/students` | List all students | Any authenticated |
| GET | `/api/students/:id` | Get student by ID | Any authenticated |
| POST | `/api/students` | Create student (role auto-set) | `admin` |
| PATCH | `/api/students/:id` | Update student | `admin` |
| DELETE | `/api/students/:id` | Delete student | `admin` |

### Teachers

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/api/teachers` | List all teachers | Any authenticated |
| GET | `/api/teachers/:id` | Get teacher by ID | Any authenticated |
| POST | `/api/teachers` | Create teacher (role auto-set) | `admin` |
| PATCH | `/api/teachers/:id` | Update teacher | `admin` |
| DELETE | `/api/teachers/:id` | Delete teacher | `admin` |

### Parents

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/api/parents` | List all parents | Any authenticated |
| GET | `/api/parents/:id` | Get parent by ID | Any authenticated |
| POST | `/api/parents` | Create parent (role auto-set) | `admin` |
| PATCH | `/api/parents/:id` | Update parent | `admin` |
| DELETE | `/api/parents/:id` | Delete parent | `admin` |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Description of the error."
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error (bad input) |
| 401 | Missing or invalid JWT token |
| 403 | Insufficient permissions (not admin) |
| 404 | User not found |
| 409 | Email already exists |
| 500 | Unexpected server error |
