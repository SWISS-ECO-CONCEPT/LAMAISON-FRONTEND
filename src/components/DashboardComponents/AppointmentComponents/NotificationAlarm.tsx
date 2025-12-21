import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNotificationSound } from "../../../hooks/useNotificationSound";

export interface NotificationData {
  id: string;
  type: "rdv-request" | "rdv-response" | "message";
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  rdvId?: number;
  prospectName?: string;
  agentName?: string;
}

interface NotificationAlarmProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
  onClear: () => void;
}

const NotificationAlarm: React.FC<NotificationAlarmProps> = ({
  notifications,
  onDismiss,
  onClear,
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  // const { playSound } = useNotificationSound();

  // useEffect(() => {
  //   if (unreadCount > 0) {
  //     playSound();
  //   }
  // }, [unreadCount, playSound]);

  const getNotificationColor = (type: string) => {
    if (type === "rdv-request") return "border-blue-500 bg-blue-50";
    if (type === "rdv-response") return "border-green-500 bg-green-50";
    if (type === "message") return "border-purple-500 bg-purple-50";
    return "border-gray-500 bg-gray-50";
  };

  const getNotificationIcon = (type: string) => {
    if (type === "rdv-request") return "📅";
    if (type === "rdv-response") return "✅";
    if (type === "message") return "💬";
    return "🔔";
  };

  return (
    <div className="">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative p-3 rounded-full transition ${
          unreadCount > 0
            ? "bg-red-500 text-white animate-pulse shadow-lg"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute top-16 right-0 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold text-lg"> Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="hover:bg-white/20 p-1 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 ${getNotificationColor(
                    notification.type
                  )} p-3 border-b hover:bg-opacity-75 transition cursor-pointer`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onDismiss(notification.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t p-2 bg-gray-50">
              <button
                onClick={onClear}
                className="w-full text-xs text-blue-600 hover:text-blue-800 font-semibold p-2"
              >
                Effacer tout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationAlarm;
