import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
      return;
    }
  }, [token]);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
      feedback.push("At least 8 characters");
    } else {
      feedback.push("Need at least 8 characters");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push("Contains lowercase letter");
    } else {
      feedback.push("Need lowercase letter");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push("Contains uppercase letter");
    } else {
      feedback.push("Need uppercase letter");
    }

    if (/[0-9]/.test(password)) {
      score += 1;
      feedback.push("Contains number");
    } else {
      feedback.push("Need number");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
      feedback.push("Contains special character");
    } else {
      feedback.push("Need special character");
    }

    setPasswordStrength({ score, feedback });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, formData.password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/auth/signin", {
            state: {
              message:
                "Password reset successful! Please sign in with your new password.",
            },
          });
        }, 3000);
      } else {
        setError(result.error || "Password reset failed");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-green-600 mb-4">
              Your password has been successfully reset. You will be redirected
              to the login page shortly.
            </p>
            <div className="animate-pulse">
              <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your new password below to complete the reset process
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.score
                            ? level <= 2
                              ? "bg-red-400"
                              : level <= 3
                              ? "bg-yellow-400"
                              : "bg-green-400"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">
                    {passwordStrength.score < 3 && "Password is weak"}
                    {passwordStrength.score === 3 && "Password is moderate"}
                    {passwordStrength.score > 3 && "Password is strong"}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {formData.confirmPassword && (
                <div className="text-xs">
                  {formData.password === formData.confirmPassword ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !token}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting Password...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Reset Password
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/auth/signin")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
