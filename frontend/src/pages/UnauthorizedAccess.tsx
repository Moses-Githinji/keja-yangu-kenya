import React from "react";
import { ShieldX, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const UnauthorizedAccess: React.FC = () => {
  const handleBecomeAgent = () => {
    const event = new CustomEvent("openBecomeAgentModal");
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            401 - Unauthorized Access
          </CardTitle>
          <CardDescription className="text-gray-600">
            You don't have permission to access this page. This area is
            restricted to verified agents only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              To access the agent dashboard and related features, you need to
              become a verified agent.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
              <Users className="w-5 h-5" />
              <span className="font-medium">
                Join our network of professional agents
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleBecomeAgent}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Partner With Us
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              By becoming an agent, you'll gain access to property listings,
              client management, and revenue opportunities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedAccess;
