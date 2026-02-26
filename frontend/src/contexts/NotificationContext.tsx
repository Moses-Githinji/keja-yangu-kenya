import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { chatApi } from '@/api/chat';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  chatUnreadCount: number;
  totalUnreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    await notificationService.loadNotifications();
    
    // Also fetch chat unread count
    try {
      const chatRes = await chatApi.getUnreadCount();
      if (chatRes.data.status === 'success') {
        setChatUnreadCount(chatRes.data.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch chat unread count:", err);
    }
    
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setChatUnreadCount(0);
      return;
    }

    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCountValue());
    });

    refreshNotifications();

    return unsubscribe;
  }, [isAuthenticated, refreshNotifications]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      notificationService.loadNotifications();
    };

    const handleNewMessage = () => {
      // If we get a new message, refresh chat unread count and notifications
      refreshNotifications();
    };

    socket.on('new-notification', handleNewNotification);
    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-notification', handleNewNotification);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, refreshNotifications]);

  // Polling fallback every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!socket || !socket.connected) {
        refreshNotifications();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, socket, refreshNotifications]);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  const deleteNotification = async (id: string) => {
    await notificationService.deleteNotification(id);
  };

  const totalUnreadCount = unreadCount + chatUnreadCount;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        chatUnreadCount,
        totalUnreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
