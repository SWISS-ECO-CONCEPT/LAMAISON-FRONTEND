import React, { useCallback, useMemo, useState } from "react";
import type { NotificationData } from "../components/DashboardComponents/AppointmentComponents/NotificationAlarm";
import {
  NotificationsContext,
  type NotificationsContextValue,
  loadStoredNotifications,
  persistNotifications,
} from "./notifications-context";

export const NotificationsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>(loadStoredNotifications);

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
      setNotifications((prev) => {
        const next = [newNotification, ...prev];
        persistNotifications(next);
        return next;
      });
      return id;
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      persistNotifications(next);
      return next;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    persistNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      persistNotifications(next);
      return next;
    });
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
