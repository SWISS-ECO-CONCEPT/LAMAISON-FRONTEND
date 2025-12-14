import { useState, useCallback } from "react";
import type { NotificationData } from "../components/DashboardComponents/AppointmentComponents/NotificationAlarm";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback(
    (
      type: "rdv-request" | "rdv-response" | "message",
      title: string,
      message: string,
      rdvId?: number
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newNotification: NotificationData = {
        id,
        type,
        title,
        message,
        isRead: false,
        timestamp: new Date(),
        rdvId,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      return id;
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    markAsRead,
  };
};
