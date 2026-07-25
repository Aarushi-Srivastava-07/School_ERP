# Notification Module

Backend Team note from cyber security lead:

Only admins and teachers can create and send notifications. Message bodies are rejected when they contain HTML or script tags, so notifications cannot become an XSS path.

## APIs

Mount this router in the main Express app:

```js
const { notificationRoutes } = require('./backend/notifications');

app.use('/api/notifications', authMiddleware, notificationRoutes);
```

The auth middleware should set `req.user` with at least:

```js
{
  id: 'user id',
  role: 'admin'
}
```

### Create Notification API

`POST /api/notifications`

```json
{
  "title": "Exam Reminder",
  "message": "Bring your hall ticket tomorrow.",
  "audience": {
    "roles": ["student"],
    "userIds": []
  }
}
```

### Send Notification API

Send an existing draft:

`POST /api/notifications/:id/send`

Create and send in one request:

`POST /api/notifications/send`

### Notification History

`GET /api/notifications/history`

Optional filters:

- `status=draft`
- `status=sent`
- `type=notification`
- `type=announcement`

### Student, Teacher, Parent Notifications

`GET /api/notifications/me`

This returns sent notifications for the logged in user's role. Supported audience roles are `student`, `teacher`, and `parent`.

### Announcement Management

Create an announcement:

`POST /api/notifications`

```json
{
  "title": "Holiday",
  "message": "School remains closed on Monday.",
  "type": "announcement",
  "audience": {
    "roles": ["student", "teacher", "parent"]
  }
}
```

Update a draft announcement:

`PATCH /api/notifications/announcements/:id`

Delete an announcement:

`DELETE /api/notifications/announcements/:id`
