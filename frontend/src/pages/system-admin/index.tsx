import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MessageSquare,
  CreditCard,
  Settings,
  BarChart3,
  Users,
  Home,
  DollarSign,
  Bell,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";

const AdminOverview: React.FC = () => {
  return (
    <AdminLayout>
      <AdminOverviewContent />
    </AdminLayout>
  );
};

const AdminOverviewContent: React.FC = () => {
  const [stats, setStats] = useState({
    properties: "0",
    users: "0",
    agents: "0",
    revenue: "KES 0",
    unreadMessages: "0",
    systemHealth: "Online",
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        apiService.admin.getStats(),
        apiService.admin.getRecentActivity(),
      ]);

      if (statsRes.data.status === "success") {
        const s = statsRes.data.data;
        setStats({
          properties: s.properties.toString(),
          users: s.users.toString(),
          agents: s.agents.toString(),
          revenue: `KES ${(s.revenue / 1000).toFixed(1)}K`, // Simple formatting
          unreadMessages: s.unreadMessages.toString(),
          systemHealth: s.systemHealth,
        });
      }

      if (activityRes.data.status === "success") {
        setActivities(activityRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: "Properties",
      value: stats.properties,
      description: "Total listings",
      icon: Home,
      color: "text-blue-600",
    },
    {
      title: "Total Users",
      value: stats.users,
      description: "Registered users",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Active Agents",
      value: stats.agents,
      description: "Verified agents",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: stats.revenue,
      description: "Total collected",
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Messages",
      value: stats.unreadMessages,
      description: "Unread messages",
      icon: MessageSquare,
      color: "text-red-600",
    },
    {
      title: "System Status",
      value: stats.systemHealth,
      description: "Live monitoring",
      icon: BarChart3,
      color: "text-green-600",
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      path: "/system-admin/users",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Agent Applications",
      description: "Review and approve agents",
      icon: Users,
      path: "/system-admin/agents",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Property Oversight",
      description: "Monitor and moderate listings",
      icon: Home,
      path: "/system-admin/properties",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      path: "/system-admin/settings",
      color: "bg-gray-500 hover:bg-gray-600",
    },
    {
      title: "Financial Reports",
      description: "View revenue and analytics",
      icon: DollarSign,
      path: "/system-admin/finance",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      title: "System Health",
      description: "Monitor system performance",
      icon: BarChart3,
      path: "/system-admin/health",
      color: "bg-red-500 hover:bg-red-600",
    },
  ];

  const formatDistanceToNow = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            System Administrator Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage users, agents, properties, and system settings
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row space-x-1 items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${action.color} text-white`}
                    >
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <span className="text-sm text-green-600 font-medium">
                  Healthy
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Services</span>
                <span className="text-sm text-green-600 font-medium">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Email Service</span>
                <span className="text-sm text-green-600 font-medium">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">File Storage</span>
                <span className="text-sm text-green-600 font-medium">
                  Healthy
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "USER_REGISTRATION"
                          ? "bg-blue-500"
                          : activity.type === "PROPERTY_LISTED"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formatDistanceToNow(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-gray-500">
                  No recent activity found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              System Notifications
            </CardTitle>
            <CardDescription>
              Important alerts and notifications for administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm text-gray-500 italic">
                No active critical alerts.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
