import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Home,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";

  // Define all possible menu items with role-aware paths and visibility
  const allMenuItems = [
    {
      title: "Dashboard",
      path: isAdmin ? "/system-admin" : isAgent ? "/agent" : "/host/dashboard",
      icon: LayoutDashboard,
      visible: true, // Always visible to all roles
    },
    {
      title: "Properties",
      path: isAdmin ? "/system-admin/properties" : isAgent ? "/agent/properties" : "/host/properties",
      icon: Home,
      visible: true, // Visible to all roles
    },
    {
      title: "Bookings",
      path: "/host/bookings",
      icon: Calendar,
      visible: user?.role === 'HOST', // Only for HOST
    },
    {
      title: "Earnings",
      path: "/host/earnings",
      icon: DollarSign,
      visible: user?.role === 'HOST', // Only for HOST
    },
    {
      title: "User Management",
      path: "/system-admin/users",
      icon: Users,
      visible: isAdmin, // Only for ADMIN
    },
    {
      title: isAdmin ? "Financial Reports" : "My Earnings",
      path: isAdmin ? "/system-admin/finance" : "/agent/finance",
      icon: DollarSign,
      visible: isAdmin || isAgent, // Show to both ADMIN and AGENT
    },
    {
      title: "System Health",
      path: "/system-admin/health",
      icon: BarChart3,
      visible: isAdmin, // Only ADMIN
    },
    {
      title: "Messages",
      path: isAdmin ? "/system-admin/messages" : isAgent ? "/agent/messages" : "/host/messages",
      icon: MessageSquare,
      visible: true, // All roles have messages
    },
    {
      title: "Agent Applications",
      path: "/system-admin/agents",
      icon: Users,
      visible: isAdmin, // Only ADMIN
    },
    {
      title: isAdmin ? "System Settings" : "Account Settings",
      path: isAdmin ? "/system-admin/settings" : isAgent ? "/agent/settings" : "/host/settings",
      icon: Settings,
      visible: true, // All roles have settings
    },
  ];

  // Filter only visible items for current user
  const menuItems = allMenuItems.filter((item) => item.visible);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={cn("flex flex-col h-full bg-white border-r", className)}>
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">
          {isAdmin ? "System Admin" : "Agent"}
        </h2>
        <p className="text-sm text-gray-600">
          {isAdmin ? "Administrator Dashboard" : "Agent Dashboard"}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <p className="text-xs font-medium text-blue-600 uppercase">
              {user?.role}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
