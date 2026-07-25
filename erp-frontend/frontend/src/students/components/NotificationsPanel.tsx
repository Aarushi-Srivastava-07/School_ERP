import { useEffect, useState } from "react";
import { getNotifications } from "../../api";
import type { Notification } from "../../notifications/types/notification";
import { formatDistanceToNow } from "date-fns";

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNotifications();
        
        // Ensure data is always an array before using slice
        const safeData = Array.isArray(data) ? data : [];
        setNotifications(safeData.slice(0, 4)); // Show only first 4 notifications
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error fetching notifications:', err);
        setNotifications([]); // Ensure notifications is always an array on error
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return "⏰";
      case "exam": return "📚";
      case "attendance": return "⚠️";
      case "announcement": return "📢";
      default: return "🔔";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
        <div className="text-center py-8 text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
        <div className="text-center py-8 text-gray-500">No notifications to display</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((note) => (
          <div key={note.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div className="text-2xl mt-1">{getIcon(note.type)}</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                {note.title}
                {!note.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{note.message}</p>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;
