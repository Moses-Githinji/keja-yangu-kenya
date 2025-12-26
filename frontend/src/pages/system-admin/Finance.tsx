import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Download,
  Calendar,
  BarChart3,
} from "lucide-react";

const AdminFinance: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTransactions = [
      {
        id: "1",
        type: "REVENUE",
        amount: 250000,
        description: "Premium listing fee - Modern Family Home",
        user: "John Kamau",
        date: "2024-11-01",
        status: "COMPLETED",
        method: "MPESA",
      },
      {
        id: "2",
        type: "REVENUE",
        amount: 150000,
        description: "Agent commission - Apartment sale",
        user: "Grace Wanjiku",
        date: "2024-10-30",
        status: "COMPLETED",
        method: "BANK_TRANSFER",
      },
      {
        id: "3",
        type: "EXPENSE",
        amount: -50000,
        description: "Server maintenance costs",
        user: "System",
        date: "2024-10-28",
        status: "COMPLETED",
        method: "BANK_TRANSFER",
      },
      {
        id: "4",
        type: "REVENUE",
        amount: 75000,
        description: "Ad revenue - Property impressions",
        user: "System",
        date: "2024-10-25",
        status: "PENDING",
        method: "STRIPE",
      },
    ];
    setTransactions(mockTransactions);
    setLoading(false);
  }, []);

  const stats = {
    totalRevenue: 4250000,
    monthlyRevenue: 1250000,
    totalExpenses: 150000,
    netProfit: 4100000,
    pendingPayments: 75000,
    transactions: transactions.length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string, amount: number) => {
    if (type === "REVENUE") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          Revenue
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <TrendingDown className="w-3 h-3 mr-1" />
          Expense
        </Badge>
      );
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor revenue, expenses, and financial performance
          </p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">After expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.pendingPayments)}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sources</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Premium Listings</span>
                  <span className="font-medium">{formatCurrency(2100000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Agent Commissions</span>
                  <span className="font-medium">{formatCurrency(1500000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ad Revenue</span>
                  <span className="font-medium">{formatCurrency(500000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Other</span>
                  <span className="font-medium">{formatCurrency(150000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">M-Pesa</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bank Transfer</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Card Payment</span>
                  <span className="font-medium">8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cash</span>
                  <span className="font-medium">2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Transaction History</h3>
                <p className="text-sm text-gray-600">
                  Recent financial transactions
                </p>
              </div>
              <div className="flex gap-4">
                <Select value={period} onValueChange={setPeriod}>
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
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {getTypeBadge(transaction.type, transaction.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell>{transaction.user}</TableCell>
                      <TableCell
                        className={`font-medium ${
                          transaction.amount < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.method}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFinance;
