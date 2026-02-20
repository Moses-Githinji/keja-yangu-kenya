import React, { useState, useMemo } from "react";
import {
  DollarSign,
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
  CreditCard,
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
import { Button } from "@/components/ui/button";

// Types
interface Transaction {
  id: string;
  type: "REVENUE" | "EXPENSE" | "REFUND" | "WITHDRAWAL";
  amount: number;
  description: string;
  user: string;
  date: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: "MPESA" | "BANK_TRANSFER" | "CREDIT_CARD" | "OTHER";
}

const AdminFinance: React.FC = () => {
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "REVENUE",
      amount: 5000,
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
      amount: -25000, // ← negative for expenses
      description: "Server maintenance",
      user: "System",
      date: "2024-10-28",
      status: "COMPLETED",
      method: "BANK_TRANSFER",
    },
    {
      id: "4",
      type: "REVENUE",
      amount: 10000,
      description: "Premium listing fee - Luxury Villa",
      user: "David Ochieng",
      date: "2024-10-25",
      status: "PENDING",
      method: "MPESA",
    },
  ]);

  const [period, setPeriod] = useState("30d");

  // Computed stats
  const stats = useMemo(() => {
    const revenue = transactions
      .filter((t) => t.type === "REVENUE" && t.status === "COMPLETED")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.amount < 0 && t.status === "COMPLETED")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const pending = transactions
      .filter((t) => t.status === "PENDING")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalRevenue: revenue,
      monthlyRevenue: Math.round(revenue * 0.3), // dummy approximation
      netProfit: revenue - expenses,
      pendingPayments: pending,
    };
  }, [transactions]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIndicator = (type: string, amount: number) => {
    const isPositive = amount > 0;

    return (
      <Badge
        variant="outline"
        className={`
          flex items-center gap-1 px-3 py-1
          ${
            isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }
        `}
      >
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}
        {type}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Overview
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Track revenue, expenses, profit and pending transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                After expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <CreditCard className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.pendingPayments)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Period Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-medium">Transaction History</h3>
                <p className="text-sm text-muted-foreground">
                  Recent platform financial activity
                </p>
              </div>
              <div className="flex gap-3">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">Export CSV</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No transactions found in the selected period
              </div>
            ) : (
              <div className="rounded-md border">
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
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-muted/40">
                        <TableCell>
                          {getTypeIndicator(tx.type, tx.amount)}
                        </TableCell>
                        <TableCell className="font-medium max-w-md truncate">
                          {tx.description}
                        </TableCell>
                        <TableCell>{tx.user}</TableCell>
                        <TableCell
                          className={`font-semibold ${
                            tx.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(tx.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.method}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell>
                          {new Date(tx.date).toLocaleDateString("en-KE")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFinance;
