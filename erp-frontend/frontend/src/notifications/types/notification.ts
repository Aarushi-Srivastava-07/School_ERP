// src/notifications/types/notification.ts

export type NotificationType = "assignment" | "exam" | "attendance" | "announcement";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string; // ISO format
}
