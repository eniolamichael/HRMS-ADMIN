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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Target, ClipboardCheck } from "lucide-react";

type ReviewTarget = {
  appraisalId: string;
  stageId: string;
  stageName: string;
  employeeName: string;
} | null;

export default function HodAppraisals() {
  const {
    teamAppraisals,
    submitAppraisalReview,
    hodId,
    hodName,
    appraisalPeriods,
  } = useHod();
  const hrms = useHrms();
  const [target, setTarget] = useState<ReviewTarget>(null);
  const [score, setScore] = useState(70);
  const [comments, setComments] = useState("");

  const pendingReviews = teamAppraisals.filter(
    (a) =>
      (a.status === "in_progress" || a.status === "submitted") &&
      a.scores.some((s) => s.reviewerId === hodId && !s.completedAt),
  );

  const openReview = (
    appraisalId: string,
    stageId: string,
    stageName: string,
    employeeName: string,
  ) => {
    setScore(70);
    setComments("");
    setTarget({ appraisalId, stageId, stageName, employeeName });
  };

  const currentPeriod = hrms.appraisalPeriods.find((p) => p.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Appraisals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete assigned appraisal activities for your team ({hodName})
        </p>
      </div>

      {/* Active period summary */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-0 text-white">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-emerald-100">Active Appraisal Period</p>
              <p className="font-semibold text-lg">
                {currentPeriod?.name ?? "Q4 2024 Appraisal"}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-emerald-100">Reviews assigned to you</p>
              <p className="text-2xl font-bold">{pendingReviews.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {pendingReviews.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-gray-500">
            No appraisal activities are currently assigned to you.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingReviews.map((a) => {
            const stage = a.scores.find((s) => s.reviewerId === hodId && !s.completedAt);
            if (!stage) return null;
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-col md:flex-row md:items-center gap-4 py-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{a.employeeName}</p>
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {stage.stageName}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {a.departmentName} · Period: {a.periodName}
                    </p>
                  </div>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => openReview(a.id, stage.id, stage.stageName, a.employeeName)}
                  >
                    <ClipboardCheck className="h-4 w-4" /> Complete Review
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* All team appraisals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Appraisals</CardTitle>
          <CardDescription>All appraisals within your reporting scope</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {teamAppraisals.map((a) => {
              const completedStages = a.scores.filter((s) => s.completedAt).length;
              return (
                <div key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.employeeName}</p>
                    <p className="text-xs text-gray-500">
                      {a.periodName} · {completedStages}/{a.scores.length} stages completed
                    </p>
                  </div>
                  <Badge className="capitalize" variant={a.status === "completed" ? "default" : "secondary"}>
                    {a.status.replace("_", " ")}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Review dialog */}
      {target && (
        <Dialog open onOpenChange={(open) => !open && setTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {target.stageName} — {target.employeeName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Score (0 – 100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1"
                  value={score}
                  onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                />
              </div>
              <div>
                <Label>Comments</Label>
                <Textarea
                  className="mt-1"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide feedback on this employee's performance"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  submitAppraisalReview(target.appraisalId, target.stageId, score, comments);
                  setTarget(null);
                }}
              >
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}