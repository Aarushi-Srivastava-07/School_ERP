
import apiClient from './client';
import type { Notification } from "../notifications/types/notification";
import { API_ROUTES } from './routes';

/**
 * Helper function to unwrap API response and ensure we always return an array
 * API returns: { success: true, data: [...] }
 */
const unwrapResponse = (response: any): Notification[] => {
  // If response is already an array, return it
  if (Array.isArray(response)) {
    return response;
  }
  
  // If response is null or undefined, return empty array
  if (response === null || response === undefined) {
    return [];
  }
  
  // If response is wrapped in standard API format { success: true, data: [...] }
  if (typeof response === 'object') {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.notifications)) {
      return response.notifications;
    }
    if (Array.isArray(response.results)) {
      return response.results;
    }
  }
  
  // Fallback to empty array
  console.warn('API response is not in expected format:', response);
  return [];
};

/**
 * Fetch notifications for the logged-in user
 * GET /api/notifications/me
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.student.notifications);
    return unwrapResponse(response.data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Mark a notification as read
 * Note: This endpoint is not documented in the API spec, keeping for future use
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.put(`${API_ROUTES.student.notifications}/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * Note: This endpoint is not documented in the API spec, keeping for future use
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await apiClient.put(`${API_ROUTES.student.notifications}/read-all`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
