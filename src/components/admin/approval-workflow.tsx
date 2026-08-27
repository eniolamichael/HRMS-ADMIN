"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import {
  ApprovalWorkflow,
  ApprovalStage,
  ApprovalApprover,
} from "@/types/hrms";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  GitBranch,
  ChevronUp,
  ChevronDown,
  GripVertical,
  X,
  UserPlus,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

const WORKFLOW_MODULES = [
  "Leave",
  "Promotion",
  "Job Requisition",
  "Exit",
  "Employee Creation",
  "General",
];

const ACTION_TYPES = ["approve_decline", "review_only"] as const;

const defaultWorkflowForm = {
  name: "",
  description: "",
  module: "",
  isActive: true,
  stages: [] as ApprovalStage[],
};

const emptyApprover: ApprovalApprover = {
  userId: "",
  name: "",
  email: "",
  role: "",
};

export default function ApprovalWorkflowManager() {
  const {
    approvalWorkflows,
    addApprovalWorkflow,
    updateApprovalWorkflow,
    deleteApprovalWorkflow,
    employees,
  } = useHrms();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultWorkflowForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Approver dialog
  const [approverDialogOpen, setApproverDialogOpen] = useState(false);
  const [approverStageIdx, setApproverStageIdx] = useState<number | null>(null);
  const [approverForm, setApproverForm] = useState<ApprovalApprover>(
    emptyApprover
  );

  const filtered = approvalWorkflows.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.module.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultWorkflowForm);
    setDialogOpen(true);
  };

  const openEdit = (wf: ApprovalWorkflow) => {
    setEditingId(wf.id);
    setForm({
      name: wf.name,
      description: wf.description,
      module: wf.module,
      isActive: wf.isActive,
      stages: wf.stages.map((s) => ({ ...s, approvers: [...s.approvers] })),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.module) return;

    if (editingId) {
      updateApprovalWorkflow(editingId, {
        ...form,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addApprovalWorkflow({
        ...form,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteApprovalWorkflow(id);
    setDeleteConfirmId(null);
  };

  const addStage = () => {
    const newStage: ApprovalStage = {
      id: generateId(),
      name: "",
      order: form.stages.length + 1,
      approvers: [],
      requireDeclineComment: false,
      action: "approve_decline",
    };
    setForm((s) => ({ ...s, stages: [...s.stages, newStage] }));
  };

  const updateStage = (idx: number, updates: Partial<ApprovalStage>) => {
    setForm((s) => ({
      ...s,
      stages: s.stages.map((st, i) =>
        i === idx ? { ...st, ...updates } : st
      ),
    }));
  };

  const removeStage = (idx: number) => {
    setForm((s) => ({
      ...s,
      stages: s.stages
        .filter((_, i) => i !== idx)
        .map((st, i) => ({ ...st, order: i + 1 })),
    }));
  };

  const moveStageUp = (idx: number) => {
    if (idx === 0) return;
    setForm((s) => {
      const stages = [...s.stages];
      [stages[idx - 1], stages[idx]] = [stages[idx], stages[idx - 1]];
      return {
        ...s,
        stages: stages.map((st, i) => ({ ...st, order: i + 1 })),
      };
    });
  };

  const moveStageDown = (idx: number) => {
    if (idx >= form.stages.length - 1) return;
    setForm((s) => {
      const stages = [...s.stages];
      [stages[idx], stages[idx + 1]] = [stages[idx + 1], stages[idx]];
      return {
        ...s,
        stages: stages.map((st, i) => ({ ...st, order: i + 1 })),
      };
    });
  };

  const openAddApprover = (stageIdx: number) => {
    setApproverStageIdx(stageIdx);
    setApproverForm(emptyApprover);
    setApproverDialogOpen(true);
  };

  const handleAddApprover = () => {
    if (approverStageIdx === null || !approverForm.name.trim()) return;
    updateStage(approverStageIdx, {
      approvers: [
        ...form.stages[approverStageIdx].approvers,
        { ...approverForm },
      ],
    });
    setApproverDialogOpen(false);
  };

  const removeApprover = (stageIdx: number, approverIdx: number) => {
    updateStage(stageIdx, {
      approvers: form.stages[stageIdx].approvers.filter(
        (_, i) => i !== approverIdx
      ),
    });
  };

  const statusColor = (active: boolean) =>
    active
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Approval Workflows
              </CardTitle>
              <CardDescription>
                Configure approval processes for various HR modules.
              </CardDescription>
            </div>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Stages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No approval workflows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((wf) => (
                    <TableRow key={wf.id}>
                      <TableCell className="font-medium">{wf.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {wf.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{wf.module}</Badge>
                      </TableCell>
                      <TableCell>{wf.stages.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusColor(wf.isActive)}`}
                          >
                            {wf.isActive ? "Active" : "Inactive"}
                          </span>
                          <Switch
                            checked={wf.isActive}
                            onCheckedChange={(checked) =>
                              updateApprovalWorkflow(wf.id, {
                                isActive: checked,
                                updatedAt: new Date().toISOString(),
                              })
                            }
                            className="scale-75"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(wf.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(wf)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={deleteConfirmId === wf.id}
                            onOpenChange={(o) =>
                              !o && setDeleteConfirmId(null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirmId(wf.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Workflow</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete &quot;
                                  {wf.name}&quot;? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteConfirmId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(wf.id)}
                                >
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

      {/* Create/Edit Workflow Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Workflow" : "Create Workflow"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the workflow configuration and stages."
                : "Define a new approval workflow with stages and approvers."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="e.g. Leave Approval"
                />
              </div>
              <div className="space-y-2">
                <Label>Module</Label>
                <Select
                  value={form.module}
                  onValueChange={(v) =>
                    setForm((s) => ({ ...s, module: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_MODULES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(c) =>
                  setForm((s) => ({ ...s, isActive: c }))
                }
              />
            </div>

            <Separator />

            {/* Stages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Stages</h3>
                <Button variant="outline" size="sm" onClick={addStage}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stage
                </Button>
              </div>

              {form.stages.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                  <GitBranch className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">
                    No stages yet. Click &quot;Add Stage&quot; to begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.stages.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => moveStageUp(idx)}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => moveStageDown(idx)}
                            disabled={idx === form.stages.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge variant="secondary">Stage {stage.order}</Badge>
                        <div className="flex-1">
                          <Input
                            value={stage.name}
                            onChange={(e) =>
                              updateStage(idx, { name: e.target.value })
                            }
                            placeholder="Stage name"
                            className="max-w-xs"
                          />
                        </div>
                        <Select
                          value={stage.action}
                          onValueChange={(v) =>
                            updateStage(idx, {
                              action: v as ApprovalStage["action"],
                            })
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approve_decline">
                              Approve / Decline
                            </SelectItem>
                            <SelectItem value="review_only">
                              Review Only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStage(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      {/* Approvers */}
                      <div className="ml-8 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">
                            Approvers
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => openAddApprover(idx)}
                          >
                            <UserPlus className="mr-1 h-3 w-3" />
                            Add Approver
                          </Button>
                        </div>

                        {stage.approvers.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">
                            No approvers added.
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {stage.approvers.map((approver, aIdx) => (
                              <div
                                key={aIdx}
                                className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-1.5"
                              >
                                <div className="text-xs">
                                  <span className="font-medium">
                                    {approver.name}
                                  </span>
                                  <span className="text-muted-foreground ml-2">
                                    {approver.email}
                                  </span>
                                  {approver.role && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 text-[10px]"
                                    >
                                      {approver.role}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => removeApprover(idx, aIdx)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Require Decline Comment */}
                        <div className="flex items-center justify-between pt-1">
                          <Label className="text-xs text-muted-foreground">
                            Require decline comment
                          </Label>
                          <Switch
                            checked={stage.requireDeclineComment}
                            onCheckedChange={(c) =>
                              updateStage(idx, {
                                requireDeclineComment: c,
                              })
                            }
                            className="scale-75"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.module}
            >
              {editingId ? "Update Workflow" : "Create Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Approver Dialog */}
      <Dialog open={approverDialogOpen} onOpenChange={setApproverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Approver</DialogTitle>
            <DialogDescription>
              Select an employee to add as an approver for this stage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <Select
                value={approverForm.userId}
                onValueChange={(v) => {
                  const emp = employees.find((e) => e.id === v);
                  if (emp) {
                    setApproverForm({
                      userId: emp.id,
                      name: `${emp.firstName} ${emp.lastName}`,
                      email: emp.email,
                      role: emp.jobRoleName,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.jobRoleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {approverForm.userId && (
              <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
                <p>
                  <strong>Name:</strong> {approverForm.name}
                </p>
                <p>
                  <strong>Email:</strong> {approverForm.email}
                </p>
                <p>
                  <strong>Role:</strong> {approverForm.role}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproverDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddApprover}
              disabled={!approverForm.userId}
            >
              Add Approver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
