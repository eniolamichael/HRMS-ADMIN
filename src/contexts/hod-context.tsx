"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useHrms } from "./hrms-context";
import type {
  HodModuleTab,
  Employee,
  LeaveRequest,
  ResumptionRequest,
  JobRequisition,
  Appraisal,
  PromotionRequest,
  ExitRequest,
  DisciplinaryCase,
  HRReport,
  Notification,
  AuditLog,
  WorkSchedule,
  TimeBlock,
} from "@/types/hrms";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const HOD_PROFILE = {
  id: "emp-5",
  name: "Tunde Bakare",
  email: "tunde.bakare@fasytechnology.com",
  departmentId: "dept-1",
  departmentName: "Engineering",
} as const;

export interface HodApprovalTask {
  id: string;
  module: "Leave" | "Resumption" | "Exit" | "Appraisal";
  requestId: string;
  reference: string;
  title: string;
  employeeId: string;
  employeeName: string;
  department: string;
  submittedDate: string;
  action: "approve_decline" | "review_only";
  requireDeclineComment: boolean;
  details: string;
}

export interface HodContextType {
  // Navigation
  activeTab: HodModuleTab;
  setActiveTab: (tab: HodModuleTab) => void;

  // HOD profile
  hodId: string;
  hodName: string;
  hodEmail: string;
  departmentId: string;
  departmentName: string;

  // Team visibility (FR-071)
  teamMembers: Employee[];
  directReports: Employee[];
  teamDepartmentIds: string[];

  // Approval queue (FR-099..102, FR-432..433)
  approvalTasks: HodApprovalTask[];
  approveTask: (taskId: string, comment?: string) => void;
  declineTask: (taskId: string, comment?: string) => void;

  // Leave approvals (FR-132..135)
  teamLeaveRequests: LeaveRequest[];
  approveLeave: (id: string, comment?: string) => void;
  rejectLeave: (id: string, comment?: string) => void;
  teamResumptionRequests: ResumptionRequest[];
  approveResumption: (id: string, comment?: string) => void;

  // Scheduling (FR-165..166)
  workSchedules: WorkSchedule[];
  addWorkSchedule: (item: Omit<WorkSchedule, "id" | "createdAt">) => void;
  updateWorkSchedule: (id: string, item: Partial<WorkSchedule>) => void;
  deleteWorkSchedule: (id: string) => void;
  timeBlocks: TimeBlock[];

  // Job requisitions (FR-188..193)
  requisitionPolicies: { id: string; name: string; approvalWorkflowName: string }[];
  myRequisitions: JobRequisition[];
  saveRequisition: (item: Omit<JobRequisition, "id" | "raisedBy" | "raisedByName" | "raisedDate" | "createdAt">) => void;
  updateRequisition: (id: string, item: Partial<JobRequisition>) => void;
  deleteRequisition: (id: string) => void;

  // Appraisals (FR-252..254)
  teamAppraisals: Appraisal[];
  appraisalPeriods: { id: string; name: string; status: string }[];
  appraisalWorkflows: { id: string; name: string }[];
  submitAppraisalReview: (
    appraisalId: string,
    stageId: string,
    score: number,
    comments: string,
  ) => void;

  // Promotions (FR-264..269)
  teamPromotionRequests: PromotionRequest[];
  teamPromotionHistory: { id: string; employeeName: string; previousGrade: string; newGrade: string; effectiveDate: string; approvedBy: string }[];
  requestPromotion: (item: Omit<PromotionRequest, "id" | "raisedDate" | "raisedBy" | "raisedByName">) => void;
  deletePromotionRequest: (id: string) => void;

  // Exit requests (FR-309..311)
  teamExitRequests: ExitRequest[];
  approveExit: (id: string) => void;

  // Disciplinary (FR-362..365)
  teamDisciplinaryCases: DisciplinaryCase[];
  addCaseComment: (caseId: string, comment: string, escalate?: boolean) => void;
  caseComments: Record<string, string[]>;

  // Reports (FR-429)
  authorizedReports: HRReport[];

  // Notifications & workflow status (FR-432..433)
  hodNotifications: Notification[];
  markNotificationRead: (id: string) => void;
  workflowStatus: { module: string; pending: number; approved: number; declined: number }[];

  // Audit trail (FR-438)
  hodAuditLogs: AuditLog[];
  addHodAuditLog: (module: string, action: string, details: string) => void;

  // Notification sender
  sendNotification: (type: string, title: string, message: string, recipientId: string) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const HodContext = createContext<HodContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function HodProvider({ children }: { children: ReactNode }) {
  const hrms = useHrms();

  const [activeTab, setActiveTab] = useState<HodModuleTab>("hod-dashboard");
  const [localCaseComments, setLocalCaseComments] = useState<Record<string, string[]>>({});

  const hodId = HOD_PROFILE.id;
  const hodName = HOD_PROFILE.name;
  const hodEmail = HOD_PROFILE.email;
  const departmentId = HOD_PROFILE.departmentId;
  const departmentName = HOD_PROFILE.departmentName;

  // ── Team scope ──────────────────────────────────────────────────────────
  const teamMembers = useMemo(
    () => hrms.employees.filter((e) => e.departmentId === departmentId),
    [hrms.employees, departmentId],
  );

  const directReports = useMemo(
    () =>
      hrms.employees.filter(
        (e) =>
          e.supervisorId === hodId ||
          (e.departmentId === departmentId && e.id !== hodId),
      ),
    [hrms.employees, departmentId, hodId],
  );

  const teamDepartmentIds = useMemo(
    () => Array.from(new Set(teamMembers.map((e) => e.departmentId))),
    [teamMembers],
  );

  const teamMemberIds = useMemo(
    () => new Set(teamMembers.map((e) => e.id)),
    [teamMembers],
  );

  // ── Leave approvals ─────────────────────────────────────────────────────
  const teamLeaveRequests = useMemo(
    () =>
      hrms.leaveRequests.filter((r) => teamMemberIds.has(r.employeeId)),
    [hrms.leaveRequests, teamMemberIds],
  );

  const teamResumptionRequests = useMemo(
    () =>
      hrms.resumptionRequests.filter(
        (r) => hrms.leaveRequests.find((lr) => lr.id === r.leaveRequestId && teamMemberIds.has(lr.employeeId)),
      ),
    [hrms.resumptionRequests, hrms.leaveRequests, teamMemberIds],
  );

  const approveLeave = (id: string, comment?: string) => {
    hrms.approveLeaveRequest(id, hodName, comment);
    addHodAuditLog("Leave", "Approve leave request", `Approved leave request ${id}`);
  };

  const rejectLeave = (id: string, comment?: string) => {
    hrms.rejectLeaveRequest(id, hodName, comment);
    addHodAuditLog("Leave", "Reject leave request", `Rejected leave request ${id}: ${comment ?? ""}`);
  };

  const approveResumption = (id: string, comment?: string) => {
    hrms.updateResumptionRequest(id, { status: "approved", comments: comment });
    addHodAuditLog("Leave", "Approve resumption", comment ?? `Confirmed resumption ${id}`);
  };

  // ── Exit approvals ──────────────────────────────────────────────────────
  const teamExitRequests = useMemo(
    () =>
      hrms.exitRequests.filter(
        (r) => teamMemberIds.has(r.employeeId) || r.departmentId === departmentId,
      ),
    [hrms.exitRequests, teamMemberIds, departmentId],
  );

  // ── Appraisals ──────────────────────────────────────────────────────────
  const teamAppraisals = useMemo(
    () =>
      hrms.appraisals.filter(
        (a) => a.departmentId === departmentId || teamMemberIds.has(a.employeeId),
      ),
    [hrms.appraisals, teamMemberIds, departmentId],
  );

  // ── Promotions ──────────────────────────────────────────────────────────
  const teamPromotionRequests = useMemo(
    () =>
      hrms.promotionRequests.filter(
        (p) =>
          teamMemberIds.has(p.employeeId) ||
          (p.raisedBy === hodId && teamMemberIds.has(p.employeeId)),
      ),
    [hrms.promotionRequests, teamMemberIds, hodId],
  );

  const teamPromotionHistory = useMemo(
    () =>
      hrms.promotionHistory.filter((h) => teamMemberIds.has(h.employeeId)),
    [hrms.promotionHistory, teamMemberIds],
  );

  // ── Job requisitions ────────────────────────────────────────────────────
  const myRequisitions = useMemo(
    () => hrms.jobRequisitions.filter((r) => r.raisedBy === hodId),
    [hrms.jobRequisitions, hodId],
  );

  // ── Disciplinary ────────────────────────────────────────────────────────
  const teamDisciplinaryCases = useMemo(
    () =>
      hrms.disciplinaryCases.filter(
        (c) => teamMemberIds.has(c.employeeId),
      ),
    [hrms.disciplinaryCases, teamMemberIds],
  );

  // ── Reports (only authorized modules) ───────────────────────────────────
  const authorizedModules = [
    "Leave",
    "Attendance",
    "Appraisal",
    "Promotion",
    "Disciplinary",
    "Exit",
    "Recruitment",
    "Employee",
  ];

  const authorizedReports = useMemo(
    () => hrms.hrReports.filter((r) => authorizedModules.includes(r.module)),
    [hrms.hrReports],
  );

  // ── Notifications ───────────────────────────────────────────────────────
  const hodNotifications = useMemo(
    () => hrms.notifications.filter((n) => n.recipientId === hodId),
    [hrms.notifications, hodId],
  );

  const sendNotification = (
    type: string,
    title: string,
    message: string,
    recipientId: string,
  ) => {
    hrms.addNotification({ type, title, message, recipientId, isRead: false });
  };

  // ── Approval queue (derived) ────────────────────────────────────────────
  const approvalTasks = useMemo<HodApprovalTask[]>(() => {
    const tasks: HodApprovalTask[] = [];

    // Pending leave requests from team
    teamLeaveRequests
      .filter((r) => r.status === "pending")
      .forEach((r) => {
        tasks.push({
          id: `approval-leave-${r.id}`,
          module: "Leave",
          requestId: r.id,
          reference: r.leaveTypeName ?? "Leave",
          title: `${r.leaveTypeName} request`,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          department: r.employeeDepartment,
          submittedDate: r.appliedDate,
          action: "approve_decline",
          requireDeclineComment: true,
          details: `${r.days} day(s) from ${r.startDate} to ${r.endDate}`,
        });
      });

    // Pending resumption requests from team
    teamResumptionRequests
      .filter((r) => r.status === "pending")
      .forEach((r) => {
        tasks.push({
          id: `approval-resume-${r.id}`,
          module: "Resumption",
          requestId: r.id,
          reference: "Resumption",
          title: "Resumption confirmation",
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          department: departmentName,
          submittedDate: r.resumptionDate,
          action: "review_only",
          requireDeclineComment: false,
          details: `Resuming on ${r.resumptionDate}`,
        });
      });

    // Pending exit requests from team
    teamExitRequests
      .filter((r) => r.status === "pending_approval")
      .forEach((r) => {
        tasks.push({
          id: `approval-exit-${r.id}`,
          module: "Exit",
          requestId: r.id,
          reference: r.policyName ?? "Exit",
          title: `${r.mode} request`,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          department: r.departmentName,
          submittedDate: r.initiatedDate,
          action: "approve_decline",
          requireDeclineComment: true,
          details: `Last working day ${r.lastWorkingDay}`,
        });
      });

    // Appraisals awaiting HOD manager review
    teamAppraisals
      .filter((a) => a.status === "in_progress" || a.status === "submitted")
      .forEach((a) => {
        const pendingStage = a.scores.find(
          (s) => s.reviewerId === hodId && !s.completedAt,
        );
        if (pendingStage) {
          tasks.push({
            id: `approval-appraisal-${a.id}-${pendingStage.id}`,
            module: "Appraisal",
            requestId: a.id,
            reference: a.periodName ?? "Appraisal",
            title: `${pendingStage.stageName} – ${a.employeeName}`,
            employeeId: a.employeeId,
            employeeName: a.employeeName,
            department: a.departmentName,
            submittedDate: a.createdAt,
            action: "review_only",
            requireDeclineComment: false,
            details: `Stage: ${pendingStage.stageName}`,
          });
        }
      });

    return tasks;
  }, [teamLeaveRequests, teamResumptionRequests, teamExitRequests, teamAppraisals, hodId, departmentName]);

  const approveTask = (taskId: string, comment?: string) => {
    const task = approvalTasks.find((t) => t.id === taskId);
    if (!task) return;
    switch (task.module) {
      case "Leave":
        approveLeave(task.requestId, comment);
        break;
      case "Resumption":
        approveResumption(task.requestId, comment);
        break;
      case "Exit":
        hrms.approveExitRequest(task.requestId);
        addHodAuditLog("Exit", "Approve exit request", `Approved exit request ${task.requestId}`);
        break;
      default:
        break;
    }
  };

  const declineTask = (taskId: string, comment?: string) => {
    const task = approvalTasks.find((t) => t.id === taskId);
    if (!task) return;
    switch (task.module) {
      case "Leave":
        rejectLeave(task.requestId, comment);
        break;
      case "Exit":
        hrms.updateExitRequest(task.requestId, { status: "cancelled" });
        addHodAuditLog("Exit", "Decline exit request", `Declined exit request ${task.requestId}: ${comment ?? ""}`);
        break;
      default:
        break;
    }
  };

  // ── Scheduling actions ──────────────────────────────────────────────────
  const addWorkSchedule = (item: Omit<WorkSchedule, "id" | "createdAt">) => {
    hrms.addWorkSchedule(item);
    addHodAuditLog("Attendance", "Create work schedule", `Created schedule "${item.name}"`);
  };

  const updateWorkSchedule = (id: string, item: Partial<WorkSchedule>) => {
    hrms.updateWorkSchedule(id, item);
  };

  const deleteWorkSchedule = (id: string) => {
    hrms.deleteWorkSchedule(id);
  };

  // ── Requisition actions ─────────────────────────────────────────────────
  const saveRequisition = (item: Omit<JobRequisition, "id" | "raisedBy" | "raisedByName" | "raisedDate" | "createdAt">) => {
    hrms.addJobRequisition({
      ...item,
      raisedBy: hodId,
      raisedByName: hodName,
      raisedDate: new Date().toISOString().split("T")[0],
    });
    addHodAuditLog("Recruitment", "Create job requisition", `Raised requisition for "${item.title}"`);
    sendNotification(
      "Recruitment",
      "New Job Requisition",
      `${hodName} submitted a job requisition for ${item.title}`,
      "emp-9",
    );
  };

  const updateRequisition = (id: string, item: Partial<JobRequisition>) => {
    hrms.updateJobRequisition(id, item);
  };

  const deleteRequisition = (id: string) => {
    hrms.deleteJobRequisition(id);
  };

  // ── Appraisal actions ───────────────────────────────────────────────────
  const submitAppraisalReview = (
    appraisalId: string,
    stageId: string,
    score: number,
    comments: string,
  ) => {
    const appraisal = hrms.appraisals.find((a) => a.id === appraisalId);
    if (!appraisal) return;
    const updatedScores = appraisal.scores.map((s) =>
      s.id === stageId
        ? { ...s, score, comments, reviewerId: hodId, reviewerName: hodName, completedAt: new Date().toISOString().split("T")[0] }
        : s,
    );
    const hasAllScores = updatedScores.filter((s) => s.stageId === stageId).every((s) => typeof s.score === "number");
    hrms.updateAppraisal(appraisalId, {
      scores: updatedScores,
      status: hasAllScores ? "completed" : appraisal.status,
    });
    addHodAuditLog("Appraisal", "Submit appraisal review", `Completed ${appraisal.employeeName}'s appraisal stage with score ${score}`);
  };

  // ── Promotion actions ───────────────────────────────────────────────────
  const requestPromotion = (item: Omit<PromotionRequest, "id" | "raisedDate" | "raisedBy" | "raisedByName">) => {
    hrms.addPromotionRequest({
      ...item,
      raisedBy: hodId,
      raisedByName: hodName,
    });
    addHodAuditLog("Promotion", "Initiate promotion", `Initiated promotion for ${item.employeeName}`);
  };

  const deletePromotionRequest = (id: string) => {
    hrms.deletePromotionRequest(id);
  };

  // ── Exit actions ────────────────────────────────────────────────────────
  const approveExit = (id: string) => {
    hrms.approveExitRequest(id);
    addHodAuditLog("Exit", "Approve exit request", `Approved exit request ${id}`);
  };

  // ── Disciplinary actions ────────────────────────────────────────────────
  const addCaseComment = (caseId: string, comment: string, escalate = false) => {
    setLocalCaseComments((prev) => ({
      ...prev,
      [caseId]: [...(prev[caseId] ?? []), comment],
    }));
    if (escalate) {
      hrms.updateDisciplinaryCase(caseId, { status: "escalated" });
    }
    addHodAuditLog(
      "Disciplinary",
      escalate ? "Escalate disciplinary case" : "Comment on disciplinary case",
      `${escalate ? "Escalated" : "Commented on"} case ${caseId}: ${comment}`,
    );
  };

  // ── Reports accessibility ───────────────────────────────────────────────
  // authorizedReports computed above

  // ── Audit trail ─────────────────────────────────────────────────────────
  const addHodAuditLog = (module: string, action: string, details: string) => {
    hrms.addAuditLog({
      userId: hodId,
      userName: hodName,
      module,
      action,
      details,
      ipAddress: "10.24.0.12",
    });
  };

  const hodAuditLogs = useMemo(
    () => hrms.auditLogs.filter((l) => l.userId === hodId),
    [hrms.auditLogs, hodId],
  );

  // ── Workflow status ─────────────────────────────────────────────────────
  const workflowStatus = useMemo(() => {
    const statusSummary: { module: string; pending: number; approved: number; declined: number }[] = [];
    const push = (module: string, status: string) => {
      let row = statusSummary.find((r) => r.module === module);
      if (!row) {
        row = { module, pending: 0, approved: 0, declined: 0 };
        statusSummary.push(row);
      }
      if (status === "pending" || status === "pending_approval" || status === "in_progress") row.pending++;
      else if (status === "approved" || status === "completed") row.approved++;
      else row.declined++;
    };
    teamLeaveRequests.forEach((r) => push("Leave", r.status));
    teamExitRequests.forEach((r) => push("Exit", r.status));
    teamPromotionRequests.forEach((r) => push("Promotion", r.status));
    myRequisitions.forEach((r) => push("Recruitment", r.status));
    return statusSummary;
  }, [teamLeaveRequests, teamExitRequests, teamPromotionRequests, myRequisitions]);

  const value: HodContextType = {
    activeTab,
    setActiveTab,
    hodId,
    hodName,
    hodEmail,
    departmentId,
    departmentName,
    teamMembers,
    directReports,
    teamDepartmentIds,
    approvalTasks,
    approveTask,
    declineTask,
    teamLeaveRequests,
    approveLeave,
    rejectLeave,
    teamResumptionRequests,
    approveResumption,
    workSchedules: hrms.workSchedules,
    addWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
    timeBlocks: hrms.timeBlocks,
    requisitionPolicies: hrms.requisitionPolicies.map((p) => ({
      id: p.id,
      name: p.name,
      approvalWorkflowName: p.approvalWorkflowName,
    })),
    myRequisitions,
    saveRequisition,
    updateRequisition,
    deleteRequisition,
    teamAppraisals,
    appraisalPeriods: hrms.appraisalPeriods.map((p) => ({ id: p.id, name: p.name, status: p.status })),
    appraisalWorkflows: hrms.appraisalWorkflows.map((w) => ({ id: w.id, name: w.name })),
    submitAppraisalReview,
    teamPromotionRequests,
    teamPromotionHistory,
    requestPromotion,
    deletePromotionRequest,
    teamExitRequests,
    approveExit,
    teamDisciplinaryCases,
    addCaseComment,
    caseComments: localCaseComments,
    authorizedReports,
    hodNotifications,
    markNotificationRead: hrms.markNotificationRead,
    workflowStatus,
    hodAuditLogs,
    addHodAuditLog,
    sendNotification,
  };

  return <HodContext.Provider value={value}>{children}</HodContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHod(): HodContextType {
  const context = useContext(HodContext);
  if (!context) {
    throw new Error("useHod must be used within an HodProvider");
  }
  return context;
}