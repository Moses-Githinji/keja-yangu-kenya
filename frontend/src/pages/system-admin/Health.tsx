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
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Server,
  Database,
  Mail,
  Cloud,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react";

interface SystemHealth {
  overall: {
    status: string;
    uptime: string;
    responseTime: string;
    lastChecked: string;
  };
  services: Array<{
    name: string;
    status: string;
    uptime: string;
    responseTime: string;
    lastChecked: string;
    icon: any;
  }>;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

const AdminHealth: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: {
      status: "HEALTHY",
      uptime: "15 days, 8 hours",
      responseTime: "245ms",
      lastChecked: new Date().toISOString(),
    },
    services: [],
    metrics: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
    },
    alerts: [],
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockHealth = {
      overall: {
        status: "HEALTHY",
        uptime: "15 days, 8 hours",
        responseTime: "245ms",
        lastChecked: new Date().toISOString(),
      },
      services: [
        {
          name: "API Server",
          status: "HEALTHY",
          uptime: "99.8%",
          responseTime: "145ms",
          lastChecked: "2 minutes ago",
          icon: Server,
        },
        {
          name: "Database",
          status: "HEALTHY",
          uptime: "99.9%",
          responseTime: "23ms",
          lastChecked: "1 minute ago",
          icon: Database,
        },
        {
          name: "Email Service",
          status: "HEALTHY",
          uptime: "98.5%",
          responseTime: "890ms",
          lastChecked: "5 minutes ago",
          icon: Mail,
        },
        {
          name: "File Storage",
          status: "WARNING",
          uptime: "97.2%",
          responseTime: "1250ms",
          lastChecked: "3 minutes ago",
          icon: Cloud,
        },
      ],
      metrics: {
        cpu: 45,
        memory: 68,
        disk: 72,
        network: 23,
      },
      alerts: [
        {
          id: "1",
          type: "WARNING",
          message: "File storage response time is above threshold",
          timestamp: "2024-11-02T10:30:00Z",
          resolved: false,
        },
        {
          id: "2",
          type: "INFO",
          message: "Database backup completed successfully",
          timestamp: "2024-11-02T06:00:00Z",
          resolved: true,
        },
      ],
    };
    setSystemHealth(mockHealth);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Healthy
          </Badge>
        );
      case "WARNING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      case "CRITICAL":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Critical
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "CRITICAL":
        return <Badge variant="destructive">{type}</Badge>;
      case "WARNING":
        return <Badge variant="secondary">{type}</Badge>;
      case "INFO":
        return <Badge variant="outline">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const refreshHealth = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading system health...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-600 mt-2">
              Monitor system performance and service status
            </p>
          </div>
          <Button onClick={refreshHealth} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Overall Health Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Overall System Status
            </CardTitle>
            <CardDescription>
              Current health status of the entire platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mb-2">
                  {getStatusBadge(systemHealth.overall?.status)}
                </div>
                <p className="text-sm text-gray-600">System Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {systemHealth.overall?.uptime}
                </div>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {systemHealth.overall?.responseTime}
                </div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">
                  Last checked
                </div>
                <p className="text-sm text-gray-600">
                  {systemHealth.overall?.lastChecked
                    ? new Date(
                        systemHealth.overall.lastChecked
                      ).toLocaleTimeString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {systemHealth.services?.map((service, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <service.icon className="w-4 h-4" />
                  {service.name}
                </CardTitle>
                {getStatusBadge(service.status)}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uptime:</span>
                    <span className="font-medium">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Response Time:</span>
                    <span className="font-medium">{service.responseTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Checked:</span>
                    <span className="font-medium">{service.lastChecked}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Current resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    CPU Usage
                  </span>
                  <span className="text-sm text-gray-600">
                    {systemHealth.metrics?.cpu}%
                  </span>
                </div>
                <Progress value={systemHealth.metrics?.cpu} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Memory Usage
                  </span>
                  <span className="text-sm text-gray-600">
                    {systemHealth.metrics?.memory}%
                  </span>
                </div>
                <Progress
                  value={systemHealth.metrics?.memory}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Disk Usage
                  </span>
                  <span className="text-sm text-gray-600">
                    {systemHealth.metrics?.disk}%
                  </span>
                </div>
                <Progress value={systemHealth.metrics?.disk} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Network I/O
                  </span>
                  <span className="text-sm text-gray-600">
                    {systemHealth.metrics?.network}%
                  </span>
                </div>
                <Progress
                  value={systemHealth.metrics?.network}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>
              Recent system events and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.alerts?.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getAlertBadge(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {alert.resolved ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminHealth;
