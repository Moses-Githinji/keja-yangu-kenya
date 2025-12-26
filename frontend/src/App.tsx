import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ToastProvider } from "@/components/ui/toast-container";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import BecomeAgentModal from "./components/auth/BecomeAgentModal";

// Pages
import Index from "./pages/Index";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
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
import AdminOverview from "./pages/system-admin/index";
import AdminUsers from "./pages/system-admin/Users.tsx";
import AdminAgents from "./pages/system-admin/Agents.tsx";
import AdminProperties from "./pages/system-admin/Properties.tsx";
import AdminFinance from "./pages/system-admin/Finance.tsx";
import AdminHealth from "./pages/system-admin/Health.tsx";
import AdminMessages from "./pages/system-admin/Messages.tsx";
import AdminSettings from "./pages/system-admin/Settings";

// Agent Pages
import BecomeAgent from "./pages/BecomeAgent";
import AddProperty from "./pages/AddProperty";
import Agents from "./pages/agent/Agents.tsx";
import AgentDashboard from "./pages/agent";
import AgentProperties from "./pages/agent/Properties.tsx";
import AgentFinance from "./pages/agent/Finance.tsx";
import AgentHealth from "./pages/agent/Health.tsx";
import AgentApplications from "./pages/agent/Agent.tsx";

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
                <Route path="/property/:id" element={<PropertyDetails />} />
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
                      <AdminOverview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/users"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/agents"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminAgents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/properties"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminProperties />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/finance"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminFinance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/health"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminHealth />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/messages"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminMessages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-admin/settings"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Agent Routes */}
                <Route path="/become-agent" element={<BecomeAgent />} />
                <Route
                  path="/add-property"
                  element={
                    <ProtectedRoute requiredRole="AGENT">
                      <AddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent"
                  element={
                    <ProtectedRoute requiredRole="AGENT">
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/*"
                  element={
                    <ProtectedRoute requiredRole="AGENT">
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/dashboard"
                  element={
                    <ProtectedRoute requiredRole="AGENT">
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/properties"
                  element={
                    <ProtectedRoute requiredRole="AGENT">
                      <AgentProperties />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/finance"
                  element={
                    <ProtectedRoute requiredRole="AGENT">
                      <AgentFinance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/health"
                  element={
                    <ProtectedRoute requiredRole="AGENT">
                      <AgentHealth />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/applications"
                  element={
                    <ProtectedRoute requiredRole="AGENT">
                      <AgentApplications />
                    </ProtectedRoute>
                  }
                />
                <Route path="/unauthorized" element={<UnauthorizedAccess />} />

                {/* API Test Route */}
                <Route path="/api-test" element={<ApiTestComponent />} />

                {/* Legal Routes */}
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
