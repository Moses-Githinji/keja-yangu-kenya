import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ToastProvider } from "@/components/ui/toast-container";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import BecomeAgentModal from "./components/auth/BecomeAgentModal";

// Pages
import Index from "./pages/Index";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import BriefStay from "./pages/BriefStay";
import BriefStayHost from "./pages/BriefStayHost";
import PropertyDetails from "./pages/PropertyDetails";
import NotFound from "./pages/NotFound";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import EmailVerification from "./pages/auth/EmailVerification";
import EmailVerified from "./pages/auth/EmailVerified";
import ResetPassword from "./pages/auth/ResetPassword";
import UserNotFound from "./pages/auth/UserNotFound";

// User Pages
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";

// Content Creator Pages
import ContentCreatorDashboard from "./pages/ContentCreatorDashboard";
import ContentCreatorEnrollment from "./pages/ContentCreatorEnrollment";

// Demo Pages
import MapDemo from "./pages/MapDemo";

// Legal Pages
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Access Control Pages
import UnauthorizedAccess from "./pages/UnauthorizedAccess";

// System Admin Pages
import SystemAdminDashboard from "./pages/system-admin";
import SystemAdminUsers from "./pages/system-admin/Users";
import SystemAdminAgents from "./pages/system-admin/Agents";
import SystemAdminProperties from "./pages/system-admin/Properties";
import SystemAdminFinance from "./pages/system-admin/Finance";
import SystemAdminHealth from "./pages/system-admin/Health";
import SystemAdminMessages from "./pages/system-admin/Messages";
import SystemAdminSettings from "./pages/system-admin/Settings";
import SystemAdminBilling from "./pages/system-admin/Billing";

// Agent Pages
import BecomeAgent from "./pages/BecomeAgent";
import Agents from "./pages/agent/Agents.tsx";
import AgentDashboard from "./pages/agent";
import AgentProperties from "./pages/agent/Properties.tsx";
import AgentFinance from "./pages/agent/Finance.tsx";
import AgentHealth from "./pages/agent/Health.tsx";
import AgentApplications from "./pages/agent/Agent.tsx";
import AgentAddProperty from "./pages/agent/AddProperty.tsx";
import EditProperty from "./pages/agent/EditProperty.tsx";
import AgentMessages from "./pages/agent/Messages";
import AgentSettings from "./pages/agent/Settings";

// Host Dashboard
import HostDashboard from "./pages/host";

// Test Component
import ApiTestComponent from "./components/api-test/ApiTestComponent";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isBecomeAgentModalOpen, setIsBecomeAgentModalOpen] =
    React.useState(false);

  React.useEffect(() => {
    const handleOpenBecomeAgentModal = () => {
      setIsBecomeAgentModalOpen(true);
    };

    window.addEventListener("openBecomeAgentModal", handleOpenBecomeAgentModal);

    return () => {
      window.removeEventListener(
        "openBecomeAgentModal",
        handleOpenBecomeAgentModal
      );
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider>
          <ToastProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/buy" element={<Buy />} />
                <Route path="/rent" element={<Rent />} />
                <Route path="/brief-stay" element={<BriefStay />} />
                <Route
                  path="/property/:propertyId"
                  element={<PropertyDetails />}
                />
                <Route path="/agents" element={<Agents />} />

                {/* Auth Routes */}
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/register" element={<Register />} />
                <Route
                  path="/auth/verify-email"
                  element={<EmailVerification />}
                />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route
                  path="/auth/email-verified"
                  element={<EmailVerified />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
                <Route path="/auth/user-not-found" element={<UserNotFound />} />

                {/* User Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />

                {/* Content Creator Routes */}
                <Route
                  path="/content-creator-dashboard"
                  element={
                    <ProtectedRoute>
                      <ContentCreatorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/content-creator-enrollment"
                  element={
                    <ProtectedRoute>
                      <ContentCreatorEnrollment />
                    </ProtectedRoute>
                  }
                />

                {/* Demo Routes */}
                <Route path="/map-demo" element={<MapDemo />} />

                {/* System Admin Routes */}
                <Route
                  path="/system-admin"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <SystemAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/users"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <SystemAdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/agents"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <SystemAdminAgents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/properties"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <SystemAdminProperties />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/finance"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <SystemAdminFinance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/health"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <SystemAdminHealth />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/messages"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <SystemAdminMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/settings"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <SystemAdminSettings />
                    </ProtectedRoute>
                  }
                />


                {/* Agent Routes - Only accessible to AGENT role */}
                <Route path="/become-agent" element={<BecomeAgent />} />
                <Route
                  path="/agent"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/properties"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentProperties />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/finance"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentFinance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/health"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentHealth />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/applications"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/properties/add"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentAddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/properties/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <EditProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/add-property"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentAddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/messages"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/settings"
                  element={
                    <ProtectedRoute allowedRoles={["AGENT"]}>
                      <AgentSettings />
                    </ProtectedRoute>
                  }
                />
                <Route path="/unauthorized" element={<UnauthorizedAccess />} />

                {/* API Test Route */}
                <Route path="/api-test" element={<ApiTestComponent />} />

                {/* Legal Routes */}
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Host Routes - Only accessible to HOST role */}
                <Route
                  path="/host/dashboard"
                  element={
                    <ProtectedRoute requiredRole="HOST">
                      <HostDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/host/properties"
                  element={
                    <ProtectedRoute requiredRole="HOST">
                      <div>Host Properties (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/host/bookings"
                  element={
                    <ProtectedRoute requiredRole="HOST">
                      <div>Host Bookings (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/host/earnings"
                  element={
                    <ProtectedRoute requiredRole="HOST">
                      <div>Host Earnings (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/host/messages"
                  element={
                    <ProtectedRoute requiredRole="HOST">
                      <div>Host Messages (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/host/settings"
                  element={
                    <ProtectedRoute requiredRole="HOST">
                      <div>Host Settings (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              {/* Become Agent Modal */}
              <BecomeAgentModal
                isOpen={isBecomeAgentModalOpen}
                onClose={() => setIsBecomeAgentModalOpen(false)}
              />
            </Router>
            <Toaster />
            <Sonner />
          </ToastProvider>
        </TooltipProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);
}

export default App;
