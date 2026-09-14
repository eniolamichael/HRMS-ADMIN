"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type {
  AdminModuleTab,
  MFAConfig,
  AdminUser,
  Employee,
  EmployeeDocumentRequirement,
  EmployeeGroup,
  EmployeeIDConfig,
  Department,
  Division,
  JobRole,
  CompanyInfo,
  CompanyDocument,
  CompanyDocumentFolder,
  ApprovalWorkflow,
  LeavePolicy,
  LeaveRequest,
  ResumptionRequest,
  WorkSchedule,
  TimeBlock,
  LatenessPolicy,
  AbsenteeismPolicy,
  GeofenceConfig,
  AttendanceRecord,
  AttendanceContest,
  Project,
  ProjectTask,
  TaskSheet,
  JobRequisitionPolicy,
  JobRequisition,
  RecruitmentWorkflow,
  CandidateRestriction,
  AppraisalObjective,
  AppraisalCycle,
  AppraisalPeriod,
  BSCConfig,
  OKRConfig,
  AppraisalWorkflow,
  CoreValue,
  Appraisal,
  PromotionRequest,
  PromotionHistory,
  ExitPolicy,
  ExitBenefit,
  ExitActivity,
  ExitRequest,
  ExitActivityInstance,
  Course,
  LearningGroup,
  LearningAward,
  LearningTag,
  OnboardingApplicant,
  OfferLetterTemplate,
  OnboardingTemplate,
  RecruitmentBatch,
  ConfirmationPolicy,
  DisciplinaryCase,
  DisciplinaryMeeting,
  DisciplinaryCommittee,
  QueryTemplate,
  DisciplinaryTerminology,
  DisciplinaryOutcome,
  Asset,
  AssetCategory,
  SurveyQuestionCategory,
  SurveyQuestion,
  Survey,
  SurveyResponse,
  HRReport,
  ReportSchedule,
  DashboardChart,
  Notification,
  AuditLog,
} from "@/types/hrms";
import {
  initialMFAConfig,
  initialAdminUsers,
  initialEmployees,
  initialDocumentRequirements,
  initialEmployeeGroups,
  initialEmployeeIDConfig,
  initialDepartments,
  initialDivisions,
  initialJobRoles,
  initialCompanyInfo,
  initialCompanyDocuments,
  initialCompanyFolders,
  initialApprovalWorkflows,
  initialLeavePolicies,
  initialLeaveRequests,
  initialResumptionRequests,
  initialWorkSchedules,
  initialTimeBlocks,
  initialLatenessPolicies,
  initialAbsenteeismPolicies,
  initialGeofences,
  initialAttendanceRecords,
  initialAttendanceContests,
  initialProjects,
  initialProjectTasks,
  initialTaskSheets,
  initialRequisitionPolicies,
  initialJobRequisitions,
  initialRecruitmentWorkflows,
  initialCandidateRestrictions,
  initialObjectives,
  initialAppraisalCycles,
  initialAppraisalPeriods,
  initialBSCConfig,
  initialOKRConfig,
  initialAppraisalWorkflows,
  initialCoreValues,
  initialAppraisals,
  initialPromotionRequests,
  initialPromotionHistory,
  initialExitPolicies,
  initialExitBenefits,
  initialExitActivities,
  initialExitRequests,
  initialExitActivityInstances,
  initialCourses,
  initialLearningGroups,
  initialLearningAwards,
  initialLearningTags,
  initialOnboardingApplicants,
  initialOfferLetterTemplates,
  initialOnboardingTemplates,
  initialRecruitmentBatches,
  initialConfirmationPolicies,
  initialDisciplinaryCases,
  initialDisciplinaryMeetings,
  initialDisciplinaryCommittees,
  initialQueryTemplates,
  initialDisciplinaryTerminology,
  initialDisciplinaryOutcomes,
  initialAssets,
  initialAssetCategories,
  initialSurveyQuestionCategories,
  initialSurveyQuestions,
  initialSurveys,
  initialSurveyResponses,
  initialHRReports,
  initialReportSchedules,
  initialDashboardCharts,
  initialNotifications,
  initialAuditLogs,
} from "@/services/hrms-mock-data";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = (): string => new Date().toISOString().split("T")[0];

type WithoutId<T> = Omit<T, "id">;

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

export interface HrmsContextType {
  // Navigation
  activeTab: AdminModuleTab;
  setActiveTab: (tab: AdminModuleTab) => void;

  // Auth & Access
  mfaConfig: MFAConfig;
  updateMfaConfig: (cfg: Partial<MFAConfig>) => void;
  adminUsers: AdminUser[];
  addAdminUser: (item: WithoutId<AdminUser>) => void;
  updateAdminUser: (id: string, item: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;

  // Employee / HRIS
  employees: Employee[];
  addEmployee: (item: WithoutId<Employee>) => void;
  updateEmployee: (id: string, item: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  documentRequirements: EmployeeDocumentRequirement[];
  addDocumentRequirement: (item: WithoutId<EmployeeDocumentRequirement>) => void;
  updateDocumentRequirement: (id: string, item: Partial<EmployeeDocumentRequirement>) => void;
  deleteDocumentRequirement: (id: string) => void;
  employeeGroups: EmployeeGroup[];
  addEmployeeGroup: (item: WithoutId<EmployeeGroup>) => void;
  updateEmployeeGroup: (id: string, item: Partial<EmployeeGroup>) => void;
  deleteEmployeeGroup: (id: string) => void;
  employeeIDConfig: EmployeeIDConfig;
  updateEmployeeIDConfig: (cfg: Partial<EmployeeIDConfig>) => void;
  generateEmployeeId: () => string;

  // Org Structure
  departments: Department[];
  addDepartment: (item: WithoutId<Department>) => void;
  updateDepartment: (id: string, item: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  divisions: Division[];
  addDivision: (item: WithoutId<Division>) => void;
  updateDivision: (id: string, item: Partial<Division>) => void;
  deleteDivision: (id: string) => void;
  jobRoles: JobRole[];
  addJobRole: (item: WithoutId<JobRole>) => void;
  updateJobRole: (id: string, item: Partial<JobRole>) => void;
  deleteJobRole: (id: string) => void;

  // Company
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  companyDocuments: CompanyDocument[];
  addCompanyDocument: (item: WithoutId<CompanyDocument>) => void;
  updateCompanyDocument: (id: string, item: Partial<CompanyDocument>) => void;
  deleteCompanyDocument: (id: string) => void;
  companyFolders: CompanyDocumentFolder[];
  addCompanyFolder: (item: WithoutId<CompanyDocumentFolder>) => void;
  updateCompanyFolder: (id: string, item: Partial<CompanyDocumentFolder>) => void;
  deleteCompanyFolder: (id: string) => void;

  // Approval Workflows
  approvalWorkflows: ApprovalWorkflow[];
  addApprovalWorkflow: (item: WithoutId<ApprovalWorkflow>) => void;
  updateApprovalWorkflow: (id: string, item: Partial<ApprovalWorkflow>) => void;
  deleteApprovalWorkflow: (id: string) => void;

  // Leave Management
  leavePolicies: LeavePolicy[];
  addLeavePolicy: (item: WithoutId<LeavePolicy>) => void;
  updateLeavePolicy: (id: string, item: Partial<LeavePolicy>) => void;
  deleteLeavePolicy: (id: string) => void;
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (item: WithoutId<LeaveRequest>) => void;
  updateLeaveRequest: (id: string, item: Partial<LeaveRequest>) => void;
  deleteLeaveRequest: (id: string) => void;
  approveLeaveRequest: (id: string, approverName: string, comment?: string) => void;
  rejectLeaveRequest: (id: string, approverName: string, comment?: string) => void;
  resumptionRequests: ResumptionRequest[];
  addResumptionRequest: (item: WithoutId<ResumptionRequest>) => void;
  updateResumptionRequest: (id: string, item: Partial<ResumptionRequest>) => void;
  deleteResumptionRequest: (id: string) => void;

  // Attendance & Scheduling
  workSchedules: WorkSchedule[];
  addWorkSchedule: (item: Omit<WorkSchedule, "id" | "createdAt">) => void;
  updateWorkSchedule: (id: string, item: Partial<WorkSchedule>) => void;
  deleteWorkSchedule: (id: string) => void;
  timeBlocks: TimeBlock[];
  addTimeBlock: (item: WithoutId<TimeBlock>) => void;
  updateTimeBlock: (id: string, item: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  latenessPolicies: LatenessPolicy[];
  addLatenessPolicy: (item: WithoutId<LatenessPolicy>) => void;
  updateLatenessPolicy: (id: string, item: Partial<LatenessPolicy>) => void;
  deleteLatenessPolicy: (id: string) => void;
  absenteeismPolicies: AbsenteeismPolicy[];
  addAbsenteeismPolicy: (item: WithoutId<AbsenteeismPolicy>) => void;
  updateAbsenteeismPolicy: (id: string, item: Partial<AbsenteeismPolicy>) => void;
  deleteAbsenteeismPolicy: (id: string) => void;
  geofences: GeofenceConfig[];
  addGeofence: (item: WithoutId<GeofenceConfig>) => void;
  updateGeofence: (id: string, item: Partial<GeofenceConfig>) => void;
  deleteGeofence: (id: string) => void;
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (item: WithoutId<AttendanceRecord>) => void;
  updateAttendanceRecord: (id: string, item: Partial<AttendanceRecord>) => void;
  deleteAttendanceRecord: (id: string) => void;
  attendanceContests: AttendanceContest[];
  addAttendanceContest: (item: WithoutId<AttendanceContest>) => void;
  updateAttendanceContest: (id: string, item: Partial<AttendanceContest>) => void;
  deleteAttendanceContest: (id: string) => void;

  // Projects & Tasks
  projects: Project[];
  addProject: (item: WithoutId<Project>) => void;
  updateProject: (id: string, item: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  projectTasks: ProjectTask[];
  addProjectTask: (item: WithoutId<ProjectTask>) => void;
  updateProjectTask: (id: string, item: Partial<ProjectTask>) => void;
  deleteProjectTask: (id: string) => void;
  taskSheets: TaskSheet[];
  addTaskSheet: (item: WithoutId<TaskSheet>) => void;
  updateTaskSheet: (id: string, item: Partial<TaskSheet>) => void;
  deleteTaskSheet: (id: string) => void;

  // Recruitment
  requisitionPolicies: JobRequisitionPolicy[];
  addRequisitionPolicy: (item: WithoutId<JobRequisitionPolicy>) => void;
  updateRequisitionPolicy: (id: string, item: Partial<JobRequisitionPolicy>) => void;
  deleteRequisitionPolicy: (id: string) => void;
  jobRequisitions: JobRequisition[];
  addJobRequisition: (item: WithoutId<JobRequisition>) => void;
  updateJobRequisition: (id: string, item: Partial<JobRequisition>) => void;
  deleteJobRequisition: (id: string) => void;
  recruitmentWorkflows: RecruitmentWorkflow[];
  addRecruitmentWorkflow: (item: WithoutId<RecruitmentWorkflow>) => void;
  updateRecruitmentWorkflow: (id: string, item: Partial<RecruitmentWorkflow>) => void;
  deleteRecruitmentWorkflow: (id: string) => void;
  candidateRestrictions: CandidateRestriction[];
  addCandidateRestriction: (item: WithoutId<CandidateRestriction>) => void;
  updateCandidateRestriction: (id: string, item: Partial<CandidateRestriction>) => void;
  deleteCandidateRestriction: (id: string) => void;

  // Performance / Appraisal
  objectives: AppraisalObjective[];
  addObjective: (item: WithoutId<AppraisalObjective>) => void;
  updateObjective: (id: string, item: Partial<AppraisalObjective>) => void;
  deleteObjective: (id: string) => void;
  appraisalCycles: AppraisalCycle[];
  addAppraisalCycle: (item: WithoutId<AppraisalCycle>) => void;
  updateAppraisalCycle: (id: string, item: Partial<AppraisalCycle>) => void;
  deleteAppraisalCycle: (id: string) => void;
  appraisalPeriods: AppraisalPeriod[];
  addAppraisalPeriod: (item: WithoutId<AppraisalPeriod>) => void;
  updateAppraisalPeriod: (id: string, item: Partial<AppraisalPeriod>) => void;
  deleteAppraisalPeriod: (id: string) => void;
  bscConfig: BSCConfig;
  updateBscConfig: (cfg: Partial<BSCConfig>) => void;
  okrConfig: OKRConfig;
  updateOkrConfig: (cfg: Partial<OKRConfig>) => void;
  appraisalWorkflows: AppraisalWorkflow[];
  addAppraisalWorkflow: (item: WithoutId<AppraisalWorkflow>) => void;
  updateAppraisalWorkflow: (id: string, item: Partial<AppraisalWorkflow>) => void;
  deleteAppraisalWorkflow: (id: string) => void;
  coreValues: CoreValue[];
  addCoreValue: (item: WithoutId<CoreValue>) => void;
  updateCoreValue: (id: string, item: Partial<CoreValue>) => void;
  deleteCoreValue: (id: string) => void;
  appraisals: Appraisal[];
  addAppraisal: (item: WithoutId<Appraisal>) => void;
  updateAppraisal: (id: string, item: Partial<Appraisal>) => void;
  deleteAppraisal: (id: string) => void;
  processAppraisal: (id: string) => void;
  startAppraisal: (id: string) => void;

  // Promotion
  promotionRequests: PromotionRequest[];
  addPromotionRequest: (item: Omit<PromotionRequest, "id" | "raisedDate">) => void;
  updatePromotionRequest: (id: string, item: Partial<PromotionRequest>) => void;
  deletePromotionRequest: (id: string) => void;
  approvePromotionRequest: (id: string) => void;
  declinePromotionRequest: (id: string) => void;
  promotionHistory: PromotionHistory[];
  addPromotionHistory: (item: Omit<PromotionHistory, "id" | "approvedDate">) => void;
  updatePromotionHistory: (id: string, item: Partial<PromotionHistory>) => void;
  deletePromotionHistory: (id: string) => void;

  // Exit Management
  exitPolicies: ExitPolicy[];
  addExitPolicy: (item: WithoutId<ExitPolicy>) => void;
  updateExitPolicy: (id: string, item: Partial<ExitPolicy>) => void;
  deleteExitPolicy: (id: string) => void;
  exitBenefits: ExitBenefit[];
  addExitBenefit: (item: WithoutId<ExitBenefit>) => void;
  updateExitBenefit: (id: string, item: Partial<ExitBenefit>) => void;
  deleteExitBenefit: (id: string) => void;
  exitActivities: ExitActivity[];
  addExitActivity: (item: WithoutId<ExitActivity>) => void;
  updateExitActivity: (id: string, item: Partial<ExitActivity>) => void;
  deleteExitActivity: (id: string) => void;
  exitRequests: ExitRequest[];
  addExitRequest: (item: WithoutId<ExitRequest>) => void;
  updateExitRequest: (id: string, item: Partial<ExitRequest>) => void;
  deleteExitRequest: (id: string) => void;
  approveExitRequest: (id: string) => void;
  completeExitRequest: (id: string) => void;
  exitActivityInstances: ExitActivityInstance[];
  addExitActivityInstance: (item: WithoutId<ExitActivityInstance>) => void;
  updateExitActivityInstance: (id: string, item: Partial<ExitActivityInstance>) => void;
  deleteExitActivityInstance: (id: string) => void;
  nudgeExitActivity: (id: string) => void;

  // Learning
  courses: Course[];
  addCourse: (item: WithoutId<Course>) => void;
  updateCourse: (id: string, item: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  learningGroups: LearningGroup[];
  addLearningGroup: (item: WithoutId<LearningGroup>) => void;
  updateLearningGroup: (id: string, item: Partial<LearningGroup>) => void;
  deleteLearningGroup: (id: string) => void;
  learningAwards: LearningAward[];
  addLearningAward: (item: WithoutId<LearningAward>) => void;
  updateLearningAward: (id: string, item: Partial<LearningAward>) => void;
  deleteLearningAward: (id: string) => void;
  learningTags: LearningTag[];
  addLearningTag: (item: WithoutId<LearningTag>) => void;
  updateLearningTag: (id: string, item: Partial<LearningTag>) => void;
  deleteLearningTag: (id: string) => void;

  // Onboarding
  onboardingApplicants: OnboardingApplicant[];
  addOnboardingApplicant: (item: WithoutId<OnboardingApplicant>) => void;
  updateOnboardingApplicant: (id: string, item: Partial<OnboardingApplicant>) => void;
  deleteOnboardingApplicant: (id: string) => void;
  offerLetterTemplates: OfferLetterTemplate[];
  addOfferLetterTemplate: (item: WithoutId<OfferLetterTemplate>) => void;
  updateOfferLetterTemplate: (id: string, item: Partial<OfferLetterTemplate>) => void;
  deleteOfferLetterTemplate: (id: string) => void;
  onboardingTemplates: OnboardingTemplate[];
  addOnboardingTemplate: (item: WithoutId<OnboardingTemplate>) => void;
  updateOnboardingTemplate: (id: string, item: Partial<OnboardingTemplate>) => void;
  deleteOnboardingTemplate: (id: string) => void;
  recruitmentBatches: RecruitmentBatch[];
  addRecruitmentBatch: (item: WithoutId<RecruitmentBatch>) => void;
  updateRecruitmentBatch: (id: string, item: Partial<RecruitmentBatch>) => void;
  deleteRecruitmentBatch: (id: string) => void;
  confirmationPolicies: ConfirmationPolicy[];
  addConfirmationPolicy: (item: WithoutId<ConfirmationPolicy>) => void;
  updateConfirmationPolicy: (id: string, item: Partial<ConfirmationPolicy>) => void;
  deleteConfirmationPolicy: (id: string) => void;

  // Disciplinary
  disciplinaryCases: DisciplinaryCase[];
  addDisciplinaryCase: (item: WithoutId<DisciplinaryCase>) => void;
  updateDisciplinaryCase: (id: string, item: Partial<DisciplinaryCase>) => void;
  deleteDisciplinaryCase: (id: string) => void;
  disciplinaryMeetings: DisciplinaryMeeting[];
  addDisciplinaryMeeting: (item: WithoutId<DisciplinaryMeeting>) => void;
  updateDisciplinaryMeeting: (id: string, item: Partial<DisciplinaryMeeting>) => void;
  deleteDisciplinaryMeeting: (id: string) => void;
  disciplinaryCommittees: DisciplinaryCommittee[];
  addDisciplinaryCommittee: (item: WithoutId<DisciplinaryCommittee>) => void;
  updateDisciplinaryCommittee: (id: string, item: Partial<DisciplinaryCommittee>) => void;
  deleteDisciplinaryCommittee: (id: string) => void;
  queryTemplates: QueryTemplate[];
  addQueryTemplate: (item: WithoutId<QueryTemplate>) => void;
  updateQueryTemplate: (id: string, item: Partial<QueryTemplate>) => void;
  deleteQueryTemplate: (id: string) => void;
  disciplinaryTerminology: DisciplinaryTerminology[];
  addDisciplinaryTerminology: (item: WithoutId<DisciplinaryTerminology>) => void;
  updateDisciplinaryTerminology: (id: string, item: Partial<DisciplinaryTerminology>) => void;
  deleteDisciplinaryTerminology: (id: string) => void;
  disciplinaryOutcomes: DisciplinaryOutcome[];
  addDisciplinaryOutcome: (item: WithoutId<DisciplinaryOutcome>) => void;
  updateDisciplinaryOutcome: (id: string, item: Partial<DisciplinaryOutcome>) => void;
  deleteDisciplinaryOutcome: (id: string) => void;

  // Asset Management
  assets: Asset[];
  addAsset: (item: WithoutId<Asset>) => void;
  updateAsset: (id: string, item: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  assetCategories: AssetCategory[];
  addAssetCategory: (item: WithoutId<AssetCategory>) => void;
  updateAssetCategory: (id: string, item: Partial<AssetCategory>) => void;
  deleteAssetCategory: (id: string) => void;

  // Survey & Feedback
  surveyQuestionCategories: SurveyQuestionCategory[];
  addSurveyQuestionCategory: (item: WithoutId<SurveyQuestionCategory>) => void;
  updateSurveyQuestionCategory: (id: string, item: Partial<SurveyQuestionCategory>) => void;
  deleteSurveyQuestionCategory: (id: string) => void;
  surveyQuestions: SurveyQuestion[];
  addSurveyQuestion: (item: WithoutId<SurveyQuestion>) => void;
  updateSurveyQuestion: (id: string, item: Partial<SurveyQuestion>) => void;
  deleteSurveyQuestion: (id: string) => void;
  surveys: Survey[];
  addSurvey: (item: WithoutId<Survey>) => void;
  updateSurvey: (id: string, item: Partial<Survey>) => void;
  deleteSurvey: (id: string) => void;
  surveyResponses: SurveyResponse[];
  addSurveyResponse: (item: WithoutId<SurveyResponse>) => void;
  updateSurveyResponse: (id: string, item: Partial<SurveyResponse>) => void;
  deleteSurveyResponse: (id: string) => void;

  // Reports & Analytics
  hrReports: HRReport[];
  addHrReport: (item: WithoutId<HRReport>) => void;
  updateHrReport: (id: string, item: Partial<HRReport>) => void;
  deleteHrReport: (id: string) => void;
  reportSchedules: ReportSchedule[];
  addReportSchedule: (item: WithoutId<ReportSchedule>) => void;
  updateReportSchedule: (id: string, item: Partial<ReportSchedule>) => void;
  deleteReportSchedule: (id: string) => void;
  dashboardCharts: DashboardChart[];
  addDashboardChart: (item: WithoutId<DashboardChart>) => void;
  updateDashboardChart: (id: string, item: Partial<DashboardChart>) => void;
  deleteDashboardChart: (id: string) => void;

  // Notifications & Audit
  notifications: Notification[];
  addNotification: (item: Omit<Notification, "id" | "createdAt">) => void;
  updateNotification: (id: string, item: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (item: Omit<AuditLog, "id" | "timestamp">) => void;
  updateAuditLog: (id: string, item: Partial<AuditLog>) => void;
  deleteAuditLog: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const HrmsContext = createContext<HrmsContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function HrmsProvider({ children }: { children: ReactNode }) {
  // ── Navigation ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminModuleTab>("dashboard");

  // ── Auth & Access ───────────────────────────────────────────────────────
  const [mfaConfig, setMfaConfig] = useState<MFAConfig>(initialMFAConfig);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);

  // ── Employee / HRIS ─────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [documentRequirements, setDocumentRequirements] = useState<EmployeeDocumentRequirement[]>(initialDocumentRequirements);
  const [employeeGroups, setEmployeeGroups] = useState<EmployeeGroup[]>(initialEmployeeGroups);
  const [employeeIDConfig, setEmployeeIDConfig] = useState<EmployeeIDConfig>(initialEmployeeIDConfig);

  // ── Org Structure ───────────────────────────────────────────────────────
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);
  const [jobRoles, setJobRoles] = useState<JobRole[]>(initialJobRoles);

  // ── Company ─────────────────────────────────────────────────────────────
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>(initialCompanyDocuments);
  const [companyFolders, setCompanyFolders] = useState<CompanyDocumentFolder[]>(initialCompanyFolders);

  // ── Approval Workflows ──────────────────────────────────────────────────
  const [approvalWorkflows, setApprovalWorkflows] = useState<ApprovalWorkflow[]>(initialApprovalWorkflows);

  // ── Leave Management ────────────────────────────────────────────────────
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>(initialLeavePolicies);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [resumptionRequests, setResumptionRequests] = useState<ResumptionRequest[]>(initialResumptionRequests);

  // ── Attendance & Scheduling ─────────────────────────────────────────────
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>(initialWorkSchedules);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks);
  const [latenessPolicies, setLatenessPolicies] = useState<LatenessPolicy[]>(initialLatenessPolicies);
  const [absenteeismPolicies, setAbsenteeismPolicies] = useState<AbsenteeismPolicy[]>(initialAbsenteeismPolicies);
  const [geofences, setGeofences] = useState<GeofenceConfig[]>(initialGeofences);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [attendanceContests, setAttendanceContests] = useState<AttendanceContest[]>(initialAttendanceContests);

  // ── Projects & Tasks ────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(initialProjectTasks);
  const [taskSheets, setTaskSheets] = useState<TaskSheet[]>(initialTaskSheets);

  // ── Recruitment ─────────────────────────────────────────────────────────
  const [requisitionPolicies, setRequisitionPolicies] = useState<JobRequisitionPolicy[]>(initialRequisitionPolicies);
  const [jobRequisitions, setJobRequisitions] = useState<JobRequisition[]>(initialJobRequisitions);
  const [recruitmentWorkflows, setRecruitmentWorkflows] = useState<RecruitmentWorkflow[]>(initialRecruitmentWorkflows);
  const [candidateRestrictions, setCandidateRestrictions] = useState<CandidateRestriction[]>(initialCandidateRestrictions);

  // ── Performance / Appraisal ─────────────────────────────────────────────
  const [objectives, setObjectives] = useState<AppraisalObjective[]>(initialObjectives);
  const [appraisalCycles, setAppraisalCycles] = useState<AppraisalCycle[]>(initialAppraisalCycles);
  const [appraisalPeriods, setAppraisalPeriods] = useState<AppraisalPeriod[]>(initialAppraisalPeriods);
  const [bscConfig, setBscConfig] = useState<BSCConfig>(initialBSCConfig);
  const [okrConfig, setOkrConfig] = useState<OKRConfig>(initialOKRConfig);
  const [appraisalWorkflows, setAppraisalWorkflows] = useState<AppraisalWorkflow[]>(initialAppraisalWorkflows);
  const [coreValues, setCoreValues] = useState<CoreValue[]>(initialCoreValues);
  const [appraisals, setAppraisals] = useState<Appraisal[]>(initialAppraisals);

  // ── Promotion ───────────────────────────────────────────────────────────
  const [promotionRequests, setPromotionRequests] = useState<PromotionRequest[]>(initialPromotionRequests);
  const [promotionHistory, setPromotionHistory] = useState<PromotionHistory[]>(initialPromotionHistory);

  // ── Exit Management ─────────────────────────────────────────────────────
  const [exitPolicies, setExitPolicies] = useState<ExitPolicy[]>(initialExitPolicies);
  const [exitBenefits, setExitBenefits] = useState<ExitBenefit[]>(initialExitBenefits);
  const [exitActivities, setExitActivities] = useState<ExitActivity[]>(initialExitActivities);
  const [exitRequests, setExitRequests] = useState<ExitRequest[]>(initialExitRequests);
  const [exitActivityInstances, setExitActivityInstances] = useState<ExitActivityInstance[]>(initialExitActivityInstances);

  // ── Learning ────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [learningGroups, setLearningGroups] = useState<LearningGroup[]>(initialLearningGroups);
  const [learningAwards, setLearningAwards] = useState<LearningAward[]>(initialLearningAwards);
  const [learningTags, setLearningTags] = useState<LearningTag[]>(initialLearningTags);

  // ── Onboarding ──────────────────────────────────────────────────────────
  const [onboardingApplicants, setOnboardingApplicants] = useState<OnboardingApplicant[]>(initialOnboardingApplicants);
  const [offerLetterTemplates, setOfferLetterTemplates] = useState<OfferLetterTemplate[]>(initialOfferLetterTemplates);
  const [onboardingTemplates, setOnboardingTemplates] = useState<OnboardingTemplate[]>(initialOnboardingTemplates);
  const [recruitmentBatches, setRecruitmentBatches] = useState<RecruitmentBatch[]>(initialRecruitmentBatches);
  const [confirmationPolicies, setConfirmationPolicies] = useState<ConfirmationPolicy[]>(initialConfirmationPolicies);

  // ── Disciplinary ────────────────────────────────────────────────────────
  const [disciplinaryCases, setDisciplinaryCases] = useState<DisciplinaryCase[]>(initialDisciplinaryCases);
  const [disciplinaryMeetings, setDisciplinaryMeetings] = useState<DisciplinaryMeeting[]>(initialDisciplinaryMeetings);
  const [disciplinaryCommittees, setDisciplinaryCommittees] = useState<DisciplinaryCommittee[]>(initialDisciplinaryCommittees);
  const [queryTemplates, setQueryTemplates] = useState<QueryTemplate[]>(initialQueryTemplates);
  const [disciplinaryTerminology, setDisciplinaryTerminology] = useState<DisciplinaryTerminology[]>(initialDisciplinaryTerminology);
  const [disciplinaryOutcomes, setDisciplinaryOutcomes] = useState<DisciplinaryOutcome[]>(initialDisciplinaryOutcomes);

  // ── Asset Management ────────────────────────────────────────────────────
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>(initialAssetCategories);

  // ── Survey & Feedback ───────────────────────────────────────────────────
  const [surveyQuestionCategories, setSurveyQuestionCategories] = useState<SurveyQuestionCategory[]>(initialSurveyQuestionCategories);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>(initialSurveyQuestions);
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(initialSurveyResponses);

  // ── Reports & Analytics ─────────────────────────────────────────────────
  const [hrReports, setHrReports] = useState<HRReport[]>(initialHRReports);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>(initialReportSchedules);
  const [dashboardCharts, setDashboardCharts] = useState<DashboardChart[]>(initialDashboardCharts);

  // ── Notifications & Audit ───────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // ========================================================================
  // ACTIONS – Auth & Access
  // ========================================================================

  const updateMfaConfig = useCallback((cfg: Partial<MFAConfig>) => {
    setMfaConfig((prev) => ({ ...prev, ...cfg }));
  }, []);

  const addAdminUser = useCallback((item: WithoutId<AdminUser>) => {
    setAdminUsers((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateAdminUser = useCallback((id: string, item: Partial<AdminUser>) => {
    setAdminUsers((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAdminUser = useCallback((id: string) => {
    setAdminUsers((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Employee / HRIS
  // ========================================================================

  const addEmployee = useCallback((item: WithoutId<Employee>) => {
    setEmployees((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateEmployee = useCallback((id: string, item: Partial<Employee>) => {
    setEmployees((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addDocumentRequirement = useCallback((item: WithoutId<EmployeeDocumentRequirement>) => {
    setDocumentRequirements((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateDocumentRequirement = useCallback((id: string, item: Partial<EmployeeDocumentRequirement>) => {
    setDocumentRequirements((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteDocumentRequirement = useCallback((id: string) => {
    setDocumentRequirements((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addEmployeeGroup = useCallback((item: WithoutId<EmployeeGroup>) => {
    setEmployeeGroups((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateEmployeeGroup = useCallback((id: string, item: Partial<EmployeeGroup>) => {
    setEmployeeGroups((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteEmployeeGroup = useCallback((id: string) => {
    setEmployeeGroups((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateEmployeeIDConfig = useCallback((cfg: Partial<EmployeeIDConfig>) => {
    setEmployeeIDConfig((prev) => ({ ...prev, ...cfg }));
  }, []);

  const generateEmployeeId = useCallback((): string => {
    const { prefix, suffix, nextNumber, digitLength } = employeeIDConfig;
    const num = String(nextNumber).padStart(digitLength, "0");
    const id = suffix ? `${prefix}-${num}-${suffix}` : `${prefix}-${num}`;
    setEmployeeIDConfig((prev) => ({ ...prev, nextNumber: prev.nextNumber + 1 }));
    return id;
  }, [employeeIDConfig]);

  // ========================================================================
  // ACTIONS – Org Structure
  // ========================================================================

  const addDepartment = useCallback((item: WithoutId<Department>) => {
    setDepartments((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateDepartment = useCallback((id: string, item: Partial<Department>) => {
    setDepartments((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addDivision = useCallback((item: WithoutId<Division>) => {
    setDivisions((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateDivision = useCallback((id: string, item: Partial<Division>) => {
    setDivisions((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteDivision = useCallback((id: string) => {
    setDivisions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addJobRole = useCallback((item: WithoutId<JobRole>) => {
    setJobRoles((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateJobRole = useCallback((id: string, item: Partial<JobRole>) => {
    setJobRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteJobRole = useCallback((id: string) => {
    setJobRoles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Company
  // ========================================================================

  const updateCompanyInfo = useCallback((info: Partial<CompanyInfo>) => {
    setCompanyInfo((prev) => ({ ...prev, ...info }));
  }, []);

  const addCompanyDocument = useCallback((item: WithoutId<CompanyDocument>) => {
    setCompanyDocuments((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateCompanyDocument = useCallback((id: string, item: Partial<CompanyDocument>) => {
    setCompanyDocuments((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteCompanyDocument = useCallback((id: string) => {
    setCompanyDocuments((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addCompanyFolder = useCallback((item: WithoutId<CompanyDocumentFolder>) => {
    setCompanyFolders((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateCompanyFolder = useCallback((id: string, item: Partial<CompanyDocumentFolder>) => {
    setCompanyFolders((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteCompanyFolder = useCallback((id: string) => {
    setCompanyFolders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Approval Workflows
  // ========================================================================

  const addApprovalWorkflow = useCallback((item: WithoutId<ApprovalWorkflow>) => {
    setApprovalWorkflows((prev) => [...prev, { ...item, id: generateId(), createdAt: now(), updatedAt: now() }]);
  }, []);

  const updateApprovalWorkflow = useCallback((id: string, item: Partial<ApprovalWorkflow>) => {
    setApprovalWorkflows((prev) => prev.map((r) => (r.id === id ? { ...r, ...item, updatedAt: now() } : r)));
  }, []);

  const deleteApprovalWorkflow = useCallback((id: string) => {
    setApprovalWorkflows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Leave Management
  // ========================================================================

  const addLeavePolicy = useCallback((item: WithoutId<LeavePolicy>) => {
    setLeavePolicies((prev) => [...prev, { ...item, id: generateId(), createdAt: now(), updatedAt: now() }]);
  }, []);

  const updateLeavePolicy = useCallback((id: string, item: Partial<LeavePolicy>) => {
    setLeavePolicies((prev) => prev.map((r) => (r.id === id ? { ...r, ...item, updatedAt: now() } : r)));
  }, []);

  const deleteLeavePolicy = useCallback((id: string) => {
    setLeavePolicies((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addLeaveRequest = useCallback((item: WithoutId<LeaveRequest>) => {
    setLeaveRequests((prev) => [...prev, { ...item, id: generateId(), appliedDate: now() }]);
  }, []);

  const updateLeaveRequest = useCallback((id: string, item: Partial<LeaveRequest>) => {
    setLeaveRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteLeaveRequest = useCallback((id: string) => {
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const approveLeaveRequest = useCallback((id: string, approverName: string, comment?: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "approved" as const, approverName, approverComment: comment }
          : r,
      ),
    );
  }, []);

  const rejectLeaveRequest = useCallback((id: string, approverName: string, comment?: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "rejected" as const, approverName, approverComment: comment }
          : r,
      ),
    );
  }, []);

  const addResumptionRequest = useCallback((item: WithoutId<ResumptionRequest>) => {
    setResumptionRequests((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateResumptionRequest = useCallback((id: string, item: Partial<ResumptionRequest>) => {
    setResumptionRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteResumptionRequest = useCallback((id: string) => {
    setResumptionRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Attendance & Scheduling
  // ========================================================================

  const addWorkSchedule = useCallback((item: Omit<WorkSchedule, "id" | "createdAt">) => {
    setWorkSchedules((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateWorkSchedule = useCallback((id: string, item: Partial<WorkSchedule>) => {
    setWorkSchedules((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteWorkSchedule = useCallback((id: string) => {
    setWorkSchedules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addTimeBlock = useCallback((item: WithoutId<TimeBlock>) => {
    setTimeBlocks((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateTimeBlock = useCallback((id: string, item: Partial<TimeBlock>) => {
    setTimeBlocks((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteTimeBlock = useCallback((id: string) => {
    setTimeBlocks((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addLatenessPolicy = useCallback((item: WithoutId<LatenessPolicy>) => {
    setLatenessPolicies((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateLatenessPolicy = useCallback((id: string, item: Partial<LatenessPolicy>) => {
    setLatenessPolicies((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteLatenessPolicy = useCallback((id: string) => {
    setLatenessPolicies((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addAbsenteeismPolicy = useCallback((item: WithoutId<AbsenteeismPolicy>) => {
    setAbsenteeismPolicies((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateAbsenteeismPolicy = useCallback((id: string, item: Partial<AbsenteeismPolicy>) => {
    setAbsenteeismPolicies((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAbsenteeismPolicy = useCallback((id: string) => {
    setAbsenteeismPolicies((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addGeofence = useCallback((item: WithoutId<GeofenceConfig>) => {
    setGeofences((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateGeofence = useCallback((id: string, item: Partial<GeofenceConfig>) => {
    setGeofences((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteGeofence = useCallback((id: string) => {
    setGeofences((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addAttendanceRecord = useCallback((item: WithoutId<AttendanceRecord>) => {
    setAttendanceRecords((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateAttendanceRecord = useCallback((id: string, item: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAttendanceRecord = useCallback((id: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addAttendanceContest = useCallback((item: WithoutId<AttendanceContest>) => {
    setAttendanceContests((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateAttendanceContest = useCallback((id: string, item: Partial<AttendanceContest>) => {
    setAttendanceContests((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAttendanceContest = useCallback((id: string) => {
    setAttendanceContests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Projects & Tasks
  // ========================================================================

  const addProject = useCallback((item: WithoutId<Project>) => {
    setProjects((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateProject = useCallback((id: string, item: Partial<Project>) => {
    setProjects((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addProjectTask = useCallback((item: WithoutId<ProjectTask>) => {
    setProjectTasks((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateProjectTask = useCallback((id: string, item: Partial<ProjectTask>) => {
    setProjectTasks((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteProjectTask = useCallback((id: string) => {
    setProjectTasks((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addTaskSheet = useCallback((item: WithoutId<TaskSheet>) => {
    setTaskSheets((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateTaskSheet = useCallback((id: string, item: Partial<TaskSheet>) => {
    setTaskSheets((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteTaskSheet = useCallback((id: string) => {
    setTaskSheets((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Recruitment
  // ========================================================================

  const addRequisitionPolicy = useCallback((item: WithoutId<JobRequisitionPolicy>) => {
    setRequisitionPolicies((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateRequisitionPolicy = useCallback((id: string, item: Partial<JobRequisitionPolicy>) => {
    setRequisitionPolicies((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteRequisitionPolicy = useCallback((id: string) => {
    setRequisitionPolicies((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addJobRequisition = useCallback((item: WithoutId<JobRequisition>) => {
    setJobRequisitions((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateJobRequisition = useCallback((id: string, item: Partial<JobRequisition>) => {
    setJobRequisitions((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteJobRequisition = useCallback((id: string) => {
    setJobRequisitions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addRecruitmentWorkflow = useCallback((item: WithoutId<RecruitmentWorkflow>) => {
    setRecruitmentWorkflows((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateRecruitmentWorkflow = useCallback((id: string, item: Partial<RecruitmentWorkflow>) => {
    setRecruitmentWorkflows((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteRecruitmentWorkflow = useCallback((id: string) => {
    setRecruitmentWorkflows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addCandidateRestriction = useCallback((item: WithoutId<CandidateRestriction>) => {
    setCandidateRestrictions((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateCandidateRestriction = useCallback((id: string, item: Partial<CandidateRestriction>) => {
    setCandidateRestrictions((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteCandidateRestriction = useCallback((id: string) => {
    setCandidateRestrictions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Performance / Appraisal
  // ========================================================================

  const addObjective = useCallback((item: WithoutId<AppraisalObjective>) => {
    setObjectives((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateObjective = useCallback((id: string, item: Partial<AppraisalObjective>) => {
    setObjectives((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteObjective = useCallback((id: string) => {
    setObjectives((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addAppraisalCycle = useCallback((item: WithoutId<AppraisalCycle>) => {
    setAppraisalCycles((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateAppraisalCycle = useCallback((id: string, item: Partial<AppraisalCycle>) => {
    setAppraisalCycles((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAppraisalCycle = useCallback((id: string) => {
    setAppraisalCycles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addAppraisalPeriod = useCallback((item: WithoutId<AppraisalPeriod>) => {
    setAppraisalPeriods((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateAppraisalPeriod = useCallback((id: string, item: Partial<AppraisalPeriod>) => {
    setAppraisalPeriods((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAppraisalPeriod = useCallback((id: string) => {
    setAppraisalPeriods((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateBscConfig = useCallback((cfg: Partial<BSCConfig>) => {
    setBscConfig((prev) => ({ ...prev, ...cfg }));
  }, []);

  const updateOkrConfig = useCallback((cfg: Partial<OKRConfig>) => {
    setOkrConfig((prev) => ({ ...prev, ...cfg }));
  }, []);

  const addAppraisalWorkflow = useCallback((item: WithoutId<AppraisalWorkflow>) => {
    setAppraisalWorkflows((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateAppraisalWorkflow = useCallback((id: string, item: Partial<AppraisalWorkflow>) => {
    setAppraisalWorkflows((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAppraisalWorkflow = useCallback((id: string) => {
    setAppraisalWorkflows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addCoreValue = useCallback((item: WithoutId<CoreValue>) => {
    setCoreValues((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateCoreValue = useCallback((id: string, item: Partial<CoreValue>) => {
    setCoreValues((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteCoreValue = useCallback((id: string) => {
    setCoreValues((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addAppraisal = useCallback((item: WithoutId<Appraisal>) => {
    setAppraisals((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateAppraisal = useCallback((id: string, item: Partial<Appraisal>) => {
    setAppraisals((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAppraisal = useCallback((id: string) => {
    setAppraisals((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const processAppraisal = useCallback((id: string) => {
    setAppraisals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "in_progress" as const } : r)),
    );
  }, []);

  const startAppraisal = useCallback((id: string) => {
    setAppraisals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "in_progress" as const } : r)),
    );
  }, []);

  // ========================================================================
  // ACTIONS – Promotion
  // ========================================================================

  const addPromotionRequest = useCallback((item: Omit<PromotionRequest, "id" | "raisedDate">) => {
    setPromotionRequests((prev) => [...prev, { ...item, id: generateId(), raisedDate: now() }]);
  }, []);

  const updatePromotionRequest = useCallback((id: string, item: Partial<PromotionRequest>) => {
    setPromotionRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deletePromotionRequest = useCallback((id: string) => {
    setPromotionRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const approvePromotionRequest = useCallback((id: string) => {
    setPromotionRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "approved" as const, approvedDate: now() }
          : r,
      ),
    );
  }, []);

  const declinePromotionRequest = useCallback((id: string) => {
    setPromotionRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)),
    );
  }, []);

  const addPromotionHistory = useCallback((item: Omit<PromotionHistory, "id" | "approvedDate">) => {
    setPromotionHistory((prev) => [...prev, { ...item, id: generateId(), approvedDate: now() }]);
  }, []);

  const updatePromotionHistory = useCallback((id: string, item: Partial<PromotionHistory>) => {
    setPromotionHistory((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deletePromotionHistory = useCallback((id: string) => {
    setPromotionHistory((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Exit Management
  // ========================================================================

  const addExitPolicy = useCallback((item: WithoutId<ExitPolicy>) => {
    setExitPolicies((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateExitPolicy = useCallback((id: string, item: Partial<ExitPolicy>) => {
    setExitPolicies((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteExitPolicy = useCallback((id: string) => {
    setExitPolicies((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addExitBenefit = useCallback((item: WithoutId<ExitBenefit>) => {
    setExitBenefits((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateExitBenefit = useCallback((id: string, item: Partial<ExitBenefit>) => {
    setExitBenefits((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteExitBenefit = useCallback((id: string) => {
    setExitBenefits((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addExitActivity = useCallback((item: WithoutId<ExitActivity>) => {
    setExitActivities((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateExitActivity = useCallback((id: string, item: Partial<ExitActivity>) => {
    setExitActivities((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteExitActivity = useCallback((id: string) => {
    setExitActivities((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addExitRequest = useCallback((item: WithoutId<ExitRequest>) => {
    setExitRequests((prev) => [...prev, { ...item, id: generateId(), initiatedDate: now() }]);
  }, []);

  const updateExitRequest = useCallback((id: string, item: Partial<ExitRequest>) => {
    setExitRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteExitRequest = useCallback((id: string) => {
    setExitRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const approveExitRequest = useCallback((id: string) => {
    setExitRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "approved" as const, approvalStatus: "approved" }
          : r,
      ),
    );
  }, []);

  const completeExitRequest = useCallback((id: string) => {
    setExitRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "completed" as const } : r)),
    );
  }, []);

  const addExitActivityInstance = useCallback((item: WithoutId<ExitActivityInstance>) => {
    setExitActivityInstances((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateExitActivityInstance = useCallback((id: string, item: Partial<ExitActivityInstance>) => {
    setExitActivityInstances((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteExitActivityInstance = useCallback((id: string) => {
    setExitActivityInstances((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const nudgeExitActivity = useCallback((id: string) => {
    setExitActivityInstances((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "nudged" as const } : r)),
    );
  }, []);

  // ========================================================================
  // ACTIONS – Learning
  // ========================================================================

  const addCourse = useCallback((item: WithoutId<Course>) => {
    setCourses((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateCourse = useCallback((id: string, item: Partial<Course>) => {
    setCourses((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addLearningGroup = useCallback((item: WithoutId<LearningGroup>) => {
    setLearningGroups((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateLearningGroup = useCallback((id: string, item: Partial<LearningGroup>) => {
    setLearningGroups((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteLearningGroup = useCallback((id: string) => {
    setLearningGroups((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addLearningAward = useCallback((item: WithoutId<LearningAward>) => {
    setLearningAwards((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateLearningAward = useCallback((id: string, item: Partial<LearningAward>) => {
    setLearningAwards((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteLearningAward = useCallback((id: string) => {
    setLearningAwards((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addLearningTag = useCallback((item: WithoutId<LearningTag>) => {
    setLearningTags((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateLearningTag = useCallback((id: string, item: Partial<LearningTag>) => {
    setLearningTags((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteLearningTag = useCallback((id: string) => {
    setLearningTags((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Onboarding
  // ========================================================================

  const addOnboardingApplicant = useCallback((item: WithoutId<OnboardingApplicant>) => {
    setOnboardingApplicants((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateOnboardingApplicant = useCallback((id: string, item: Partial<OnboardingApplicant>) => {
    setOnboardingApplicants((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteOnboardingApplicant = useCallback((id: string) => {
    setOnboardingApplicants((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addOfferLetterTemplate = useCallback((item: WithoutId<OfferLetterTemplate>) => {
    setOfferLetterTemplates((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateOfferLetterTemplate = useCallback((id: string, item: Partial<OfferLetterTemplate>) => {
    setOfferLetterTemplates((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteOfferLetterTemplate = useCallback((id: string) => {
    setOfferLetterTemplates((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addOnboardingTemplate = useCallback((item: WithoutId<OnboardingTemplate>) => {
    setOnboardingTemplates((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateOnboardingTemplate = useCallback((id: string, item: Partial<OnboardingTemplate>) => {
    setOnboardingTemplates((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteOnboardingTemplate = useCallback((id: string) => {
    setOnboardingTemplates((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addRecruitmentBatch = useCallback((item: WithoutId<RecruitmentBatch>) => {
    setRecruitmentBatches((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateRecruitmentBatch = useCallback((id: string, item: Partial<RecruitmentBatch>) => {
    setRecruitmentBatches((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteRecruitmentBatch = useCallback((id: string) => {
    setRecruitmentBatches((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addConfirmationPolicy = useCallback((item: WithoutId<ConfirmationPolicy>) => {
    setConfirmationPolicies((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateConfirmationPolicy = useCallback((id: string, item: Partial<ConfirmationPolicy>) => {
    setConfirmationPolicies((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteConfirmationPolicy = useCallback((id: string) => {
    setConfirmationPolicies((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Disciplinary
  // ========================================================================

  const addDisciplinaryCase = useCallback((item: WithoutId<DisciplinaryCase>) => {
    setDisciplinaryCases((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateDisciplinaryCase = useCallback((id: string, item: Partial<DisciplinaryCase>) => {
    setDisciplinaryCases((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteDisciplinaryCase = useCallback((id: string) => {
    setDisciplinaryCases((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addDisciplinaryMeeting = useCallback((item: WithoutId<DisciplinaryMeeting>) => {
    setDisciplinaryMeetings((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateDisciplinaryMeeting = useCallback((id: string, item: Partial<DisciplinaryMeeting>) => {
    setDisciplinaryMeetings((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteDisciplinaryMeeting = useCallback((id: string) => {
    setDisciplinaryMeetings((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addDisciplinaryCommittee = useCallback((item: WithoutId<DisciplinaryCommittee>) => {
    setDisciplinaryCommittees((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateDisciplinaryCommittee = useCallback((id: string, item: Partial<DisciplinaryCommittee>) => {
    setDisciplinaryCommittees((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteDisciplinaryCommittee = useCallback((id: string) => {
    setDisciplinaryCommittees((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addQueryTemplate = useCallback((item: WithoutId<QueryTemplate>) => {
    setQueryTemplates((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateQueryTemplate = useCallback((id: string, item: Partial<QueryTemplate>) => {
    setQueryTemplates((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteQueryTemplate = useCallback((id: string) => {
    setQueryTemplates((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addDisciplinaryTerminology = useCallback((item: WithoutId<DisciplinaryTerminology>) => {
    setDisciplinaryTerminology((prev) => [...prev, { ...item, id: generateId(), lastModified: now() }]);
  }, []);

  const updateDisciplinaryTerminology = useCallback((id: string, item: Partial<DisciplinaryTerminology>) => {
    setDisciplinaryTerminology((prev) => prev.map((r) => (r.id === id ? { ...r, ...item, lastModified: now() } : r)));
  }, []);

  const deleteDisciplinaryTerminology = useCallback((id: string) => {
    setDisciplinaryTerminology((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addDisciplinaryOutcome = useCallback((item: WithoutId<DisciplinaryOutcome>) => {
    setDisciplinaryOutcomes((prev) => [...prev, { ...item, id: generateId(), issuedDate: now() }]);
  }, []);

  const updateDisciplinaryOutcome = useCallback((id: string, item: Partial<DisciplinaryOutcome>) => {
    setDisciplinaryOutcomes((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteDisciplinaryOutcome = useCallback((id: string) => {
    setDisciplinaryOutcomes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Asset Management
  // ========================================================================

  const addAsset = useCallback((item: WithoutId<Asset>) => {
    setAssets((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateAsset = useCallback((id: string, item: Partial<Asset>) => {
    setAssets((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addAssetCategory = useCallback((item: WithoutId<AssetCategory>) => {
    setAssetCategories((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateAssetCategory = useCallback((id: string, item: Partial<AssetCategory>) => {
    setAssetCategories((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAssetCategory = useCallback((id: string) => {
    setAssetCategories((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Survey & Feedback
  // ========================================================================

  const addSurveyQuestionCategory = useCallback((item: WithoutId<SurveyQuestionCategory>) => {
    setSurveyQuestionCategories((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateSurveyQuestionCategory = useCallback((id: string, item: Partial<SurveyQuestionCategory>) => {
    setSurveyQuestionCategories((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteSurveyQuestionCategory = useCallback((id: string) => {
    setSurveyQuestionCategories((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addSurveyQuestion = useCallback((item: WithoutId<SurveyQuestion>) => {
    setSurveyQuestions((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateSurveyQuestion = useCallback((id: string, item: Partial<SurveyQuestion>) => {
    setSurveyQuestions((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteSurveyQuestion = useCallback((id: string) => {
    setSurveyQuestions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addSurvey = useCallback((item: WithoutId<Survey>) => {
    setSurveys((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateSurvey = useCallback((id: string, item: Partial<Survey>) => {
    setSurveys((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteSurvey = useCallback((id: string) => {
    setSurveys((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addSurveyResponse = useCallback((item: WithoutId<SurveyResponse>) => {
    setSurveyResponses((prev) => [...prev, { ...item, id: generateId(), submittedAt: now() }]);
  }, []);

  const updateSurveyResponse = useCallback((id: string, item: Partial<SurveyResponse>) => {
    setSurveyResponses((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteSurveyResponse = useCallback((id: string) => {
    setSurveyResponses((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Reports & Analytics
  // ========================================================================

  const addHrReport = useCallback((item: WithoutId<HRReport>) => {
    setHrReports((prev) => [...prev, { ...item, id: generateId(), createdAt: now(), updatedAt: now() }]);
  }, []);

  const updateHrReport = useCallback((id: string, item: Partial<HRReport>) => {
    setHrReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...item, updatedAt: now() } : r)));
  }, []);

  const deleteHrReport = useCallback((id: string) => {
    setHrReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addReportSchedule = useCallback((item: WithoutId<ReportSchedule>) => {
    setReportSchedules((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateReportSchedule = useCallback((id: string, item: Partial<ReportSchedule>) => {
    setReportSchedules((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteReportSchedule = useCallback((id: string) => {
    setReportSchedules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addDashboardChart = useCallback((item: WithoutId<DashboardChart>) => {
    setDashboardCharts((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const updateDashboardChart = useCallback((id: string, item: Partial<DashboardChart>) => {
    setDashboardCharts((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteDashboardChart = useCallback((id: string) => {
    setDashboardCharts((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // ACTIONS – Notifications & Audit
  // ========================================================================

  const addNotification = useCallback((item: Omit<Notification, "id" | "createdAt">) => {
    setNotifications((prev) => [...prev, { ...item, id: generateId(), createdAt: now() }]);
  }, []);

  const updateNotification = useCallback((id: string, item: Partial<Notification>) => {
    setNotifications((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isRead: true } : r)),
    );
  }, []);

  const addAuditLog = useCallback((item: Omit<AuditLog, "id" | "timestamp">) => {
    setAuditLogs((prev) => [...prev, { ...item, id: generateId(), timestamp: now() }]);
  }, []);

  const updateAuditLog = useCallback((id: string, item: Partial<AuditLog>) => {
    setAuditLogs((prev) => prev.map((r) => (r.id === id ? { ...r, ...item } : r)));
  }, []);

  const deleteAuditLog = useCallback((id: string) => {
    setAuditLogs((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <HrmsContext.Provider
      value={{
        // Navigation
        activeTab,
        setActiveTab,

        // Auth & Access
        mfaConfig,
        updateMfaConfig,
        adminUsers,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,

        // Employee / HRIS
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        documentRequirements,
        addDocumentRequirement,
        updateDocumentRequirement,
        deleteDocumentRequirement,
        employeeGroups,
        addEmployeeGroup,
        updateEmployeeGroup,
        deleteEmployeeGroup,
        employeeIDConfig,
        updateEmployeeIDConfig,
        generateEmployeeId,

        // Org Structure
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        divisions,
        addDivision,
        updateDivision,
        deleteDivision,
        jobRoles,
        addJobRole,
        updateJobRole,
        deleteJobRole,

        // Company
        companyInfo,
        updateCompanyInfo,
        companyDocuments,
        addCompanyDocument,
        updateCompanyDocument,
        deleteCompanyDocument,
        companyFolders,
        addCompanyFolder,
        updateCompanyFolder,
        deleteCompanyFolder,

        // Approval Workflows
        approvalWorkflows,
        addApprovalWorkflow,
        updateApprovalWorkflow,
        deleteApprovalWorkflow,

        // Leave Management
        leavePolicies,
        addLeavePolicy,
        updateLeavePolicy,
        deleteLeavePolicy,
        leaveRequests,
        addLeaveRequest,
        updateLeaveRequest,
        deleteLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        resumptionRequests,
        addResumptionRequest,
        updateResumptionRequest,
        deleteResumptionRequest,

        // Attendance & Scheduling
        workSchedules,
        addWorkSchedule,
        updateWorkSchedule,
        deleteWorkSchedule,
        timeBlocks,
        addTimeBlock,
        updateTimeBlock,
        deleteTimeBlock,
        latenessPolicies,
        addLatenessPolicy,
        updateLatenessPolicy,
        deleteLatenessPolicy,
        absenteeismPolicies,
        addAbsenteeismPolicy,
        updateAbsenteeismPolicy,
        deleteAbsenteeismPolicy,
        geofences,
        addGeofence,
        updateGeofence,
        deleteGeofence,
        attendanceRecords,
        addAttendanceRecord,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        attendanceContests,
        addAttendanceContest,
        updateAttendanceContest,
        deleteAttendanceContest,

        // Projects & Tasks
        projects,
        addProject,
        updateProject,
        deleteProject,
        projectTasks,
        addProjectTask,
        updateProjectTask,
        deleteProjectTask,
        taskSheets,
        addTaskSheet,
        updateTaskSheet,
        deleteTaskSheet,

        // Recruitment
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
        updateCandidateRestriction,
        deleteCandidateRestriction,

        // Performance / Appraisal
        objectives,
        addObjective,
        updateObjective,
        deleteObjective,
        appraisalCycles,
        addAppraisalCycle,
        updateAppraisalCycle,
        deleteAppraisalCycle,
        appraisalPeriods,
        addAppraisalPeriod,
        updateAppraisalPeriod,
        deleteAppraisalPeriod,
        bscConfig,
        updateBscConfig,
        okrConfig,
        updateOkrConfig,
        appraisalWorkflows,
        addAppraisalWorkflow,
        updateAppraisalWorkflow,
        deleteAppraisalWorkflow,
        coreValues,
        addCoreValue,
        updateCoreValue,
        deleteCoreValue,
        appraisals,
        addAppraisal,
        updateAppraisal,
        deleteAppraisal,
        processAppraisal,
        startAppraisal,

        // Promotion
        promotionRequests,
        addPromotionRequest,
        updatePromotionRequest,
        deletePromotionRequest,
        approvePromotionRequest,
        declinePromotionRequest,
        promotionHistory,
        addPromotionHistory,
        updatePromotionHistory,
        deletePromotionHistory,

        // Exit Management
        exitPolicies,
        addExitPolicy,
        updateExitPolicy,
        deleteExitPolicy,
        exitBenefits,
        addExitBenefit,
        updateExitBenefit,
        deleteExitBenefit,
        exitActivities,
        addExitActivity,
        updateExitActivity,
        deleteExitActivity,
        exitRequests,
        addExitRequest,
        updateExitRequest,
        deleteExitRequest,
        approveExitRequest,
        completeExitRequest,
        exitActivityInstances,
        addExitActivityInstance,
        updateExitActivityInstance,
        deleteExitActivityInstance,
        nudgeExitActivity,

        // Learning
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        learningGroups,
        addLearningGroup,
        updateLearningGroup,
        deleteLearningGroup,
        learningAwards,
        addLearningAward,
        updateLearningAward,
        deleteLearningAward,
        learningTags,
        addLearningTag,
        updateLearningTag,
        deleteLearningTag,

        // Onboarding
        onboardingApplicants,
        addOnboardingApplicant,
        updateOnboardingApplicant,
        deleteOnboardingApplicant,
        offerLetterTemplates,
        addOfferLetterTemplate,
        updateOfferLetterTemplate,
        deleteOfferLetterTemplate,
        onboardingTemplates,
        addOnboardingTemplate,
        updateOnboardingTemplate,
        deleteOnboardingTemplate,
        recruitmentBatches,
        addRecruitmentBatch,
        updateRecruitmentBatch,
        deleteRecruitmentBatch,
        confirmationPolicies,
        addConfirmationPolicy,
        updateConfirmationPolicy,
        deleteConfirmationPolicy,

        // Disciplinary
        disciplinaryCases,
        addDisciplinaryCase,
        updateDisciplinaryCase,
        deleteDisciplinaryCase,
        disciplinaryMeetings,
        addDisciplinaryMeeting,
        updateDisciplinaryMeeting,
        deleteDisciplinaryMeeting,
        disciplinaryCommittees,
        addDisciplinaryCommittee,
        updateDisciplinaryCommittee,
        deleteDisciplinaryCommittee,
        queryTemplates,
        addQueryTemplate,
        updateQueryTemplate,
        deleteQueryTemplate,
        disciplinaryTerminology,
        addDisciplinaryTerminology,
        updateDisciplinaryTerminology,
        deleteDisciplinaryTerminology,
        disciplinaryOutcomes,
        addDisciplinaryOutcome,
        updateDisciplinaryOutcome,
        deleteDisciplinaryOutcome,

        // Asset Management
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        assetCategories,
        addAssetCategory,
        updateAssetCategory,
        deleteAssetCategory,

        // Survey & Feedback
        surveyQuestionCategories,
        addSurveyQuestionCategory,
        updateSurveyQuestionCategory,
        deleteSurveyQuestionCategory,
        surveyQuestions,
        addSurveyQuestion,
        updateSurveyQuestion,
        deleteSurveyQuestion,
        surveys,
        addSurvey,
        updateSurvey,
        deleteSurvey,
        surveyResponses,
        addSurveyResponse,
        updateSurveyResponse,
        deleteSurveyResponse,

        // Reports & Analytics
        hrReports,
        addHrReport,
        updateHrReport,
        deleteHrReport,
        reportSchedules,
        addReportSchedule,
        updateReportSchedule,
        deleteReportSchedule,
        dashboardCharts,
        addDashboardChart,
        updateDashboardChart,
        deleteDashboardChart,

        // Notifications & Audit
        notifications,
        addNotification,
        updateNotification,
        deleteNotification,
        markNotificationRead,
        auditLogs,
        addAuditLog,
        updateAuditLog,
        deleteAuditLog,
      }}
    >
      {children}
    </HrmsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHrms(): HrmsContextType {
  const context = useContext(HrmsContext);
  if (!context) {
    throw new Error("useHrms must be used within an HrmsProvider");
  }
  return context;
}
