import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900">
          Loading
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign in page with return url
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Check if user has required role (single role check)
  if (requiredRole && user?.role !== requiredRole) {
    console.log("ProtectedRoute: Access denied (requiredRole)", {
      userRole: user?.role,
      requiredRole,
      userId: user?.id,
    });
    
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'HOST') {
      return <Navigate to="/host/dashboard" replace />;
    } else if (user?.role === 'AGENT') {
      return <Navigate to="/agent" replace />;
    } else if (user?.role === 'ADMIN') {
      return <Navigate to="/system-admin" replace />;
    }
    
    // Default to unauthorized if role doesn't match any known dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user has one of the allowed roles (array check)
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role || "")
  ) {
    console.log("ProtectedRoute: Access denied (allowedRoles)", {
      userRole: user?.role,
      allowedRoles,
      userId: user?.id,
    });
    
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'HOST') {
      return <Navigate to="/host/dashboard" replace />;
    } else if (user?.role === 'AGENT') {
      return <Navigate to="/agent" replace />;
    } else if (user?.role === 'ADMIN') {
      return <Navigate to="/system-admin" replace />;
    }
    
    // Default to unauthorized if role doesn't match any known dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

interface UnauthorizedAccessProps {
  requiredRole: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  requiredRole,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be an {requiredRole.toLowerCase()} to access this area.
            Apply to become an agent to list properties and manage your real
            estate business.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              // Trigger the become agent modal - we'll implement this
              const event = new CustomEvent("openBecomeAgentModal");
              window.dispatchEvent(event);
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply to Become an Agent
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
