import apiClient from '../../services/apiClient';
import type { Notification } from "../types/notification";

// API endpoint
const NOTIFICATIONS_ENDPOINT = '/student/notifications';

/**
 * Helper function to ensure we always return an array
 */
const ensureArray = (data: any): Notification[] => {
  // If data is already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // If data is null or undefined, return empty array
  if (data === null || data === undefined) {
    return [];
  }
  
  // If data is wrapped in an object (e.g., { data: [...] } or { notifications: [...] })
  if (typeof data === 'object') {
    if (Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data.notifications)) {
      return data.notifications;
    }
    if (Array.isArray(data.results)) {
      return data.results;
    }
  }
  
  // Fallback to empty array
  console.warn('API response is not an array:', data);
  return [];
};

/**
 * Fetch notifications for the current student
 * GET /student/notifications
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get(NOTIFICATIONS_ENDPOINT);
    return ensureArray(response.data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Mark a notification as read
 * PUT /student/notifications/:id/read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.put(`${NOTIFICATIONS_ENDPOINT}/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * PUT /student/notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await apiClient.put(`${NOTIFICATIONS_ENDPOINT}/read-all`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
