import React, { useState } from "react";
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
import { ArrowLeft, Download, CreditCard, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const Billing: React.FC = () => {
  return (
    <AdminLayout>
      <BillingContent />
    </AdminLayout>
  );
};

const BillingContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"invoices" | "payments">(
    "invoices"
  );

  const invoices = [
    {
      id: "INV-001",
      date: "2024-01-15",
      amount: 2500,
      status: "paid",
      description: "Premium listing fee - 3 Bedroom Apartment",
    },
    {
      id: "INV-002",
      date: "2024-01-10",
      amount: 1500,
      status: "paid",
      description: "Featured listing upgrade",
    },
    {
      id: "INV-003",
      date: "2024-01-05",
      amount: 3200,
      status: "pending",
      description: "Monthly subscription",
    },
  ];

  const payments = [
    {
      id: "PAY-001",
      date: "2024-01-15",
      amount: 2500,
      method: "M-Pesa",
      status: "completed",
      reference: "REF123456",
    },
    {
      id: "PAY-002",
      date: "2024-01-10",
      amount: 1500,
      method: "Card",
      status: "completed",
      reference: "REF123457",
    },
    {
      id: "PAY-003",
      date: "2024-01-05",
      amount: 3200,
      method: "Bank Transfer",
      status: "pending",
      reference: "REF123458",
    },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: "KES 7,200",
      description: "This month",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Pending Payments",
      value: "KES 3,200",
      description: "Awaiting payment",
      icon: CreditCard,
      color: "text-yellow-600",
    },
    {
      title: "Paid Invoices",
      value: "4,001",
      description: "This month",
      icon: Download,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">
          Manage invoices and payment records
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-4">
            <Button
              variant={activeTab === "invoices" ? "default" : "outline"}
              onClick={() => setActiveTab("invoices")}
            >
              Invoices
            </Button>
            <Button
              variant={activeTab === "payments" ? "default" : "outline"}
              onClick={() => setActiveTab("payments")}
            >
              Payments
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "invoices" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>KES {invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.reference}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
