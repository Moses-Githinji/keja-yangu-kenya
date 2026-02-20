import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  MessageSquare,
  Home,
  DollarSign,
  AlertCircle,
  Info,
  Clock,
  Star,
  Eye,
  EyeOff,
  Archive,
  RefreshCw,
  Settings,
  MoreVertical,
  Calendar,
  MapPin,
  Building,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { notificationService, Notification } from "@/services/notificationService";

const Notifications = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

    // Subscribe to notification service
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [isAuthenticated, navigate]);

  // Filter and sort notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (notification) =>
          notification.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (notification) => notification.category === selectedCategory
      );
    }

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (notification) => notification.type === selectedType
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "unread") {
        filtered = filtered.filter((notification) => !notification.isRead);
      } else if (selectedStatus === "read") {
        filtered = filtered.filter((notification) => notification.isRead);
      } else if (selectedStatus === "pinned") {
        filtered = filtered.filter((notification) => notification.isPinned);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else if (sortBy === "oldest") {
        return a.timestamp.getTime() - b.timestamp.getTime();
      } else if (sortBy === "priority") {
        const priorityOrder = { urgent: 4, important: 3, normal: 2, low: 1 };
        return (
          priorityOrder[b.category as keyof typeof priorityOrder] -
          priorityOrder[a.category as keyof typeof priorityOrder]
        );
      }
      return 0;
    });

    setFilteredNotifications(filtered);
  }, [
    notifications,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedStatus,
    sortBy,
  ]);

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "property":
        return <Home className="h-5 w-5 text-green-500" />;
      case "payment":
        return <DollarSign className="h-5 w-5 text-yellow-500" />;
      case "system":
        return <Info className="h-5 w-5 text-purple-500" />;
      case "inquiry":
        return <User className="h-5 w-5 text-orange-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-indigo-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: Notification["category"]) => {
    switch (category) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "important":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    toast({
      title: "Marked as read",
      description: "Notification marked as read",
      variant: "default",
    });
  };

  // Mark all as read
  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    toast({
      title: "All marked as read",
      description: "All notifications marked as read",
      variant: "default",
    });
  };

  // Toggle pin notification
  const togglePin = (notificationId: string) => {
    // Note: Pinning is local or would need backend support
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isPinned: !n.isPinned } : n
      )
    );
  };

  // Archive notification
  const archiveNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId); // For now just delete/archive
    toast({
      title: "Archived",
      description: "Notification moved to archive",
      variant: "default",
    });
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    toast({
      title: "Deleted",
      description: "Notification deleted successfully",
      variant: "default",
    });
  };

  // Bulk actions
  const handleBulkAction = (action: "read" | "archive" | "delete") => {
    if (selectedNotifications.length === 0) {
      toast({
        title: "No selection",
        description: "Please select notifications first",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case "read":
        setNotifications((prev) =>
          prev.map((n) =>
            selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n
          )
        );
        toast({
          title: "Bulk action completed",
          description: `${selectedNotifications.length} notifications marked as read`,
          variant: "default",
        });
        break;
      case "archive":
        setNotifications((prev) =>
          prev.map((n) =>
            selectedNotifications.includes(n.id)
              ? { ...n, isArchived: true }
              : n
          )
        );
        toast({
          title: "Bulk action completed",
          description: `${selectedNotifications.length} notifications archived`,
          variant: "default",
        });
        break;
      case "delete":
        setNotifications((prev) =>
          prev.filter((n) => !selectedNotifications.includes(n.id))
        );
        toast({
          title: "Bulk action completed",
          description: `${selectedNotifications.length} notifications deleted`,
          variant: "default",
        });
        break;
    }
    setSelectedNotifications([]);
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      notification.action();
    }
  };

  // Toggle notification selection
  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Select all notifications
  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pinnedCount = notifications.filter((n) => n.isPinned).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="h-8 w-8 text-blue-500" />
              <h1 className="text-4xl font-bold">Notifications</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Stay updated with your property activities and messages
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm">
                  {notifications.length} Total
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive" className="text-sm">
                  {unreadCount} Unread
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  {pinnedCount} Pinned
                </Badge>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="message">Messages</SelectItem>
                      <SelectItem value="property">Properties</SelectItem>
                      <SelectItem value="payment">Payments</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="inquiry">Inquiries</SelectItem>
                      <SelectItem value="reminder">Reminders</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="pinned">Pinned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-muted rounded-lg border"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedNotifications.length} notification(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("read")}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("archive")}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction("delete")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No notifications found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ||
                    selectedCategory !== "all" ||
                    selectedType !== "all" ||
                    selectedStatus !== "all"
                      ? "Try adjusting your filters or search query"
                      : "You're all caught up! Check back later for new notifications"}
                  </p>
                  {(searchQuery ||
                    selectedCategory !== "all" ||
                    selectedType !== "all" ||
                    selectedStatus !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedType("all");
                        setSelectedStatus("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card
                      className={`transition-all duration-200 hover:shadow-md ${
                        notification.isPinned
                          ? "border-l-4 border-l-blue-500 bg-blue-50/50"
                          : ""
                      } ${
                        !notification.isRead
                          ? "border-l-4 border-l-orange-500 bg-orange-50/50"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Selection Checkbox */}
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(
                                notification.id
                              )}
                              onChange={() => toggleSelection(notification.id)}
                              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                          </div>

                          {/* Notification Icon */}
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h3
                                  className={`font-medium ${
                                    notification.isRead
                                      ? "text-muted-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                {notification.isPinned && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getCategoryColor(
                                    notification.category
                                  )}`}
                                >
                                  {notification.category}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => togglePin(notification.id)}
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      notification.isPinned
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    archiveNotification(notification.id)
                                  }
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <p
                              className={`text-sm mb-3 ${
                                notification.isRead
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {notification.message}
                            </p>

                            {/* Metadata */}
                            {notification.metadata && (
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                                {notification.metadata.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>
                                      {notification.metadata.location}
                                    </span>
                                  </div>
                                )}
                                {notification.metadata.amount && (
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>
                                      KES{" "}
                                      {notification.metadata.amount.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {notification.metadata.scheduledTime && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {new Date(
                                        notification.metadata.scheduledTime
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs h-6 px-2"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                                className="text-xs"
                              >
                                {notification.type === "message"
                                  ? "View Message"
                                  : "View Details"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={selectAll} className="text-sm">
                {selectedNotifications.length === filteredNotifications.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              {selectedNotifications.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedNotifications.length} of{" "}
                  {filteredNotifications.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
