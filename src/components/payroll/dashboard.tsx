"use client";

import { usePayroll } from "@/contexts/payroll-context";
import { PayrollModuleTab } from "@/types/payroll";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Award,
  DollarSign,
  AlertTriangle,
  Clock,
  PlayCircle,
  FileText,
  UserX,
  ChevronRight,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface DashboardProps {
  onNavigate?: (tab: PayrollModuleTab) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const {
    employees,
    payGroups,
    payGrades,
    payrollRuns,
    arrearRecords,
    offCycleUpdates,
  } = usePayroll();

  const activeEmployees = employees.filter((e) => e.status === "active");
  const activePayGroups = payGroups.filter((pg) => pg.isActive);
  const activePayGrades = payGrades.filter((pg) => pg.isActive);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const latestRuns = payrollRuns.filter((r) => {
    const d = new Date(r.startDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalMonthlyGross = latestRuns.reduce((sum, r) => sum + r.totalGross, 0);

  const pendingArrears = arrearRecords.filter((a) => a.status === "pending");
  const pendingArrearsSum = pendingArrears.reduce((sum, a) => sum + a.amount, 0);

  const pendingOffCycle = offCycleUpdates.filter((o) => o.status === "pending");

  const unverifiedAccounts = employees.filter(
    (e) => e.status === "active" && !e.accountVerified
  );

  const statusCounts = payrollRuns.reduce(
    (acc, run) => {
      acc[run.status] = (acc[run.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalRuns = payrollRuns.length || 1;
  const statusColors: Record<string, string> = {
    draft: "bg-gray-400",
    processing: "bg-blue-500",
    preview: "bg-yellow-500",
    completed: "bg-green-500",
    paid: "bg-emerald-600",
    cancelled: "bg-red-400",
  };

  const topPayGroups = [...activePayGroups]
    .sort((a, b) => b.employeeCount - a.employeeCount)
    .slice(0, 5);

  const recentActivity = [
    ...latestRuns.map((r) => ({
      id: r.id,
      action: `Payroll run "${r.name}" - ${r.status}`,
      time: r.processedAt || r.completedAt || r.paidAt || r.startDate,
      type: r.status as string,
    })),
    ...pendingArrears.slice(0, 2).map((a) => ({
      id: a.id,
      action: `Arrear pending for ${a.employeeName}`,
      time: a.effectiveDate,
      type: "arrear",
    })),
    ...pendingOffCycle.slice(0, 2).map((o) => ({
      id: o.id,
      action: `Off-cycle update for ${o.employeeName}`,
      time: o.createdAt,
      type: "off-cycle",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  const handleNavigate = (tab: PayrollModuleTab) => {
    onNavigate?.(tab);
  };

  const metricCards = [
    {
      title: "Total Employees",
      value: activeEmployees.length.toString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Pay Groups",
      value: activePayGroups.length.toString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Active Pay Grades",
      value: activePayGrades.length.toString(),
      icon: Award,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Total Monthly Payroll",
      value: formatCurrency(totalMonthlyGross),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Arrears",
      value: `${pendingArrears.length} (${formatCurrency(pendingArrearsSum)})`,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Off-Cycle Updates",
      value: pendingOffCycle.length.toString(),
      suffix: "pending",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Payroll Runs This Month",
      value: latestRuns.length.toString(),
      icon: PlayCircle,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Unverified Accounts",
      value: unverifiedAccounts.length.toString(),
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const quickActions = [
    { title: "Run Payroll", tab: "run-payroll" as PayrollModuleTab, icon: PlayCircle, color: "text-green-600" },
    { title: "Manage Employees", tab: "employees" as PayrollModuleTab, icon: Users, color: "text-blue-600" },
    { title: "Tax Configuration", tab: "tax-configuration" as PayrollModuleTab, icon: FileText, color: "text-purple-600" },
    { title: "Reports", tab: "reports" as PayrollModuleTab, icon: BarChart3, color: "text-indigo-600" },
    { title: "Off-Cycle Updates", tab: "off-cycle" as PayrollModuleTab, icon: ArrowUpRight, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payroll Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Overview of your payroll system status and key metrics.
        </p>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-xl font-bold">{card.value}</p>
                  </div>
                  <div className={cn("p-2 rounded-lg", card.bg)}>
                    <Icon className={cn("h-4 w-4", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Last payroll-related events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              )}
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.time).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Navigate to key sections</CardDescription>
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
                    onClick={() => handleNavigate(action.tab)}
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

        {/* Payroll Status Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Payroll Status Overview</CardTitle>
            <CardDescription>Distribution of payroll run statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => {
                const pct = totalRuns > 0 ? (count / totalRuns) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{status}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", statusColors[status] || "bg-gray-300")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(statusCounts).length === 0 && (
                <p className="text-sm text-muted-foreground">No payroll runs yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pay Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Pay Groups</CardTitle>
          <CardDescription>Pay groups by employee count with latest payroll info</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Pay Group</th>
                  <th className="pb-2 font-medium">Frequency</th>
                  <th className="pb-2 font-medium text-right">Employees</th>
                  <th className="pb-2 font-medium text-right">Latest Gross</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {topPayGroups.map((pg) => {
                  const latestRun = payrollRuns
                    .filter((r) => r.payGroupId === pg.id)
                    .sort(
                      (a, b) =>
                        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                    )[0];

                  return (
                    <tr key={pg.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{pg.name}</td>
                      <td className="py-3 capitalize">{pg.payFrequency}</td>
                      <td className="py-3 text-right">{pg.employeeCount}</td>
                      <td className="py-3 text-right">
                        {latestRun ? formatCurrency(latestRun.totalGross) : "-"}
                      </td>
                      <td className="py-3 text-right">
                        {latestRun ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize text-xs",
                              latestRun.status === "paid" && "border-green-300 text-green-700",
                              latestRun.status === "completed" && "border-blue-300 text-blue-700",
                              latestRun.status === "processing" && "border-yellow-300 text-yellow-700",
                              latestRun.status === "draft" && "border-gray-300 text-gray-700",
                              latestRun.status === "preview" && "border-purple-300 text-purple-700"
                            )}
                          >
                            {latestRun.status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {topPayGroups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No active pay groups.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
