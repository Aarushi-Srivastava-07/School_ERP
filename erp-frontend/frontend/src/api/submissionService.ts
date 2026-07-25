import apiClient from "./client";
import { API_ROUTES } from "./routes";

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status?: string;
  submittedAt?: string;
  [key: string]: any;
}

export const getSubmissions = async () => {
  const response = await apiClient.get(API_ROUTES.submission.list);
  return response.data;
};

export const getSubmissionById = async (id: string) => {
  const response = await apiClient.get(API_ROUTES.submission.byId(id));
  return response.data;
};

export const createSubmission = async (submissionData: any) => {
  const response = await apiClient.post(
    API_ROUTES.submission.list,
    submissionData
  );
  return response.data;
};

export const updateSubmission = async (
  id: string,
  submissionData: any
) => {
  const response = await apiClient.put(
    API_ROUTES.submission.byId(id),
    submissionData
  );
  return response.data;
};

export const deleteSubmission = async (id: string) => {
  const response = await apiClient.delete(
    API_ROUTES.submission.byId(id)
  );
  return response.data;
};