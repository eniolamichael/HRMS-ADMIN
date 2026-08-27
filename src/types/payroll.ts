export interface PayGroup {
  id: string;
  name: string;
  description: string;
  payFrequency: "weekly" | "bi-weekly" | "semi-monthly" | "monthly";
  paymentDay: string;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayGrade {
  id: string;
  name: string;
  code: string;
  payGroupId: string;
  payGroupName: string;
  currency: string;
  defaultAnnualGross: number;
  maximumGross: number;
  isTaxable: boolean;
  minSalary: number;
  maxSalary: number;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePayroll {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  payGroupId: string;
  payGroupName: string;
  payGradeId: string;
  payGradeName: string;
  status: "active" | "inactive" | "suspended";
  baseSalary: number;
  bankName: string;
  accountNumber: string;
  accountVerified: boolean;
  taxReliefs: TaxRelief[];
  benefitsInKind: BenefitInKind[];
  inclusionDate: string;
  removalDate?: string;
}

export interface TaxTable {
  id: string;
  name: string;
  country: string;
  currency: string;
  taxYear: number;
  brackets: TaxBracket[];
  isActive: boolean;
  effectiveDate: string;
  createdAt: string;
}

export interface TaxBracket {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  rate: number;
  fixedAmount: number;
}

export interface TaxReliefType {
  id: string;
  name: string;
  code: string;
  description: string;
  defaultAmount: number;
  maxAmount: number;
  isPercentage: boolean;
  isActive: boolean;
}

export interface TaxRelief {
  id: string;
  reliefTypeId: string;
  reliefTypeName: string;
  amount: number;
  isPercentage: boolean;
}

export interface BenefitInKindType {
  id: string;
  name: string;
  code: string;
  description: string;
  taxRate: number;
  isActive: boolean;
}

export interface BenefitInKind {
  id: string;
  bikTypeId: string;
  bikTypeName: string;
  value: number;
  taxAmount: number;
}

export interface PayrollApprover {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  approvalLevel: number;
  isActive: boolean;
}

export interface PayrollAdministrator {
  id: string;
  userId: string;
  name: string;
  email: string;
  permissions: PayrollPermission[];
  isActive: boolean;
  assignedAt: string;
}

export interface PayrollPermission {
  id: string;
  name: string;
  description: string;
  granted: boolean;
}

export interface PayslipSetting {
  id: string;
  settingName: string;
  settingValue: string;
  isEnabled: boolean;
}

export interface PayslipField {
  id: string;
  fieldName: string;
  fieldType: "employee_info" | "earnings" | "deductions" | "taxes" | "custom";
  isVisible: boolean;
  displayOrder: number;
  label: string;
}

export interface BonusConfiguration {
  id: string;
  name: string;
  type: "13th_month" | "bonus" | "allowance" | "commission" | "other";
  calculationMethod: "fixed" | "percentage_of_salary" | "custom";
  defaultAmount: number;
  percentage: number;
  isTaxable: boolean;
  isActive: boolean;
  applicablePayGroups: string[];
}

export interface ArrearRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "promotion" | "correction" | "backpay";
  amount: number;
  effectiveDate: string;
  processedDate?: string;
  status: "pending" | "processed" | "cancelled";
  description: string;
}

export interface ProratableDeduction {
  id: string;
  name: string;
  type: "loan" | "advance" | "garnishment" | "other";
  calculationMethod: "monthly" | "quarterly" | "annual";
  isActive: boolean;
}

export interface PayrollRun {
  id: string;
  name: string;
  payGroupId: string;
  payGroupName: string;
  period: string;
  startDate: string;
  endDate: string;
  status: "draft" | "processing" | "preview" | "completed" | "paid" | "cancelled";
  type: "regular" | "off-cycle";
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalTax: number;
  processedAt?: string;
  completedAt?: string;
  paidAt?: string;
  createdBy: string;
}

export interface OffCycleUpdate {
  id: string;
  employeeId: string;
  employeeName: string;
  payrollRunId: string;
  type: "bonus" | "deduction" | "adjustment" | "correction";
  amount: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface PayrollReport {
  id: string;
  name: string;
  description: string;
  type: "summary" | "detailed" | "tax" | "pension" | "ytd" | "custom";
  columns: string[];
  filters: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  lastGenerated?: string;
}

export interface PayslipData {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  payPeriod: string;
  payDate: string;
  baseSalary: number;
  allowances: { name: string; amount: number }[];
  grossPay: number;
  deductions: { name: string; amount: number }[];
  taxes: { name: string; amount: number }[];
  totalDeductions: number;
  netPay: number;
  bankName: string;
  accountNumber: string;
  yearToDate: {
    grossPay: number;
    totalTax: number;
    totalDeductions: number;
    netPay: number;
  };
}

export interface PensionReport {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  pensionFund: string;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  period: string;
}

export interface PayrollAccountStatement {
  id: string;
  employeeId: string;
  employeeName: string;
  accountNumber: string;
  bankName: string;
  period: string;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  paymentDate: string;
  paymentRef: string;
}

export type PayrollModuleTab =
  | "dashboard"
  | "pay-groups"
  | "pay-grades"
  | "employees"
  | "tax-configuration"
  | "administration"
  | "payslip-settings"
  | "bonus-configuration"
  | "arrears"
  | "run-payroll"
  | "off-cycle"
  | "reports";
