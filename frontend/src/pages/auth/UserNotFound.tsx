import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  UserX,
  Home,
  UserPlus,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
  Mail,
} from "lucide-react";

const UserNotFound = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Error Card */}
        <Card
          className={`transform transition-all duration-1000 ${
            animate ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <CardHeader className="text-center pb-8">
            <div
              className={`mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 transition-all duration-700 ${
                animate ? "scale-100 rotate-0" : "scale-0 rotate-180"
              }`}
            >
              <UserX className="w-12 h-12 text-red-600" />
            </div>

            <CardTitle
              className={`text-3xl font-bold text-red-800 mb-3 transition-all duration-700 delay-200 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              User Not Found
            </CardTitle>

            <CardDescription
              className={`text-lg text-red-600 transition-all duration-700 delay-400 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              We couldn't verify your identity with the provided information
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Details */}
            <div
              className={`bg-red-50 border border-red-200 rounded-lg p-4 transition-all duration-700 delay-500 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">
                    What happened?
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• The verification link may have expired</li>
                    <li>• The user account might not exist</li>
                    <li>• The verification token could be invalid</li>
                    <li>• The account may have been deleted</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div
              className={`bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-700 delay-600 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Security Notice
                  </h3>
                  <p className="text-sm text-blue-700">
                    This is a security feature to protect your account. If you
                    believe this is an error, please contact our support team.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-700 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <Button
                onClick={() => navigate("/auth/register")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white group"
                size="lg"
              >
                <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Create New Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 group"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Go to Homepage
              </Button>
            </div>

            {/* Additional Help */}
            <div
              className={`text-center pt-4 transition-all duration-700 delay-800 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <p className="text-sm text-gray-600 mb-3">
                Need help? Here are some options:
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <button
                  onClick={() => navigate("/auth/forgot-password")}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Forgot Password
                </button>

                <button
                  onClick={() => navigate("/auth/signin")}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  Sign In
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  <Home className="w-3 h-3" />
                  Homepage
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Elements Animation */}
        <div
          className={`fixed inset-0 pointer-events-none transition-all duration-1000 delay-1000 ${
            animate ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Floating Icons */}
          <div className="absolute top-20 left-10 animate-bounce">
            <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
              <UserX className="w-4 h-4 text-red-600" />
            </div>
          </div>

          <div
            className="absolute top-40 right-20 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-orange-600" />
            </div>
          </div>

          <div
            className="absolute bottom-40 left-20 animate-bounce"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-7 h-7 bg-yellow-200 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-yellow-600" />
            </div>
          </div>

          <div
            className="absolute bottom-20 right-10 animate-bounce"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center">
              <Shield className="w-2 h-2 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotFound;
