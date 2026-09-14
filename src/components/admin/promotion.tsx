"use client";

import { useState, useMemo } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { PromotionRequest, PromotionHistory } from "@/types/hrms";
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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Upload,
  Eye,
  ChevronDown,
  Filter,
  History,
  Settings,
  Loader2,
  Users,
} from "lucide-react";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "processed";

const defaultPromotionForm = {
  employeeId: "",
  employeeName: "",
  currentGrade: "",
  proposedGrade: "",
  proposedSalary: 0,
  effectiveDate: "",
  approvalWorkflowId: "",
  comments: "",
};

const defaultSettingsForm = {
  approvalWorkflowId: "",
  bulkTemplateUploaded: false,
};

export default function PromotionManagement() {
  const {
    employees,
    promotionRequests,
    addPromotionRequest,
    updatePromotionRequest,
    deletePromotionRequest,
    promotionHistory,
    addPromotionHistory,
    approvalWorkflows,
    jobRoles,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [historySearch, setHistorySearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [promotionForm, setPromotionForm] = useState(defaultPromotionForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<PromotionRequest | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [settingsForm, setSettingsForm] = useState(defaultSettingsForm);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const promotionWorkflows = useMemo(
    () => approvalWorkflows.filter((w) => w.module === "Promotion" && w.isActive),
    [approvalWorkflows]
  );

  const filteredRequests = useMemo(() => {
    return promotionRequests.filter((r) => {
      const matchSearch =
        search === "" ||
        r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.raisedByName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [promotionRequests, search, statusFilter]);

  const filteredHistory = useMemo(() => {
    return promotionHistory.filter((h) => {
      const matchSearch =
        historySearch === "" ||
        h.employeeName.toLowerCase().includes(historySearch.toLowerCase());
      let matchDate = true;
      if (dateFrom) matchDate = matchDate && h.effectiveDate >= dateFrom;
      if (dateTo) matchDate = matchDate && h.effectiveDate <= dateTo;
      return matchSearch && matchDate;
    });
  }, [promotionHistory, historySearch, dateFrom, dateTo]);

  const openCreateDialog = () => {
    setEditingId(null);
    setPromotionForm(defaultPromotionForm);
    setDialogOpen(true);
  };

  const openEditDialog = (req: PromotionRequest) => {
    setEditingId(req.id);
    setPromotionForm({
      employeeId: req.employeeId,
      employeeName: req.employeeName,
      currentGrade: req.currentGrade,
      proposedGrade: req.proposedGrade,
      proposedSalary: req.proposedSalary,
      effectiveDate: req.effectiveDate,
      approvalWorkflowId: req.approvalWorkflowId ?? "",
      comments: req.comments ?? "",
    });
    setDialogOpen(true);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      setPromotionForm((s) => ({
        ...s,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        currentGrade: emp.payGradeName || "",
      }));
    }
  };

  const handleSave = () => {
    if (!promotionForm.employeeId || !promotionForm.proposedGrade || !promotionForm.effectiveDate) return;

    if (editingId) {
      updatePromotionRequest(editingId, {
        employeeId: promotionForm.employeeId,
        employeeName: promotionForm.employeeName,
        currentGrade: promotionForm.currentGrade,
        proposedGrade: promotionForm.proposedGrade,
        proposedSalary: promotionForm.proposedSalary,
        effectiveDate: promotionForm.effectiveDate,
        approvalWorkflowId: promotionForm.approvalWorkflowId,
        comments: promotionForm.comments,
      });
    } else {
      addPromotionRequest({
        employeeId: promotionForm.employeeId,
        employeeName: promotionForm.employeeName,
        currentGrade: promotionForm.currentGrade,
        proposedGrade: promotionForm.proposedGrade,
        proposedSalary: promotionForm.proposedSalary,
        effectiveDate: promotionForm.effectiveDate,
        status: "pending",
        raisedBy: "admin-1",
        raisedByName: "Admin User",
        approvalWorkflowId: promotionForm.approvalWorkflowId,
        comments: promotionForm.comments,
      });
    }
    setDialogOpen(false);
  };

  const handleApprove = (id: string) => {
    updatePromotionRequest(id, { status: "approved", approvedDate: new Date().toISOString() });
  };

  const handleReject = (id: string) => {
    updatePromotionRequest(id, { status: "rejected", approvedDate: new Date().toISOString() });
  };

  const handleDelete = (id: string) => {
    deletePromotionRequest(id);
    setDeleteConfirmId(null);
  };

  const handleBulkPromote = () => {
    const lines = bulkCsvText.trim().split("\n").filter((l) => l.trim());
    lines.forEach((line) => {
      const [empId, proposedGrade, salary, effDate] = line.split(",").map((s) => s.trim());
      const emp = employees.find((e) => e.employeeId === empId || e.id === empId);
      if (emp) {
        addPromotionRequest({
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          currentGrade: emp.payGradeName || "",
          proposedGrade,
          proposedSalary: Number(salary) || 0,
          effectiveDate: effDate || new Date().toISOString().split("T")[0],
          status: "pending",
          raisedBy: "admin-1",
          raisedByName: "Admin User",
        });
      }
    });
    setBulkDialogOpen(false);
    setBulkCsvText("");
  };

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const statusBadge = (status: PromotionRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "processed":
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">
            <FileText className="mr-2 h-4 w-4" />
            Promotion Requests
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Promotion Settings
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Promotion History
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Promotion Requests */}
        <TabsContent value="requests" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Requests</CardTitle>
              <CardDescription>Manage employee promotion requests and approvals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee or requester..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Bulk Promote
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Bulk Promote Employees</DialogTitle>
                        <DialogDescription>
                          Paste CSV data with format: EmployeeID, ProposedGrade, Salary, EffectiveDate (one per line)
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder={"EMP001,Grade 3,75000,2026-04-01\nEMP002,Grade 4,85000,2026-04-01"}
                        value={bulkCsvText}
                        onChange={(e) => setBulkCsvText(e.target.value)}
                        rows={8}
                      />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleBulkPromote} disabled={!bulkCsvText.trim()}>
                          Process Bulk Promotion
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Promote Employee
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Current Grade</TableHead>
                      <TableHead>Proposed Grade</TableHead>
                      <TableHead>Proposed Salary</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Raised By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          No promotion requests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.employeeName}</TableCell>
                          <TableCell>{req.currentGrade}</TableCell>
                          <TableCell>{req.proposedGrade}</TableCell>
                          <TableCell>{formatCurrency(req.proposedSalary)}</TableCell>
                          <TableCell>{formatDate(req.effectiveDate)}</TableCell>
                          <TableCell className="text-muted-foreground">{req.raisedByName}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(req.status)}`}>
                              {req.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(req.raisedDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setViewDetails(req)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {req.status === "pending" && (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(req)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleApprove(req.id)}>
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleReject(req.id)}>
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {req.status === "pending" && (
                                <Dialog open={deleteConfirmId === req.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(req.id)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Delete Promotion Request</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to delete this promotion request for &quot;{req.employeeName}&quot;? This action cannot be undone.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                        Cancel
                                      </Button>
                                      <Button variant="destructive" onClick={() => handleDelete(req.id)}>
                                        Delete
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
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

        {/* Tab 2: Promotion Settings */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Settings</CardTitle>
              <CardDescription>Configure default promotion workflows and templates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Default Approval Workflow</Label>
                <p className="text-sm text-muted-foreground">
                  Attach an approval workflow to be used for all promotion requests.
                </p>
                <Select
                  value={settingsForm.approvalWorkflowId}
                  onValueChange={(v) => setSettingsForm((s) => ({ ...s, approvalWorkflowId: v }))}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select a workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {promotionWorkflows.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Bulk Promotion Template</Label>
                <p className="text-sm text-muted-foreground">
                  Download a CSV template for bulk promotion uploads.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const header = "EmployeeID,ProposedGrade,ProposedSalary,EffectiveDate";
                    const sample = "EMP001,Grade 3,75000,2026-04-01";
                    const blob = new Blob([`${header}\n${sample}`], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "bulk-promotion-template.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveSettings}>
                  Save Settings
                </Button>
                {settingsSaved && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Settings saved successfully
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Promotion History */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Promotion History</CardTitle>
              <CardDescription>View completed promotions and historical records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee name..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
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
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const header = "Employee,Previous Grade,New Grade,Previous Salary,New Salary,Effective Date,Approved By,Approved Date";
                    const rows = filteredHistory
                      .map(
                        (h) =>
                          `${h.employeeName},${h.previousGrade},${h.newGrade},${h.previousSalary},${h.newSalary},${h.effectiveDate},${h.approvedBy},${h.approvedDate}`
                      )
                      .join("\n");
                    const blob = new Blob([`${header}\n${rows}`], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "promotion-history.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Previous Grade</TableHead>
                      <TableHead>New Grade</TableHead>
                      <TableHead>Previous Salary</TableHead>
                      <TableHead>New Salary</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Approved Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No promotion history found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">{h.employeeName}</TableCell>
                          <TableCell>{h.previousGrade}</TableCell>
                          <TableCell>{h.newGrade}</TableCell>
                          <TableCell>{formatCurrency(h.previousSalary)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(h.newSalary)}
                          </TableCell>
                          <TableCell>{formatDate(h.effectiveDate)}</TableCell>
                          <TableCell className="text-muted-foreground">{h.approvedBy}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(h.approvedDate)}</TableCell>
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

      {/* Create / Edit Promotion Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Promotion Request" : "Promote Employee"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the promotion request details below."
                : "Create a new promotion request for an employee."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={promotionForm.employeeId}
                onValueChange={handleEmployeeSelect}
                disabled={!!editingId}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Grade</Label>
                <Input value={promotionForm.currentGrade} disabled />
              </div>
              <div className="space-y-2">
                <Label>Proposed Grade</Label>
                <Select
                  value={promotionForm.proposedGrade}
                  onValueChange={(v) => setPromotionForm((s) => ({ ...s, proposedGrade: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRoles.map((jr) => (
                      <SelectItem key={jr.id} value={jr.name}>
                        {jr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proposed Salary</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={promotionForm.proposedSalary || ""}
                  onChange={(e) =>
                    setPromotionForm((s) => ({ ...s, proposedSalary: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={promotionForm.effectiveDate}
                  onChange={(e) =>
                    setPromotionForm((s) => ({ ...s, effectiveDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Approval Workflow</Label>
              <Select
                value={promotionForm.approvalWorkflowId}
                onValueChange={(v) => setPromotionForm((s) => ({ ...s, approvalWorkflowId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a workflow" />
                </SelectTrigger>
                <SelectContent>
                  {promotionWorkflows.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                placeholder="Reason for promotion..."
                value={promotionForm.comments}
                onChange={(e) => setPromotionForm((s) => ({ ...s, comments: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!promotionForm.employeeId || !promotionForm.proposedGrade || !promotionForm.effectiveDate}
            >
              {editingId ? "Update Request" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewDetails} onOpenChange={(open) => !open && setViewDetails(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Promotion Request Details</DialogTitle>
            <DialogDescription>Full details of the promotion request.</DialogDescription>
          </DialogHeader>
          {viewDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Employee</span>
                  <p className="font-medium">{viewDetails.employeeName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(viewDetails.status)}`}>
                      {viewDetails.status}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Grade</span>
                  <p className="font-medium">{viewDetails.currentGrade}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Proposed Grade</span>
                  <p className="font-medium">{viewDetails.proposedGrade}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Proposed Salary</span>
                  <p className="font-medium">{formatCurrency(viewDetails.proposedSalary)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Effective Date</span>
                  <p className="font-medium">{formatDate(viewDetails.effectiveDate)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Raised By</span>
                  <p className="font-medium">{viewDetails.raisedByName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Raised Date</span>
                  <p className="font-medium">{formatDate(viewDetails.raisedDate)}</p>
                </div>
              </div>
              {viewDetails.comments && (
                <div>
                  <span className="text-muted-foreground text-sm">Comments</span>
                  <p className="text-sm mt-1">{viewDetails.comments}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetails(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
