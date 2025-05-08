import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType = "success" | "error" | "info" | "warning";
export type SystemAlertLevel = "low" | "medium" | "high" | "critical";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
  priority: SystemAlertLevel;
  source: string;
}

interface NotificationsState {
  notifications: SystemNotification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<SystemNotification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

export const useNotifications = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => {
        const newNotification: SystemNotification = {
          ...notification,
          id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: Date.now(),
          read: false
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // Limit to 100 notifications
          unreadCount: state.unreadCount + 1
        }));
      },
      
      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification => {
            if (notification.id === id && !notification.read) {
              return { ...notification, read: true };
            }
            return notification;
          });
          
          // Count how many notifications were marked as read
          const markedAsRead = state.notifications.filter(n => n.id === id && !n.read).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount: state.unreadCount - markedAsRead
          };
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notification => ({ ...notification, read: true })),
          unreadCount: 0
        }));
      },
      
      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0
        });
      },
      
      removeNotification: (id) => {
        set((state) => {
          const notificationToRemove = state.notifications.find(n => n.id === id);
          const unreadAdjustment = notificationToRemove && !notificationToRemove.read ? 1 : 0;
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: state.unreadCount - unreadAdjustment
          };
        });
      }
    }),
    {
      name: 'nexusforge-notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount
      }),
    }
  )
);