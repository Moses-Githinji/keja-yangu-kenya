import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign,
  TrendingUp,
  Eye,
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  BarChart3,
  Settings,
  Calendar,
  MapPin,
  Building,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ContentCreatorDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({});
  const [compliance, setCompliance] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

    if (user?.role !== "CONTENT_CREATOR") {
      navigate("/dashboard");
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, navigate, user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch profile, earnings, payouts, stats, and compliance data
      // This would be replaced with actual API calls
      const mockData = {
        profile: {
          id: "1",
          isEnrolled: true,
          enrollmentStatus: "APPROVED",
          totalEarnings: 2500.75,
          availableBalance: 850.25,
          totalPayouts: 1650.5,
          complianceScore: 95,
          viewRate: 0.01,
          inquiryRate: 0.5,
          premiumListingRate: 0.1,
          adRevenueRate: 0.7,
          minimumPayout: 100,
          enrollmentDate: "2024-01-01T00:00:00Z",
        },
        earnings: [
          {
            id: "1",
            propertyId: "1",
            earningsType: "VIEW_BASED",
            amount: 15.5,
            views: 1550,
            inquiries: 8,
            calculationDate: "2024-01-15T00:00:00Z",
            property: {
              title: "Modern 3-Bedroom Apartment",
              slug: "modern-3-bedroom-apartment",
              images: [{ url: "/api/placeholder/60/60" }],
            },
          },
          {
            id: "2",
            propertyId: "2",
            earningsType: "INQUIRY_BASED",
            amount: 25.0,
            views: 1200,
            inquiries: 50,
            calculationDate: "2024-01-14T00:00:00Z",
            property: {
              title: "Luxury Villa with Pool",
              slug: "luxury-villa-pool",
              images: [{ url: "/api/placeholder/60/60" }],
            },
          },
        ],
        payouts: [
          {
            id: "1",
            amount: 500.0,
            method: "MPESA",
            status: "COMPLETED",
            createdAt: "2024-01-10T00:00:00Z",
            processedAt: "2024-01-12T00:00:00Z",
            mpesaReference: "MPESA_REF_123456",
          },
          {
            id: "2",
            amount: 1150.5,
            method: "BANK_TRANSFER",
            status: "PENDING",
            createdAt: "2024-01-15T00:00:00Z",
          },
        ],
        stats: {
          period: "30 days",
          totalEarnings: 2500.75,
          earningsCount: 15,
          totalPayouts: 1650.5,
          payoutsCount: 3,
          activeProperties: 5,
          totalViews: 15000,
          totalInquiries: 250,
        },
        compliance: {
          violations: {
            total: 2,
            resolved: 1,
            unresolved: 1,
            bySeverity: { LOW: 1, MEDIUM: 1, HIGH: 0, CRITICAL: 0 },
            byType: { MISLEADING_INFORMATION: 1, SPAM: 1 },
          },
          profile: {
            complianceScore: 95,
            lastComplianceCheck: "2024-01-15T00:00:00Z",
            enrollmentStatus: "APPROVED",
          },
        },
      };

      setProfile(mockData.profile);
      setEarnings(mockData.earnings);
      setPayouts(mockData.payouts);
      setStats(mockData.stats);
      setCompliance(mockData.compliance);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      // This would be an actual API call
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request payout",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "SUSPENDED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPayoutStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Content Creator Profile Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              You need to enroll as a content creator to access this dashboard.
            </p>
            <Button onClick={() => navigate("/content-creators/enroll")}>
              Enroll Now
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <h1 className="text-4xl font-bold">Content Creator Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Monitor your earnings, manage payouts, and track compliance
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Earnings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES {profile.totalEarnings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.totalEarnings} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Balance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES {profile.availableBalance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready for payout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Score
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.complianceScore}/100
                </div>
                <Progress value={profile.complianceScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Properties
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.activeProperties}
                </div>
                <p className="text-xs text-muted-foreground">
                  Generating revenue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your content creator account
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button
                    onClick={handleRequestPayout}
                    disabled={profile.availableBalance < profile.minimumPayout}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Request Payout</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Add Property</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Earnings</CardTitle>
                    <CardDescription>
                      Your latest property earnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {earnings.slice(0, 5).map((earning) => (
                          <div
                            key={earning.id}
                            className="flex items-center space-x-3"
                          >
                            <img
                              src={earning.property.images[0]?.url}
                              alt={earning.property.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {earning.property.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  earning.calculationDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                KES {earning.amount}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {earning.earningsType.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Your content performance this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Total Views</span>
                      </div>
                      <span className="font-medium">
                        {stats.totalViews.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Total Inquiries</span>
                      </div>
                      <span className="font-medium">
                        {stats.totalInquiries.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Earnings Count</span>
                      </div>
                      <span className="font-medium">{stats.earningsCount}</span>
                    </div>
                    <Separator />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        KES {stats.totalEarnings.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Earnings
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings History</CardTitle>
                  <CardDescription>
                    Track your property earnings over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {earnings.map((earning) => (
                        <div
                          key={earning.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg"
                        >
                          <img
                            src={earning.property.images[0]?.url}
                            alt={earning.property.title}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {earning.property.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{earning.views.toLocaleString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{earning.inquiries}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(
                                    earning.calculationDate
                                  ).toLocaleDateString()}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              KES {earning.amount.toFixed(2)}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {earning.earningsType.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Payout History</CardTitle>
                      <CardDescription>
                        Track your payout requests and transactions
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleRequestPayout}
                      disabled={
                        profile.availableBalance < profile.minimumPayout
                      }
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Request Payout</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <span className="font-medium">
                              KES {payout.amount.toFixed(2)}
                            </span>
                          </div>
                          <Badge
                            className={getPayoutStatusColor(payout.status)}
                          >
                            {payout.status}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </p>
                          <p className="capitalize">
                            {payout.method.toLowerCase().replace("_", " ")}
                          </p>
                          {payout.mpesaReference && (
                            <p className="text-xs">
                              Ref: {payout.mpesaReference}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Overview</CardTitle>
                  <CardDescription>
                    Monitor your compliance score and violations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Compliance Score */}
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {profile.complianceScore}/100
                    </div>
                    <Progress value={profile.complianceScore} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Last checked:{" "}
                      {new Date(
                        compliance.profile.lastComplianceCheck
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <Separator />

                  {/* Violations Summary */}
                  <div>
                    <h4 className="font-medium mb-4">Violations Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {compliance.violations.total}
                        </div>
                        <div className="text-sm text-red-600">Total</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {compliance.violations.resolved}
                        </div>
                        <div className="text-sm text-green-600">Resolved</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {compliance.violations.unresolved}
                        </div>
                        <div className="text-sm text-yellow-600">
                          Unresolved
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {profile.complianceScore}
                        </div>
                        <div className="text-sm text-blue-600">Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Violation Types */}
                  <div>
                    <h4 className="font-medium mb-4">Violation Types</h4>
                    <div className="space-y-3">
                      {Object.entries(compliance.violations.byType).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="capitalize">
                              {type.toLowerCase().replace("_", " ")}
                            </span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ContentCreatorDashboard;
