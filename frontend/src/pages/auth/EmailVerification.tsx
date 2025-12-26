import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Timer,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { verifyEmail, resendVerification } = useAuth();

  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem("pendingVerificationEmail");

    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem("pendingVerificationEmail", emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // No email found, redirect to register
      navigate("/auth/register");
      return;
    }

    // Start countdown for resend button
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.state, navigate]);

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    setError(""); // Clear error when user types
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const result = await verifyEmail(email, verificationCode);

      if (result.success) {
        toast({
          title: "Email Verified!",
          description:
            "Your email has been verified successfully. Redirecting to sign in...",
          variant: "default",
        });

        // Clear pending verification email
        localStorage.removeItem("pendingVerificationEmail");

        // Redirect to sign in after a short delay
        setTimeout(() => {
          navigate("/auth/signin");
        }, 2000);
      } else {
        setError(result.error || "Verification failed");
        toast({
          title: "Verification Failed",
          description:
            result.error || "Failed to verify your email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("An unexpected error occurred");
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setError("");

    try {
      const result = await resendVerification(email);

      if (result.success) {
        toast({
          title: "Code Sent!",
          description: "A new verification code has been sent to your email.",
          variant: "default",
        });

        // Reset countdown
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.error || "Failed to resend code");
        toast({
          title: "Resend Failed",
          description:
            result.error ||
            "Failed to resend verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("An unexpected error occurred");
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegister = () => {
    localStorage.removeItem("pendingVerificationEmail");
    navigate("/auth/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              We've sent a 6-digit verification code to
            </CardDescription>
            <p className="text-sm font-medium text-blue-600 mt-1">{email}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                className="text-center text-lg tracking-widest font-mono"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={countdown > 0 || isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Timer className="mr-2 h-4 w-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleBackToRegister}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Register
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              📧 Check Your Email
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Look for an email from KejaYangu</li>
              <li>• Check your spam folder if you don't see it</li>
              <li>• The code expires in 10 minutes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
