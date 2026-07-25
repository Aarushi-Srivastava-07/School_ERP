import apiClient from "./client";
import { API_ROUTES } from "./routes";

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  class?: string;
  [key: string]: any;
}

/**
 * GET /api/students
 */
export const getStudents = async () => {
  const response = await apiClient.get(API_ROUTES.student.list);
  return response.data;
};

/**
 * GET /api/students/:id
 */
export const getStudentById = async (id: string) => {
  const response = await apiClient.get(API_ROUTES.student.byId(id));
  return response.data;
};

/**
 * POST /api/students
 */
export const createStudent = async (studentData: any) => {
  const response = await apiClient.post(
    API_ROUTES.student.list,
    studentData
  );
  return response.data;
};

/**
 * PATCH /api/students/:id
 */
export const updateStudent = async (
  id: string,
  studentData: any
) => {
  const response = await apiClient.patch(
    API_ROUTES.student.byId(id),
    studentData
  );
  return response.data;
};

/**
 * DELETE /api/students/:id
 */
export const deleteStudent = async (id: string) => {
  const response = await apiClient.delete(
    API_ROUTES.student.byId(id)
  );
  return response.data;
};