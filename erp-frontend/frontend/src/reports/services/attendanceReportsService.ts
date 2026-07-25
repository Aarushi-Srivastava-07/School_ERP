import apiClient from '../../services/apiClient';

// Types for attendance reports data
export interface AttendanceOverview {
  overall: number;
  present: number;
  absent: number;
  late: number;
}

export interface SubjectAttendance {
  name: string;
  present: number;
  absent: number;
  percentage: number;
}

export interface MonthlyAttendanceReport {
  month: string;
  present: number;
  absent: number;
  percentage: number;
}

export interface AttendanceInsight {
  icon: string;
  title: string;
  description: string;
}

// API endpoints
const ATTENDANCE_REPORTS_ENDPOINTS = {
  OVERVIEW: '/student/attendance-reports/overview',
  SUBJECTS: '/student/attendance-reports/subjects',
  MONTHLY: '/student/attendance-reports/monthly',
  INSIGHTS: '/student/attendance-reports/insights',
  DOWNLOAD: '/student/attendance-reports/download',
};

/**
 * Fetch attendance overview for reports
 * GET /student/attendance-reports/overview
 */
export const getAttendanceOverview = async (): Promise<AttendanceOverview> => {
  try {
    const response = await apiClient.get(ATTENDANCE_REPORTS_ENDPOINTS.OVERVIEW);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance overview:', error);
    throw error;
  }
};

/**
 * Fetch subject-wise attendance
 * GET /student/attendance-reports/subjects
 */
export const getSubjectAttendance = async (): Promise<SubjectAttendance[]> => {
  try {
    const response = await apiClient.get(ATTENDANCE_REPORTS_ENDPOINTS.SUBJECTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching subject attendance:', error);
    throw error;
  }
};

/**
 * Fetch monthly attendance summary
 * GET /student/attendance-reports/monthly
 */
export const getMonthlyAttendanceReport = async (): Promise<MonthlyAttendanceReport[]> => {
  try {
    const response = await apiClient.get(ATTENDANCE_REPORTS_ENDPOINTS.MONTHLY);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly attendance report:', error);
    throw error;
  }
};

/**
 * Fetch attendance insights
 * GET /student/attendance-reports/insights
 */
export const getAttendanceInsights = async (): Promise<AttendanceInsight[]> => {
  try {
    const response = await apiClient.get(ATTENDANCE_REPORTS_ENDPOINTS.INSIGHTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance insights:', error);
    throw error;
  }
};

/**
 * Download attendance report
 * GET /student/attendance-reports/download?format=pdf
 */
export const downloadAttendanceReport = async (format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> => {
  try {
    const response = await apiClient.get(ATTENDANCE_REPORTS_ENDPOINTS.DOWNLOAD, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading attendance report:', error);
    throw error;
  }
};
