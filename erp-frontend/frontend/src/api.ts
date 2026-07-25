import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || (import.meta.env.DEV ? 'dev-mock-token' : null);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface AttendanceRecord {
  id?: string | number;
  studentId?: string;
  date?: string;
  status?: 'present' | 'absent' | 'late' | 'holiday';
  present?: boolean;
  remarks?: string;
  [key: string]: unknown;
}

export const getNotifications = () => api.get('/notifications');
export const getAttendanceCalendar = (year?: number, month?: number) =>
  api.get('/attendance/calendar', { params: { year, month } });
export const getAttendanceSummary = () => api.get('/attendance/summary');
export const getRecentAttendance = (limit = 10) =>
  api.get('/attendance/recent', { params: { limit } });
export const getAttendanceTrend = () => api.get('/attendance/trend');
export const getAttendanceOverview = () => api.get('/attendance/overview');
export const getSubjectAttendance = () => api.get('/attendance/subjects');
export const getMonthlyAttendanceReport = () => api.get('/attendance/monthly');
export const getAttendanceInsights = () => api.get('/attendance/insights');
export const downloadAttendanceReport = (format: 'pdf' | 'excel' = 'pdf') =>
  api.get('/attendance/download', {
    params: { format },
    responseType: 'blob',
  });

export default api;
