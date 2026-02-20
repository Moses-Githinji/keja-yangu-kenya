import { toast } from "@/hooks/use-toast";
import apiService from "./api";

export interface Notification {
  id: string;
  type: string;
  category: "urgent" | "important" | "normal" | "low";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  avatar?: string;
  metadata?: any;
  action?: () => void;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private unreadCount = 0;
  private isInitialized = false;

  constructor() {
    // We'll call loadNotifications when explicitly needed or after auth
  }

  // Load real notifications from API
  async loadNotifications() {
    try {
      const response = await apiService.notifications.getAll();
      if (response.data.status === "success") {
        this.notifications = response.data.data.map((n: any) => ({
          id: n.id,
          type: n.type.toLowerCase(),
          category: n.category || "normal",
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt),
          isRead: n.isRead,
          isArchived: false, // Backend doesn't seem to have archive yet
          isPinned: false,   // Backend doesn't seem to have pin yet
          metadata: n.data ? JSON.parse(n.data) : {},
        }));
        this.isInitialized = true;
        this.updateUnreadCount();
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread count
  getUnreadCountValue(): number {
    return this.unreadCount;
  }

  // Fetch unread count from API
  async fetchUnreadCount() {
    try {
      const response = await apiService.notifications.getUnreadCount();
      if (response.data.status === "success") {
        this.unreadCount = response.data.data.unreadCount;
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }

  // Add new notification (local only or handled by backend)
  addNotification(
    notification: Omit<
      Notification,
      "id" | "timestamp" | "isRead" | "isArchived" | "isPinned"
    >
  ): string {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      isRead: false,
      isArchived: false,
      isPinned: false,
    };

    this.notifications.unshift(newNotification);
    this.unreadCount++;
    this.notifyListeners();

    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.category === "urgent" ? "destructive" : "default",
    });

    return id;
  }

  // Mark notification as read
  async markAsRead(id: string) {
    try {
      const notification = this.notifications.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        await apiService.notifications.markAsRead(id);
        notification.isRead = true;
        this.updateUnreadCount();
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  // Mark all as read
  async markAllAsRead() {
    try {
      await apiService.notifications.markAllAsRead();
      this.notifications.forEach((n) => {
        n.isRead = true;
      });
      this.updateUnreadCount();
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }

  // Delete notification
  async deleteNotification(id: string) {
    try {
      await apiService.notifications.deleteNotification(id);
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        if (!this.notifications[index].isRead) {
          this.unreadCount--;
        }
        this.notifications.splice(index, 1);
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }

  // Clear all read
  async clearRead() {
    try {
      await apiService.notifications.clearRead();
      this.notifications = this.notifications.filter((n) => !n.isRead);
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
    }
  }

  // Update unread count locally (best effort)
  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(
      (n) => !n.isRead && !n.isArchived
    ).length;
  }

  // Subscribe to notifications changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // If not initialized, trigger load
    if (!this.isInitialized) {
      this.loadNotifications();
    } else {
      listener(this.notifications);
    }

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const list = [...this.notifications];
    this.listeners.forEach((listener) => listener(list));
  }
}

export const notificationService = new NotificationService();
