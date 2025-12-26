import React from "react";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default AdminLayout;
