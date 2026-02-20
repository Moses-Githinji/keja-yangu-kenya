import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface AgentApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  licenseNumber: string;
  experience: string;
  specializations: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  approvedAt?: string;
}

const AgentApplications: React.FC = () => {
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<AgentApplication | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiService.agents.getApplications({
        status: statusFilter === "all" ? "ALL" : statusFilter,
        search: searchTerm,
      });

      if (response.data.status === "success") {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load agent applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: "APPROVED" | "REJECTED"
  ) => {
    try {
      if (newStatus === "APPROVED") {
        await apiService.agents.approveApplication(applicationId);
      } else {
        await apiService.agents.rejectApplication(applicationId, "Application rejected by administrator");
      }

      // Refresh list after update
      fetchApplications();

      toast({
        title: "Success",
        description: `Application ${newStatus.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = `${app.firstName} ${app.lastName} ${app.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "PENDING").length,
    approved: applications.filter((app) => app.status === "APPROVED").length,
    rejected: applications.filter((app) => app.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Agent Applications
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage agent registration applications
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
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              Review and manage agent applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium">
                        {application.firstName} {application.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {application.email}
                      </div>
                      <div className="text-sm text-gray-600">
                        {application.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {application.company || "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      {new Date(application.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Application Details</DialogTitle>
                              <DialogDescription>
                                Review the agent application details
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApplication && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      Full Name
                                    </label>
                                    <p>
                                      {selectedApplication.firstName}{" "}
                                      {selectedApplication.lastName}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Email
                                    </label>
                                    <p>{selectedApplication.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Phone
                                    </label>
                                    <p>{selectedApplication.phone}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Status
                                    </label>
                                    <div>
                                      {getStatusBadge(
                                        selectedApplication.status
                                      )}
                                    </div>
                                  </div>
                                </div>

                                  {selectedApplication.company && (
                                    <div className="space-y-4">
                                      <h4 className="font-medium">
                                        Agent Profile
                                      </h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">
                                            Company
                                          </label>
                                          <p>
                                            {selectedApplication.company}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">
                                            License Number
                                          </label>
                                          <p>
                                            {selectedApplication.licenseNumber}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">
                                            Experience
                                          </label>
                                          <p>
                                            {selectedApplication.experience}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">
                                            Specialization
                                          </label>
                                          <p>
                                            {selectedApplication.specializations?.join(
                                              ", "
                                            ) || "None"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {selectedApplication.status === "PENDING" && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          selectedApplication.id,
                                          "APPROVED"
                                        )
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <UserCheck className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          selectedApplication.id,
                                          "REJECTED"
                                        )
                                      }
                                      variant="destructive"
                                    >
                                      <UserX className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {application.status === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(application.id, "APPROVED")
                              }
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(application.id, "REJECTED")
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredApplications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No applications found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AgentApplications;
