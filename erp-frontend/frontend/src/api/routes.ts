
export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me"
  },
  student: {
    notifications: "/api/notifications/me",
    attendance: {
      mark: "/api/attendance/mark",
      update: "/api/attendance/update",
      view: "/api/attendance/view",
      classes: "/api/attendance/classes",
      students: "/api/attendance/students"
    },
    attendanceReports: {
      overview: "/student/attendance-reports/overview",
      subjects: "/student/attendance-reports/subjects",
      monthly: "/student/attendance-reports/monthly",
      insights: "/student/attendance-reports/insights",
      download: "/student/attendance-reports/download"
    },
    list: "/api/students",
    byId: (id: string) => `/api/students/${id}`,
  },

  teacher: {
    list: "/api/teachers",
    byId: (id: string) => `/api/teachers/${id}`,
  },

  parent: {
    list: "/api/parents",
    byId: (id: string) => `/api/parents/${id}`,
  },

  assignment: {
    list: "/api/assignments",
    byId: (id: string) => `/api/assignments/${id}`,
  },

  submission: {
    list: "/api/submissions",
    byId: (id: string) => `/api/submissions/${id}`,
  },

  exam: {
    list: "/api/exams",
    me: "/api/exams/me",
    byId: (id: string) => `/api/exams/${id}`,
  },

  report: {
    dashboard: "/api/reports/dashboard",
    attendance: "/api/reports/attendance",
    studentPerformance: (id: string) =>
      `/api/reports/student-performance/${id}`,
    results: "/api/reports/results",
  }
};
