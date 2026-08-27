"use client";

import { useHrms } from "@/contexts/hrms-context";
import { AdminModuleTab } from "@/types/hrms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Building2,
  Calendar,
  FolderKanban,
  Briefcase,
  AlertTriangle,
  UserPlus,
  FileText,
  PlusCircle,
  BarChart3,
  ChevronRight,
  Clock,
  Shield,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface DashboardProps {
  setActiveTab: (tab: AdminModuleTab) => void;
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const {
    employees,
    departments,
    leaveRequests,
    projects,
    jobRequisitions,
    disciplinaryCases,
    auditLogs,
  } = useHrms();

  const activeEmployees = employees.filter((e) => e.status === "active");
  const activeDepartments = departments.filter((d) => d.isActive);
  const pendingLeaveRequests = leaveRequests.filter((l) => l.status === "pending");
  const activeProjects = projects.filter((p) => p.status === "active");
  const openRequisitions = jobRequisitions.filter(
    (r) => r.status === "pending_approval" || r.status === "approved"
  );
  const openCases = disciplinaryCases.filter(
    (c) =>
      c.status === "open" ||
      c.status === "under_investigation" ||
      c.status === "hearing_scheduled" ||
      c.status === "escalated"
  );

  const recentEmployees = [...employees]
    .sort(
      (a, b) =>
        new Date(b.dateOfJoining).getTime() - new Date(a.dateOfJoining).getTime()
    )
    .slice(0, 5);

  const recentAuditLogs = [...auditLogs]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5);

  const metricCards = [
    {
      title: "Total Employees",
      value: activeEmployees.length,
      icon: Users,
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Departments",
      value: activeDepartments.length,
      icon: Building2,
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Pending Leave Requests",
      value: pendingLeaveRequests.length,
      icon: Calendar,
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Active Projects",
      value: activeProjects.length,
      icon: FolderKanban,
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Open Job Requisitions",
      value: openRequisitions.length,
      icon: Briefcase,
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Disciplinary Cases Open",
      value: openCases.length,
      icon: AlertTriangle,
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      iconColor: "text-red-600",
    },
  ];

  const quickActions = [
    {
      title: "Add Employee",
      tab: "employee-hris" as AdminModuleTab,
      icon: UserPlus,
      color: "text-blue-600",
    },
    {
      title: "Create Leave Policy",
      tab: "leave-management" as AdminModuleTab,
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "New Job Requisition",
      tab: "recruitment" as AdminModuleTab,
      icon: PlusCircle,
      color: "text-purple-600",
    },
    {
      title: "View Reports",
      tab: "reports-analytics" as AdminModuleTab,
      icon: BarChart3,
      color: "text-indigo-600",
    },
  ];

  const leaveStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    resumption_pending: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const employeeStatusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    on_leave: "bg-yellow-100 text-yellow-800 border-yellow-200",
    terminated: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">HRMS Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Overview of your human resource management system.
        </p>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-xl font-bold">{card.value}</p>
                  </div>
                  <div className={cn("p-2 rounded-lg", card.bg)}>
                    <Icon className={cn("h-4 w-4", card.iconColor)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Row 2: Recent Employees + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">
                        {emp.employeeId}
                      </TableCell>
                      <TableCell>
                        {emp.firstName} {emp.lastName}
                      </TableCell>
                      <TableCell>{emp.departmentName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize text-xs",
                            employeeStatusColors[emp.status] ||
                              "bg-gray-100 text-gray-800 border-gray-200"
                          )}
                        >
                          {emp.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(emp.dateOfJoining).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentEmployees.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-4"
                      >
                        No employees found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.tab}
                    variant="outline"
                    className="justify-between h-auto py-3"
                    onClick={() => setActiveTab(action.tab)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", action.color)} />
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Leave Requests Overview + Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Requests Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Requests Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeaveRequests.slice(0, 5).map((lr) => (
                    <TableRow key={lr.id}>
                      <TableCell className="font-medium">
                        {lr.employeeName}
                      </TableCell>
                      <TableCell>{lr.leaveTypeName}</TableCell>
                      <TableCell className="text-right">{lr.days}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize text-xs",
                            leaveStatusColors[lr.status] ||
                              "bg-gray-100 text-gray-800 border-gray-200"
                          )}
                        >
                          {lr.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingLeaveRequests.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-4"
                      >
                        No pending leave requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Audit Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAuditLogs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No recent audit activity.
                </p>
              )}
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 p-1.5 rounded-md bg-gray-100">
                    <Shield className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.userName} &middot; {log.module}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{getRelativeTime(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
