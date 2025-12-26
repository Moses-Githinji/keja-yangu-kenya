import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to send password reset email");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate("/auth/signin");
  };

  const handleTryAgain = () => {
    setSuccess(false);
    setEmail("");
    setError("");
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
              Check Your Email
            </h2>
            <p className="text-green-600 mb-4">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the password reset link in the email</li>
                <li>• The link expires in 30 seconds for security</li>
                <li>• Create a new password on the reset page</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleTryAgain}
                variant="outline"
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
              >
                Send to Different Email
              </Button>

              <Button
                onClick={handleBackToSignIn}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Back to Sign In
              </Button>
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
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password
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
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-10"
                  required
                  disabled={loading}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Reset Link...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Reset Link
                </div>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm">
              🔒 Security Features
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Reset links expire in 30 seconds</li>
              <li>• Links are tied to your specific account</li>
              <li>• Only sent to verified email addresses</li>
              <li>• Secure token-based verification</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="mt-6 text-center">
            <button
              onClick={handleBackToSignIn}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/auth/register")}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                disabled={loading}
              >
                Sign up here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
