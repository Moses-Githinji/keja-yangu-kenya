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
import { Input } from "@/components/ui/input";
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
  Search,
  Home,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminProperties: React.FC = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProperties = [
      {
        id: "1",
        title: "Modern Family Home in Westlands",
        propertyType: "HOUSE",
        listingType: "SALE",
        price: 25000000,
        city: "Nairobi",
        status: "ACTIVE",
        isVerified: true,
        isPremium: true,
        views: 245,
        ownerName: "John Kamau",
        createdAt: "2024-10-15",
      },
      {
        id: "2",
        title: "Luxury Apartment in Kilimani",
        propertyType: "APARTMENT",
        listingType: "RENT",
        price: 85000,
        city: "Nairobi",
        status: "PENDING",
        isVerified: false,
        isPremium: false,
        views: 89,
        ownerName: "Grace Wanjiku",
        createdAt: "2024-11-01",
      },
      {
        id: "3",
        title: "Commercial Office Space",
        propertyType: "COMMERCIAL",
        listingType: "SALE",
        price: 45000000,
        city: "Mombasa",
        status: "ACTIVE",
        isVerified: true,
        isPremium: false,
        views: 156,
        ownerName: "Peter Ochieng",
        createdAt: "2024-09-20",
      },
      {
        id: "4",
        title: "Student Hostel in Westlands",
        propertyType: "STUDENT_HOSTEL",
        listingType: "RENT",
        price: 12000,
        city: "Nairobi",
        status: "INACTIVE",
        isVerified: true,
        isPremium: true,
        views: 78,
        ownerName: "Mary Njeri",
        createdAt: "2024-08-10",
      },
    ];
    setProperties(mockProperties);
    setLoading(false);
  }, []);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);

    return listingType === "RENT" ? `${formatted}/month` : formatted;
  };

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "ACTIVE").length,
    pending: properties.filter((p) => p.status === "PENDING").length,
    inactive: properties.filter((p) => p.status === "INACTIVE").length,
    premium: properties.filter((p) => p.isPremium).length,
    verified: properties.filter((p) => p.isVerified).length,
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Property Oversight
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage property listings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Properties
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
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
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premium}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Properties</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle>Properties ({filteredProperties.length})</CardTitle>
            <CardDescription>
              Manage property listings and monitor performance
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
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{property.title}</div>
                          <div className="text-sm text-gray-500">
                            {property.listingType} • {property.propertyType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{property.propertyType}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(property.price, property.listingType)}
                      </TableCell>
                      <TableCell>{property.city}</TableCell>
                      <TableCell>{property.ownerName}</TableCell>
                      <TableCell>{getStatusBadge(property.status)}</TableCell>
                      <TableCell>{property.views}</TableCell>
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

export default AdminProperties;
