
import apiClient from './client';
import { API_ROUTES } from './routes';

// Types for attendance data
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Holiday';
  classId?: string;
  markedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceSummary {
  overall: number;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface AttendanceCalendarData {
  year: number;
  month: number;
  days: Array<{
    day: number;
    status: 'present' | 'absent' | 'late' | 'holiday';
  }>;
}

export interface AttendanceTrendData {
  day: string;
  present: number;
  absent: number;
}

export interface MonthlyAttendanceData {
  month: string;
  percent: number;
}

export interface Class {
  id: string;
  name: string;
  section?: string;
  subject?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  classId: string;
}

export interface MarkAttendanceRequest {
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  classId?: string;
}

export interface UpdateAttendanceRequest {
  status: 'Present' | 'Absent' | 'Late';
}

/**
 * Helper to unwrap API response in standard format: { success: true, data: ... }
 */
const unwrapResponse = <T>(response: any): T => {
  if (response?.success && response?.data !== undefined) {
    return response.data;
  }
  return response;
};

/**
 * Mark attendance for a student
 * POST /api/attendance/mark
 */
export const markAttendance = async (data: MarkAttendanceRequest): Promise<AttendanceRecord> => {
  try {
    const response = await apiClient.post(API_ROUTES.student.attendance.mark, data);
    return unwrapResponse<AttendanceRecord>(response.data);
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

/**
 * Update attendance record
 * PUT /api/attendance/update/:id
 */
export const updateAttendance = async (id: string, data: UpdateAttendanceRequest): Promise<AttendanceRecord> => {
  try {
    const response = await apiClient.put(`${API_ROUTES.student.attendance.update}/${id}`, data);
    return unwrapResponse<AttendanceRecord>(response.data);
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

/**
 * View attendance records
 * GET /api/attendance/view
 */
export const viewAttendance = async (params?: {
  studentId?: string;
  classId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceRecord[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendance.view, { params });
    const data = unwrapResponse<AttendanceRecord[] | { records: AttendanceRecord[] }>(response.data);
    
    // Handle both direct array and wrapped response
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.records && Array.isArray(data.records)) {
      return data.records;
    }
    return [];
  } catch (error) {
    console.error('Error viewing attendance:', error);
    throw error;
  }
};

/**
 * Get attendance summary for current student
 * GET /api/attendance/view (with studentId from auth)
 */
export const getAttendanceSummary = async (): Promise<AttendanceSummary> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendance.view);
    const data = unwrapResponse<any>(response.data);
    
    // Handle different response formats
    if (data?.summary) {
      return data.summary;
    }
    if (data?.overall !== undefined) {
      return data;
    }
    // Default fallback
    return { overall: 0, present: 0, absent: 0, late: 0, total: 0 };
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    return { overall: 0, present: 0, absent: 0, late: 0, total: 0 };
  }
};

/**
 * Get attendance calendar data
 * GET /api/attendance/view (with date range)
 */
export const getAttendanceCalendar = async (
  year: number,
  month: number
): Promise<AttendanceCalendarData> => {
  try {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
    
    const response = await apiClient.get(API_ROUTES.student.attendance.view, {
      params: { startDate, endDate }
    });
    
    const records = unwrapResponse<AttendanceRecord[] | { records: AttendanceRecord[] }>(response.data);
    const attendanceRecords = Array.isArray(records) ? records : (records?.records || []);
    
    // Convert records to calendar format
    const days = attendanceRecords.map((record: AttendanceRecord) => ({
      day: new Date(record.date).getDate(),
      status: record.status.toLowerCase() as 'present' | 'absent' | 'late' | 'holiday'
    }));
    
    return { year, month, days };
  } catch (error) {
    console.error('Error fetching attendance calendar:', error);
    return { year, month, days: [] };
  }
};

/**
 * Get recent attendance records
 * GET /api/attendance/view (with limit)
 */
export const getRecentAttendance = async (limit: number = 10): Promise<AttendanceRecord[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendance.view, {
      params: { limit }
    });
    
    const data = unwrapResponse<AttendanceRecord[] | { records: AttendanceRecord[] }>(response.data);
    
    if (Array.isArray(data)) {
      return data.slice(0, limit);
    }
    if (data?.records && Array.isArray(data.records)) {
      return data.records.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching recent attendance:', error);
    return [];
  }
};

/**
 * Get attendance trend data
 * GET /api/attendance/view (with date range for trend)
 */
export const getAttendanceTrend = async (): Promise<AttendanceTrendData[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendance.view);
    const data = unwrapResponse<any>(response.data);
    
    if (data?.trend && Array.isArray(data.trend)) {
      return data.trend;
    }
    return [];
  } catch (error) {
    console.error('Error fetching attendance trend:', error);
    return [];
  }
};

/**
 * Get monthly attendance data
 * GET /api/attendance/view (with grouping by month)
 */
export const getMonthlyAttendance = async (): Promise<MonthlyAttendanceData[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendance.view);
    const data = unwrapResponse<any>(response.data);
    
    if (data?.monthly && Array.isArray(data.monthly)) {
      return data.monthly;
    }
    return [];
  } catch (error) {
    console.error('Error fetching monthly attendance:', error);
    return [];
  }
};

/**
 * Get available classes
 * GET /api/attendance/classes
 */
export const getClasses = async (): Promise<Class[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendance.classes);
    const data = unwrapResponse<Class[] | { classes: Class[] }>(response.data);
    
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.classes && Array.isArray(data.classes)) {
      return data.classes;
    }
    return [];
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

/**
 * Get students in a class
 * GET /api/attendance/students?classId=
 */
export const getStudents = async (classId: string): Promise<Student[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendance.students, {
      params: { classId }
    });
    const data = unwrapResponse<Student[] | { students: Student[] }>(response.data);
    
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.students && Array.isArray(data.students)) {
      return data.students;
    }
    return [];
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};
