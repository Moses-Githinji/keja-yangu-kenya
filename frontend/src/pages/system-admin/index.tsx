import React from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminOverview: React.FC = () => {
  return (
    <AdminLayout>
      <AdminOverviewContent />
    </AdminLayout>
  );
};

const AdminOverviewContent: React.FC = () => {
  const stats = [
    {
      title: "Total Properties",
      value: "1,234",
      description: "Active listings",
      icon: Home,
      color: "text-blue-600",
    },
    {
      title: "Total Users",
      value: "5,678",
      description: "Registered users",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Active Agents",
      value: "156",
      description: "Verified agents",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: "KES 2.4M",
      description: "This month",
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Messages",
      value: "89",
      description: "Unread messages",
      icon: MessageSquare,
      color: "text-red-600",
    },
    {
      title: "System Health",
      value: "98.5%",
      description: "Uptime this month",
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          System Administrator Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage users, agents, properties, and system settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row space-x-1 items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
                <span className="text-sm text-yellow-600 font-medium">
                  Warning
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
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Agent application approved
                  </p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-gray-600">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Property listing moderated
                  </p>
                  <p className="text-xs text-gray-600">6 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System backup completed</p>
                  <p className="text-xs text-gray-600">8 hours ago</p>
                </div>
              </div>
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
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">High CPU usage detected</p>
                  <p className="text-xs text-gray-600">Server load: 95%</p>
                  <p className="text-xs text-gray-500">5 min ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Database backup overdue</p>
                  <p className="text-xs text-gray-600">Last backup: 48h ago</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    New agent applications pending
                  </p>
                  <p className="text-xs text-gray-600">
                    3 applications waiting
                  </p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    System maintenance completed
                  </p>
                  <p className="text-xs text-gray-600">
                    All services operational
                  </p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
