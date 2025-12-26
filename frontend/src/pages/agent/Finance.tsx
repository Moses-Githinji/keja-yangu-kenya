import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  CreditCard,
  Receipt,
  Clock,
  Wallet,
  PiggyBank,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AgentFinance: React.FC = () => {
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        // Mock agent-specific finance data - replace with actual API calls
        const mockData = {
          totalEarnings: 450000,
          monthlyEarnings: 85000,
          availableBalance: 125000,
          pendingPayouts: 35000,
          totalCommissions: 12,
          monthlyCommissions: 3,
          averageCommission: 70833,
          earningsBreakdown: {
            propertySales: 320000,
            referrals: 85000,
            bonuses: 45000,
          },
          monthlyGrowth: 15.2,
          recentCommissions: [
            {
              id: "COMM001",
              property: "Modern 3BR Apartment in Westlands",
              amount: 125000,
              date: "2024-11-01",
              status: "paid",
              type: "Sale Commission",
            },
            {
              id: "COMM002",
              property: "Luxury Villa in Karen",
              amount: 95000,
              date: "2024-10-28",
              status: "paid",
              type: "Sale Commission",
            },
            {
              id: "COMM003",
              property: "Commercial Space in CBD",
              amount: 75000,
              date: "2024-10-25",
              status: "pending",
              type: "Lease Commission",
            },
          ],
          payoutHistory: [
            {
              id: "PAYOUT001",
              amount: 200000,
              date: "2024-10-31",
              method: "M-Pesa",
              status: "completed",
            },
            {
              id: "PAYOUT002",
              amount: 150000,
              date: "2024-09-30",
              method: "Bank Transfer",
              status: "completed",
            },
          ],
        };

        setFinanceData(mockData);
      } catch (error) {
        console.error("Error fetching finance data:", error);
        toast({
          title: "Error",
          description: "Failed to load financial data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFinanceData();
    }
  }, [timeRange, toast, user?.id]);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
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
            <h1 className="text-3xl font-bold text-gray-900">My Earnings</h1>
            <p className="text-gray-600 mt-2">
              Track your commissions, payouts, and financial performance
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
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
                {formatCurrency(financeData?.totalEarnings)}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+
                {financeData?.monthlyGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(financeData?.availableBalance)}
              </div>
              <p className="text-xs text-muted-foreground">Ready for payout</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Earnings
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(financeData?.monthlyEarnings)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month's commissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payouts
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(financeData?.pendingPayouts)}
              </div>
              <p className="text-xs text-muted-foreground">
                Processing payments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Earnings by Source</CardTitle>
              <CardDescription>
                Breakdown of your commission sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(financeData?.earningsBreakdown || {}).map(
                ([source, amount]: [string, any]) => (
                  <div
                    key={source}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium capitalize">
                        {source.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Summary</CardTitle>
              <CardDescription>Your performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Commissions</p>
                      <p className="text-xs text-gray-500">All time</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">
                    {financeData?.totalCommissions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Monthly Commissions</p>
                      <p className="text-xs text-gray-500">This month</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">
                    {financeData?.monthlyCommissions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <PiggyBank className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Average Commission</p>
                      <p className="text-xs text-gray-500">Per deal</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">
                    {formatCurrency(financeData?.averageCommission)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Commissions & Payouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Commissions</CardTitle>
              <CardDescription>Latest commission earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financeData?.recentCommissions?.map((commission: any) => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          commission.status === "paid"
                            ? "bg-green-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        {commission.status === "paid" ? (
                          <DollarSign className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {commission.property}
                        </p>
                        <p className="text-xs text-gray-500">
                          {commission.type} • {commission.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(commission.amount)}
                      </p>
                      <Badge
                        variant={
                          commission.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {commission.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Recent payments to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financeData?.payoutHistory?.map((payout: any) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payout.method}</p>
                        <p className="text-sm text-gray-500">
                          {payout.id} • {payout.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(payout.amount)}
                      </p>
                      <Badge variant="default">{payout.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AgentFinance;
