import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  Heart,
  MessageSquare,
  Eye,
  Plus,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Home,
  Search,
  Bell,
  Settings,
  ArrowRight,
  Star,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    propertiesViewed: 0,
    propertiesSaved: 0,
    inquiriesSent: 0,
    messagesReceived: 0,
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: "view",
      property: "Modern 3-Bedroom Apartment",
      location: "Westlands, Nairobi",
      price: "KES 25,000,000",
      date: "2 hours ago",
      image: "/api/placeholder/60/60",
    },
    {
      id: 2,
      type: "save",
      property: "Luxury Villa with Pool",
      location: "Karen, Nairobi",
      price: "KES 45,000,000",
      date: "1 day ago",
      image: "/api/placeholder/60/60",
    },
    {
      id: 3,
      type: "inquiry",
      property: "Studio Apartment",
      location: "Kilimani, Nairobi",
      price: "KES 8,500,000",
      date: "3 days ago",
      image: "/api/placeholder/60/60",
    },
  ]);

  const [quickActions] = useState([
    {
      title: "Search Properties",
      description: "Find your dream home",
      icon: Search,
      action: () => navigate("/buy"),
      color: "bg-blue-500",
    },
    {
      title: "View Favorites",
      description: "Check saved properties",
      icon: Heart,
      action: () => navigate("/favorites"),
      color: "bg-red-500",
    },
    {
      title: "Messages",
      description: "Chat with agents",
      icon: MessageSquare,
      action: () => navigate("/messages"),
      color: "bg-green-500",
    },
    {
      title: "Account Settings",
      description: "Manage your profile",
      icon: Settings,
      action: () => navigate("/account"),
      color: "bg-purple-500",
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch unread count for messages
        const unreadRes = await apiService.notifications.getUnreadCount();
        const unreadCount = unreadRes.data.success ? unreadRes.data.data.unreadCount : 0;

        // Fetch favorites for saved properties
        const favsRes = await apiService.properties.getFavorites();
        const favsCount = favsRes.data.success ? favsRes.data.data.length : 0;

        setStats({
          propertiesViewed: 0, // TODO: Track views in backend
          propertiesSaved: favsCount,
          inquiriesSent: 0,    // TODO: Track inquiries in backend
          messagesReceived: unreadCount,
        });

        // Set recent activities (could be fetched from a unified activity log)
        setRecentActivities([]); // Clear mock activities for now
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "save":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "inquiry":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "view":
        return "bg-blue-100 text-blue-800";
      case "save":
        return "bg-red-100 text-red-800";
      case "inquiry":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your account today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Properties Viewed
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.propertiesViewed}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Properties Saved
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.propertiesSaved}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Inquiries Sent
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.inquiriesSent}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Bell className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Messages
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.messagesReceived}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Access frequently used features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 hover:bg-accent"
                        onClick={action.action}
                      >
                        <div className={`p-2 rounded-lg mr-3 ${action.color}`}>
                          <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>
                    Your latest property interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={activity.image}
                              alt={activity.property}
                            />
                            <AvatarFallback>
                              {getActivityIcon(activity.type)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge
                                variant="secondary"
                                className={getActivityColor(activity.type)}
                              >
                                {activity.type.charAt(0).toUpperCase() +
                                  activity.type.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {activity.date}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm truncate">
                              {activity.property}
                            </h4>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {activity.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {activity.price}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/property-details")}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                        {index < recentActivities.length - 1 && <Separator />}
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button variant="outline" onClick={() => navigate("/buy")}>
                      View All Properties
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Market Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Market Insights</span>
                </CardTitle>
                <CardDescription>
                  Stay updated with the latest real estate trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-blue-900">
                      Market Trends
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Property prices are trending upward in Nairobi
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <Home className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-900">
                      New Listings
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      45 new properties added this week
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-purple-900">
                      Agent Activity
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      High agent response rates this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
