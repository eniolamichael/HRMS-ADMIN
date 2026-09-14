"use client";

import { useState } from "react";
import { useHod } from "@/contexts/hod-context";
import { useHrms } from "@/contexts/hrms-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Send, Eye } from "lucide-react";

export default function HodJobRequisitions() {
  const {
    myRequisitions,
    saveRequisition,
    updateRequisition,
    deleteRequisition,
    requisitionPolicies,
    hodName,
    departmentId,
    departmentName,
  } = useHod();
  const hrms = useHrms();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const [policyId, setPolicyId] = useState("");
  const [title, setTitle] = useState("");
  const [jobRoleId, setJobRoleId] = useState("");
  const [vacancies, setVacancies] = useState(1);
  const [salaryRange, setSalaryRange] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState<"draft" | "pending_approval">("draft");

  const editing = myRequisitions.find((r) => r.id === editingId) ?? null;
  const viewing = myRequisitions.find((r) => r.id === viewingId) ?? null;
  const selectedRole = hrms.jobRoles.find((r) => r.id === jobRoleId);

  const openCreate = () => {
    setEditingId(null);
    setPolicyId(requisitionPolicies[0]?.id ?? "");
    setTitle("");
    setJobRoleId("role-1");
    setVacancies(1);
    setSalaryRange("");
    setDescription("");
    setRequirements("");
    setStatus("draft");
    setShowCreate(true);
  };

  const openEdit = (id: string) => {
    const r = myRequisitions.find((x) => x.id === id);
    if (!r) return;
    setEditingId(id);
    setPolicyId(r.policyId);
    setTitle(r.title);
    setJobRoleId(r.jobRoleId);
    setVacancies(r.vacancies);
    setSalaryRange(r.salaryRange);
    setDescription(r.description);
    setRequirements(r.requirements);
    setStatus("draft");
    setShowCreate(true);
  };

  const submit = () => {
    const payload = {
      policyId,
      policyName: requisitionPolicies.find((p) => p.id === policyId)?.name ?? "",
      title,
      departmentId,
      departmentName,
      jobRoleId,
      jobRoleName: selectedRole?.name ?? "",
      vacancies,
      salaryRange,
      description,
      requirements,
      status: status as "draft" | "pending_approval",
    };

    if (editingId) {
      updateRequisition(editingId, { ...payload, status: status as "draft" | "pending_approval" });
    } else {
      saveRequisition(payload);
    }
    setShowCreate(false);
  };

  const submitForApproval = (id: string) => {
    updateRequisition(id, { status: "pending_approval" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Job Requisitions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Raise requisitions for vacant roles in {departmentName}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Raise Requisition
        </Button>
      </div>

      {myRequisitions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-500">
            You have not raised any job requisitions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myRequisitions.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{r.title}</CardTitle>
                    <CardDescription className="mt-0.5">
                      {r.jobRoleName} · {r.vacancies} vacancy(ies)
                    </CardDescription>
                  </div>
                  <Badge
                    className={`capitalize ${
                      r.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        : r.status === "pending_approval"
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                        : r.status === "rejected"
                        ? "bg-red-50 text-red-700 hover:bg-red-50"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {r.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 line-clamp-2">{r.description}</p>
                <p className="text-xs text-gray-400">
                  Salary: {r.salaryRange || "—"} · Raised {r.raisedDate} by {r.raisedByName}
                </p>
                {r.status === "rejected" && r.rejectionReason && (
                  <p className="text-xs text-red-600">Reason: {r.rejectionReason}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setViewingId(r.id)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  {r.status === "draft" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => openEdit(r.id)}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteRequisition(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {r.status === "draft" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => submitForApproval(r.id)}
                    >
                      <Send className="h-4 w-4" /> Submit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / edit dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Requisition" : "Raise Job Requisition"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Requisition Policy</Label>
              <Select value={policyId} onValueChange={setPolicyId}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {requisitionPolicies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job Title</Label>
              <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Job Role</Label>
                <Select value={jobRoleId} onValueChange={setJobRoleId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrms.jobRoles.map((j) => (
                      <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Number of Vacancies</Label>
                <Input
                  type="number"
                  min={1}
                  className="mt-1"
                  value={vacancies}
                  onChange={(e) => setVacancies(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label>Salary Range</Label>
              <Input className="mt-1" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="e.g. 3,000,000 – 5,000,000 NGN" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Role overview" />
            </div>
            <div>
              <Label>Requirements</Label>
              <Textarea className="mt-1" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} placeholder="Key skills and experience" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "pending_approval")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="pending_approval">Submit for Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!title.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {status === "pending_approval" ? "Submit for Approval" : "Save Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      {viewing && (
        <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{viewing.title}</DialogTitle>
            </DialogHeader>
            <div className="text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <Badge className="capitalize">{viewing.status.replace("_", " ")}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Job Role</span>
                <span className="font-medium text-gray-900">{viewing.jobRoleName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Vacancies</span>
                <span className="font-medium text-gray-900">{viewing.vacancies}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Salary Range</span>
                <span className="font-medium text-gray-900">{viewing.salaryRange || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Raised By</span>
                <span className="font-medium text-gray-900">{viewing.raisedByName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Policy</span>
                <span className="font-medium text-gray-900">{viewing.policyName}</span>
              </div>
              <p className="pt-2 text-gray-700 border-t">{viewing.description}</p>
              <p className="text-gray-700">{viewing.requirements}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewingId(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}