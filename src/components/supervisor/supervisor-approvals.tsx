"use client";

import { useState } from "react";
import { useSupervisor, SupervisorApprovalTask } from "@/contexts/supervisor-context";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Eye, Inbox } from "lucide-react";

type DecisionDialog = {
  task: SupervisorApprovalTask;
  decision: "approved" | "declined";
} | null;

export default function SupervisorApprovals() {
  const {
    approvalTasks,
    approveTask,
    declineTask,
    supervisorName,
    departmentName,
    workflowStatus,
  } = useSupervisor();
  const [dialog, setDialog] = useState<DecisionDialog>(null);
  const [comment, setComment] = useState("");
  const [detailsTask, setDetailsTask] = useState<SupervisorApprovalTask | null>(null);

  const openDecision = (task: SupervisorApprovalTask, decision: "approved" | "declined") => {
    setComment("");
    setDialog({ task, decision });
  };

  const confirm = () => {
    if (!dialog) return;
    if (dialog.decision === "approved") {
      approveTask(dialog.task.id, comment || undefined);
    } else {
      declineTask(dialog.task.id, comment || undefined);
    }
    setDialog(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Requests routed to you as {supervisorName} ({departmentName})
        </p>
      </div>

      {approvalTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="font-medium text-gray-900">You're all caught up</p>
            <p className="text-sm text-gray-500 mt-1">
              No approval requests are currently routed to you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvalTasks.map((task) => (
            <Card key={task.id} className="border-l-4 border-l-amber-500">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <CardDescription className="mt-0.5">
                      {task.employeeName} · {task.department}
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      task.action === "approve_decline"
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-50"
                    }
                  >
                    {task.action === "approve_decline" ? "Decision needed" : "Review"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-gray-600">{task.details}</div>
                <div className="text-xs text-gray-400">
                  Submitted {task.submittedDate} · Module: {task.module}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => openDecision(task, "approved")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  {task.action === "approve_decline" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => openDecision(task, "declined")}
                    >
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                  )}
                  {task.action === "review_only" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailsTask(task)}
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Decision dialog */}
      {dialog && (
        <Dialog open onOpenChange={(open) => !open && setDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="capitalize">
                {dialog.decision} request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">{dialog.task.title}</p>
                <p className="mt-1">{dialog.task.employeeName}</p>
                <p className="text-gray-400">{dialog.task.details}</p>
              </div>
              {dialog.decision === "declined" && dialog.task.requireDeclineComment && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Decline comment (required)
                  </label>
                  <Textarea
                    className="mt-1"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Please provide a reason"
                  />
                </div>
              )}
              {dialog.decision === "approved" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Comment (optional)
                  </label>
                  <Input
                    className="mt-1"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a note"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={confirm}
                disabled={dialog.decision === "declined" && dialog.task.requireDeclineComment && !comment.trim()}
                className={dialog.decision === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
              >
                {dialog.decision === "approved" ? "Approve" : "Decline"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Details dialog */}
      {detailsTask && (
        <Dialog open={!!detailsTask} onOpenChange={(open) => !open && setDetailsTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2 flex items-center gap-2 text-gray-500">
                <Inbox className="h-4 w-4" /> {detailsTask.module}
              </div>
              <div>
                <p className="text-xs text-gray-400">Request</p>
                <p className="font-medium text-gray-900">{detailsTask.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Employee</p>
                <p className="font-medium text-gray-900">{detailsTask.employeeName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400">Details</p>
                <p className="text-gray-700">{detailsTask.details}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Submitted</p>
                <p className="text-gray-700">{detailsTask.submittedDate}</p>
              </div>
              {detailsTask.action !== "approve_decline" && (
                <div>
                  <p className="text-xs text-gray-400">Action</p>
                  <p className="text-gray-700">{detailsTask.action === "review_only" ? "Review only" : "Decision"}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setDetailsTask(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Workflow status summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow Status</CardTitle>
          <CardDescription>Status of requests within your scope</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowStatus.map((row) => (
              <div key={row.module} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900">{row.module}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{row.pending} pending</span>
                  <span className="text-emerald-600">{row.approved} approved</span>
                  <span className="text-red-600">{row.declined} declined</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}