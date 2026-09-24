export interface AdminUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "administrator";
  status: "active" | "inactive" | "invited";
  mfaEnabled: boolean;
  lastLogin?: string;
  invitedAt?: string;
  createdAt: string;
}

export interface MFAConfig {
  method: "sms" | "email" | "authenticator";
  isEnabled: boolean;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  dateOfJoining: string;
  departmentId: string;
  departmentName: string;
  jobRoleId: string;
  jobRoleName: string;
  divisionId?: string;
  divisionName?: string;
  supervisorId?: string;
  supervisorName?: string;
  payGroupId?: string;
  payGroupName?: string;
  payGradeId?: string;
  payGradeName?: string;
  status: "active" | "inactive" | "on_leave" | "terminated";
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  contractStartDate?: string;
  contractEndDate?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  avatarUrl?: string;
  trainingCerts?: TrainingCertificate[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  documentRequirementId?: string;
}

export interface EmployeeDocumentRequirement {
  id: string;
  name: string;
  description: string;
  allowedFormats: string[];
  requiredUploads: number;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeGroup {
  id: string;
  name: string;
  description: string;
  members: EmployeeGroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeGroupMember {
  employeeId: string;
  employeeName: string;
  supervisorId?: string;
  supervisorName?: string;
}

export interface EmployeeIDConfig {
  prefix: string;
  suffix: string;
  nextNumber: number;
  digitLength: number;
  format: string;
}

export interface TrainingCertificate {
  id: string;
  employeeId: string;
  certificateName: string;
  issueDate: string;
  expiryDate?: string;
  fileName: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headId?: string;
  headName?: string;
  parentId?: string;
  parentName?: string;
  employeeCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Division {
  id: string;
  name: string;
  code: string;
  description: string;
  headId?: string;
  headName?: string;
  departmentIds: string[];
  isActive: boolean;
  createdAt: string;
}

export interface JobRole {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  departmentName: string;
  minSalary: number;
  maxSalary: number;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  website: string;
  address: string;
  description: string;
  logoUrl?: string;
  ceoName?: string;
  cfoName?: string;
  loginSliderImages: string[];
  updatedAt: string;
}

export interface CompanyDocument {
  id: string;
  name: string;
  description: string;
  fileName: string;
  folderId?: string;
  folderName?: string;
  uploadDate: string;
  fileSize: number;
}

export interface CompanyDocumentFolder {
  id: string;
  name: string;
  documentCount: number;
}

export interface OrganogramNode {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  parentId?: string;
  children: OrganogramNode[];
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  module: string;
  isActive: boolean;
  stages: ApprovalStage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStage {
  id: string;
  name: string;
  order: number;
  approvers: ApprovalApprover[];
  requireDeclineComment: boolean;
  action: "approve_decline" | "review_only";
}

export interface ApprovalApprover {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface LeavePolicy {
  id: string;
  name: string;
  description: string;
  leaveType: string;
  defaultDays: number;
  eligibilityCategories: string[];
  eligibilityPayGrades: string[];
  noticeDays: number;
  allowRollover: boolean;
  rolloverExpiryDays: number;
  allowSplit: boolean;
  accrualEnabled: boolean;
  proratedEnabled: boolean;
  weekendTreatment: "include" | "exclude" | "count_as_workday";
  publicHolidayTreatment: "include" | "exclude";
  requireSupportingProof: boolean;
  requireReason: boolean;
  requireHandoverNote: boolean;
  allowanceAmount: number;
  approvalWorkflowId?: string;
  approvalWorkflowName?: string;
  commenceNotification: boolean;
  resumptionNotification: boolean;
  reliefOfficerApproval: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  leavePolicyId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "resumption_pending";
  appliedDate: string;
  approverName?: string;
  approverComment?: string;
  reliefOfficerId?: string;
  reliefOfficerName?: string;
  handoverNote?: string;
  supportingDocument?: string;
}

export interface ResumptionRequest {
  id: string;
  leaveRequestId: string;
  employeeId: string;
  employeeName: string;
  resumptionDate: string;
  status: "pending" | "approved";
  comments?: string;
}

export interface WorkSchedule {
  id: string;
  name: string;
  type: "full_time" | "rotational";
  startTime: string;
  endTime: string;
  breakMinutes: number;
  days: string[];
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
}

export interface TimeBlock {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface LatenessPolicy {
  id: string;
  name: string;
  graceMinutes: number;
  actionAfterGrace: "warning" | "deduction" | "escalation";
  deductionAmount: number;
  isActive: boolean;
}

export interface AbsenteeismPolicy {
  id: string;
  name: string;
  maxConsecutiveDays: number;
  maxMonthlyOccurrences: number;
  action: "warning" | "deduction" | "termination";
  isActive: boolean;
}

export interface GeofenceConfig {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  employeeCount: number;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  hoursWorked: number;
  status: "present" | "absent" | "late" | "half_day";
  geofenceName?: string;
}

export interface AttendanceContest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "declined";
  reviewedBy?: string;
  reviewComment?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "on_hold" | "cancelled";
  taskCount: number;
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  description: string;
  assignedTo?: string;
  assignedToName?: string;
  dueDate: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface TaskSheet {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  date: string;
  hoursWorked: number;
  description: string;
  status: "submitted" | "approved" | "rejected";
}

export interface JobRequisitionPolicy {
  id: string;
  name: string;
  description: string;
  approvalWorkflowId: string;
  approvalWorkflowName: string;
  isActive: boolean;
  createdAt: string;
}

export interface JobRequisition {
  id: string;
  policyId: string;
  policyName: string;
  title: string;
  departmentId: string;
  departmentName: string;
  jobRoleId: string;
  jobRoleName: string;
  vacancies: number;
  salaryRange: string;
  description: string;
  requirements: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "posted";
  raisedBy: string;
  raisedByName: string;
  raisedDate: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export interface RecruitmentWorkflow {
  id: string;
  name: string;
  steps: RecruitmentStep[];
  isActive: boolean;
}

export interface RecruitmentStep {
  id: string;
  name: string;
  order: number;
  visibleToCandidate: boolean;
}

export interface CandidateRestriction {
  id: string;
  email: string;
  reason: string;
  restrictedDate: string;
}

export interface AppraisalObjective {
  id: string;
  level: "company" | "division" | "department";
  name: string;
  description: string;
  targetValue?: string;
  weight?: number;
  divisionId?: string;
  departmentId?: string;
  createdAt: string;
}

export interface AppraisalCycle {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppraisalPeriod {
  id: string;
  cycleId: string;
  cycleName: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "closed";
}

export interface BSCConfig {
  id: string;
  enabled: boolean;
  weightFinancial: number;
  weightCustomer: number;
  weightInternalProcess: number;
  weightLearningGrowth: number;
}

export interface OKRConfig {
  id: string;
  enabled: boolean;
  objectiveLimitPerUser: number;
  keyResultLimitPerObjective: number;
}

export interface AppraisalWorkflow {
  id: string;
  name: string;
  description: string;
  stages: AppraisalWorkflowStage[];
  isActive: boolean;
  createdAt: string;
}

export interface AppraisalWorkflowStage {
  id: string;
  name: string;
  order: number;
  type: "self_assessment" | "manager_review" | "countersign" | "final_review";
  reviewers: string[];
}

export interface CoreValue {
  id: string;
  name: string;
  description: string;
  weight: number;
  isActive: boolean;
}

export interface Appraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  periodId: string;
  periodName: string;
  workflowId: string;
  workflowName: string;
  status: "not_started" | "in_progress" | "submitted" | "under_review" | "completed";
  scores: AppraisalScore[];
  createdAt: string;
}

export interface AppraisalScore {
  id: string;
  stageId: string;
  stageName: string;
  reviewerId: string;
  reviewerName: string;
  score?: number;
  comments?: string;
  completedAt?: string;
}

export interface PromotionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  currentGrade: string;
  proposedGrade: string;
  proposedSalary: number;
  effectiveDate: string;
  status: "pending" | "approved" | "rejected" | "processed";
  raisedBy: string;
  raisedByName: string;
  raisedDate: string;
  approvalWorkflowId?: string;
  comments?: string;
  approvedDate?: string;
}

export interface PromotionHistory {
  id: string;
  employeeId: string;
  employeeName: string;
  previousGrade: string;
  newGrade: string;
  previousSalary: number;
  newSalary: number;
  effectiveDate: string;
  approvedBy: string;
  approvedDate: string;
}

export interface ExitPolicy {
  id: string;
  name: string;
  description: string;
  initiator: "admin" | "employee" | "hr";
  approvalWorkflowId?: string;
  approvalWorkflowName?: string;
  bypassApproval: boolean;
  applicablePayGroups: string[];
  noticePeriodDays: number;
  penaltyInLieuOfNotice: number;
  isActive: boolean;
  isContractPolicy: boolean;
  contractTriggerDays?: number;
  createdAt: string;
}

export interface ExitBenefit {
  id: string;
  name: string;
  description: string;
  type: "severance" | "gratuity" | "unused_leave" | "other";
  calculationMethod: "fixed" | "formula" | "none";
  amount: number;
  policyId: string;
  isActive: boolean;
}

export interface ExitActivity {
  id: string;
  name: string;
  description: string;
  order: number;
  timing: "before_exit" | "on_exit" | "after_exit";
  completionRequired: boolean;
  assigneeRole: string;
  policyIds: string[];
}

export interface ExitRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  policyId: string;
  policyName: string;
  mode: "resignation" | "termination" | "retirement" | "contract_end";
  lastWorkingDay: string;
  status: "pending_approval" | "approved" | "in_progress" | "completed" | "cancelled";
  initiatedBy: string;
  initiatedDate: string;
  approvalStatus?: string;
}

export interface ExitActivityInstance {
  id: string;
  exitRequestId: string;
  activityId: string;
  activityName: string;
  assigneeId: string;
  assigneeName: string;
  status: "pending" | "in_progress" | "completed" | "nudged";
  dueDate: string;
  completedDate?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  instructor: string;
  maxEnrollees: number;
  enrolledCount: number;
  status: "draft" | "published" | "active" | "completed";
  createdAt: string;
}

export interface LearningGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  memberCount: number;
  createdAt: string;
}

export interface LearningAward {
  id: string;
  name: string;
  description: string;
  courseId?: string;
  courseName?: string;
  criteria: string;
  isActive: boolean;
}

export interface LearningTag {
  id: string;
  name: string;
  collection: string;
  createdAt: string;
}

export interface OnboardingApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  departmentId: string;
  departmentName: string;
  offerLetterStatus: "pending" | "sent" | "accepted" | "declined";
  offerLetterTemplateId?: string;
  onboardStatus: "pre_arrival" | "day_one" | "in_progress" | "completed";
  loginSent: boolean;
  createdAt: string;
}

export interface OfferLetterTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  isCompulsoryAcceptance: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  tasks: OnboardingTask[];
  isActive: boolean;
  createdAt: string;
}

export interface OnboardingTask {
  id: string;
  name: string;
  description: string;
  assigneeRole: string;
  dueDays: number;
  isRequired: boolean;
  order: number;
}

export interface RecruitmentBatch {
  id: string;
  name: string;
  description: string;
  onboardingTemplateId?: string;
  onboardingTemplateName?: string;
  applicantIds: string[];
  createdAt: string;
}

export interface ConfirmationPolicy {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  confirmationWorkflowId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DisciplinaryCase {
  id: string;
  caseNumber: string;
  employeeId: string;
  employeeName: string;
  offenseCategory: string;
  offense: string;
  description: string;
  severity: "minor" | "major" | "critical";
  status: "open" | "under_investigation" | "hearing_scheduled" | "resolved" | "escalated" | "closed";
  assignedMembers: DisciplinaryMember[];
  attachments: string[];
  createdAt: string;
}

export interface DisciplinaryMember {
  userId: string;
  name: string;
  role: string;
  committeeLevel: "I" | "II";
}

export interface DisciplinaryMeeting {
  id: string;
  caseId: string;
  caseNumber: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
  minutes: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface DisciplinaryCommittee {
  id: string;
  name: string;
  level: "I" | "II";
  members: DisciplinaryMember[];
  isActive: boolean;
}

export interface QueryTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  createdAt: string;
}

export interface DisciplinaryTerminology {
  id: string;
  term: string;
  definition: string;
  category: string;
  lastModified: string;
  modifiedBy: string;
}

export interface DisciplinaryOutcome {
  id: string;
  caseId: string;
  outcome: "warning" | "suspension" | "termination" | "demotion" | "counseling" | "other";
  description: string;
  appealDeadline: string;
  appealStatus: "none" | "pending" | "upheld" | "overturned";
  issuedDate: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: "available" | "assigned" | "maintenance" | "retired";
  assignedToId?: string;
  assignedToName?: string;
  location: string;
  createdAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  depreciationRate: number;
  assetCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface SurveyQuestionCategory {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  createdAt: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  description: string;
  answerType: "text" | "textarea" | "rating" | "single_choice" | "multi_choice" | "yes_no";
  options: string[];
  assignableRoles: string[];
  categoryId: string;
  categoryName: string;
  isCompulsory: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Survey {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  questionCount: number;
  status: "draft" | "active" | "closed";
  startDate: string;
  endDate: string;
  responseCount: number;
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  respondentName: string;
  respondentRole: string;
  answers: SurveyAnswer[];
  submittedAt: string;
}

export interface SurveyAnswer {
  questionId: string;
  questionTitle: string;
  answer: string | string[] | number;
}

export interface HRReport {
  id: string;
  name: string;
  description: string;
  module: string;
  type: string;
  fields: string[];
  filters: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  lastGenerated?: string;
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  reportName: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: ScheduleRecipient[];
  externalRecipients: string[];
  isActive: boolean;
  createdAt: string;
}

export interface ScheduleRecipient {
  userId: string;
  name: string;
  email: string;
}

export interface DashboardChart {
  id: string;
  reportId: string;
  chartType: "bar" | "line" | "pie" | "doughnut";
  title: string;
  position: { x: number; y: number; w: number; h: number };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  recipientId: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export type AdminModuleTab =
  | "dashboard"
  | "auth-access"
  | "employee-hris"
  | "org-structure"
  | "approval-workflow"
  | "leave-management"
  | "attendance-scheduling"
  | "recruitment"
  | "payroll"
  | "performance"
  | "promotion"
  | "exit-management"
  | "learning"
  | "onboarding"
  | "disciplinary"
  | "asset-management"
  | "survey-feedback"
  | "reports-analytics"
  | "notifications-audit";

export type HodModuleTab =
  | "hod-dashboard"
  | "hod-my-team"
  | "hod-approvals"
  | "hod-leave-approvals"
  | "hod-scheduling"
  | "hod-job-requisitions"
  | "hod-appraisals"
  | "hod-promotions"
  | "hod-exit-requests"
  | "hod-disciplinary"
  | "hod-reports";

export type SupervisorModuleTab =
  | "sup-dashboard"
  | "sup-direct-reports"
  | "sup-approvals"
  | "sup-leave-approvals"
  | "sup-job-requisitions"
  | "sup-appraisals"
  | "sup-promotions"
  | "sup-exit-requests"
  | "sup-disciplinary"
  | "sup-reports";
