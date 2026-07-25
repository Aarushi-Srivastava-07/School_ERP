const users = [
  {
    email: "admin@erp.com",
    password: "admin123",
    role: "admin",
  },
  {
    email: "teacher@erp.com",
    password: "teacher123",
    role: "teacher",
  },
  {
    email: "student@erp.com",
    password: "student123",
    role: "student",
  },
  {
    email: "parent@erp.com",
    password: "parent123",
    role: "parent",
  },
];

export function authenticate(email, password, role) {
  const user = users.find(
    (u) =>
      u.email === email &&
      u.password === password &&
      u.role === role
  );

  return user;
}