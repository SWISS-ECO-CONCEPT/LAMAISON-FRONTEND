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

// Clé localStorage — propre à ce navigateur/appareil, pas partagée entre appareils.
const STORAGE_KEY = "lamaison_notifications";
// Nombre max conservé, pour ne pas faire grossir le localStorage indéfiniment.
const MAX_STORED = 50;

// Relit le localStorage au tout premier rendu. Le JSON ne conserve pas les
// objets Date (ils redeviennent des chaînes de texte) — on les reconvertit
// explicitement, sinon l'affichage de l'heure planterait.
function loadStoredNotifications(): NotificationData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NotificationData[];
    return parsed.map((n) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch {
    // localStorage indisponible (navigation privée stricte) ou données
    // corrompues : on démarre simplement avec une liste vide.
    return [];
  }
}

function persistNotifications(notifications: NotificationData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)));
  } catch {
    // Pas grave si l'écriture échoue (quota dépassé, navigation privée) —
    // les notifications restent utilisables en mémoire pour la session en cours.
  }
}

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

export const useNotificationsContext = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotificationsContext must be used within NotificationsProvider");
  }
  return ctx;
};
