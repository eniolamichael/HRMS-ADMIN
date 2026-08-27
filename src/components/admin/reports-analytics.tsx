"use client";

import { useState, useMemo } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { HRReport, ReportSchedule, DashboardChart, AuditLog } from "@/types/hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  FileText,
  Download,
  Loader2,
  Copy,
  Play,
  Clock,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Circle,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  GripVertical,
  Eye,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

const MODULES = [
  "Employee",
  "Leave",
  "Attendance",
  "Recruitment",
  "Payroll",
  "Performance",
  "Promotion",
  "Exit",
  "Learning",
  "Disciplinary",
  "Asset",
  "Survey",
];

const REPORT_TYPES = ["summary", "detailed", "analytical", "comparative", "trend"];

const MODULE_FIELDS: Record<string, string[]> = {
  Employee: ["Name", "Email", "Department", "Job Role", "Status", "Date of Joining", "Employment Type"],
  Leave: ["Employee", "Leave Type", "Start Date", "End Date", "Days", "Status", "Reason"],
  Attendance: ["Employee", "Date", "Clock In", "Clock Out", "Hours Worked", "Status"],
  Recruitment: ["Position", "Department", "Vacancies", "Status", "Raised By", "Date"],
  Payroll: ["Employee", "Basic Salary", "Allowances", "Deductions", "Net Pay", "Period"],
  Performance: ["Employee", "Cycle", "Score", "Status", "Reviewer", "Comments"],
  Promotion: ["Employee", "Current Grade", "Proposed Grade", "Proposed Salary", "Status", "Date"],
  Exit: ["Employee", "Mode", "Last Working Day", "Status", "Initiated By", "Date"],
  Learning: ["Course", "Category", "Duration", "Instructor", "Enrolled", "Status"],
  Disciplinary: ["Employee", "Offense", "Severity", "Status", "Case Number", "Date"],
  Asset: ["Name", "Category", "Serial Number", "Status", "Assigned To", "Location"],
  Survey: ["Name", "Description", "Questions", "Status", "Responses", "Start Date"],
};

const CHART_TYPES: DashboardChart["chartType"][] = ["bar", "line", "pie", "doughnut"];

export default function ReportsAnalytics() {
  const {
    hrReports,
    addHrReport,
    updateHrReport,
    deleteHrReport,
    reportSchedules,
    addReportSchedule,
    updateReportSchedule,
    deleteReportSchedule,
    dashboardCharts,
    addDashboardChart,
    updateDashboardChart,
    deleteDashboardChart,
    auditLogs,
    addAuditLog,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("reports");
  const [reportSearch, setReportSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditModuleFilter, setAuditModuleFilter] = useState("all");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteScheduleConfirmId, setDeleteScheduleConfirmId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [labelDialogChartId, setLabelDialogChartId] = useState<string | null>(null);
  const [labelText, setLabelText] = useState("");

  const defaultReportForm = {
    name: "",
    description: "",
    module: "",
    type: "",
    fields: [] as string[],
    filters: {} as Record<string, string>,
  };

  const defaultScheduleForm = {
    reportId: "",
    frequency: "weekly" as ReportSchedule["frequency"],
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: "09:00",
    recipients: [] as { userId: string; name: string; email: string }[],
    externalRecipients: [] as string[],
    isActive: true,
  };

  const [reportForm, setReportForm] = useState(defaultReportForm);
  const [scheduleForm, setScheduleForm] = useState(defaultScheduleForm);
  const [newExternalEmail, setNewExternalEmail] = useState("");

  // ── Reports Tab ─────────────────────────────────────────────────────────

  const filteredReports = useMemo(() => {
    return hrReports.filter((r) => {
      const matchSearch =
        reportSearch === "" ||
        r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(reportSearch.toLowerCase());
      const matchModule = moduleFilter === "all" || r.module === moduleFilter;
      return matchSearch && matchModule;
    });
  }, [hrReports, reportSearch, moduleFilter]);

  const openCreateReport = () => {
    setEditingReportId(null);
    setReportForm(defaultReportForm);
    setReportDialogOpen(true);
  };

  const openEditReport = (report: HRReport) => {
    setEditingReportId(report.id);
    setReportForm({
      name: report.name,
      description: report.description,
      module: report.module,
      type: report.type,
      fields: [...report.fields],
      filters: { ...report.filters },
    });
    setReportDialogOpen(true);
  };

  const handleSaveReport = () => {
    if (!reportForm.name || !reportForm.module || !reportForm.type) return;

    if (editingReportId) {
      updateHrReport(editingReportId, {
        name: reportForm.name,
        description: reportForm.description,
        module: reportForm.module,
        type: reportForm.type,
        fields: reportForm.fields,
        filters: reportForm.filters,
      });
    } else {
      addHrReport({
        name: reportForm.name,
        description: reportForm.description,
        module: reportForm.module,
        type: reportForm.type,
        fields: reportForm.fields,
        filters: reportForm.filters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setReportDialogOpen(false);
  };

  const handleDuplicateReport = (report: HRReport) => {
    addHrReport({
      name: `${report.name} (Copy)`,
      description: report.description,
      module: report.module,
      type: report.type,
      fields: [...report.fields],
      filters: { ...report.filters },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleGenerateReport = (id: string) => {
    setGeneratingId(id);
    setTimeout(() => {
      updateHrReport(id, { lastGenerated: new Date().toISOString() });
      setGeneratingId(null);
      addAuditLog({
        userId: "admin-1",
        userName: "Admin User",
        action: "Generate Report",
        module: "Reports",
        details: `Generated report: ${hrReports.find((r) => r.id === id)?.name}`,
        ipAddress: "192.168.1.1",
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleDeleteReport = (id: string) => {
    deleteHrReport(id);
    setDeleteConfirmId(null);
  };

  const toggleReportField = (field: string) => {
    setReportForm((s) => ({
      ...s,
      fields: s.fields.includes(field) ? s.fields.filter((f) => f !== field) : [...s.fields, field],
    }));
  };

  const typeBadgeClass = (type: string) => {
    switch (type) {
      case "summary":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "detailed":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "analytical":
        return "bg-green-100 text-green-700 border-green-200";
      case "comparative":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "trend":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ── Scheduled Reports Tab ───────────────────────────────────────────────

  const handleSaveSchedule = () => {
    if (!scheduleForm.reportId) return;

    const report = hrReports.find((r) => r.id === scheduleForm.reportId);
    if (!report) return;

    if (editingScheduleId) {
      updateReportSchedule(editingScheduleId, {
        reportId: scheduleForm.reportId,
        reportName: report.name,
        frequency: scheduleForm.frequency,
        dayOfWeek: scheduleForm.dayOfWeek,
        dayOfMonth: scheduleForm.dayOfMonth,
        time: scheduleForm.time,
        recipients: [...scheduleForm.recipients],
        externalRecipients: [...scheduleForm.externalRecipients],
        isActive: scheduleForm.isActive,
      });
    } else {
      addReportSchedule({
        reportId: scheduleForm.reportId,
        reportName: report.name,
        frequency: scheduleForm.frequency,
        dayOfWeek: scheduleForm.dayOfWeek,
        dayOfMonth: scheduleForm.dayOfMonth,
        time: scheduleForm.time,
        recipients: [...scheduleForm.recipients],
        externalRecipients: [...scheduleForm.externalRecipients],
        isActive: scheduleForm.isActive,
        createdAt: new Date().toISOString(),
      });
    }
    setScheduleDialogOpen(false);
  };

  const openCreateSchedule = () => {
    setEditingScheduleId(null);
    setScheduleForm(defaultScheduleForm);
    setScheduleDialogOpen(true);
  };

  const openEditSchedule = (schedule: ReportSchedule) => {
    setEditingScheduleId(schedule.id);
    setScheduleForm({
      reportId: schedule.reportId,
      frequency: schedule.frequency,
      dayOfWeek: schedule.dayOfWeek ?? 1,
      dayOfMonth: schedule.dayOfMonth ?? 1,
      time: schedule.time,
      recipients: [...schedule.recipients],
      externalRecipients: [...schedule.externalRecipients],
      isActive: schedule.isActive,
    });
    setScheduleDialogOpen(true);
  };

  const handleDeleteSchedule = (id: string) => {
    deleteReportSchedule(id);
    setDeleteScheduleConfirmId(null);
  };

  const toggleScheduleActive = (id: string, active: boolean) => {
    updateReportSchedule(id, { isActive: active });
  };

  const addExternalRecipient = () => {
    if (!newExternalEmail.trim()) return;
    setScheduleForm((s) => ({
      ...s,
      externalRecipients: [...s.externalRecipients, newExternalEmail.trim()],
    }));
    setNewExternalEmail("");
  };

  const removeExternalRecipient = (email: string) => {
    setScheduleForm((s) => ({
      ...s,
      externalRecipients: s.externalRecipients.filter((e) => e !== email),
    }));
  };

  // ── Dashboards Tab ──────────────────────────────────────────────────────

  const handleMoveChart = (id: string, direction: "up" | "down") => {
    const idx = dashboardCharts.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const swapped = [...dashboardCharts];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= swapped.length) return;
    [swapped[idx], swapped[targetIdx]] = [swapped[targetIdx], swapped[idx]];
    swapped.forEach((c, i) => updateDashboardChart(c.id, { position: { ...c.position, x: i } }));
  };

  const handleResizeChart = (id: string, size: "small" | "medium" | "large") => {
    const sizeMap = { small: 1, medium: 2, large: 3 };
    updateDashboardChart(id, { position: { ...dashboardCharts.find((c) => c.id === id)!.position, w: sizeMap[size] } });
  };

  const handleAddLabel = (id: string) => {
    setLabelDialogChartId(id);
    setLabelText("");
  };

  const handleSaveLabel = () => {
    if (!labelDialogChartId) return;
    const chart = dashboardCharts.find((c) => c.id === labelDialogChartId);
    if (chart) {
      updateDashboardChart(labelDialogChartId, { title: labelText || chart.title });
    }
    setLabelDialogChartId(null);
  };

  const chartTypeIcon = (type: DashboardChart["chartType"]) => {
    switch (type) {
      case "bar":
        return <BarChart3 className="h-4 w-4" />;
      case "line":
        return <LineChart className="h-4 w-4" />;
      case "pie":
        return <PieChart className="h-4 w-4" />;
      case "doughnut":
        return <Circle className="h-4 w-4" />;
    }
  };

  const handleSaveChart = () => {
    const reportId = scheduleForm.reportId;
    if (!reportId) return;
    const report = hrReports.find((r) => r.id === reportId);
    if (!report) return;

    addDashboardChart({
      reportId,
      chartType: "bar",
      title: report.name,
      position: { x: dashboardCharts.length, y: 0, w: 2, h: 1 },
    });
    setChartDialogOpen(false);
  };

  // ── Audit Trail Tab ─────────────────────────────────────────────────────

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      const matchSearch =
        auditSearch === "" ||
        l.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        l.details.toLowerCase().includes(auditSearch.toLowerCase());
      const matchModule = auditModuleFilter === "all" || l.module === auditModuleFilter;
      return matchSearch && matchModule;
    });
  }, [auditLogs, auditSearch, auditModuleFilter]);

  const handleExportAuditLogs = () => {
    const header = "User,Action,Module,Details,IP Address,Timestamp";
    const rows = filteredAuditLogs
      .map((l) => `${l.userName},${l.action},${l.module},"${l.details}",${l.ipAddress},${l.timestamp}`)
      .join("\n");
    const blob = new Blob([`${header}\n${rows}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports-audit-trail.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Clock className="mr-2 h-4 w-4" />
            Scheduled Reports
          </TabsTrigger>
          <TabsTrigger value="dashboards">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Shield className="mr-2 h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Reports ────────────────────────────────────────────── */}
        <TabsContent value="reports" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Create, manage, and generate HR reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {MODULES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={openCreateReport}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Report
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Generated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No reports found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {report.description}
                          </TableCell>
                          <TableCell>{report.module}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${typeBadgeClass(report.type)}`}>
                              {report.type}
                            </span>
                          </TableCell>
                          <TableCell>{report.fields.length}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(report.createdAt)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {report.lastGenerated ? formatDate(report.lastGenerated) : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={generatingId === report.id}
                                onClick={() => handleGenerateReport(report.id)}
                              >
                                {generatingId === report.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDuplicateReport(report)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditReport(report)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog open={deleteConfirmId === report.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(report.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Report</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete &quot;{report.name}&quot;? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteReport(report.id)}>
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Scheduled Reports ──────────────────────────────────── */}
        <TabsContent value="schedules" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automate recurring report delivery to recipients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-end gap-2 mb-6">
                <Button onClick={openCreateSchedule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Report
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>External Recipients</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportSchedules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No scheduled reports found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.reportName}</TableCell>
                          <TableCell className="capitalize">{schedule.frequency}</TableCell>
                          <TableCell>{schedule.time}</TableCell>
                          <TableCell>{schedule.recipients.length}</TableCell>
                          <TableCell>{schedule.externalRecipients.length}</TableCell>
                          <TableCell>
                            <Switch
                              checked={schedule.isActive}
                              onCheckedChange={(checked) => toggleScheduleActive(schedule.id, checked)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditSchedule(schedule)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog open={deleteScheduleConfirmId === schedule.id} onOpenChange={(open) => !open && setDeleteScheduleConfirmId(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteScheduleConfirmId(schedule.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Schedule</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete this schedule for &quot;{schedule.reportName}&quot;?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteScheduleConfirmId(null)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteSchedule(schedule.id)}>
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Dashboards ─────────────────────────────────────────── */}
        <TabsContent value="dashboards" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dashboard Charts</CardTitle>
                  <CardDescription>Manage and configure dashboard visualizations.</CardDescription>
                </div>
                <Dialog open={chartDialogOpen} onOpenChange={setChartDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Chart to Dashboard
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Chart to Dashboard</DialogTitle>
                      <DialogDescription>Select a report to visualize on the dashboard.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Report</Label>
                        <Select
                          value={scheduleForm.reportId}
                          onValueChange={(v) => setScheduleForm((s) => ({ ...s, reportId: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a report" />
                          </SelectTrigger>
                          <SelectContent>
                            {hrReports.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setChartDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveChart} disabled={!scheduleForm.reportId}>
                        Add Chart
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardCharts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No charts added to the dashboard yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardCharts.map((chart, idx) => {
                    const report = hrReports.find((r) => r.id === chart.reportId);
                    return (
                      <Card key={chart.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {chartTypeIcon(chart.chartType)}
                              <CardTitle className="text-sm">{chart.title}</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {chart.chartType}
                            </Badge>
                          </div>
                          {report && (
                            <CardDescription className="text-xs">Source: {report.name}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="h-24 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-sm">
                            {chart.chartType === "bar" && <BarChart3 className="h-8 w-8 opacity-50" />}
                            {chart.chartType === "line" && <LineChart className="h-8 w-8 opacity-50" />}
                            {chart.chartType === "pie" && <PieChart className="h-8 w-8 opacity-50" />}
                            {chart.chartType === "doughnut" && <Circle className="h-8 w-8 opacity-50" />}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => handleMoveChart(chart.id, "up")}>
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === dashboardCharts.length - 1} onClick={() => handleMoveChart(chart.id, "down")}>
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleResizeChart(chart.id, "small")}>
                                <Minimize2 className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleResizeChart(chart.id, "large")}>
                                <Maximize2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Select
                              value={chart.chartType}
                              onValueChange={(v) => updateDashboardChart(chart.id, { chartType: v as DashboardChart["chartType"] })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CHART_TYPES.map((ct) => (
                                  <SelectItem key={ct} value={ct}>
                                    <span className="capitalize">{ct}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleAddLabel(chart.id)}>
                              Add Label
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={() => deleteDashboardChart(chart.id)}>
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Audit Trail ────────────────────────────────────────── */}
        <TabsContent value="audit" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics Audit Trail</CardTitle>
              <CardDescription>Track all activity within the reports and analytics module.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search audit logs..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={auditModuleFilter} onValueChange={setAuditModuleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {MODULES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={handleExportAuditLogs}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No audit logs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.module}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[250px] truncate">
                            {log.details}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{log.ipAddress}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(log.timestamp)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Create / Edit Report Dialog ─────────────────────────────────── */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReportId ? "Edit Report" : "Create Report"}</DialogTitle>
            <DialogDescription>
              {editingReportId ? "Update report configuration." : "Configure a new HR report."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Report name"
                value={reportForm.name}
                onChange={(e) => setReportForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description..."
                value={reportForm.description}
                onChange={(e) => setReportForm((s) => ({ ...s, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Module</Label>
                <Select
                  value={reportForm.module}
                  onValueChange={(v) => setReportForm((s) => ({ ...s, module: v, fields: [] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={reportForm.type}
                  onValueChange={(v) => setReportForm((s) => ({ ...s, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        <span className="capitalize">{t}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {reportForm.module && (
              <div className="space-y-2">
                <Label>Fields</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                  {(MODULE_FIELDS[reportForm.module] || []).map((field) => (
                    <label key={field} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportForm.fields.includes(field)}
                        onChange={() => toggleReportField(field)}
                        className="rounded border-gray-300"
                      />
                      {field}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Filters</Label>
              <Textarea
                placeholder='{"status": "active", "department": "Engineering"}'
                value={JSON.stringify(reportForm.filters)}
                onChange={(e) => {
                  try {
                    setReportForm((s) => ({ ...s, filters: JSON.parse(e.target.value) }));
                  } catch {
                    // ignore invalid json while typing
                  }
                }}
                rows={3}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveReport} disabled={!reportForm.name || !reportForm.module || !reportForm.type}>
              {editingReportId ? "Update Report" : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit Schedule Dialog ───────────────────────────────── */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingScheduleId ? "Edit Schedule" : "Schedule Report"}</DialogTitle>
            <DialogDescription>
              {editingScheduleId ? "Update the report schedule." : "Set up automated report delivery."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Report</Label>
              <Select
                value={scheduleForm.reportId}
                onValueChange={(v) => setScheduleForm((s) => ({ ...s, reportId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a report" />
                </SelectTrigger>
                <SelectContent>
                  {hrReports.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={scheduleForm.frequency}
                onValueChange={(v) => setScheduleForm((s) => ({ ...s, frequency: v as ReportSchedule["frequency"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {scheduleForm.frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={String(scheduleForm.dayOfWeek)}
                  onValueChange={(v) => setScheduleForm((s) => ({ ...s, dayOfWeek: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                      (day, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {day}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(scheduleForm.frequency === "monthly" || scheduleForm.frequency === "quarterly") && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={scheduleForm.dayOfMonth}
                  onChange={(e) => setScheduleForm((s) => ({ ...s, dayOfMonth: Number(e.target.value) }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm((s) => ({ ...s, time: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Internal Recipients</Label>
              <p className="text-sm text-muted-foreground">
                {scheduleForm.recipients.length} recipient(s) added.
              </p>
            </div>
            <div className="space-y-2">
              <Label>External Email Recipients</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newExternalEmail}
                  onChange={(e) => setNewExternalEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addExternalRecipient();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addExternalRecipient}>
                  Add
                </Button>
              </div>
              {scheduleForm.externalRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {scheduleForm.externalRecipients.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button onClick={() => removeExternalRecipient(email)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} disabled={!scheduleForm.reportId}>
              {editingScheduleId ? "Update Schedule" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Label Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!labelDialogChartId} onOpenChange={(open) => !open && setLabelDialogChartId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Label</DialogTitle>
            <DialogDescription>Set a custom label for this chart.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Chart label"
            value={labelText}
            onChange={(e) => setLabelText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLabelDialogChartId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLabel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
