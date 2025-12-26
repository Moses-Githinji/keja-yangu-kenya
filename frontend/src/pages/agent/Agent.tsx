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
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiService } from "@/services/api";

const AdminAgents: React.FC = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch agent applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await apiService.agents.getApplications({
          status: statusFilter,
          limit: 100, // Get all applications for now
        });

        if (response.status === "success") {
          setApplications(response.data);
        } else {
          console.error("Failed to fetch applications:", response.message);
          setApplications([]);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [statusFilter]);

  const filteredApplications = applications.filter((app) => {
    return statusFilter === "ALL" || app.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      // Call API to verify agent
      const response = await fetch(`/api/v1/agents/${applicationId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        // Update local state
        setApplications((apps) =>
          apps.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: "APPROVED",
                  approvedAt: new Date().toISOString().split("T")[0],
                }
              : app
          )
        );
      } else {
        console.error("Failed to approve agent");
      }
    } catch (error) {
      console.error("Error approving agent:", error);
    }
  };

  const handleReject = async (applicationId: string) => {
    // For now, we'll just update the local state
    // In a real implementation, you might want to add a rejection endpoint
    setApplications((apps) =>
      apps.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: "REJECTED",
              rejectedAt: new Date().toISOString().split("T")[0],
            }
          : app
      )
    );
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    approved: applications.filter((a) => a.status === "APPROVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Agent Applications
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage agent applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Applications</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
            <CardDescription>
              Review agent applications and make decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading applications...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Specializations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {app.firstName} {app.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{app.company}</TableCell>
                      <TableCell>{app.experience} years</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {app.specializations
                            .slice(0, 2)
                            .map((spec, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {spec}
                              </Badge>
                            ))}
                          {app.specializations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>{app.submittedAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {app.status === "PENDING" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApprove(app.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleReject(app.id)}
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
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

export default AdminAgents;
