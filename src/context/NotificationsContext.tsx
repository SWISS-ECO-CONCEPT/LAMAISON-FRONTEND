import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { NotificationData } from "../components/DashboardComponents/AppointmentComponents/NotificationAlarm";

type NotificationsContextValue = {
  notifications: NotificationData[];
  addNotification: (
    type: "rdv-request" | "rdv-response" | "message",
    title: string,
    message: string,
    rdvId?: number
  ) => string;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification: NotificationsContextValue["addNotification"] = useCallback(
    (type, title, message, rdvId) => {
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
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      dismissNotification,
      clearAllNotifications,
      markAsRead,
    }),
    [notifications, addNotification, dismissNotification, clearAllNotifications, markAsRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotificationsContext = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotificationsContext must be used within NotificationsProvider");
  }
  return ctx;
};
