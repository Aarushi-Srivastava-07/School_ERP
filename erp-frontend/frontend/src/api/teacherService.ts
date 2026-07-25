import apiClient from "./client";
import { API_ROUTES } from "./routes";

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

export const getParents = async () => {
  const response = await apiClient.get(API_ROUTES.parent.list);
  return response.data;
};

export const getParentById = async (id: string) => {
  const response = await apiClient.get(API_ROUTES.parent.byId(id));
  return response.data;
};

export const createParent = async (parentData: any) => {
  const response = await apiClient.post(
    API_ROUTES.parent.list,
    parentData
  );
  return response.data;
};

export const updateParent = async (
  id: string,
  parentData: any
) => {
  const response = await apiClient.put(
    API_ROUTES.parent.byId(id),
    parentData
  );
  return response.data;
};

export const deleteParent = async (id: string) => {
  const response = await apiClient.delete(
    API_ROUTES.parent.byId(id)
  );
  return response.data;
};