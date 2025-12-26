import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  X,
  MessageSquare,
  Home,
  DollarSign,
  AlertCircle,
  Info,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  notificationService,
  Notification,
} from "@/services/notificationService";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to notification service
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notifications) => {
      setNotifications(notifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    return unsubscribe;
  }, []);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  // Mark all as read
  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "property":
        return <Home className="h-4 w-4 text-green-500" />;
      case "payment":
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case "system":
        return <Info className="h-4 w-4 text-purple-500" />;
      case "inquiry":
        return <User className="h-4 w-4 text-orange-500" />;
      case "reminder":
        return <Clock className="h-4 w-4 text-indigo-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      notification.action();
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 mt-2"
        align="end"
        sideOffset={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="flex items-center justify-between p-4">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-80">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-xs">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      notification.isRead
                        ? "bg-muted/50 hover:bg-muted"
                        : "bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback className="text-xs">
                              {getNotificationIcon(notification.type)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p
                            className={`text-sm font-medium ${
                              notification.isRead
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p
                          className={`text-sm mt-1 ${
                            notification.isRead
                              ? "text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {notification.message}
                        </p>

                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Navigate to notifications page
                  console.log("Navigate to notifications page");
                  setIsOpen(false);
                }}
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
