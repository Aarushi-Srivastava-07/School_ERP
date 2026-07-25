import apiClient from "./client";
import { API_ROUTES } from "./routes";

export interface DashboardReport {
  [key: string]: any;
}

/**
 * GET /api/reports/dashboard
 */
export const getDashboardReport = async () => {
  const response = await apiClient.get(API_ROUTES.report.dashboard);
  return response.data;
};

/**
 * GET /api/reports/attendance
 */
export const getAttendanceReport = async () => {
  const response = await apiClient.get(API_ROUTES.report.attendance);
  return response.data;
};

/**
 * GET /api/reports/student-performance/:id
 */
export const getStudentPerformance = async (id: string) => {
  const response = await apiClient.get(
    API_ROUTES.report.studentPerformance(id)
  );
  return response.data;
};

/**
 * GET /api/reports/results
 */
export const getResultReport = async () => {
  const response = await apiClient.get(API_ROUTES.report.results);
  return response.data;
};