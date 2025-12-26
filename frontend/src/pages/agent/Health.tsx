import React, { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  Building,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Target,
  Award,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AgentHealth: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchHealthData = async () => {
    try {
      setRefreshing(true);
      // Mock agent performance data - replace with actual API calls
      const mockData = {
        overall: {
          status: "excellent",
          performance: "Top 10% of agents",
          lastChecked: new Date().toISOString(),
        },
        metrics: [
          {
            name: "Properties Listed",
            value: 12,
            target: 15,
            status: "on_track",
            change: "+2 this month",
          },
          {
            name: "Properties Sold",
            value: 8,
            target: 10,
            status: "on_track",
            change: "+1 this month",
          },
          {
            name: "Client Inquiries",
            value: 45,
            target: 50,
            status: "on_track",
            change: "+8 this month",
          },
          {
            name: "Response Time",
            value: "2.3 hours",
            target: "< 4 hours",
            status: "excellent",
            change: "-0.5 hours",
          },
        ],
        performance: {
          listingQuality: 92,
          clientSatisfaction: 88,
          marketReach: 76,
          salesConversion: 67,
        },
        recentAchievements: [
          {
            id: "ACH001",
            title: "Top Seller Badge",
            description: "Sold 8 properties this month",
            date: "2024-11-01",
            type: "badge",
          },
          {
            id: "ACH002",
            title: "Quick Response Award",
            description: "Responded to 95% of inquiries within 2 hours",
            date: "2024-10-28",
            type: "award",
          },
        ],
        goals: [
          {
            id: "GOAL001",
            title: "List 15 properties this month",
            progress: 80,
            target: 15,
            current: 12,
            deadline: "2024-11-30",
          },
          {
            id: "GOAL002",
            title: "Achieve 90% client satisfaction",
            progress: 98,
            target: 90,
            current: 88,
            deadline: "2024-12-31",
          },
        ],
      };

      setHealthData(mockData);
    } catch (error) {
      console.error("Error fetching health data:", error);
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50";
      case "on_track":
        return "text-blue-600 bg-blue-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-4 w-4" />;
      case "on_track":
        return <Target className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 75) return "text-blue-600 bg-blue-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Performance Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Track your performance metrics and achievements
            </p>
          </div>
          <Button
            onClick={fetchHealthData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Overall Performance */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-full ${getStatusColor(
                    healthData?.overall?.status
                  )}`}
                >
                  {getStatusIcon(healthData?.overall?.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Performance Status: {healthData?.overall?.status}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {healthData?.overall?.performance} | Last updated:{" "}
                    {new Date(
                      healthData?.overall?.lastChecked
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(healthData?.overall?.status)}>
                {healthData?.overall?.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Properties Listed
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData?.metrics?.[0]?.value || 0}
              </div>
              <p className="text-xs text-green-600">
                {healthData?.metrics?.[0]?.change || ""}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      ((healthData?.metrics?.[0]?.value || 0) /
                        (healthData?.metrics?.[0]?.target || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Properties Sold
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData?.metrics?.[1]?.value || 0}
              </div>
              <p className="text-xs text-green-600">
                {healthData?.metrics?.[1]?.change || ""}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      ((healthData?.metrics?.[1]?.value || 0) /
                        (healthData?.metrics?.[1]?.target || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Client Inquiries
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData?.metrics?.[2]?.value || 0}
              </div>
              <p className="text-xs text-green-600">
                {healthData?.metrics?.[2]?.change || ""}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${
                      ((healthData?.metrics?.[2]?.value || 0) /
                        (healthData?.metrics?.[2]?.target || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Response Time
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData?.metrics?.[3]?.value || "N/A"}
              </div>
              <p className="text-xs text-green-600">
                {healthData?.metrics?.[3]?.change || ""}
              </p>
              <Badge
                className={getStatusColor(healthData?.metrics?.[3]?.status)}
              >
                {healthData?.metrics?.[3]?.status || "unknown"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Performance Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance Scores</CardTitle>
              <CardDescription>Your key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(healthData?.performance || {}).map(
                ([metric, score]: [string, any]) => (
                  <div
                    key={metric}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`p-2 rounded-full ${getPerformanceColor(
                          score
                        )}`}
                      >
                        {score >= 90 ? (
                          <Award className="h-4 w-4" />
                        ) : score >= 75 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-sm font-medium capitalize">
                        {metric.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                    <span className="text-sm font-bold">{score}%</span>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Goals</CardTitle>
              <CardDescription>
                Track your progress towards targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthData?.goals?.map((goal: any) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <span className="text-sm text-gray-500">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest milestones and awards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthData?.recentAchievements?.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-full bg-yellow-100 mt-1">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge variant="outline" className="text-yellow-600">
                          {achievement.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AgentHealth;
