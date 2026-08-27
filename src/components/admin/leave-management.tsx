"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { LeavePolicy, LeaveRequest, ResumptionRequest } from "@/types/hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Eye,
  RotateCcw,
  FileText,
  UserCheck,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

const leaveTypes = ["Annual", "Sick", "Maternity", "Paternity", "Compassionate", "Bereavement", "Study", "Marriage"];
const categories = ["Full-Time", "Part-Time", "Contract", "Intern"];
const weekendOptions: LeavePolicy["weekendTreatment"][] = ["include", "exclude", "count_as_workday"];
const holidayOptions: LeavePolicy["publicHolidayTreatment"][] = ["include", "exclude"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  resumption_pending: "bg-blue-100 text-blue-800 border-blue-200",
};

const defaultPolicyForm: Omit<LeavePolicy, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  leaveType: "Annual",
  defaultDays: 0,
  eligibilityCategories: [],
  eligibilityPayGrades: [],
  noticeDays: 0,
  allowRollover: false,
  rolloverExpiryDays: 0,
  allowSplit: false,
  accrualEnabled: false,
  proratedEnabled: false,
  weekendTreatment: "exclude",
  publicHolidayTreatment: "exclude",
  requireSupportingProof: false,
  requireReason: false,
  requireHandoverNote: false,
  allowanceAmount: 0,
  approvalWorkflowId: "",
  approvalWorkflowName: "",
  commenceNotification: false,
  resumptionNotification: false,
  reliefOfficerApproval: false,
  isActive: true,
};

export default function LeaveManagement() {
  const {
    leavePolicies,
    addLeavePolicy,
    updateLeavePolicy,
    deleteLeavePolicy,
    leaveRequests,
    addLeaveRequest,
    updateLeaveRequest,
    resumptionRequests,
    updateResumptionRequest,
    employees,
    approvalWorkflows,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("policies");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [policyForm, setPolicyForm] = useState(defaultPolicyForm);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [deletePolicyId, setDeletePolicyId] = useState<string | null>(null);

  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [requestDetailOpen, setRequestDetailOpen] = useState(false);
  const [approveConfirmId, setApproveConfirmId] = useState<string | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const [applyOnBehalfOpen, setApplyOnBehalfOpen] = useState(false);
  const [behalfForm, setBehalfForm] = useState({
    employeeId: "",
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [balanceSearch, setBalanceSearch] = useState("");
  const [recalculating, setRecalculating] = useState<string | null>(null);

  const filteredPolicies = leavePolicies.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.leaveType.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = leaveRequests.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.leaveTypeName.toLowerCase().includes(requestSearch.toLowerCase());
    const matchesStatus = requestStatusFilter === "all" || r.status === requestStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBalances = employees.filter(
    (e) =>
      e.firstName.toLowerCase().includes(balanceSearch.toLowerCase()) ||
      e.lastName.toLowerCase().includes(balanceSearch.toLowerCase())
  );

  const openCreatePolicy = () => {
    setEditingPolicyId(null);
    setPolicyForm(defaultPolicyForm);
    setPolicyDialogOpen(true);
  };

  const openEditPolicy = (policy: LeavePolicy) => {
    setEditingPolicyId(policy.id);
    setPolicyForm({
      name: policy.name,
      description: policy.description,
      leaveType: policy.leaveType,
      defaultDays: policy.defaultDays,
      eligibilityCategories: policy.eligibilityCategories,
      eligibilityPayGrades: policy.eligibilityPayGrades,
      noticeDays: policy.noticeDays,
      allowRollover: policy.allowRollover,
      rolloverExpiryDays: policy.rolloverExpiryDays,
      allowSplit: policy.allowSplit,
      accrualEnabled: policy.accrualEnabled,
      proratedEnabled: policy.proratedEnabled,
      weekendTreatment: policy.weekendTreatment,
      publicHolidayTreatment: policy.publicHolidayTreatment,
      requireSupportingProof: policy.requireSupportingProof,
      requireReason: policy.requireReason,
      requireHandoverNote: policy.requireHandoverNote,
      allowanceAmount: policy.allowanceAmount,
      approvalWorkflowId: policy.approvalWorkflowId ?? "",
      approvalWorkflowName: policy.approvalWorkflowName ?? "",
      commenceNotification: policy.commenceNotification,
      resumptionNotification: policy.resumptionNotification,
      reliefOfficerApproval: policy.reliefOfficerApproval,
      isActive: policy.isActive,
    });
    setPolicyDialogOpen(true);
  };

  const handleSavePolicy = () => {
    if (!policyForm.name.trim()) return;
    const now = new Date().toISOString();
    if (editingPolicyId) {
      updateLeavePolicy(editingPolicyId, { ...policyForm, updatedAt: now });
    } else {
      addLeavePolicy({ ...policyForm, createdAt: now, updatedAt: now });
    }
    setPolicyDialogOpen(false);
  };

  const handleDeletePolicy = () => {
    if (deletePolicyId) {
      deleteLeavePolicy(deletePolicyId);
      setDeletePolicyId(null);
    }
  };

  const handleApproveRequest = (id: string) => {
    updateLeaveRequest(id, { status: "approved", approverName: "Admin" });
    setApproveConfirmId(null);
  };

  const handleRejectRequest = (id: string) => {
    updateLeaveRequest(id, { status: "rejected", approverComment: rejectComment, approverName: "Admin" });
    setRejectDialogId(null);
    setRejectComment("");
  };

  const handleApplyOnBehalf = () => {
    if (!behalfForm.employeeId || !behalfForm.startDate || !behalfForm.endDate) return;
    const emp = employees.find((e) => e.id === behalfForm.employeeId);
    const start = new Date(behalfForm.startDate);
    const end = new Date(behalfForm.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    addLeaveRequest({
      employeeId: behalfForm.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
      employeeDepartment: emp?.departmentName ?? "",
      leavePolicyId: "",
      leaveTypeName: behalfForm.leaveType,
      startDate: behalfForm.startDate,
      endDate: behalfForm.endDate,
      days,
      reason: behalfForm.reason,
      status: "pending",
      appliedDate: new Date().toISOString(),
    });
    setApplyOnBehalfOpen(false);
    setBehalfForm({ employeeId: "", leaveType: "Annual", startDate: "", endDate: "", reason: "" });
  };

  const handleRecalculate = (empId: string) => {
    setRecalculating(empId);
    setTimeout(() => setRecalculating(null), 1000);
  };

  const getLeaveBalance = (empId: string, type: string) => {
    const used = leaveRequests.filter((r) => r.employeeId === empId && r.leaveTypeName === type && r.status === "approved").reduce((s, r) => s + r.days, 0);
    const total = leavePolicies.find((p) => p.leaveType === type)?.defaultDays ?? 0;
    return { used, total };
  };

  const toggleCategory = (cat: string) => {
    setPolicyForm((prev) => ({
      ...prev,
      eligibilityCategories: prev.eligibilityCategories.includes(cat)
        ? prev.eligibilityCategories.filter((c) => c !== cat)
        : [...prev.eligibilityCategories, cat],
    }));
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="policies">Leave Policies</TabsTrigger>
        <TabsTrigger value="requests">Leave Requests</TabsTrigger>
        <TabsTrigger value="resumption">Resumption Requests</TabsTrigger>
        <TabsTrigger value="balances">Leave Balances</TabsTrigger>
      </TabsList>

      {/* =============== TAB 1: POLICIES =============== */}
      <TabsContent value="policies" className="space-y-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Leave Policies</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search policies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={openCreatePolicy} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Create Policy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Default Days</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Rollover</TableHead>
                  <TableHead>Approval Workflow</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.name}</TableCell>
                    <TableCell>{policy.leaveType}</TableCell>
                    <TableCell>{policy.defaultDays}</TableCell>
                    <TableCell>{policy.eligibilityCategories.join(", ") || "All"}</TableCell>
                    <TableCell>
                      {policy.allowRollover ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Yes ({policy.rolloverExpiryDays}d)</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 border-gray-200">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>{policy.approvalWorkflowName || "None"}</TableCell>
                    <TableCell>
                      <Badge className={policy.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                        {policy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditPolicy(policy)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletePolicyId(policy.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Policy Create/Edit Dialog */}
        <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPolicyId ? "Edit Leave Policy" : "Create Leave Policy"}</DialogTitle>
              <DialogDescription>Configure the leave policy details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={policyForm.name} onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Leave Type</Label>
                    <Select value={policyForm.leaveType} onValueChange={(v) => setPolicyForm({ ...policyForm, leaveType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((lt) => <SelectItem key={lt} value={lt}>{lt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Description</Label>
                  <Textarea value={policyForm.description} onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })} rows={2} />
                </div>
              </div>
              <Separator />
              {/* Duration */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Duration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Days</Label>
                    <Input type="number" value={policyForm.defaultDays} onChange={(e) => setPolicyForm({ ...policyForm, defaultDays: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Notice Days</Label>
                    <Input type="number" value={policyForm.noticeDays} onChange={(e) => setPolicyForm({ ...policyForm, noticeDays: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <Separator />
              {/* Eligibility */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Eligibility</h4>
                <div className="space-y-3">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-4">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <Checkbox
                          checked={policyForm.eligibilityCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <span className="text-sm">{cat}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label>Pay Grades (comma-separated)</Label>
                    <Input
                      value={policyForm.eligibilityPayGrades.join(", ")}
                      onChange={(e) => setPolicyForm({ ...policyForm, eligibilityPayGrades: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                      placeholder="e.g. Grade 1, Grade 2"
                    />
                  </div>
                </div>
              </div>
              <Separator />
              {/* Rollover */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Rollover</h4>
                <div className="flex items-center justify-between mb-3">
                  <Label>Allow Rollover</Label>
                  <Switch checked={policyForm.allowRollover} onCheckedChange={(v) => setPolicyForm({ ...policyForm, allowRollover: v })} />
                </div>
                {policyForm.allowRollover && (
                  <div className="space-y-2">
                    <Label>Rollover Expiry Days</Label>
                    <Input type="number" value={policyForm.rolloverExpiryDays} onChange={(e) => setPolicyForm({ ...policyForm, rolloverExpiryDays: parseInt(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
              <Separator />
              {/* Split & Accrual */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Split & Accrual</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Allow Split</Label>
                    <Switch checked={policyForm.allowSplit} onCheckedChange={(v) => setPolicyForm({ ...policyForm, allowSplit: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Accrual Enabled</Label>
                    <Switch checked={policyForm.accrualEnabled} onCheckedChange={(v) => setPolicyForm({ ...policyForm, accrualEnabled: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Prorated Enabled</Label>
                    <Switch checked={policyForm.proratedEnabled} onCheckedChange={(v) => setPolicyForm({ ...policyForm, proratedEnabled: v })} />
                  </div>
                </div>
              </div>
              <Separator />
              {/* Treatment */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Treatment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weekend Treatment</Label>
                    <Select value={policyForm.weekendTreatment} onValueChange={(v: LeavePolicy["weekendTreatment"]) => setPolicyForm({ ...policyForm, weekendTreatment: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {weekendOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt.replace(/_/g, " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Public Holiday Treatment</Label>
                    <Select value={policyForm.publicHolidayTreatment} onValueChange={(v: LeavePolicy["publicHolidayTreatment"]) => setPolicyForm({ ...policyForm, publicHolidayTreatment: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {holidayOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Separator />
              {/* Requirements */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Requirements</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Require Supporting Proof</Label>
                    <Switch checked={policyForm.requireSupportingProof} onCheckedChange={(v) => setPolicyForm({ ...policyForm, requireSupportingProof: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Reason</Label>
                    <Switch checked={policyForm.requireReason} onCheckedChange={(v) => setPolicyForm({ ...policyForm, requireReason: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Handover Note</Label>
                    <Switch checked={policyForm.requireHandoverNote} onCheckedChange={(v) => setPolicyForm({ ...policyForm, requireHandoverNote: v })} />
                  </div>
                </div>
              </div>
              <Separator />
              {/* Allowance */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Allowance</h4>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" value={policyForm.allowanceAmount} onChange={(e) => setPolicyForm({ ...policyForm, allowanceAmount: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <Separator />
              {/* Workflow */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Approval Workflow</h4>
                <Select
                  value={policyForm.approvalWorkflowId}
                  onValueChange={(v) => {
                    const wf = approvalWorkflows.find((w) => w.id === v);
                    setPolicyForm({ ...policyForm, approvalWorkflowId: v, approvalWorkflowName: wf?.name ?? "" });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select workflow" /></SelectTrigger>
                  <SelectContent>
                    {approvalWorkflows.filter((w) => w.module === "leave").map((wf) => (
                      <SelectItem key={wf.id} value={wf.id}>{wf.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              {/* Notifications */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Commence Notification</Label>
                    <Switch checked={policyForm.commenceNotification} onCheckedChange={(v) => setPolicyForm({ ...policyForm, commenceNotification: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Resumption Notification</Label>
                    <Switch checked={policyForm.resumptionNotification} onCheckedChange={(v) => setPolicyForm({ ...policyForm, resumptionNotification: v })} />
                  </div>
                </div>
              </div>
              <Separator />
              {/* Relief Officer & Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Relief Officer Approval</Label>
                  <Switch checked={policyForm.reliefOfficerApproval} onCheckedChange={(v) => setPolicyForm({ ...policyForm, reliefOfficerApproval: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={policyForm.isActive} onCheckedChange={(v) => setPolicyForm({ ...policyForm, isActive: v })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePolicy} className="bg-blue-600 hover:bg-blue-700">Save Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deletePolicyId} onOpenChange={() => setDeletePolicyId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Policy</DialogTitle>
              <DialogDescription>Are you sure you want to delete this leave policy? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletePolicyId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeletePolicy}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* =============== TAB 2: LEAVE REQUESTS =============== */}
      <TabsContent value="requests" className="space-y-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Leave Requests</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="resumption_pending">Resumption Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setApplyOnBehalfOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" /> Apply on Behalf
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.employeeName}</TableCell>
                    <TableCell>{req.employeeDepartment}</TableCell>
                    <TableCell>{req.leaveTypeName}</TableCell>
                    <TableCell>{formatDate(req.startDate)}</TableCell>
                    <TableCell>{formatDate(req.endDate)}</TableCell>
                    <TableCell>{req.days}</TableCell>
                    <TableCell>{formatDate(req.appliedDate)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[req.status]} border`}>{req.status.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>{req.approverName || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {req.status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => setApproveConfirmId(req.id)}>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setRejectDialogId(req.id)}>
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setRequestDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Approve Confirm Dialog */}
        <Dialog open={!!approveConfirmId} onOpenChange={() => setApproveConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Leave Request</DialogTitle>
              <DialogDescription>Are you sure you want to approve this leave request?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveConfirmId(null)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => approveConfirmId && handleApproveRequest(approveConfirmId)}>Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={!!rejectDialogId} onOpenChange={() => setRejectDialogId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
              <DialogDescription>Please provide a reason for rejection.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label>Comment</Label>
              <Textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => rejectDialogId && handleRejectRequest(rejectDialogId)}>Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={requestDetailOpen} onOpenChange={setRequestDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-500">Employee</Label><p className="font-medium">{selectedRequest.employeeName}</p></div>
                  <div><Label className="text-gray-500">Department</Label><p className="font-medium">{selectedRequest.employeeDepartment}</p></div>
                  <div><Label className="text-gray-500">Leave Type</Label><p className="font-medium">{selectedRequest.leaveTypeName}</p></div>
                  <div><Label className="text-gray-500">Days</Label><p className="font-medium">{selectedRequest.days}</p></div>
                  <div><Label className="text-gray-500">Start Date</Label><p className="font-medium">{formatDate(selectedRequest.startDate)}</p></div>
                  <div><Label className="text-gray-500">End Date</Label><p className="font-medium">{formatDate(selectedRequest.endDate)}</p></div>
                  <div><Label className="text-gray-500">Applied Date</Label><p className="font-medium">{formatDate(selectedRequest.appliedDate)}</p></div>
                  <div><Label className="text-gray-500">Status</Label><p><Badge className={`${statusColors[selectedRequest.status]} border`}>{selectedRequest.status.replace(/_/g, " ")}</Badge></p></div>
                </div>
                {selectedRequest.reason && (
                  <div><Label className="text-gray-500">Reason</Label><p className="text-sm mt-1">{selectedRequest.reason}</p></div>
                )}
                {selectedRequest.approverComment && (
                  <div><Label className="text-gray-500">Approver Comment</Label><p className="text-sm mt-1">{selectedRequest.approverComment}</p></div>
                )}
                {selectedRequest.reliefOfficerName && (
                  <div><Label className="text-gray-500">Relief Officer</Label><p className="font-medium">{selectedRequest.reliefOfficerName}</p></div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Apply on Behalf Dialog */}
        <Dialog open={applyOnBehalfOpen} onOpenChange={setApplyOnBehalfOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Apply Leave on Behalf</DialogTitle>
              <DialogDescription>Select an employee and fill in the leave details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={behalfForm.employeeId} onValueChange={(v) => setBehalfForm({ ...behalfForm, employeeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.filter((e) => e.status === "active").map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={behalfForm.leaveType} onValueChange={(v) => setBehalfForm({ ...behalfForm, leaveType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((lt) => <SelectItem key={lt} value={lt}>{lt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="date" value={behalfForm.startDate} onChange={(e) => setBehalfForm({ ...behalfForm, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input type="date" value={behalfForm.endDate} onChange={(e) => setBehalfForm({ ...behalfForm, endDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea value={behalfForm.reason} onChange={(e) => setBehalfForm({ ...behalfForm, reason: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApplyOnBehalfOpen(false)}>Cancel</Button>
              <Button onClick={handleApplyOnBehalf} className="bg-blue-600 hover:bg-blue-700">Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* =============== TAB 3: RESUMPTION REQUESTS =============== */}
      <TabsContent value="resumption" className="space-y-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Resumption Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Request</TableHead>
                  <TableHead>Resumption Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumptionRequests.map((rr) => (
                  <TableRow key={rr.id}>
                    <TableCell className="font-medium">{rr.employeeName}</TableCell>
                    <TableCell>{rr.leaveRequestId}</TableCell>
                    <TableCell>{formatDate(rr.resumptionDate)}</TableCell>
                    <TableCell>
                      <Badge className={rr.status === "approved" ? "bg-green-100 text-green-800 border-green-200 border" : "bg-yellow-100 text-yellow-800 border-yellow-200 border"}>
                        {rr.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{rr.comments || "-"}</TableCell>
                    <TableCell className="text-right">
                      {rr.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateResumptionRequest(rr.id, { status: "approved" })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateResumptionRequest(rr.id, { status: "approved" })}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* =============== TAB 4: LEAVE BALANCES =============== */}
      <TabsContent value="balances" className="space-y-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Leave Balances</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={balanceSearch}
                  onChange={(e) => setBalanceSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" /> Bulk Recalculate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  {leaveTypes.map((lt) => (
                    <TableHead key={lt}>{lt}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                    {leaveTypes.map((lt) => {
                      const balance = getLeaveBalance(emp.id, lt);
                      return (
                        <TableCell key={lt}>
                          <span className="text-sm">{balance.used}/{balance.total}</span>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecalculate(emp.id)}
                        disabled={recalculating === emp.id}
                      >
                        <RotateCcw className={`h-4 w-4 ${recalculating === emp.id ? "animate-spin" : ""}`} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
