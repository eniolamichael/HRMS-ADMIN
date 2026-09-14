"use client";

import { useState } from "react";
import { useHod } from "@/contexts/hod-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { UserMinus, CheckCircle2, Eye } from "lucide-react";

export default function HodExitRequests() {
  const { teamExitRequests, approveExit, hodName } = useHod();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const pendingApproval = teamExitRequests.filter((r) => r.status === "pending_approval");
  const inProgress = teamExitRequests.filter((r) => r.status === "in_progress");
  const completed = teamExitRequests.filter(
    (r) => r.status === "approved" || r.status === "completed" || r.status === "cancelled",
  );

  const viewing = teamExitRequests.find((r) => r.id === viewingId) ?? null;

  const confirmApprove = () => {
    if (!confirmId) return;
    approveExit(confirmId);
    setConfirmId(null);
  };

  const statusStyle = (status: string) =>
    `capitalize ${
      status === "approved" || status === "completed"
        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
        : status === "cancelled"
        ? "bg-gray-50 text-gray-600 hover:bg-gray-50"
        : status === "in_progress"
        ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
        : "bg-amber-50 text-amber-700 hover:bg-amber-50"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Exit Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Exit requests within your reporting scope ({hodName})
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Approval ({pendingApproval.length})</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed / History ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingApproval.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No exit requests pending your approval.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingApproval.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-col md:flex-row md:items-center gap-4 py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <UserMinus className="h-4 w-4 text-amber-600" />
                        <p className="font-medium text-gray-900">{r.employeeName}</p>
                        <Badge className={statusStyle(r.status)}>{r.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {r.mode.replace("_", " ")} · {r.policyName}
                      </p>
                      <p className="text-xs text-gray-400">
                        Last working day: {r.lastWorkingDay} · Initiated {r.initiatedDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setViewingId(r.id)}>
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setConfirmId(r.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-4">
          <Card>
            <CardContent>
              {inProgress.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">No exits in progress.</p>
              ) : (
                <div className="divide-y">
                  {inProgress.map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.employeeName}</p>
                        <p className="text-xs text-gray-500">
                          {r.mode.replace("_", " ")} · Last working day {r.lastWorkingDay}
                        </p>
                      </div>
                      <Badge className="capitalize">{r.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent>
              {completed.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">No exit history.</p>
              ) : (
                <div className="divide-y">
                  {completed.map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.employeeName}</p>
                        <p className="text-xs text-gray-500">
                          {r.mode.replace("_", " ")} · {r.policyName}
                        </p>
                      </div>
                      <Badge className={statusStyle(r.status)}>{r.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve dialog */}
      {confirmId && (
        <Dialog open onOpenChange={(open) => !open && setConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Exit Request</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Approve the exit request. This will move the request forward in the exit workflow.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">Comment (optional)</label>
              <Textarea
                className="mt-1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={confirmApprove}>
                Confirm Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View dialog */}
      {viewing && (
        <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exit Request — {viewing.employeeName}</DialogTitle>
            </DialogHeader>
            <div className="text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <Badge className="capitalize">{viewing.status.replace("_", " ")}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Mode</span>
                <span className="font-medium text-gray-900 capitalize">{viewing.mode.replace("_", " ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Policy</span>
                <span className="font-medium text-gray-900">{viewing.policyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Department</span>
                <span className="font-medium text-gray-900">{viewing.departmentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last Working Day</span>
                <span className="font-medium text-gray-900">{viewing.lastWorkingDay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Initiated</span>
                <span className="font-medium text-gray-900">{viewing.initiatedDate}</span>
              </div>
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