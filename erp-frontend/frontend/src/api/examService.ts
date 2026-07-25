import apiClient from "./client";
import { API_ROUTES } from "./routes";

export interface Exam {
  id: string;
  title: string;
  subject?: string;
  examDate?: string;
  [key: string]: any;
}

/**
 * GET /api/exams
 */
export const getExams = async () => {
  const response = await apiClient.get(API_ROUTES.exam.list);
  return response.data;
};

/**
 * GET /api/exams/:id
 */
export const getExamById = async (id: string) => {
  const response = await apiClient.get(API_ROUTES.exam.byId(id));
  return response.data;
};

/**
 * POST /api/exams
 */
export const createExam = async (examData: any) => {
  const response = await apiClient.post(
    API_ROUTES.exam.list,
    examData
  );
  return response.data;
};

/**
 * PUT /api/exams/:id
 */
export const updateExam = async (
  id: string,
  examData: any
) => {
  const response = await apiClient.put(
    API_ROUTES.exam.byId(id),
    examData
  );
  return response.data;
};

/**
 * DELETE /api/exams/:id
 */
export const deleteExam = async (id: string) => {
  const response = await apiClient.delete(
    API_ROUTES.exam.byId(id)
  );
  return response.data;
};