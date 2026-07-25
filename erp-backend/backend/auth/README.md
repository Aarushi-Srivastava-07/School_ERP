Authentication & RBAC Module

Backend Team — Authentication & Role-Based Access Control (RBAC)

This module is responsible for authenticating users, securing protected APIs using JWT, hashing passwords using bcrypt, and enforcing role-based access control across the School ERP backend.

Security

JWT Authentication:Protected routes require `Authorization: Bearer <token>`.
Password Hashing: Passwords are securely hashed using bcrypt before storage.
Role-Based Access Control (RBAC): Access is restricted based on user roles.
Request Validation: Login requests and authorization headers are validated before processing.
Token Validation: Invalid, expired, or missing JWT tokens are rejected.
Account Protection: Supports failed login tracking and temporary account locking based on project requirements.
Production Security: Authentication APIs should only be accessed over HTTPS in production.



 APIs

Mount the authentication router in the main Express application:

```js
const { authRouter } = require("./backend/auth");

app.use("/api/auth", authRouter);
```



Login

`POST /api/auth/login`

Request Body

```json
{
  "email": "admin@school.edu",
  "password": "password123"
}
```



 Logout

`POST /api/auth/logout`

Headers

```http
Authorization: Bearer <JWT_TOKEN>
```



 Current User

Returns the currently authenticated user's information.

`GET /api/auth/me`

Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

Authentication

All protected APIs require a valid JWT Bearer Token.

Example:

```http
Authorization: Bearer <JWT_TOKEN>
```

JWT Payload

```json
{
  "id": "user-uuid",
  "email": "user@school.edu",
  "role": "admin"
}
```

 Supported Roles

 Admin
 Teacher
 Student
 Parent

Middleware

Authentication Middleware

Verifies:

 JWT Token
 Token Expiry
 Token Validity

Attaches the authenticated user to:

```javascript
req.user
```

Example:

```json
{
  "id": "user-uuid",
  "email": "user@school.edu",
  "role": "admin"
}
```

 Role-Based Authorization Middleware

Restricts access based on user roles.

Example:

```javascript
authorizeRoles("admin")
```

or

```javascript
authorizeRoles("admin", "teacher")
```

 Password Security

 Passwords are hashed using bcrypt.
 Plain text passwords are never stored.
 Password verification is performed using bcrypt comparison.
 Password hashes are never returned in API responses.

 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Description of the error."
}
```

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| 400    | Validation error                        |
| 401    | Missing or invalid authentication token |
| 403    | Insufficient permissions                |
| 500    | Unexpected server error                 |

---

 Current Status

 Completed

 Authentication configuration
 Authentication constants
 Role definitions
 JWT utility
 Password hashing utility
 Authentication request validation
 JWT authentication middleware
 Role-Based Access Control (RBAC) middleware
 Authentication routes
 Authentication controller structure


