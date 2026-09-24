"use client";

import { useState } from "react";
import { useSupervisor } from "@/contexts/supervisor-context";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, Plus, Eye, Pencil, Trash2 } from "lucide-react";

export default function SupervisorPromotions() {
  const {
    teamPromotionRequests,
    teamPromotionHistory,
    directReports,
    requestPromotion,
    updatePromotionRequest,
    deletePromotionRequest,
  } = useSupervisor();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRaise, setShowRaise] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [currentGrade, setCurrentGrade] = useState("");
  const [proposedGrade, setProposedGrade] = useState("");
  const [proposedSalary, setProposedSalary] = useState(0);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [comments, setComments] = useState("");

  const filtered = teamPromotionRequests.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter,
  );

  const viewing = teamPromotionRequests.find((r) => r.id === viewingId) ?? null;
  const editing = teamPromotionRequests.find((r) => r.id === editingId) ?? null;

  const openRaise = () => {
    setEmployeeId("");
    setCurrentGrade("");
    setProposedGrade("");
    setProposedSalary(0);
    setEffectiveDate("");
    setComments("");
    setShowRaise(true);
  };

  const openEdit = (id: string) => {
    const r = teamPromotionRequests.find((x) => x.id === id);
    if (!r) return;
    setEditingId(id);
    setEmployeeId(r.employeeId);
    setCurrentGrade(r.currentGrade);
    setProposedGrade(r.proposedGrade);
    setProposedSalary(r.proposedSalary);
    setEffectiveDate(r.effectiveDate);
    setComments(r.comments ?? "");
    setShowRaise(true);
  };

  const submit = () => {
    const emp = directReports.find((e) => e.id === employeeId);
    const payload = {
      employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
      currentGrade,
      proposedGrade,
      proposedSalary,
      effectiveDate,
      status: "pending" as const,
      comments,
    };
    if (editingId) {
      updatePromotionRequest(editingId, payload);
    } else {
      requestPromotion(payload);
    }
    setShowRaise(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and initiate promotions for your direct reports
          </p>
        </div>
        <Button onClick={openRaise} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Initiate Promotion
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {teamPromotionRequests.filter((r) => r.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {teamPromotionRequests.filter((r) => r.status === "approved").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">History Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{teamPromotionHistory.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Promotion Requests</TabsTrigger>
          <TabsTrigger value="history">Promotion History</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No promotion requests found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{r.employeeName}</CardTitle>
                        <CardDescription className="mt-0.5">
                          {r.currentGrade} → {r.proposedGrade}
                        </CardDescription>
                      </div>
                      <Badge
                        className={`capitalize ${
                          r.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                            : r.status === "rejected"
                            ? "bg-red-50 text-red-700 hover:bg-red-50"
                            : r.status === "processed"
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                        }`}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Proposed Salary</span>
                      <span className="font-medium text-gray-900">
                        ₦{(r.proposedSalary / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Raised By</span>
                      <span className="text-gray-700">{r.raisedByName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Raised</span>
                      <span className="text-gray-700">{r.raisedDate}</span>
                    </div>
                    {r.comments && <p className="text-xs text-gray-500">"{r.comments}"</p>}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => setViewingId(r.id)}>
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => openEdit(r.id)}>
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => deletePromotionRequest(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Promotion History</CardTitle>
              <CardDescription>Completed promotions for your direct reports</CardDescription>
            </CardHeader>
            <CardContent>
              {teamPromotionHistory.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No promotion history.</p>
              ) : (
                <div className="divide-y">
                  {teamPromotionHistory.map((h) => (
                    <div key={h.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{h.employeeName}</p>
                        <p className="text-xs text-gray-500">
                          {h.previousGrade} → {h.newGrade} · Effective {h.effectiveDate}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">Approved by {h.approvedBy}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Initiate promotion dialog */}
      <Dialog open={showRaise} onOpenChange={setShowRaise}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              {editingId ? "Edit Promotion Request" : "Initiate Promotion"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a direct report" />
                </SelectTrigger>
                <SelectContent>
                  {directReports.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Current Grade</Label>
                <Input className="mt-1" value={currentGrade} onChange={(e) => setCurrentGrade(e.target.value)} placeholder="PG-3" />
              </div>
              <div>
                <Label>Proposed Grade</Label>
                <Input className="mt-1" value={proposedGrade} onChange={(e) => setProposedGrade(e.target.value)} placeholder="PG-5" />
              </div>
            </div>
            <div>
              <Label>Proposed Salary (NGN)</Label>
              <Input
                type="number"
                className="mt-1"
                value={proposedSalary || ""}
                onChange={(e) => setProposedSalary(Number(e.target.value))}
                placeholder="5000000"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Effective Date</Label>
                <Input type="date" className="mt-1" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Comments</Label>
              <Input className="mt-1" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Justification / notes" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRaise(false)}>Cancel</Button>
            <Button
              onClick={submit}
              disabled={!employeeId || !currentGrade || !proposedGrade}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {editingId ? "Save Changes" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      {viewing && (
        <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Promotion Details — {viewing.employeeName}
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <Badge className="capitalize">{viewing.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Grade Move</span>
                <span className="font-medium text-gray-900">{viewing.currentGrade} → {viewing.proposedGrade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Proposed Salary</span>
                <span className="font-medium text-gray-900">₦{(viewing.proposedSalary / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Raised By</span>
                <span className="text-gray-900">{viewing.raisedByName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Raised Date</span>
                <span className="text-gray-900">{viewing.raisedDate}</span>
              </div>
              {viewing.effectiveDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Effective Date</span>
                  <span className="text-gray-900">{viewing.effectiveDate}</span>
                </div>
              )}
              {viewing.comments && <p className="pt-2 border-t text-gray-600">{viewing.comments}</p>}
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