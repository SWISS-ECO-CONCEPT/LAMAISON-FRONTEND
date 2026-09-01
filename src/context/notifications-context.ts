import { createContext } from "react";
import type { NotificationData } from "../components/DashboardComponents/AppointmentComponents/NotificationAlarm";

export type NotificationsContextValue = {
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

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const STORAGE_KEY = "lamaison_notifications";
const MAX_STORED = 50;

export function loadStoredNotifications(): NotificationData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NotificationData[];
    return parsed.map((n) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch {
    return [];
  }
}

export function persistNotifications(notifications: NotificationData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)));
  } catch {
    // ignore storage errors
  }
}
