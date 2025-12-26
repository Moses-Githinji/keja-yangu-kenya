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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/system-admin",
      icon: LayoutDashboard,
    },
    {
      title: "User Management",
      path: "/system-admin/users",
      icon: Users,
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            title: "Agent Applications",
            path: "/system-admin/agents",
            icon: Users,
          },
        ]
      : []),
    {
      title: "Property Oversight",
      path: "/system-admin/properties",
      icon: Home,
    },
    {
      title: "Financial Reports",
      path: "/system-admin/finance",
      icon: DollarSign,
    },
    {
      title: "System Health",
      path: "/system-admin/health",
      icon: BarChart3,
    },
    {
      title: "Messages",
      path: "/system-admin/messages",
      icon: MessageSquare,
    },
    {
      title: "System Settings",
      path: "/system-admin/settings",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={cn("flex flex-col h-full bg-white border-r", className)}>
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">System Admin</h2>
        <p className="text-sm text-gray-600">Administrator Dashboard</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
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
                    <item.icon className="mr-3 h-4 w-4" />
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
