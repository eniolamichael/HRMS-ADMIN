"use client";

import { useState, useMemo } from "react";
import { useHrms } from "@/contexts/hrms-context";
import {
  ExitPolicy,
  ExitBenefit,
  ExitActivity,
  ExitRequest,
  ExitActivityInstance,
} from "@/types/hrms";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  Download,
  Upload,
  Eye,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Bell,
  Clock,
  History,
  Settings,
  AlertTriangle,
  BarChart3,
  Users,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";

type ExitStatusFilter = "all" | "pending_approval" | "approved" | "in_progress" | "completed" | "cancelled";

const defaultPolicyForm = {
  name: "",
  description: "",
  initiator: "admin" as ExitPolicy["initiator"],
  isActive: true,
  approvalWorkflowId: "",
  bypassApproval: false,
  applicablePayGroups: [] as string[],
  noticePeriodDays: 30,
  penaltyInLieuOfNotice: 0,
  isContractPolicy: false,
  contractTriggerDays: 30,
};

const defaultBenefitForm = {
  name: "",
  description: "",
  type: "severance" as ExitBenefit["type"],
  calculationMethod: "fixed" as ExitBenefit["calculationMethod"],
  amount: 0,
  policyId: "",
  isActive: true,
};

const defaultActivityForm = {
  name: "",
  description: "",
  timing: "before_exit" as ExitActivity["timing"],
  completionRequired: true,
  assigneeRole: "",
  policyIds: [] as string[],
};

const defaultRequestForm = {
  employeeId: "",
  policyId: "",
  mode: "resignation" as ExitRequest["mode"],
  lastWorkingDay: "",
  comments: "",
};

export default function ExitManagement() {
  const {
    employees,
    exitPolicies,
    addExitPolicy,
    updateExitPolicy,
    deleteExitPolicy,
    exitBenefits,
    addExitBenefit,
    updateExitBenefit,
    deleteExitBenefit,
    exitActivities,
    addExitActivity,
    updateExitActivity,
    deleteExitActivity,
    exitRequests,
    addExitRequest,
    updateExitRequest,
    exitActivityInstances,
    updateExitActivityInstance,
    approvalWorkflows,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("policies");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExitStatusFilter>("all");
  const [historySearch, setHistorySearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Policy state
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState(defaultPolicyForm);
  const [deletePolicyId, setDeletePolicyId] = useState<string | null>(null);

  // Benefit state
  const [benefitDialogOpen, setBenefitDialogOpen] = useState(false);
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [benefitForm, setBenefitForm] = useState(defaultBenefitForm);
  const [deleteBenefitId, setDeleteBenefitId] = useState<string | null>(null);

  // Activity state
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState(defaultActivityForm);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

  // Request state
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState(defaultRequestForm);
  const [viewRequest, setViewRequest] = useState<ExitRequest | null>(null);
  const [changeModeRequest, setChangeModeRequest] = useState<ExitRequest | null>(null);
  const [newMode, setNewMode] = useState<ExitRequest["mode"]>("resignation");

  // Ongoing exits
  const [nudgeDialog, setNudgeDialog] = useState<{ employeeName: string; type: "employee" | "assignee"; assigneeName?: string } | null>(null);
  const [editLwdRequest, setEditLwdRequest] = useState<ExitRequest | null>(null);
  const [newLwd, setNewLwd] = useState("");

  const exitWorkflows = useMemo(
    () => approvalWorkflows.filter((w) => w.module === "Exit" && w.isActive),
    [approvalWorkflows]
  );

  // --- Filtered data ---
  const filteredRequests = useMemo(() => {
    return exitRequests.filter((r) => {
      const matchSearch =
        search === "" ||
        r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.departmentName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [exitRequests, search, statusFilter]);

  const ongoingExits = useMemo(
    () => exitRequests.filter((r) => r.status === "approved" || r.status === "in_progress"),
    [exitRequests]
  );

  const filteredHistory = useMemo(() => {
    return exitRequests.filter((r) => {
      const matchSearch =
        historySearch === "" ||
        r.employeeName.toLowerCase().includes(historySearch.toLowerCase());
      let matchDate = true;
      if (dateFrom) matchDate = matchDate && r.initiatedDate >= dateFrom;
      if (dateTo) matchDate = matchDate && r.initiatedDate <= dateTo;
      return matchSearch && matchDate && (r.status === "completed" || r.status === "cancelled");
    });
  }, [exitRequests, historySearch, dateFrom, dateTo]);

  const completedExits = useMemo(
    () => exitRequests.filter((r) => r.status === "completed"),
    [exitRequests]
  );

  const totalExitsCount = exitRequests.length;
  const attritionRate = totalExitsCount > 0 ? ((completedExits.length / (employees.length || 1)) * 100).toFixed(1) : "0.0";

  // --- Activity helpers ---
  const getActivityInstances = (exitRequestId: string) =>
    exitActivityInstances.filter((i) => i.exitRequestId === exitRequestId);

  const getCompletedCount = (exitRequestId: string) => {
    const instances = getActivityInstances(exitRequestId);
    return instances.filter((i) => i.status === "completed").length;
  };

  const getTotalCount = (exitRequestId: string) => getActivityInstances(exitRequestId).length;

  const getDaysRemaining = (lastWorkingDay: string) => {
    const diff = new Date(lastWorkingDay).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // --- Policy CRUD ---
  const openCreatePolicy = () => {
    setEditingPolicyId(null);
    setPolicyForm(defaultPolicyForm);
    setPolicyDialogOpen(true);
  };

  const openEditPolicy = (policy: ExitPolicy) => {
    setEditingPolicyId(policy.id);
    setPolicyForm({
      name: policy.name,
      description: policy.description,
      initiator: policy.initiator,
      isActive: policy.isActive,
      approvalWorkflowId: policy.approvalWorkflowId ?? "",
      bypassApproval: policy.bypassApproval,
      applicablePayGroups: policy.applicablePayGroups,
      noticePeriodDays: policy.noticePeriodDays,
      penaltyInLieuOfNotice: policy.penaltyInLieuOfNotice,
      isContractPolicy: policy.isContractPolicy,
      contractTriggerDays: policy.contractTriggerDays ?? 30,
    });
    setPolicyDialogOpen(true);
  };

  const handleSavePolicy = () => {
    if (!policyForm.name.trim()) return;
    const workflowName = exitWorkflows.find((w) => w.id === policyForm.approvalWorkflowId)?.name;
    if (editingPolicyId) {
      updateExitPolicy(editingPolicyId, {
        ...policyForm,
        approvalWorkflowName: workflowName,
      });
    } else {
      addExitPolicy({
        ...policyForm,
        approvalWorkflowName: workflowName,
        createdAt: new Date().toISOString(),
      });
    }
    setPolicyDialogOpen(false);
  };

  const handleDeletePolicy = () => {
    if (deletePolicyId) {
      deleteExitPolicy(deletePolicyId);
      setDeletePolicyId(null);
    }
  };

  const togglePayGroup = (pgId: string) => {
    setPolicyForm((s) => ({
      ...s,
      applicablePayGroups: s.applicablePayGroups.includes(pgId)
        ? s.applicablePayGroups.filter((id) => id !== pgId)
        : [...s.applicablePayGroups, pgId],
    }));
  };

  // --- Benefit CRUD ---
  const openCreateBenefit = () => {
    setEditingBenefitId(null);
    setBenefitForm(defaultBenefitForm);
    setBenefitDialogOpen(true);
  };

  const openEditBenefit = (benefit: ExitBenefit) => {
    setEditingBenefitId(benefit.id);
    setBenefitForm({
      name: benefit.name,
      description: benefit.description,
      type: benefit.type,
      calculationMethod: benefit.calculationMethod,
      amount: benefit.amount,
      policyId: benefit.policyId,
      isActive: benefit.isActive,
    });
    setBenefitDialogOpen(true);
  };

  const handleSaveBenefit = () => {
    if (!benefitForm.name.trim()) return;
    if (editingBenefitId) {
      updateExitBenefit(editingBenefitId, benefitForm);
    } else {
      addExitBenefit({
        ...benefitForm,
      });
    }
    setBenefitDialogOpen(false);
  };

  const handleDeleteBenefit = () => {
    if (deleteBenefitId) {
      deleteExitBenefit(deleteBenefitId);
      setDeleteBenefitId(null);
    }
  };

  // --- Activity CRUD ---
  const openCreateActivity = () => {
    setEditingActivityId(null);
    setActivityForm(defaultActivityForm);
    setActivityDialogOpen(true);
  };

  const openEditActivity = (activity: ExitActivity) => {
    setEditingActivityId(activity.id);
    setActivityForm({
      name: activity.name,
      description: activity.description,
      timing: activity.timing,
      completionRequired: activity.completionRequired,
      assigneeRole: activity.assigneeRole,
      policyIds: activity.policyIds,
    });
    setActivityDialogOpen(true);
  };

  const handleSaveActivity = () => {
    if (!activityForm.name.trim()) return;
    if (editingActivityId) {
      updateExitActivity(editingActivityId, activityForm);
    } else {
      const maxOrder = exitActivities.reduce((max, a) => Math.max(max, a.order), 0);
      addExitActivity({
        ...activityForm,
        order: maxOrder + 1,
      });
    }
    setActivityDialogOpen(false);
  };

  const handleDeleteActivity = () => {
    if (deleteActivityId) {
      deleteExitActivity(deleteActivityId);
      setDeleteActivityId(null);
    }
  };

  const handleMoveActivity = (activityId: string, direction: "up" | "down") => {
    const sorted = [...exitActivities].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((a) => a.id === activityId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const swapped = [...sorted];
    const [moved] = swapped.splice(idx, 1);
    swapped.splice(targetIdx, 0, moved);
    swapped.forEach((a, i) => {
      if (a.order !== i + 1) updateExitActivity(a.id, { order: i + 1 });
    });
  };

  const toggleActivityPolicy = (policyId: string) => {
    setActivityForm((s) => ({
      ...s,
      policyIds: s.policyIds.includes(policyId)
        ? s.policyIds.filter((id) => id !== policyId)
        : [...s.policyIds, policyId],
    }));
  };

  // --- Request CRUD ---
  const handleInitiateExit = () => {
    if (!requestForm.employeeId || !requestForm.policyId || !requestForm.lastWorkingDay) return;
    const emp = employees.find((e) => e.id === requestForm.employeeId);
    const policy = exitPolicies.find((p) => p.id === requestForm.policyId);
    addExitRequest({
      employeeId: requestForm.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
      departmentId: emp?.departmentId ?? "",
      departmentName: emp?.departmentName ?? "",
      policyId: requestForm.policyId,
      policyName: policy?.name ?? "",
      mode: requestForm.mode,
      lastWorkingDay: requestForm.lastWorkingDay,
      status: "pending_approval",
      initiatedBy: "Admin User",
      initiatedDate: new Date().toISOString(),
    });
    setRequestDialogOpen(false);
    setRequestForm(defaultRequestForm);
  };

  const handleApproveRequest = (id: string) => {
    updateExitRequest(id, { status: "approved", approvalStatus: "approved" });
  };

  const handleCancelRequest = (id: string) => {
    updateExitRequest(id, { status: "cancelled" });
  };

  const handleChangeMode = () => {
    if (changeModeRequest) {
      updateExitRequest(changeModeRequest.id, { mode: newMode });
      setChangeModeRequest(null);
    }
  };

  const handleNudge = (employeeName: string, type: "employee" | "assignee", assigneeName?: string) => {
    setNudgeDialog({ employeeName, type, assigneeName });
    setTimeout(() => setNudgeDialog(null), 2000);
  };

  const handleRevertActivity = (instanceId: string) => {
    updateExitActivityInstance(instanceId, { status: "pending", completedDate: undefined });
  };

  const handleEditLwd = () => {
    if (editLwdRequest && newLwd) {
      updateExitRequest(editLwdRequest.id, { lastWorkingDay: newLwd });
      setEditLwdRequest(null);
    }
  };

  const handleExportHistory = () => {
    const header = "Employee,Department,Mode,Last Working Day,Completed Date,Status";
    const rows = filteredHistory
      .map(
        (r) =>
          `${r.employeeName},${r.departmentName},${r.mode},${r.lastWorkingDay},${r.initiatedDate},${r.status}`
      )
      .join("\n");
    const blob = new Blob([`${header}\n${rows}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exit-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Badge helpers ---
  const exitStatusBadge = (status: ExitRequest["status"]) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const activePolicyCount = (activityId: string) => {
    const activity = exitActivities.find((a) => a.id === activityId);
    return activity?.policyIds.length ?? 0;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="policies">
            <FileText className="mr-2 h-4 w-4" />
            Exit Policies
          </TabsTrigger>
          <TabsTrigger value="benefits">
            <BarChart3 className="mr-2 h-4 w-4" />
            Exit Benefits
          </TabsTrigger>
          <TabsTrigger value="activities">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Exit Activities
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Users className="mr-2 h-4 w-4" />
            Exit Requests
          </TabsTrigger>
          <TabsTrigger value="ongoing">
            <Clock className="mr-2 h-4 w-4" />
            Ongoing Exits
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History & Reports
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Exit Policies */}
        <TabsContent value="policies" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exit Policies</CardTitle>
              <CardDescription>Configure exit policies for different employment types.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-6">
                <Button onClick={openCreatePolicy}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Policy
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Initiator</TableHead>
                      <TableHead>Notice Period</TableHead>
                      <TableHead>Approval Workflow</TableHead>
                      <TableHead>Pay Groups</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exitPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No exit policies configured.
                        </TableCell>
                      </TableRow>
                    ) : (
                      exitPolicies.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-medium">{policy.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {policy.description}
                          </TableCell>
                          <TableCell className="capitalize">{policy.initiator}</TableCell>
                          <TableCell>{policy.noticePeriodDays} days</TableCell>
                          <TableCell>{policy.approvalWorkflowName || "—"}</TableCell>
                          <TableCell>
                            {policy.applicablePayGroups.length > 0 ? (
                              <Badge variant="outline">{policy.applicablePayGroups.length} groups</Badge>
                            ) : (
                              <span className="text-muted-foreground">All</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${policy.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                {policy.isActive ? "Active" : "Inactive"}
                              </span>
                              {policy.isContractPolicy && (
                                <Badge variant="secondary" className="text-xs">Contract</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditPolicy(policy)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog open={deletePolicyId === policy.id} onOpenChange={(open) => !open && setDeletePolicyId(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setDeletePolicyId(policy.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Exit Policy</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete &quot;{policy.name}&quot;? This cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeletePolicyId(null)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleDeletePolicy}>Delete</Button>
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

        {/* Tab 2: Exit Benefits */}
        <TabsContent value="benefits" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exit Benefits</CardTitle>
              <CardDescription>Manage severance, gratuity, and other exit benefits.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2 mb-6">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
                <Button onClick={openCreateBenefit}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Benefit
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Calculation Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exitBenefits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No exit benefits configured.
                        </TableCell>
                      </TableRow>
                    ) : (
                      exitBenefits.map((benefit) => (
                        <TableRow key={benefit.id}>
                          <TableCell className="font-medium">{benefit.name}</TableCell>
                          <TableCell className="capitalize">{benefit.type.replace("_", " ")}</TableCell>
                          <TableCell className="capitalize">{benefit.calculationMethod}</TableCell>
                          <TableCell>
                            {benefit.calculationMethod !== "none" ? formatCurrency(benefit.amount) : "—"}
                          </TableCell>
                          <TableCell>
                            {exitPolicies.find((p) => p.id === benefit.policyId)?.name || "—"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${benefit.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                              {benefit.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditBenefit(benefit)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog open={deleteBenefitId === benefit.id} onOpenChange={(open) => !open && setDeleteBenefitId(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteBenefitId(benefit.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Exit Benefit</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete &quot;{benefit.name}&quot;? This cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteBenefitId(null)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleDeleteBenefit}>Delete</Button>
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

        {/* Tab 3: Exit Activities */}
        <TabsContent value="activities" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exit Activities</CardTitle>
              <CardDescription>Define the activities required during the exit process.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-6">
                <Button onClick={openCreateActivity}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Activity
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Timing</TableHead>
                      <TableHead>Completion Required</TableHead>
                      <TableHead>Assignee Role</TableHead>
                      <TableHead>Policies</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exitActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No exit activities configured.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...exitActivities]
                        .sort((a, b) => a.order - b.order)
                        .map((activity, idx, arr) => (
                          <TableRow key={activity.id}>
                            <TableCell>
                              <div className="flex flex-col items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveActivity(activity.id, "up")}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <span className="text-xs font-medium">{activity.order}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  disabled={idx === arr.length - 1}
                                  onClick={() => handleMoveActivity(activity.id, "down")}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{activity.name}</TableCell>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                              {activity.description}
                            </TableCell>
                            <TableCell className="capitalize">{activity.timing.replace("_", " ")}</TableCell>
                            <TableCell>
                              {activity.completionRequired ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell className="capitalize">{activity.assigneeRole}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{activePolicyCount(activity.id)}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditActivity(activity)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Dialog open={deleteActivityId === activity.id} onOpenChange={(open) => !open && setDeleteActivityId(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteActivityId(activity.id)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Delete Exit Activity</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to delete &quot;{activity.name}&quot;? This cannot be undone.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setDeleteActivityId(null)}>Cancel</Button>
                                      <Button variant="destructive" onClick={handleDeleteActivity}>Delete</Button>
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

        {/* Tab 4: Exit Requests */}
        <TabsContent value="requests" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exit Requests</CardTitle>
              <CardDescription>Manage employee exit requests and approvals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee or department..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ExitStatusFilter)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { setRequestForm(defaultRequestForm); setRequestDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Initiate Exit
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Last Working Day</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          No exit requests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.employeeName}</TableCell>
                          <TableCell className="text-muted-foreground">{req.departmentName}</TableCell>
                          <TableCell>{req.policyName}</TableCell>
                          <TableCell className="capitalize">{req.mode.replace("_", " ")}</TableCell>
                          <TableCell>{formatDate(req.lastWorkingDay)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${exitStatusBadge(req.status)}`}>
                              {req.status.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{req.initiatedBy}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(req.initiatedDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setViewRequest(req)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {req.status === "pending_approval" && (
                                <>
                                  <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleApproveRequest(req.id)}>
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleCancelRequest(req.id)}>
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {req.status !== "completed" && req.status !== "cancelled" && (
                                <Button variant="ghost" size="icon" onClick={() => { setChangeModeRequest(req); setNewMode(req.mode); }}>
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
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

        {/* Tab 5: Ongoing Exits */}
        <TabsContent value="ongoing" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ongoing Exits</CardTitle>
              <CardDescription>Track and manage active exit processes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Last Working Day</TableHead>
                      <TableHead>Completed Activities</TableHead>
                      <TableHead>Days Remaining</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ongoingExits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No ongoing exits.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ongoingExits.map((req) => {
                        const completed = getCompletedCount(req.id);
                        const total = getTotalCount(req.id);
                        const daysLeft = getDaysRemaining(req.lastWorkingDay);
                        const instances = getActivityInstances(req.id);
                        return (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.employeeName}</TableCell>
                            <TableCell>{formatDate(req.lastWorkingDay)}</TableCell>
                            <TableCell>
                              <span className="font-medium">{completed}</span>
                              <span className="text-muted-foreground"> / {total}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={daysLeft <= 3 ? "destructive" : "outline"}>
                                {daysLeft} days
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNudge(req.employeeName, "employee")}
                                >
                                  <Bell className="mr-1 h-3 w-3" />
                                  Nudge Employee
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditLwdRequest(req);
                                    setNewLwd(req.lastWorkingDay);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {ongoingExits.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium text-sm">Activity Details</h4>
                  {ongoingExits.map((req) => {
                    const instances = getActivityInstances(req.id);
                    if (instances.length === 0) return null;
                    return (
                      <div key={req.id} className="rounded-md border p-4 space-y-3">
                        <h5 className="font-medium text-sm">{req.employeeName}</h5>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Activity</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {instances.map((inst) => (
                                <TableRow key={inst.id}>
                                  <TableCell className="font-medium">{inst.activityName}</TableCell>
                                  <TableCell className="text-muted-foreground">{inst.assigneeName}</TableCell>
                                  <TableCell>
                                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
                                      inst.status === "completed"
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : inst.status === "nudged"
                                        ? "bg-orange-100 text-orange-700 border-orange-200"
                                        : inst.status === "in_progress"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-gray-100 text-gray-700 border-gray-200"
                                    }`}>
                                      {inst.status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">{formatDate(inst.dueDate)}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleNudge(req.employeeName, "assignee", inst.assigneeName)}
                                      >
                                        <Bell className="h-4 w-4" />
                                      </Button>
                                      {inst.status === "completed" && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRevertActivity(inst.id)}
                                        >
                                          <RefreshCw className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Exit History & Reports */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Exits</CardDescription>
                <CardTitle className="text-2xl">{totalExitsCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed Exits</CardDescription>
                <CardTitle className="text-2xl">{completedExits.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Attrition Rate</CardDescription>
                <CardTitle className="text-2xl">{attritionRate}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exit History</CardTitle>
                  <CardDescription>View completed and cancelled exit records.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleExportHistory}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Exit Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee name..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[160px]"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[160px]"
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Last Working Day</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No exit history found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.employeeName}</TableCell>
                          <TableCell className="text-muted-foreground">{req.departmentName}</TableCell>
                          <TableCell className="capitalize">{req.mode.replace("_", " ")}</TableCell>
                          <TableCell>{formatDate(req.lastWorkingDay)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(req.initiatedDate)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${exitStatusBadge(req.status)}`}>
                              {req.status.replace("_", " ")}
                            </span>
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
      </Tabs>

      {/* ============ DIALOGS ============ */}

      {/* Policy Create/Edit Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPolicyId ? "Edit Exit Policy" : "Create Exit Policy"}</DialogTitle>
            <DialogDescription>Configure the exit policy details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Basic Information</h4>
              <div className="space-y-2">
                <Label>Policy Name</Label>
                <Input
                  placeholder="e.g. Standard Exit Policy"
                  value={policyForm.name}
                  onChange={(e) => setPolicyForm((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe this exit policy..."
                  value={policyForm.description}
                  onChange={(e) => setPolicyForm((s) => ({ ...s, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Initiator</Label>
                  <Select
                    value={policyForm.initiator}
                    onValueChange={(v) => setPolicyForm((s) => ({ ...s, initiator: v as ExitPolicy["initiator"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label>Active</Label>
                  <Switch
                    checked={policyForm.isActive}
                    onCheckedChange={(checked) => setPolicyForm((s) => ({ ...s, isActive: checked }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Workflow Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Workflow</h4>
              <div className="space-y-2">
                <Label>Approval Workflow</Label>
                <Select
                  value={policyForm.approvalWorkflowId}
                  onValueChange={(v) => setPolicyForm((s) => ({ ...s, approvalWorkflowId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {exitWorkflows.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bypass Approval</Label>
                  <p className="text-xs text-muted-foreground">Skip approval workflow for this policy</p>
                </div>
                <Switch
                  checked={policyForm.bypassApproval}
                  onCheckedChange={(checked) => setPolicyForm((s) => ({ ...s, bypassApproval: checked }))}
                />
              </div>
            </div>

            <Separator />

            {/* Pay Groups Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Applicable Pay Groups</h4>
              <p className="text-xs text-muted-foreground">No pay groups configured. Leave empty to apply to all.</p>
            </div>

            <Separator />

            {/* Contract Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Contract Settings</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Is Contract Policy</Label>
                  <p className="text-xs text-muted-foreground">Apply this policy to contract employees</p>
                </div>
                <Switch
                  checked={policyForm.isContractPolicy}
                  onCheckedChange={(checked) => setPolicyForm((s) => ({ ...s, isContractPolicy: checked }))}
                />
              </div>
              {policyForm.isContractPolicy && (
                <div className="space-y-2">
                  <Label>Contract Trigger Days</Label>
                  <Input
                    type="number"
                    value={policyForm.contractTriggerDays}
                    onChange={(e) =>
                      setPolicyForm((s) => ({ ...s, contractTriggerDays: Number(e.target.value) }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days before contract end to trigger the exit process.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Notice Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Notice Period</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Notice Period (Days)</Label>
                  <Input
                    type="number"
                    value={policyForm.noticePeriodDays}
                    onChange={(e) =>
                      setPolicyForm((s) => ({ ...s, noticePeriodDays: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Penalty in Lieu of Notice</Label>
                  <Input
                    type="number"
                    value={policyForm.penaltyInLieuOfNotice}
                    onChange={(e) =>
                      setPolicyForm((s) => ({ ...s, penaltyInLieuOfNotice: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePolicy} disabled={!policyForm.name.trim()}>
              {editingPolicyId ? "Update Policy" : "Create Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Benefit Create/Edit Dialog */}
      <Dialog open={benefitDialogOpen} onOpenChange={setBenefitDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBenefitId ? "Edit Exit Benefit" : "Create Exit Benefit"}</DialogTitle>
            <DialogDescription>Configure the exit benefit details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Benefit Name</Label>
              <Input
                placeholder="e.g. End of Service Benefit"
                value={benefitForm.name}
                onChange={(e) => setBenefitForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this benefit..."
                value={benefitForm.description}
                onChange={(e) => setBenefitForm((s) => ({ ...s, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={benefitForm.type}
                  onValueChange={(v) => setBenefitForm((s) => ({ ...s, type: v as ExitBenefit["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="severance">Severance</SelectItem>
                    <SelectItem value="gratuity">Gratuity</SelectItem>
                    <SelectItem value="unused_leave">Unused Leave</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Calculation Method</Label>
                <Select
                  value={benefitForm.calculationMethod}
                  onValueChange={(v) =>
                    setBenefitForm((s) => ({ ...s, calculationMethod: v as ExitBenefit["calculationMethod"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="formula">Formula Based</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {benefitForm.calculationMethod === "fixed" && (
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={benefitForm.amount || ""}
                  onChange={(e) => setBenefitForm((s) => ({ ...s, amount: Number(e.target.value) }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Linked Policy</Label>
              <Select
                value={benefitForm.policyId}
                onValueChange={(v) => setBenefitForm((s) => ({ ...s, policyId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a policy" />
                </SelectTrigger>
                <SelectContent>
                  {exitPolicies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={benefitForm.isActive}
                onCheckedChange={(checked) => setBenefitForm((s) => ({ ...s, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBenefitDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBenefit} disabled={!benefitForm.name.trim()}>
              {editingBenefitId ? "Update Benefit" : "Create Benefit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Create/Edit Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingActivityId ? "Edit Exit Activity" : "Create Exit Activity"}</DialogTitle>
            <DialogDescription>Configure the exit activity details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Activity Name</Label>
              <Input
                placeholder="e.g. Asset Return"
                value={activityForm.name}
                onChange={(e) => setActivityForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this activity..."
                value={activityForm.description}
                onChange={(e) => setActivityForm((s) => ({ ...s, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timing</Label>
                <Select
                  value={activityForm.timing}
                  onValueChange={(v) =>
                    setActivityForm((s) => ({ ...s, timing: v as ExitActivity["timing"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before_exit">Before Exit</SelectItem>
                    <SelectItem value="on_exit">On Exit</SelectItem>
                    <SelectItem value="after_exit">After Exit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee Role</Label>
                <Select
                  value={activityForm.assigneeRole}
                  onValueChange={(v) => setActivityForm((s) => ({ ...s, assigneeRole: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Completion Required</Label>
                <p className="text-xs text-muted-foreground">Mark this activity as required for exit completion</p>
              </div>
              <Switch
                checked={activityForm.completionRequired}
                onCheckedChange={(checked) => setActivityForm((s) => ({ ...s, completionRequired: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Applicable Policies</Label>
              <p className="text-xs text-muted-foreground">Select policies this activity applies to.</p>
              <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto border rounded-md p-3">
                {exitPolicies.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activityForm.policyIds.includes(p.id)}
                      onChange={() => toggleActivityPolicy(p.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveActivity} disabled={!activityForm.name.trim()}>
              {editingActivityId ? "Update Activity" : "Create Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initiate Exit Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Initiate Exit</DialogTitle>
            <DialogDescription>Start a new exit process for an employee.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={requestForm.employeeId}
                onValueChange={(v) => setRequestForm((s) => ({ ...s, employeeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => e.status === "active")
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exit Policy</Label>
              <Select
                value={requestForm.policyId}
                onValueChange={(v) => setRequestForm((s) => ({ ...s, policyId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a policy" />
                </SelectTrigger>
                <SelectContent>
                  {exitPolicies
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select
                  value={requestForm.mode}
                  onValueChange={(v) => setRequestForm((s) => ({ ...s, mode: v as ExitRequest["mode"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resignation">Resignation</SelectItem>
                    <SelectItem value="termination">Termination</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="contract_end">Contract End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Last Working Day</Label>
                <Input
                  type="date"
                  value={requestForm.lastWorkingDay}
                  onChange={(e) => setRequestForm((s) => ({ ...s, lastWorkingDay: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                placeholder="Additional comments..."
                value={requestForm.comments}
                onChange={(e) => setRequestForm((s) => ({ ...s, comments: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleInitiateExit}
              disabled={!requestForm.employeeId || !requestForm.policyId || !requestForm.lastWorkingDay}
            >
              Initiate Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exit Request Details Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exit Request Details</DialogTitle>
            <DialogDescription>Full details and activity checklist for this exit request.</DialogDescription>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Employee</span>
                  <p className="font-medium">{viewRequest.employeeName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department</span>
                  <p className="font-medium">{viewRequest.departmentName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Policy</span>
                  <p className="font-medium">{viewRequest.policyName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mode</span>
                  <p className="font-medium capitalize">{viewRequest.mode.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Working Day</span>
                  <p className="font-medium">{formatDate(viewRequest.lastWorkingDay)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${exitStatusBadge(viewRequest.status)}`}>
                      {viewRequest.status.replace("_", " ")}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Initiated By</span>
                  <p className="font-medium">{viewRequest.initiatedBy}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Initiated Date</span>
                  <p className="font-medium">{formatDate(viewRequest.initiatedDate)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Activity Checklist</h4>
                {getActivityInstances(viewRequest.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activities assigned to this exit request.</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Activity</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getActivityInstances(viewRequest.id).map((inst) => (
                          <TableRow key={inst.id}>
                            <TableCell className="font-medium">{inst.activityName}</TableCell>
                            <TableCell className="text-muted-foreground">{inst.assigneeName}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
                                inst.status === "completed"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : inst.status === "nudged"
                                  ? "bg-orange-100 text-orange-700 border-orange-200"
                                  : inst.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              }`}>
                                {inst.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(inst.dueDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRequest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Mode Dialog */}
      <Dialog open={!!changeModeRequest} onOpenChange={(open) => !open && setChangeModeRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Exit Mode</DialogTitle>
            <DialogDescription>
              Change the exit mode for &quot;{changeModeRequest?.employeeName}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Mode</Label>
            <Select value={newMode} onValueChange={(v) => setNewMode(v as ExitRequest["mode"])}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resignation">Resignation</SelectItem>
                <SelectItem value="termination">Termination</SelectItem>
                <SelectItem value="retirement">Retirement</SelectItem>
                <SelectItem value="contract_end">Contract End</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeModeRequest(null)}>Cancel</Button>
            <Button onClick={handleChangeMode}>Change Mode</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Last Working Day Dialog */}
      <Dialog open={!!editLwdRequest} onOpenChange={(open) => !open && setEditLwdRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Last Working Day</DialogTitle>
            <DialogDescription>
              Update the last working day for &quot;{editLwdRequest?.employeeName}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Last Working Day</Label>
            <Input
              type="date"
              value={newLwd}
              onChange={(e) => setNewLwd(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLwdRequest(null)}>Cancel</Button>
            <Button onClick={handleEditLwd} disabled={!newLwd}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nudge Confirmation Dialog */}
      <Dialog open={!!nudgeDialog} onOpenChange={(open) => !open && setNudgeDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Nudge Sent
            </DialogTitle>
            <DialogDescription>
              {nudgeDialog?.type === "employee"
                ? `A reminder has been sent to ${nudgeDialog.employeeName}.`
                : `A reminder has been sent to ${nudgeDialog?.assigneeName}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNudgeDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
