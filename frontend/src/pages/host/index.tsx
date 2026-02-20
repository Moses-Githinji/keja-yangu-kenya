import React, { useState, useEffect } from "react";
import {
  Home,
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
  Building,
  User,
  Settings,
  MessageSquare,
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

const HostDashboard: React.FC = () => {
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
        // Fetch host-specific stats
        const [propertiesResponse, earningsResponse] = await Promise.allSettled([
          apiService.properties.getAll?.({
            ownerId: user?.id,
            limit: 5,
          }),
          apiService.host?.getEarnings?.(user?.id),
        ]);

        const properties = propertiesResponse.status === 'fulfilled' ? propertiesResponse.value : [];
        const earnings = earningsResponse.status === 'fulfilled' ? earningsResponse.value : { total: 0, monthly: 0 };

        setStats({
          totalProperties: properties?.length || 0,
          activeListings: properties?.filter((p: any) => p.status === 'active')?.length || 0,
          pendingApprovals: properties?.filter((p: any) => p.status === 'pending')?.length || 0,
          totalEarnings: earnings?.total || 0,
          monthlyEarnings: earnings?.monthly || 0,
          recentProperties: properties || [],
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardStats();
    }
  }, [user?.id, refreshKey]);

  const handlePropertyAdded = () => {
    refreshDashboard();
    setIsAddPropertyModalOpen(false);
    toast({
      title: 'Success',
      description: 'Property added successfully',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-500">
              Welcome back, {user?.firstName}!
            </p>
          </div>
          <Button
            onClick={() => setIsAddPropertyModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Property
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeListings || 0} active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {stats?.totalEarnings?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                KES {stats?.monthlyEarnings?.toLocaleString() || '0'} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground">
                Properties awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalProperties > 0 
                  ? Math.round((stats.activeListings / stats.totalProperties) * 100) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Listing performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Properties */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>
                  Your most recently added or updated properties
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentProperties?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentProperties.map((property: any) => (
                  <div key={property.id} className="flex items-center p-4 border rounded-lg">
                    <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      <Home className="h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{property.title}</h3>
                        {getStatusBadge(property.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {property.location}
                      </p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span>KES {property.price?.toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span>{property.type}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first property.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => setIsAddPropertyModalOpen(true)}
                    className="inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Messages
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                View Earnings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Property "Luxury Apartment" was approved
                    </p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      New booking request for "Cozy Studio"
                    </p>
                    <p className="text-sm text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Payment received for booking #12345
                    </p>
                    <p className="text-sm text-gray-500">1 day ago</p>
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
        onSuccess={handlePropertyAdded}
        userId={user?.id}
      />
    </AdminLayout>
  );
};

export default HostDashboard;
