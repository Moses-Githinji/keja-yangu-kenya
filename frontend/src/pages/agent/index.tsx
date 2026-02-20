import React, { useState, useEffect } from "react";
import {
  Building,
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import AddPropertyModal from "@/components/properties/AddPropertyModal";

const AgentDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const refreshDashboard = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // Fetch agent-specific stats
        const [propertiesResponse, earningsResponse] = await Promise.allSettled(
          [
            apiService.properties.getAll?.({
              agentId: user?.id,
              limit: 1000,
            }) ||
              Promise.resolve({
                data: { data: [], pagination: { totalDocs: 0 } },
              }),
            Promise.resolve({ data: { totalEarnings: 0, monthlyEarnings: 0 } }), // Mock earnings
          ]
        );

        const properties =
          propertiesResponse.status === "fulfilled"
            ? propertiesResponse.value.data.data
            : [];

        const dashboardStats = {
          totalProperties: properties.length,
          activeProperties: properties.filter((p: any) => p.status === "ACTIVE")
            .length,
          pendingProperties: properties.filter(
            (p: any) => p.status === "PENDING"
          ).length,
          soldProperties: properties.filter((p: any) => p.status === "SOLD")
            .length,
          totalViews: properties.reduce(
            (sum: number, p: any) => sum + (p.views || 0),
            0
          ),
          totalEarnings:
            earningsResponse.status === "fulfilled"
              ? earningsResponse.value.data.totalEarnings
              : 0,
          monthlyEarnings:
            earningsResponse.status === "fulfilled"
              ? earningsResponse.value.data.monthlyEarnings
              : 0,
          monthlyGrowth: 8.5, // Mock growth percentage
        };

        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardStats();
    }
  }, [user?.id, toast, refreshKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "SOLD":
      case "RENTED":
        return "text-blue-600 bg-blue-50";
      case "INACTIVE":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}! Here's your property portfolio
            overview.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Properties
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalProperties || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeProperties || 0} active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all your properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {(stats?.monthlyEarnings || 0).toLocaleString()}
              </div>
              <p className="text-xs text-green-600">
                +{stats?.monthlyGrowth || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalProperties > 0
                  ? Math.round(
                      (stats.soldProperties / stats.totalProperties) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Properties sold/rented
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Property Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Listings
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeProperties || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently live on platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approval
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.pendingProperties || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting admin review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold/Rented</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.soldProperties || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully closed deals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common agent tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => setIsAddPropertyModalOpen(true)}
                  className="p-4 h-auto justify-start"
                  variant="outline"
                >
                  <Plus className="h-6 w-6 text-blue-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Add New Property</div>
                    <div className="text-sm text-gray-500">
                      List a new property for sale or rent
                    </div>
                  </div>
                </Button>
                <Button
                  onClick={() => (window.location.href = "/agent/properties")}
                  className="p-4 h-auto justify-start"
                  variant="outline"
                >
                  <Building className="h-6 w-6 text-green-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Properties</div>
                    <div className="text-sm text-gray-500">
                      View and edit your property listings
                    </div>
                  </div>
                </Button>
                <Button
                  onClick={() => (window.location.href = "/agent/finance")}
                  className="p-4 h-auto justify-start"
                  variant="outline"
                >
                  <BarChart3 className="h-6 w-6 text-orange-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View Earnings</div>
                    <div className="text-sm text-gray-500">
                      Check your commission and payouts
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest property activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New property listed</p>
                    <p className="text-xs text-gray-500">
                      Modern 3BR Apartment in Westlands
                    </p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Property viewed</p>
                    <p className="text-xs text-gray-500">
                      5-bedroom villa received 15 views
                    </p>
                    <p className="text-xs text-gray-400">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Inquiry received</p>
                    <p className="text-xs text-gray-500">
                      New inquiry for commercial space
                    </p>
                    <p className="text-xs text-gray-400">6 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Commission earned</p>
                    <p className="text-xs text-gray-500">
                      KES 25,000 from property sale
                    </p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
        onSuccess={() => {
          refreshDashboard();
          toast({
            title: "Success",
            description: "Property added successfully",
            variant: "default",
          });
        }}
      />
    </AdminLayout>
  );
};

export default AgentDashboard;
