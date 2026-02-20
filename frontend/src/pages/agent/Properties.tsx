import React, { useState, useEffect } from "react";
import api from "@/services/api";
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
import AddPropertyModal from "@/components/properties/AddPropertyModal";

const AgentProperties: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await apiService.properties.getAll({
          search: searchQuery || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          propertyType: typeFilter !== "ALL" ? typeFilter : undefined,
          agentId: user.id,
          limit: 50,
        });

        setProperties(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        toast({
          title: "Error",
          description: "Could not load your properties",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user?.id, searchQuery, statusFilter, typeFilter, refreshTrigger, toast]);

  const refreshProperties = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: string; icon: JSX.Element; label: string }
    > = {
      ACTIVE: {
        variant: "default",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Active",
      },
      PENDING: {
        variant: "secondary",
        icon: <Clock className="w-3 h-3 mr-1" />,
        label: "Pending",
      },
      SOLD: {
        variant: "outline",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Sold",
      },
      REJECTED: {
        variant: "destructive",
        icon: <XCircle className="w-3 h-3 mr-1" />,
        label: "Rejected",
      },
    };

    const config = variants[status] || {
      variant: "secondary",
      icon: null,
      label: status,
    };
    return (
      <Badge
        variant={config.variant as any}
        className="flex items-center gap-1"
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleApprove = async (propertyId: string) => {
    try {
      await apiService.properties.update(propertyId, { status: "ACTIVE" });
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: "ACTIVE" } : p))
      );
      toast({ title: "Success", description: "Property approved" });
    } catch {
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
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, status: "REJECTED" } : p
        )
      );
      toast({ title: "Success", description: "Property rejected" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to reject property",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const { dismiss } = toast({
      title: "Delete Property",
      description:
        "Are you sure you want to delete this property? This action cannot be undone.",
      variant: "destructive",
      action: (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              dismiss();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await api.properties.delete(propertyId);
                dismiss();
                toast({
                  title: "Success",
                  description: "Property deleted successfully",
                });
                refreshProperties();
              } catch (error) {
                console.error("Error deleting property:", error);
                const errorMessage = error.response?.data?.message || "Failed to delete property";
                toast({
                  title: "Error",
                  description: errorMessage,
                  variant: "destructive",
                });
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    });
  };

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "ACTIVE").length,
    pending: properties.filter((p) => p.status === "PENDING").length,
    sold: properties.filter((p) => p.status === "SOLD").length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        {/* Header + Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Properties</h1>
            <p className="text-muted-foreground mt-1">
              Manage your listings, track views and update status
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Properties"
            value={stats.total}
            icon={<Building />}
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={<CheckCircle />}
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={<Clock />}
          />
          <StatCard title="Sold" value={stats.sold} icon={<DollarSign />} />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
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
              View, edit, approve or delete your property listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading your properties...
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You haven't listed any properties yet.
              </div>
            ) : (
              <div className="rounded-md border">
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
                      <TableRow key={property.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{property.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            ID: {property.id.slice(-8).toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>
                              {property.city}, {property.county}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {property.propertyType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            KES {Number(property.price).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>{property.views || 0}</TableCell>
                        <TableCell>{getStatusBadge(property.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  (window.location.href = `/property/${property.id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  (window.location.href = `/property/${property.id}/edit`)
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  handleDeleteProperty(property.id)
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshProperties();
          toast({
            title: "Property Added",
            description: "Your new property has been successfully listed",
          });
        }}
      />
    </AdminLayout>
  );
};

// Helper component for stats cards
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default AgentProperties;
