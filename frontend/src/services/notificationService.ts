import { toast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: "message" | "property" | "payment" | "system" | "inquiry" | "reminder";
  category: "urgent" | "important" | "normal" | "low";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  avatar?: string;
  metadata?: {
    propertyId?: string;
    agentId?: string;
    amount?: number;
    location?: string;
    [key: string]: any;
  };
  action?: () => void;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private unreadCount = 0;

  // Initialize with mock data
  constructor() {
    this.loadMockNotifications();
  }

  // Load mock notifications
  private loadMockNotifications() {
    this.notifications = [
      {
        id: "1",
        type: "message",
        category: "urgent",
        title: "New Message from Agent",
        message:
          "Sarah Kamau sent you a message about the property in Karen. She's available for a viewing this weekend.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        isArchived: false,
        isPinned: true,
        avatar: "/api/placeholder/40/40",
        metadata: {
          propertyId: "prop-001",
          agentId: "agent-001",
          location: "Karen, Nairobi",
        },
      },
      {
        id: "2",
        type: "property",
        category: "important",
        title: "Property View Update",
        message:
          "Your property in Westlands received 15 new views today and 3 new inquiries.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        isArchived: false,
        isPinned: false,
        avatar: "/api/placeholder/40/40",
        metadata: {
          propertyId: "prop-002",
          location: "Westlands, Nairobi",
          views: 15,
          inquiries: 3,
        },
      },
      {
        id: "3",
        type: "payment",
        category: "normal",
        title: "Payment Received",
        message:
          "KES 2,500 has been credited to your account for property views this month.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        isPinned: false,
        metadata: {
          amount: 2500,
          currency: "KES",
        },
      },
      {
        id: "4",
        type: "system",
        category: "low",
        title: "Welcome to KejaYangu",
        message:
          "Your account has been successfully created. Start exploring properties and earning rewards!",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        isPinned: false,
      },
      {
        id: "5",
        type: "inquiry",
        category: "urgent",
        title: "New Property Inquiry",
        message:
          "John Doe is interested in your 3-bedroom apartment in Kilimani. Contact them within 24 hours.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        isRead: false,
        isArchived: false,
        isPinned: false,
        avatar: "/api/placeholder/40/40",
        metadata: {
          propertyId: "prop-003",
          location: "Kilimani, Nairobi",
          contact: "john@example.com",
        },
      },
      {
        id: "6",
        type: "reminder",
        category: "important",
        title: "Property Viewing Reminder",
        message:
          "You have a property viewing scheduled for tomorrow at 2:00 PM in Westlands.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: false,
        isArchived: false,
        isPinned: false,
        metadata: {
          propertyId: "prop-004",
          location: "Westlands, Nairobi",
          scheduledTime: "2024-01-16T14:00:00Z",
        },
      },
    ];
    this.updateUnreadCount();
    this.notifyListeners();
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread count
  getUnreadCount(): number {
    return this.unreadCount;
  }

  // Add new notification
  addNotification(
    notification: Omit<
      Notification,
      "id" | "timestamp" | "isRead" | "isArchived" | "isPinned"
    >
  ): string {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
      isArchived: false,
      isPinned: false,
    };

    this.notifications.unshift(newNotification);
    this.updateUnreadCount();
    this.notifyListeners();

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.category === "urgent" ? "destructive" : "default",
    });

    return newNotification.id;
  }

  // Mark notification as read
  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.updateUnreadCount();
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    let hasChanges = false;
    this.notifications.forEach((notification) => {
      if (!notification.isRead) {
        notification.isRead = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.updateUnreadCount();
      this.notifyListeners();
    }
  }

  // Toggle pin notification
  togglePin(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.isPinned = !notification.isPinned;
      this.notifyListeners();
    }
  }

  // Archive notification
  archiveNotification(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification && !notification.isArchived) {
      notification.isArchived = true;
      this.updateUnreadCount();
      this.notifyListeners();
    }
  }

  // Delete notification
  deleteNotification(id: string): void {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      if (!notification.isRead) {
        this.unreadCount--;
      }
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  // Bulk actions
  bulkAction(ids: string[], action: "read" | "archive" | "delete"): void {
    switch (action) {
      case "read":
        ids.forEach((id) => this.markAsRead(id));
        break;
      case "archive":
        ids.forEach((id) => this.archiveNotification(id));
        break;
      case "delete":
        ids.forEach((id) => this.deleteNotification(id));
        break;
    }
  }

  // Update unread count
  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(
      (n) => !n.isRead && !n.isArchived
    ).length;
  }

  // Subscribe to notifications changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.notifications); // Initial call

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  // Simulate real-time notifications (for demo purposes)
  startRealTimeSimulation(): void {
    setInterval(() => {
      // Randomly add new notifications
      if (Math.random() < 0.1) {
        // 10% chance every interval
        const types: Notification["type"][] = [
          "message",
          "property",
          "payment",
          "inquiry",
        ];
        const categories: Notification["category"][] = [
          "urgent",
          "important",
          "normal",
        ];

        this.addNotification({
          type: types[Math.floor(Math.random() * types.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          title: "New Activity",
          message: "You have new activity on your account. Check it out!",
          metadata: {},
        });
      }
    }, 30000); // Every 30 seconds
  }

  // Stop real-time simulation
  stopRealTimeSimulation(): void {
    // Implementation would clear intervals
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Start real-time simulation for demo
notificationService.startRealTimeSimulation();
