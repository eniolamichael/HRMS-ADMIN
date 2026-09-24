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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, MessageSquare, ArrowUpCircle, Eye } from "lucide-react";

export default function SupervisorDisciplinary() {
  const { teamDisciplinaryCases, addCaseComment, caseComments, supervisorName } = useSupervisor();
  const [commentTarget, setCommentTarget] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [escalate, setEscalate] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const viewing = teamDisciplinaryCases.find((c) => c.id === viewingId) ?? null;

  const submitComment = () => {
    if (!commentTarget || !comment.trim()) return;
    addCaseComment(commentTarget, comment, escalate);
    setCommentTarget(null);
    setComment("");
    setEscalate(false);
  };

  const statusStyle = (status: string) =>
    `capitalize ${
      status === "closed" || status === "resolved"
        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
        : status === "escalated"
        ? "bg-red-50 text-red-700 hover:bg-red-50"
        : status === "hearing_scheduled"
        ? "bg-purple-50 text-purple-700 hover:bg-purple-50"
        : "bg-amber-50 text-amber-700 hover:bg-amber-50"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Disciplinary</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cases involving your direct reports — view, comment, and escalate as permitted
        </p>
      </div>

      {teamDisciplinaryCases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-500">
            No disciplinary cases in your reporting scope.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamDisciplinaryCases.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      {c.caseNumber}
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      {c.employeeName} · {c.offenseCategory}
                    </CardDescription>
                  </div>
                  <Badge className={statusStyle(c.status)}>{c.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{c.offense}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Severity: <span className="capitalize font-medium">{c.severity}</span></span>
                  <span>Opened: {c.createdAt.split("T")[0]}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.assignedMembers.map((m) => (
                    <span key={m.userId} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                      {m.name} (Lvl {m.committeeLevel})
                    </span>
                  ))}
                </div>

                {/* Comments */}
                {caseComments[c.id] && caseComments[c.id].length > 0 && (
                  <div className="space-y-1.5 bg-gray-50 rounded-lg p-3">
                    {caseComments[c.id].map((cmt, i) => (
                      <p key={i} className="text-xs text-gray-600">
                        <span className="font-medium text-gray-800">You:</span> {cmt}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setViewingId(c.id)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setCommentTarget(c.id)}>
                    <MessageSquare className="h-4 w-4" /> Comment
                  </Button>
                  {c.status !== "escalated" && c.status !== "closed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setCommentTarget(c.id);
                        setEscalate(true);
                      }}
                    >
                      <ArrowUpCircle className="h-4 w-4" /> Escalate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Comment / escalate dialog */}
      {commentTarget && (
        <Dialog open onOpenChange={(open) => !open && setCommentTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {escalate ? (
                  <>
                    <ArrowUpCircle className="h-5 w-5 text-red-600" /> Escalate Case
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 text-emerald-600" /> Add Comment
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {escalate
                  ? "Add a comment to escalate this case for further review. The case will be flagged as escalated."
                  : `Add your comment as ${supervisorName}.`}
              </p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment"
                rows={4}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCommentTarget(null)}>Cancel</Button>
              <Button
                onClick={submitComment}
                disabled={!comment.trim()}
                className={escalate ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
              >
                {escalate ? "Escalate Case" : "Post Comment"}
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
              <DialogTitle>{viewing.caseNumber} — {viewing.employeeName}</DialogTitle>
            </DialogHeader>
            <div className="text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <Badge className={statusStyle(viewing.status)}>{viewing.status.replace("_", " ")}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Severity</span>
                <span className="capitalize font-medium text-gray-900">{viewing.severity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-900">{viewing.offenseCategory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Offense</span>
                <span className="font-medium text-gray-900">{viewing.offense}</span>
              </div>
              <p className="pt-2 border-t text-gray-600">{viewing.description}</p>
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