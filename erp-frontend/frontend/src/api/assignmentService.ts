import apiClient from "./client";
import { API_ROUTES } from "./routes";

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  [key: string]: any;
}

/**
 * GET /api/assignments
 */
export const getAssignments = async () => {
  const response = await apiClient.get(API_ROUTES.assignment.list);
  return response.data;
};

/**
 * GET /api/assignments/:id
 */
export const getAssignmentById = async (id: string) => {
  const response = await apiClient.get(API_ROUTES.assignment.byId(id));
  return response.data;
};

/**
 * POST /api/assignments
 */
export const createAssignment = async (assignmentData: any) => {
  const response = await apiClient.post(
    API_ROUTES.assignment.list,
    assignmentData
  );
  return response.data;
};

/**
 * PUT /api/assignments/:id
 */
export const updateAssignment = async (
  id: string,
  assignmentData: any
) => {
  const response = await apiClient.put(
    API_ROUTES.assignment.byId(id),
    assignmentData
  );
  return response.data;
};

/**
 * DELETE /api/assignments/:id
 */
export const deleteAssignment = async (id: string) => {
  const response = await apiClient.delete(
    API_ROUTES.assignment.byId(id)
  );
  return response.data;
};