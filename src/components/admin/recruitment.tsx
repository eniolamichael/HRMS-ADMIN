"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import {
  JobRequisitionPolicy,
  JobRequisition,
  RecruitmentWorkflow,
  RecruitmentStep,
  CandidateRestriction,
} from "@/types/hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Upload,
  ExternalLink,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

export default function Recruitment() {
  const {
    requisitionPolicies,
    addRequisitionPolicy,
    updateRequisitionPolicy,
    deleteRequisitionPolicy,
    jobRequisitions,
    addJobRequisition,
    updateJobRequisition,
    deleteJobRequisition,
    recruitmentWorkflows,
    addRecruitmentWorkflow,
    updateRecruitmentWorkflow,
    deleteRecruitmentWorkflow,
    candidateRestrictions,
    addCandidateRestriction,
    deleteCandidateRestriction,
    approvalWorkflows,
    departments,
    jobRoles,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("policies");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"policy" | "requisition" | "workflow" | "restriction" | null>(null);

  // Policy state
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState({
    name: "",
    description: "",
    approvalWorkflowId: "",
    isActive: true,
  });

  // Requisition state
  const [reqDialogOpen, setReqDialogOpen] = useState(false);
  const [viewReqDialogOpen, setViewReqDialogOpen] = useState(false);
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [viewingReq, setViewingReq] = useState<JobRequisition | null>(null);
  const [postConfirmId, setPostConfirmId] = useState<string | null>(null);
  const [reqForm, setReqForm] = useState({
    title: "",
    policyId: "",
    departmentId: "",
    jobRoleId: "",
    vacancies: 1,
    salaryRange: "",
    description: "",
    requirements: "",
  });

  // Workflow state
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [workflowForm, setWorkflowForm] = useState({
    name: "",
    steps: [] as { id: string; name: string; visibleToCandidate: boolean }[],
  });

  // Restriction state
  const [restrictionDialogOpen, setRestrictionDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [restrictionForm, setRestrictionForm] = useState({
    email: "",
    reason: "",
    restrictedDate: new Date().toISOString().split("T")[0],
  });
  const [bulkEmails, setBulkEmails] = useState("");

  // ─── POLICY ───
  const openCreatePolicy = () => {
    setEditingPolicyId(null);
    setPolicyForm({ name: "", description: "", approvalWorkflowId: "", isActive: true });
    setPolicyDialogOpen(true);
  };

  const openEditPolicy = (p: JobRequisitionPolicy) => {
    setEditingPolicyId(p.id);
    setPolicyForm({
      name: p.name,
      description: p.description,
      approvalWorkflowId: p.approvalWorkflowId,
      isActive: p.isActive,
    });
    setPolicyDialogOpen(true);
  };

  const handleSavePolicy = () => {
    if (!policyForm.name.trim()) return;
    const wf = approvalWorkflows.find((w) => w.id === policyForm.approvalWorkflowId);
    if (editingPolicyId) {
      updateRequisitionPolicy(editingPolicyId, {
        ...policyForm,
        approvalWorkflowName: wf?.name ?? "",
      });
    } else {
      addRequisitionPolicy({
        ...policyForm,
        approvalWorkflowName: wf?.name ?? "",
        createdAt: new Date().toISOString(),
      });
    }
    setPolicyDialogOpen(false);
  };

  // ─── REQUISITION ───
  const filteredRequisitions = jobRequisitions.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.departmentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreateReq = () => {
    setEditingReqId(null);
    setReqForm({ title: "", policyId: "", departmentId: "", jobRoleId: "", vacancies: 1, salaryRange: "", description: "", requirements: "" });
    setReqDialogOpen(true);
  };

  const openEditReq = (r: JobRequisition) => {
    setEditingReqId(r.id);
    setReqForm({
      title: r.title,
      policyId: r.policyId,
      departmentId: r.departmentId,
      jobRoleId: r.jobRoleId,
      vacancies: r.vacancies,
      salaryRange: r.salaryRange,
      description: r.description,
      requirements: r.requirements,
    });
    setReqDialogOpen(true);
  };

  const handleSaveReq = () => {
    if (!reqForm.title.trim()) return;
    const pol = requisitionPolicies.find((p) => p.id === reqForm.policyId);
    const dept = departments.find((d) => d.id === reqForm.departmentId);
    const role = jobRoles.find((j) => j.id === reqForm.jobRoleId);
    if (editingReqId) {
      updateJobRequisition(editingReqId, {
        ...reqForm,
        policyName: pol?.name ?? "",
        departmentName: dept?.name ?? "",
        jobRoleName: role?.name ?? "",
      });
    } else {
      addJobRequisition({
        ...reqForm,
        policyName: pol?.name ?? "",
        departmentName: dept?.name ?? "",
        jobRoleName: role?.name ?? "",
        status: "draft",
        raisedBy: "current-user",
        raisedByName: "Current User",
        raisedDate: new Date().toISOString(),
      });
    }
    setReqDialogOpen(false);
  };

  const handlePostToSeamlessHiring = (id: string) => {
    updateJobRequisition(id, { status: "posted" });
    setPostConfirmId(null);
  };

  const reqStatusColor = (s: JobRequisition["status"]) => {
    switch (s) {
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "posted":
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const reqStatusLabel = (s: JobRequisition["status"]) => {
    switch (s) {
      case "draft": return "Draft";
      case "pending_approval": return "Pending Approval";
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      case "posted": return "Posted";
    }
  };

  // ─── WORKFLOW ───
  const openCreateWorkflow = () => {
    setEditingWorkflowId(null);
    setWorkflowForm({ name: "", steps: [] });
    setWorkflowDialogOpen(true);
  };

  const openEditWorkflow = (w: RecruitmentWorkflow) => {
    setEditingWorkflowId(w.id);
    setWorkflowForm({
      name: w.name,
      steps: w.steps.map((s) => ({ id: s.id, name: s.name, visibleToCandidate: s.visibleToCandidate })),
    });
    setWorkflowDialogOpen(true);
  };

  const addWorkflowStep = () => {
    setWorkflowForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { id: generateId(), name: "", visibleToCandidate: false }],
    }));
  };

  const removeWorkflowStep = (stepId: string) => {
    setWorkflowForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }));
  };

  const moveWorkflowStep = (stepId: string, direction: "up" | "down") => {
    setWorkflowForm((prev) => {
      const idx = prev.steps.findIndex((s) => s.id === stepId);
      if (idx === -1) return prev;
      const newSteps = [...prev.steps];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newSteps.length) return prev;
      [newSteps[idx], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[idx]];
      return { ...prev, steps: newSteps };
    });
  };

  const handleSaveWorkflow = () => {
    if (!workflowForm.name.trim()) return;
    if (editingWorkflowId) {
      updateRecruitmentWorkflow(editingWorkflowId, {
        name: workflowForm.name,
        steps: workflowForm.steps.map((s, i) => ({ ...s, order: i + 1 })),
      });
    } else {
      addRecruitmentWorkflow({
        name: workflowForm.name,
        steps: workflowForm.steps.map((s, i) => ({ ...s, order: i + 1 })),
        isActive: true,
      });
    }
    setWorkflowDialogOpen(false);
  };

  // ─── RESTRICTION ───
  const handleSaveRestriction = () => {
    if (!restrictionForm.email.trim()) return;
    addCandidateRestriction({
      ...restrictionForm,
    });
    setRestrictionDialogOpen(false);
    setRestrictionForm({ email: "", reason: "", restrictedDate: new Date().toISOString().split("T")[0] });
  };

  const handleBulkUpload = () => {
    const lines = bulkEmails
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l.includes("@"));
    lines.forEach((email) => {
      addCandidateRestriction({
        email,
        reason: "Bulk upload",
        restrictedDate: new Date().toISOString().split("T")[0],
      });
    });
    setBulkUploadDialogOpen(false);
    setBulkEmails("");
  };

  // ─── DELETE ───
  const confirmDelete = (id: string, type: "policy" | "requisition" | "workflow" | "restriction") => {
    setDeleteConfirmId(id);
    setDeleteType(type);
  };

  const handleDelete = () => {
    if (!deleteConfirmId || !deleteType) return;
    switch (deleteType) {
      case "policy":
        deleteRequisitionPolicy(deleteConfirmId);
        break;
      case "requisition":
        deleteJobRequisition(deleteConfirmId);
        break;
      case "workflow":
        deleteRecruitmentWorkflow(deleteConfirmId);
        break;
      case "restriction":
        deleteCandidateRestriction(deleteConfirmId);
        break;
    }
    setDeleteConfirmId(null);
    setDeleteType(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="policies">Requisition Policies</TabsTrigger>
          <TabsTrigger value="requisitions">Job Requisitions</TabsTrigger>
          <TabsTrigger value="workflows">Recruitment Workflows</TabsTrigger>
          <TabsTrigger value="restrictions">Candidate Restrictions</TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB 1: POLICIES ═══════════ */}
        <TabsContent value="policies" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Requisition Policies</CardTitle>
                <CardDescription>Define approval policies for job requisitions.</CardDescription>
              </div>
              <Button onClick={openCreatePolicy}>
                <Plus className="mr-2 h-4 w-4" />
                Create Policy
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Approval Workflow</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requisitionPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No policies found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      requisitionPolicies.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[250px] truncate">{p.description}</TableCell>
                          <TableCell>{p.approvalWorkflowName || "—"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                              {p.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditPolicy(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(p.id, "policy")}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

        {/* ═══════════ TAB 2: REQUISITIONS ═══════════ */}
        <TabsContent value="requisitions" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Job Requisitions</CardTitle>
                <CardDescription>Create and manage job requisitions across departments.</CardDescription>
              </div>
              <Button onClick={openCreateReq}>
                <Plus className="mr-2 h-4 w-4" />
                Create Requisition
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requisitions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Job Role</TableHead>
                      <TableHead>Vacancies</TableHead>
                      <TableHead>Salary Range</TableHead>
                      <TableHead>Raised By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequisitions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          No requisitions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequisitions.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.title}</TableCell>
                          <TableCell>{r.departmentName}</TableCell>
                          <TableCell>{r.jobRoleName}</TableCell>
                          <TableCell>{r.vacancies}</TableCell>
                          <TableCell className="text-muted-foreground">{r.salaryRange}</TableCell>
                          <TableCell className="text-muted-foreground">{r.raisedByName}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${reqStatusColor(r.status)}`}>
                              {reqStatusLabel(r.status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{formatDate(r.raisedDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setViewingReq(r); setViewReqDialogOpen(true); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(r.status === "draft" || r.status === "pending_approval") && (
                                <Button variant="ghost" size="icon" onClick={() => openEditReq(r)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {r.status === "approved" && (
                                <Button variant="ghost" size="icon" onClick={() => setPostConfirmId(r.id)}>
                                  <ExternalLink className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              {r.status === "draft" && (
                                <Button variant="ghost" size="icon" onClick={() => confirmDelete(r.id, "requisition")}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* ═══════════ TAB 3: WORKFLOWS ═══════════ */}
        <TabsContent value="workflows" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recruitment Workflows</CardTitle>
                <CardDescription>Define the stages in your recruitment pipeline.</CardDescription>
              </div>
              <Button onClick={openCreateWorkflow}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Steps Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recruitmentWorkflows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No workflows found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recruitmentWorkflows.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="font-medium">{w.name}</TableCell>
                          <TableCell>{w.steps.length}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${w.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                              {w.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditWorkflow(w)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(w.id, "workflow")}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

        {/* ═══════════ TAB 4: CANDIDATE RESTRICTIONS ═══════════ */}
        <TabsContent value="restrictions" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Candidate Restrictions</CardTitle>
                <CardDescription>Manage restricted candidates from applying to positions.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBulkUploadDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
                <Button onClick={() => {
                  setRestrictionForm({ email: "", reason: "", restrictedDate: new Date().toISOString().split("T")[0] });
                  setRestrictionDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Restriction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Restricted Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidateRestrictions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No restricted candidates.
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidateRestrictions.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.email}</TableCell>
                          <TableCell className="text-muted-foreground">{c.reason}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(c.restrictedDate)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => confirmDelete(c.id, "restriction")}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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

      {/* ═══════════ POLICY DIALOG ═══════════ */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPolicyId ? "Edit Policy" : "Create Requisition Policy"}</DialogTitle>
            <DialogDescription>Define the policy for job requisition approvals.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Standard Hiring Policy"
                value={policyForm.name}
                onChange={(e) => setPolicyForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this policy..."
                value={policyForm.description}
                onChange={(e) => setPolicyForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Approval Workflow</Label>
              <Select
                value={policyForm.approvalWorkflowId}
                onValueChange={(v) => setPolicyForm((s) => ({ ...s, approvalWorkflowId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  {approvalWorkflows.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={policyForm.isActive}
                onCheckedChange={(c) => setPolicyForm((s) => ({ ...s, isActive: c }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePolicy} disabled={!policyForm.name.trim()}>
              {editingPolicyId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ REQUISITION DIALOG ═══════════ */}
      <Dialog open={reqDialogOpen} onOpenChange={setReqDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReqId ? "Edit Requisition" : "Create Requisition"}</DialogTitle>
            <DialogDescription>Fill in the details for the job requisition.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Senior Software Engineer"
                value={reqForm.title}
                onChange={(e) => setReqForm((s) => ({ ...s, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Policy</Label>
              <Select value={reqForm.policyId} onValueChange={(v) => setReqForm((s) => ({ ...s, policyId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  {requisitionPolicies.filter((p) => p.isActive).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={reqForm.departmentId} onValueChange={(v) => setReqForm((s) => ({ ...s, departmentId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.filter((d) => d.isActive).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job Role</Label>
              <Select value={reqForm.jobRoleId} onValueChange={(v) => setReqForm((s) => ({ ...s, jobRoleId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.filter((j) => j.isActive).map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vacancies</Label>
                <Input
                  type="number"
                  min={1}
                  value={reqForm.vacancies}
                  onChange={(e) => setReqForm((s) => ({ ...s, vacancies: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <Input
                  placeholder="e.g. $80,000 - $120,000"
                  value={reqForm.salaryRange}
                  onChange={(e) => setReqForm((s) => ({ ...s, salaryRange: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the role..."
                rows={3}
                value={reqForm.description}
                onChange={(e) => setReqForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Requirements</Label>
              <Textarea
                placeholder="List the requirements..."
                rows={3}
                value={reqForm.requirements}
                onChange={(e) => setReqForm((s) => ({ ...s, requirements: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReqDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReq} disabled={!reqForm.title.trim()}>
              {editingReqId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ VIEW REQUISITION DETAIL ═══════════ */}
      <Dialog open={viewReqDialogOpen} onOpenChange={setViewReqDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingReq?.title}</DialogTitle>
            <DialogDescription>Requisition Details</DialogDescription>
          </DialogHeader>
          {viewingReq && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <p className="font-medium">{viewingReq.departmentName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Job Role:</span>
                  <p className="font-medium">{viewingReq.jobRoleName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vacancies:</span>
                  <p className="font-medium">{viewingReq.vacancies}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Salary Range:</span>
                  <p className="font-medium">{viewingReq.salaryRange}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Raised By:</span>
                  <p className="font-medium">{viewingReq.raisedByName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{formatDate(viewingReq.raisedDate)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground text-sm">Description</span>
                <p className="text-sm mt-1">{viewingReq.description || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Requirements</span>
                <p className="text-sm mt-1 whitespace-pre-wrap">{viewingReq.requirements || "—"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReqDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ POST CONFIRM ═══════════ */}
      <Dialog open={postConfirmId !== null} onOpenChange={(o) => !o && setPostConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post to SeamlessHiring</DialogTitle>
            <DialogDescription>
              Are you sure you want to post this requisition to SeamlessHiring? This will make it publicly visible to candidates.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostConfirmId(null)}>Cancel</Button>
            <Button onClick={() => postConfirmId && handlePostToSeamlessHiring(postConfirmId)}>
              Confirm & Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ WORKFLOW DIALOG ═══════════ */}
      <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWorkflowId ? "Edit Workflow" : "Create Recruitment Workflow"}</DialogTitle>
            <DialogDescription>Define the recruitment pipeline steps.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Standard Hiring Pipeline"
                value={workflowForm.name}
                onChange={(e) => setWorkflowForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Steps</Label>
                <Button variant="outline" size="sm" onClick={addWorkflowStep}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Step
                </Button>
              </div>
              {workflowForm.steps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No steps added. Click &quot;Add Step&quot; to begin.</p>
              )}
              {workflowForm.steps.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2 rounded-md border p-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground w-6">{idx + 1}.</span>
                  <Input
                    placeholder="Step name"
                    value={step.name}
                    onChange={(e) =>
                      setWorkflowForm((prev) => ({
                        ...prev,
                        steps: prev.steps.map((s) => (s.id === step.id ? { ...s, name: e.target.value } : s)),
                      }))
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Visible</Label>
                    <Switch
                      checked={step.visibleToCandidate}
                      onCheckedChange={(c) =>
                        setWorkflowForm((prev) => ({
                          ...prev,
                          steps: prev.steps.map((s) => (s.id === step.id ? { ...s, visibleToCandidate: c } : s)),
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveWorkflowStep(step.id, "up")} disabled={idx === 0}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveWorkflowStep(step.id, "down")} disabled={idx === workflowForm.steps.length - 1}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeWorkflowStep(step.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWorkflowDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveWorkflow} disabled={!workflowForm.name.trim()}>
              {editingWorkflowId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ RESTRICTION DIALOG ═══════════ */}
      <Dialog open={restrictionDialogOpen} onOpenChange={setRestrictionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Candidate Restriction</DialogTitle>
            <DialogDescription>Restrict a candidate from applying.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="candidate@email.com"
                value={restrictionForm.email}
                onChange={(e) => setRestrictionForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                placeholder="e.g. Policy violation"
                value={restrictionForm.reason}
                onChange={(e) => setRestrictionForm((s) => ({ ...s, reason: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={restrictionForm.restrictedDate}
                onChange={(e) => setRestrictionForm((s) => ({ ...s, restrictedDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestrictionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRestriction} disabled={!restrictionForm.email.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ BULK UPLOAD DIALOG ═══════════ */}
      <Dialog open={bulkUploadDialogOpen} onOpenChange={setBulkUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Restricted Emails</DialogTitle>
            <DialogDescription>Paste email addresses separated by commas or new lines.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={"email1@example.com\nemail2@example.com"}
              rows={6}
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpload} disabled={!bulkEmails.trim()}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ DELETE CONFIRM ═══════════ */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(o) => { if (!o) { setDeleteConfirmId(null); setDeleteType(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirmId(null); setDeleteType(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
