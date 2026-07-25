// src/notifications/components/NotificationCard.tsx

import React from "react";
import { FaRegBell, FaRegCalendarAlt, FaRegFileAlt, FaRegCheckCircle } from "react-icons/fa";
import type { Notification } from "../types/notification";
import { formatDistanceToNow } from "date-fns";

interface Props {
  notification: Notification;
}

const typeIconMap: Record<Notification["type"], React.JSX.Element> = {
  assignment: <FaRegFileAlt className="text-blue-500" size={20} />, // assignment icon
  exam: <FaRegCalendarAlt className="text-red-500" size={20} />, // exam icon
  attendance: <FaRegCheckCircle className="text-green-500" size={20} />, // attendance icon
  announcement: <FaRegBell className="text-yellow-500" size={20} />, // announcement icon
};

export const NotificationCard: React.FC<Props> = ({ notification }) => {
  const { title, message, type, read, createdAt } = notification;
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div
      className={`flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${read ? "bg-gray-50" : "bg-white"}`}
    >
      <div className="mr-4 mt-1">{typeIconMap[type]}</div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{message}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{timeAgo}</span>
          {!read && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">New</span>}
        </div>
      </div>
    </div>
  );
};
