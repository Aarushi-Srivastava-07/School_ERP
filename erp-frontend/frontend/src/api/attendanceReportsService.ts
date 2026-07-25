
import apiClient from './client';
import { API_ROUTES } from './routes';

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

/**
 * Helper to check if response is valid JSON (not HTML)
 */
const isValidResponse = (data: any): boolean => {
  if (data === null || data === undefined) return false;
  if (typeof data !== 'object') return false;
  // Check if it's likely HTML (contains <html or <body tags)
  if (typeof data === 'string' && (data.includes('<html') || data.includes('<body'))) return false;
  return true;
};

export const getAttendanceOverview = async (): Promise<AttendanceOverview> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendanceReports.overview);
    if (!isValidResponse(response.data)) {
      console.warn('Invalid response from attendance overview API, returning default');
      return { overall: 0, present: 0, absent: 0, late: 0 };
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance overview:', error);
    return { overall: 0, present: 0, absent: 0, late: 0 };
  }
};

export const getSubjectAttendance = async (): Promise<SubjectAttendance[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendanceReports.subjects);
    if (!isValidResponse(response.data)) {
      console.warn('Invalid response from subject attendance API, returning empty array');
      return [];
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Handle wrapped response
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching subject attendance:', error);
    return [];
  }
};

export const getMonthlyAttendanceReport = async (): Promise<MonthlyAttendanceReport[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendanceReports.monthly);
    if (!isValidResponse(response.data)) {
      console.warn('Invalid response from monthly attendance report API, returning empty array');
      return [];
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Handle wrapped response
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching monthly attendance report:', error);
    return [];
  }
};

export const getAttendanceInsights = async (): Promise<AttendanceInsight[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendanceReports.insights);
    if (!isValidResponse(response.data)) {
      console.warn('Invalid response from attendance insights API, returning empty array');
      return [];
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Handle wrapped response
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching attendance insights:', error);
    return [];
  }
};

export const downloadAttendanceReport = async (format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.attendanceReports.download, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading attendance report:', error);
    throw error;
  }
};
