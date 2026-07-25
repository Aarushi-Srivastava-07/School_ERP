import apiClient from '../../services/apiClient';

// Types for attendance data
export interface AttendanceSummary {
  overall: number;
  present: number;
  absent: number;
  late: number;
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Holiday';
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

// API endpoints
const ATTENDANCE_ENDPOINTS = {
  SUMMARY: '/student/attendance/summary',
  CALENDAR: '/student/attendance/calendar',
  RECENT: '/student/attendance/recent',
  TREND: '/student/attendance/trend',
  MONTHLY: '/student/attendance/monthly',
};

/**
 * Fetch attendance summary for the current student
 * GET /student/attendance/summary
 */
export const getAttendanceSummary = async (): Promise<AttendanceSummary> => {
  try {
    const response = await apiClient.get(ATTENDANCE_ENDPOINTS.SUMMARY);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    throw error;
  }
};

/**
 * Fetch attendance calendar data for a specific month
 * GET /student/attendance/calendar?year=2026&month=6
 */
export const getAttendanceCalendar = async (
  year: number,
  month: number
): Promise<AttendanceCalendarData> => {
  try {
    const response = await apiClient.get(ATTENDANCE_ENDPOINTS.CALENDAR, {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance calendar:', error);
    throw error;
  }
};

/**
 * Fetch recent attendance records
 * GET /student/attendance/recent?limit=10
 */
export const getRecentAttendance = async (limit: number = 10): Promise<AttendanceRecord[]> => {
  try {
    const response = await apiClient.get(ATTENDANCE_ENDPOINTS.RECENT, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent attendance:', error);
    throw error;
  }
};

/**
 * Fetch attendance trend data (weekly)
 * GET /student/attendance/trend
 */
export const getAttendanceTrend = async (): Promise<AttendanceTrendData[]> => {
  try {
    const response = await apiClient.get(ATTENDANCE_ENDPOINTS.TREND);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance trend:', error);
    throw error;
  }
};

/**
 * Fetch monthly attendance data
 * GET /student/attendance/monthly
 */
export const getMonthlyAttendance = async (): Promise<MonthlyAttendanceData[]> => {
  try {
    const response = await apiClient.get(ATTENDANCE_ENDPOINTS.MONTHLY);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly attendance:', error);
    throw error;
  }
};
