import React, { useState, useEffect } from "react";
import {
  Building,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Plus,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useNavigate } from "react-router-dom";

const AgentProperties: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await apiService.properties.getAll({
          search: searchQuery,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          propertyType: typeFilter !== "ALL" ? typeFilter : undefined,
          agentId: user?.id, // Only fetch agent's own properties
          limit: 50,
        });
        setProperties(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProperties();
    }
  }, [searchQuery, statusFilter, typeFilter, toast, user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "SOLD":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sold
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApprove = async (propertyId: string) => {
    try {
      await apiService.properties.update(propertyId, { status: "ACTIVE" });
      setProperties((props) =>
        props.map((prop) =>
          prop.id === propertyId ? { ...prop, status: "ACTIVE" } : prop
        )
      );
      toast({
        title: "Success",
        description: "Property approved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve property",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (propertyId: string) => {
    try {
      await apiService.properties.update(propertyId, { status: "REJECTED" });
      setProperties((props) =>
        props.map((prop) =>
          prop.id === propertyId ? { ...prop, status: "REJECTED" } : prop
        )
      );
      toast({
        title: "Success",
        description: "Property rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject property",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "ACTIVE").length,
    pending: properties.filter((p) => p.status === "PENDING").length,
    sold: properties.filter((p) => p.status === "SOLD").length,
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Properties
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your property listings and track performance
              </p>
            </div>
            <Button onClick={() => navigate("/add-property")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Properties
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Listings
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
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
              <CardTitle className="text-sm font-medium">
                Sold Properties
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sold}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="HOUSE">House</SelectItem>
                  <SelectItem value="LAND">Land</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle>Properties ({properties.length})</CardTitle>
            <CardDescription>
              Manage property listings and approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading properties...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{property.title}</div>
                          <div className="text-sm text-gray-500">
                            ID: {property.id.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span>
                            {property.city}, {property.county}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{property.propertyType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          KES {property.price?.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {property.views || 0} views
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(property.status)}</TableCell>
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
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Property
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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

export default AgentProperties;
