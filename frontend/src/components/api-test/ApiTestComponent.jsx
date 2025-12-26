import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const ApiTestComponent = () => {
  const { user, isAuthenticated, signIn, signUp, logout } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailTestEmail, setEmailTestEmail] = useState("test@example.com");

  const testApiConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/health");
      const data = await response.json();
      setTestResults((prev) => ({
        ...prev,
        connection: { success: true, data },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        connection: { success: false, error: error.message },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testEmailService = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/email-test"
      );
      const data = await response.json();
      setTestResults((prev) => ({
        ...prev,
        emailService: { success: true, data },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        emailService: { success: false, error: error.message },
      }));
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/send-test-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: emailTestEmail }),
        }
      );
      const data = await response.json();
      setTestResults((prev) => ({
        ...prev,
        testEmail: { success: true, data },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        testEmail: { success: false, error: error.message },
      }));
    } finally {
      setLoading(false);
    }
  };

  // Test properties API
  const testPropertiesApi = async () => {
    setLoading(true);
    try {
      const response = await apiService.properties.getAll({ limit: 5 });
      setTestResults((prev) => ({
        ...prev,
        properties: { success: true, data: response.data },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        properties: {
          success: false,
          error: error.message,
          details: error.response?.data || "No response data",
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  // Test agents API
  const testAgentsApi = async () => {
    setLoading(true);
    try {
      const response = await apiService.agents.getAll({ limit: 5 });
      setTestResults((prev) => ({
        ...prev,
        agents: { success: true, data: response.data },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        agents: {
          success: false,
          error: error.message,
          details: error.response?.data || "No response data",
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Test authentication
  const testAuth = async () => {
    setLoading(true);
    try {
      const result = await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "USER", // Use correct role value
      });
      if (result.success) {
        setTestResults((prev) => ({
          ...prev,
          auth: { success: true, message: "User registered successfully" },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          auth: { success: false, error: result.error },
        }));
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        auth: {
          success: false,
          error: error.message,
          details: error.response?.data || "No response data",
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  // Test login
  const testLogin = async () => {
    setLoading(true);
    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });
      if (result.success) {
        setTestResults((prev) => ({
          ...prev,
          login: { success: true, message: "User logged in successfully" },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          login: { success: false, error: result.error },
        }));
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        login: {
          success: false,
          error: error.message,
          details: error.response?.data || "No response data",
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔗 API Integration Test</CardTitle>
          <CardDescription>
            Test the connection between frontend and backend APIs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">API Testing</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={testApiConnection}
              disabled={loading}
              variant="outline"
            >
              Test API Connection
            </Button>

            <Button
              onClick={testEmailService}
              disabled={loading}
              variant="outline"
            >
              Test Email Service
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email for test"
                value={emailTestEmail}
                onChange={(e) => setEmailTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={sendTestEmail}
                disabled={loading}
                variant="outline"
              >
                Send Test Email
              </Button>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-4">
            {Object.entries(testResults).map(([key, result]) => (
              <div key={key} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </h4>
                {result.success ? (
                  <div className="text-green-600">
                    <p>✅ Success</p>
                    <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p>❌ Error: {result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Authentication Test */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Authentication Test</CardTitle>
          <CardDescription>
            Test user registration and login functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={testAuth} disabled={loading}>
              Test Registration
            </Button>
            <Button onClick={testLogin} disabled={loading} variant="outline">
              Test Login
            </Button>
            {isAuthenticated && (
              <Button onClick={logout} variant="destructive">
                Logout
              </Button>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">Current User:</h4>
              <p className="text-sm text-green-700">
                {user.firstName} {user.lastName} ({user.email})
              </p>
              <p className="text-xs text-green-600">Role: {user.role}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTestComponent;
