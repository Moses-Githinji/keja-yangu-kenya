import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmailVerified = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "success" | "error" | "verifying"
  >("verifying");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setVerificationStatus("error");
      setIsVerifying(false);
      return;
    }

    // Verify the email token with the backend
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/v1/auth/verify-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (response.ok && data.status === "success") {
          setVerificationStatus("success");
          setIsVerifying(false);

          // Start countdown to redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/auth/signin");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          setVerificationStatus("error");
          setIsVerifying(false);
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setVerificationStatus("error");
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleSignIn = () => {
    navigate("/auth/signin");
  };

  const handleRegister = () => {
    navigate("/auth/register");
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verifying Your Email
            </CardTitle>
            <CardDescription className="text-gray-600">
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verification Failed
            </CardTitle>
            <CardDescription className="text-gray-600">
              We couldn't verify your email address. The link may be invalid or
              expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Please try registering again or contact support if the problem
                persists.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRegister} variant="outline">
                  Try Again
                </Button>
                <Button onClick={handleSignIn} variant="default">
                  Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Email Verified Successfully!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your email address has been verified. You can now sign in to your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                🎉 Welcome to KejaYangu! Your account is now active and ready to
                use.
              </p>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                Redirecting to sign in page in{" "}
                <span className="font-semibold text-blue-600">{countdown}</span>{" "}
                seconds...
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleSignIn}
                className="bg-green-600 hover:bg-green-700"
              >
                Sign In Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerified;
