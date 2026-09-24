"use client";

import { useState } from "react";
import { useSupervisor } from "@/contexts/supervisor-context";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, CalendarClock, UserCheck } from "lucide-react";

export default function SupervisorLeaveApprovals() {
  const {
    teamLeaveRequests,
    approveLeave,
    rejectLeave,
    supervisorName,
    teamResumptionRequests,
    approveResumption,
  } = useSupervisor();
  const [dialog, setDialog] = useState<{
    id: string;
    name: string;
    decision: "approve" | "reject";
  } | null>(null);
  const [comment, setComment] = useState("");

  const pending = teamLeaveRequests.filter((r) => r.status === "pending");
  const decided = teamLeaveRequests.filter((r) => r.status !== "pending");
  const pendingResumptions = teamResumptionRequests.filter((r) => r.status === "pending");

  const openDecision = (
    id: string,
    name: string,
    decision: "approve" | "reject",
  ) => {
    setComment("");
    setDialog({ id, name, decision });
  };

  const confirm = () => {
    if (!dialog) return;
    if (dialog.decision === "approve") approveLeave(dialog.id, comment || undefined);
    else rejectLeave(dialog.id, comment || undefined);
    setDialog(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Leave Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve or reject leave requests from your direct reports ({supervisorName})
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="resumptions">
            Resumptions ({pendingResumptions.length})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No pending leave requests.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-col lg:flex-row lg:items-center gap-4 py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{r.employeeName}</p>
                        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {r.leaveTypeName} · {r.days} day(s) · {r.startDate} → {r.endDate}
                      </p>
                      {r.reason && (
                        <p className="text-xs text-gray-400 mt-1">Reason: {r.reason}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => openDecision(r.id, r.employeeName, "approve")}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => openDecision(r.id, r.employeeName, "reject")}
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resumptions" className="mt-4">
          {pendingResumptions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No pending resumption confirmations.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingResumptions.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-col lg:flex-row lg:items-center gap-4 py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        <p className="font-medium text-gray-900">{r.employeeName}</p>
                        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        <CalendarClock className="inline h-3.5 w-3.5 mr-1" />
                        Resumption date: {r.resumptionDate}
                      </p>
                    </div>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => approveResumption(r.id, "Resumption confirmed by Supervisor")}
                    >
                      Confirm Resumption
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {decided.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No leave history.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="divide-y">
                {decided.map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.employeeName} · {r.leaveTypeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {r.startDate} → {r.endDate} ({r.days} days)
                      </p>
                      {r.approverComment && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.approverName}: {r.approverComment}
                        </p>
                      )}
                    </div>
                    <Badge
                      className="capitalize"
                      variant={
                        r.status === "approved"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {dialog && (
        <Dialog open onOpenChange={(open) => !open && setDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="capitalize">
                {dialog.decision === "approve" ? "Approve" : "Reject"} leave request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {dialog.name}'s leave request will be{" "}
                <strong>{dialog.decision === "approve" ? "approved" : "rejected"}</strong>.
              </p>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {dialog.decision === "reject" ? "Rejection comment (required)" : "Comment (optional)"}
                </label>
                <Textarea
                  className="mt-1"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    dialog.decision === "reject"
                      ? "Please provide a reason"
                      : "Add a note"
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={confirm}
                disabled={
                  dialog.decision === "reject" && !comment.trim()
                }
                className={
                  dialog.decision === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {dialog.decision === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}