import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Checkbox } from "../../components/ui/checkbox";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Building,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "USER", // USER, AGENT, ADMIN
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      checkPasswordStrength(value);
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }));
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please choose a stronger password.");
      return false;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    // Basic phone validation for Kenya - must match backend validation
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError(
        "Please enter a valid Kenyan phone number starting with +254 or 0"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.userType, // Map userType to role field
      });

      if (result.success) {
        // Registration successful, redirect to email verification
        navigate("/auth/verify-email", {
          state: {
            message:
              "Registration successful! Please check your email for verification code.",
            email: formData.email,
          },
        });
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join KejaYangu and start your real estate journey
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
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name *
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Last Name *
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address *
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number *
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254 700 123 456"
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Use Kenyan format: +254 700 123 456 or 0700 123 456
                </p>
                <p className="text-xs text-blue-600">
                  💡 Tip: Use the same format as your Twilio number (+254...)
                </p>
              </div>
            </div>

            {/* User Type - Hidden, defaults to USER */}
            <input type="hidden" name="userType" value="USER" />

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    disabled={loading}
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
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {formData.confirmPassword && (
                  <div className="text-xs mt-2">
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
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={handleCheckboxChange}
                disabled={loading}
                className="mt-1"
              />
              <Label
                htmlFor="agreeToTerms"
                className="text-sm text-gray-600 leading-relaxed"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-green-600 hover:text-green-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-green-600 hover:text-green-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading || isLoading}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Registration Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              Continue with Facebook
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={handleSignIn}
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
                disabled={loading}
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

export default Register;
