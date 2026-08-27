import {
  PayGroup,
  PayGrade,
  EmployeePayroll,
  TaxTable,
  TaxReliefType,
  BenefitInKindType,
  PayrollApprover,
  PayrollAdministrator,
  PayslipSetting,
  PayslipField,
  BonusConfiguration,
  ArrearRecord,
  ProratableDeduction,
  PayrollRun,
  OffCycleUpdate,
  PayrollReport,
  PayslipData,
  PensionReport,
  PayrollAccountStatement,
} from "@/types/payroll";

export const initialPayGroups: PayGroup[] = [
  { id: "pg-1", name: "Monthly Salaried", description: "Full-time employees paid monthly", payFrequency: "monthly", paymentDay: "Last business day", isActive: true, employeeCount: 145, createdAt: "2024-01-15", updatedAt: "2024-06-20" },
  { id: "pg-2", name: "Bi-Weekly Hourly", description: "Hourly employees paid bi-weekly", payFrequency: "bi-weekly", paymentDay: "Friday", isActive: true, employeeCount: 82, createdAt: "2024-01-15", updatedAt: "2024-05-10" },
  { id: "pg-3", name: "Weekly Contractors", description: "Contract workers paid weekly", payFrequency: "weekly", paymentDay: "Friday", isActive: true, employeeCount: 34, createdAt: "2024-03-01", updatedAt: "2024-07-01" },
  { id: "pg-4", name: "Executive Payroll", description: "C-suite and senior leadership", payFrequency: "monthly", paymentDay: "25th", isActive: true, employeeCount: 12, createdAt: "2024-01-15", updatedAt: "2024-04-15" },
  { id: "pg-5", name: "Part-Time Staff", description: "Part-time employees paid semi-monthly", payFrequency: "semi-monthly", paymentDay: "15th & Last day", isActive: false, employeeCount: 28, createdAt: "2024-02-01", updatedAt: "2024-06-30" },
];

export const initialPayGrades: PayGrade[] = [
  { id: "payg-1", name: "Grade A - Entry Level", code: "GA", payGroupId: "pg-1", payGroupName: "Monthly Salaried", currency: "USD", defaultAnnualGross: 36000, maximumGross: 45000, isTaxable: true, minSalary: 3000, maxSalary: 3750, isActive: true, employeeCount: 42, createdAt: "2024-01-20", updatedAt: "2024-06-15" },
  { id: "payg-2", name: "Grade B - Junior", code: "GB", payGroupId: "pg-1", payGroupName: "Monthly Salaried", currency: "USD", defaultAnnualGross: 52000, maximumGross: 65000, isTaxable: true, minSalary: 4333, maxSalary: 5417, isActive: true, employeeCount: 38, createdAt: "2024-01-20", updatedAt: "2024-06-15" },
  { id: "payg-3", name: "Grade C - Mid Level", code: "GC", payGroupId: "pg-1", payGroupName: "Monthly Salaried", currency: "USD", defaultAnnualGross: 75000, maximumGross: 95000, isTaxable: true, minSalary: 6250, maxSalary: 7917, isActive: true, employeeCount: 31, createdAt: "2024-01-20", updatedAt: "2024-06-15" },
  { id: "payg-4", name: "Grade D - Senior", code: "GD", payGroupId: "pg-1", payGroupName: "Monthly Salaried", currency: "USD", defaultAnnualGross: 110000, maximumGross: 140000, isTaxable: true, minSalary: 9167, maxSalary: 11667, isActive: true, employeeCount: 22, createdAt: "2024-01-20", updatedAt: "2024-06-15" },
  { id: "payg-5", name: "Grade E - Lead", code: "GE", payGroupId: "pg-1", payGroupName: "Monthly Salaried", currency: "USD", defaultAnnualGross: 150000, maximumGross: 185000, isTaxable: true, minSalary: 12500, maxSalary: 15417, isActive: true, employeeCount: 12, createdAt: "2024-01-20", updatedAt: "2024-06-15" },
  { id: "payg-6", name: "Grade F - Executive", code: "GF", payGroupId: "pg-4", payGroupName: "Executive Payroll", currency: "USD", defaultAnnualGross: 250000, maximumGross: 500000, isTaxable: true, minSalary: 20833, maxSalary: 41667, isActive: true, employeeCount: 12, createdAt: "2024-01-20", updatedAt: "2024-06-15" },
  { id: "payg-7", name: "Hourly Grade 1", code: "HG1", payGroupId: "pg-2", payGroupName: "Bi-Weekly Hourly", currency: "USD", defaultAnnualGross: 31200, maximumGross: 38400, isTaxable: true, minSalary: 15, maxSalary: 18.46, isActive: true, employeeCount: 45, createdAt: "2024-02-01", updatedAt: "2024-06-15" },
  { id: "payg-8", name: "Hourly Grade 2", code: "HG2", payGroupId: "pg-2", payGroupName: "Bi-Weekly Hourly", currency: "USD", defaultAnnualGross: 41600, maximumGross: 52000, isTaxable: true, minSalary: 20, maxSalary: 25, isActive: true, employeeCount: 37, createdAt: "2024-02-01", updatedAt: "2024-06-15" },
];

export const initialEmployees: EmployeePayroll[] = [
  { id: "ep-1", employeeId: "EMP001", employeeName: "Alice Johnson", employeeCode: "EMP001", department: "Engineering", payGroupId: "pg-1", payGroupName: "Monthly Salaried", payGradeId: "payg-3", payGradeName: "Grade C - Mid Level", status: "active", baseSalary: 75000, bankName: "First National Bank", accountNumber: "****4521", accountVerified: true, taxReliefs: [], benefitsInKind: [{ id: "bik-1", bikTypeId: "bikt-1", bikTypeName: "Health Insurance", value: 4800, taxAmount: 480 }], inclusionDate: "2023-03-15" },
  { id: "ep-2", employeeId: "EMP002", employeeName: "Bob Williams", employeeCode: "EMP002", department: "Engineering", payGroupId: "pg-1", payGroupName: "Monthly Salaried", payGradeId: "payg-4", payGradeName: "Grade D - Senior", status: "active", baseSalary: 120000, bankName: "Chase Bank", accountNumber: "****7832", accountVerified: true, taxReliefs: [{ id: "tr-1", reliefTypeId: "trt-1", reliefTypeName: "Personal Allowance", amount: 4000, isPercentage: false }], benefitsInKind: [{ id: "bik-2", bikTypeId: "bikt-1", bikTypeName: "Health Insurance", value: 6000, taxAmount: 600 }], inclusionDate: "2022-08-01" },
  { id: "ep-3", employeeId: "EMP003", employeeName: "Carol Davis", employeeCode: "EMP003", department: "Marketing", payGroupId: "pg-1", payGroupName: "Monthly Salaried", payGradeId: "payg-2", payGradeName: "Grade B - Junior", status: "active", baseSalary: 52000, bankName: "Wells Fargo", accountNumber: "****1234", accountVerified: true, taxReliefs: [], benefitsInKind: [], inclusionDate: "2024-01-10" },
  { id: "ep-4", employeeId: "EMP004", employeeName: "David Brown", employeeCode: "EMP004", department: "Sales", payGroupId: "pg-1", payGroupName: "Monthly Salaried", payGradeId: "payg-3", payGradeName: "Grade C - Mid Level", status: "active", baseSalary: 80000, bankName: "Bank of America", accountNumber: "****5678", accountVerified: false, taxReliefs: [], benefitsInKind: [{ id: "bik-3", bikTypeId: "bikt-2", bikTypeName: "Company Car", value: 12000, taxAmount: 1800 }], inclusionDate: "2023-06-20" },
  { id: "ep-5", employeeId: "EMP005", employeeName: "Eva Martinez", employeeCode: "EMP005", department: "HR", payGroupId: "pg-1", payGroupName: "Monthly Salaried", payGradeId: "payg-5", payGradeName: "Grade E - Lead", status: "active", baseSalary: 155000, bankName: "Citibank", accountNumber: "****9012", accountVerified: true, taxReliefs: [{ id: "tr-2", reliefTypeId: "trt-2", reliefTypeName: "Pension Contribution", amount: 5000, isPercentage: false }], benefitsInKind: [], inclusionDate: "2021-11-01" },
  { id: "ep-6", employeeId: "EMP006", employeeName: "Frank Wilson", employeeCode: "EMP006", department: "Operations", payGroupId: "pg-2", payGroupName: "Bi-Weekly Hourly", payGradeId: "payg-7", payGradeName: "Hourly Grade 1", status: "active", baseSalary: 33000, bankName: "TD Bank", accountNumber: "****3456", accountVerified: true, taxReliefs: [], benefitsInKind: [], inclusionDate: "2023-09-01" },
  { id: "ep-7", employeeId: "EMP007", employeeName: "Grace Lee", employeeCode: "EMP007", department: "Finance", payGroupId: "pg-1", payGroupName: "Monthly Salaried", payGradeId: "payg-4", payGradeName: "Grade D - Senior", status: "active", baseSalary: 115000, bankName: "US Bank", accountNumber: "****7890", accountVerified: true, taxReliefs: [], benefitsInKind: [{ id: "bik-4", bikTypeId: "bikt-3", bikTypeName: "Education Allowance", value: 3000, taxAmount: 0 }], inclusionDate: "2022-04-15" },
  { id: "ep-8", employeeId: "EMP008", employeeName: "Henry Taylor", employeeCode: "EMP008", department: "Engineering", payGroupId: "pg-1", payGroupName: "Monthly Salaried", payGradeId: "payg-1", payGradeName: "Grade A - Entry Level", status: "inactive", baseSalary: 38000, bankName: "PNC Bank", accountNumber: "****2345", accountVerified: true, taxReliefs: [], benefitsInKind: [], inclusionDate: "2024-02-01", removalDate: "2024-07-15" },
  { id: "ep-9", employeeId: "EMP009", employeeName: "Ivy Chen", employeeCode: "EMP009", department: "Marketing", payGroupId: "pg-1", payGroupName: "Monthly Salaried", payGradeId: "payg-2", payGradeName: "Grade B - Junior", status: "active", baseSalary: 48000, bankName: "Capital One", accountNumber: "****6789", accountVerified: false, taxReliefs: [], benefitsInKind: [], inclusionDate: "2024-03-01" },
  { id: "ep-10", employeeId: "EMP010", employeeName: "Jack Anderson", employeeCode: "EMP010", department: "Operations", payGroupId: "pg-2", payGroupName: "Bi-Weekly Hourly", payGradeId: "payg-8", payGradeName: "Hourly Grade 2", status: "active", baseSalary: 44000, bankName: "First National Bank", accountNumber: "****0123", accountVerified: true, taxReliefs: [{ id: "tr-3", reliefTypeId: "trt-1", reliefTypeName: "Personal Allowance", amount: 4000, isPercentage: false }], benefitsInKind: [], inclusionDate: "2023-07-01" },
];

export const initialTaxTables: TaxTable[] = [
  {
    id: "tt-1", name: "Federal Income Tax 2024", country: "United States", currency: "USD", taxYear: 2024, isActive: true, effectiveDate: "2024-01-01", createdAt: "2024-01-01",
    brackets: [
      { id: "tb-1", minAmount: 0, maxAmount: 11000, rate: 10, fixedAmount: 0 },
      { id: "tb-2", minAmount: 11001, maxAmount: 44725, rate: 12, fixedAmount: 1100 },
      { id: "tb-3", minAmount: 44726, maxAmount: 95375, rate: 22, fixedAmount: 5147 },
      { id: "tb-4", minAmount: 95376, maxAmount: 182100, rate: 24, fixedAmount: 16290 },
      { id: "tb-5", minAmount: 182101, maxAmount: 231250, rate: 32, fixedAmount: 37104 },
      { id: "tb-6", minAmount: 231251, maxAmount: 578125, rate: 35, fixedAmount: 52832 },
      { id: "tb-7", minAmount: 578126, maxAmount: null, rate: 37, fixedAmount: 174238.25 },
    ],
  },
  {
    id: "tt-2", name: "State Tax - California 2024", country: "United States", currency: "USD", taxYear: 2024, isActive: true, effectiveDate: "2024-01-01", createdAt: "2024-01-01",
    brackets: [
      { id: "tb-8", minAmount: 0, maxAmount: 10099, rate: 1, fixedAmount: 0 },
      { id: "tb-9", minAmount: 10100, maxAmount: 23942, rate: 2, fixedAmount: 101 },
      { id: "tb-10", minAmount: 23943, maxAmount: 37788, rate: 4, fixedAmount: 377.86 },
      { id: "tb-11", minAmount: 37789, maxAmount: 52455, rate: 6, fixedAmount: 931.66 },
      { id: "tb-12", minAmount: 52456, maxAmount: 66295, rate: 8, fixedAmount: 1811.72 },
      { id: "tb-13", minAmount: 66296, maxAmount: 338639, rate: 9.3, fixedAmount: 2918.92 },
      { id: "tb-14", minAmount: 338640, maxAmount: 406364, rate: 10.3, fixedAmount: 28290.92 },
      { id: "tb-15", minAmount: 406365, maxAmount: 677275, rate: 11.3, fixedAmount: 35266.58 },
      { id: "tb-16", minAmount: 677276, maxAmount: null, rate: 12.3, fixedAmount: 65879.51 },
    ],
  },
];

export const initialTaxReliefTypes: TaxReliefType[] = [
  { id: "trt-1", name: "Personal Allowance", code: "PA", description: "Standard personal tax-free allowance", defaultAmount: 4000, maxAmount: 12000, isPercentage: false, isActive: true },
  { id: "trt-2", name: "Pension Contribution", code: "PC", description: "Tax relief on pension contributions", defaultAmount: 5000, maxAmount: 60000, isPercentage: false, isActive: true },
  { id: "trt-3", name: "Mortgage Interest Relief", code: "MIR", description: "Relief on mortgage interest payments", defaultAmount: 0, maxAmount: 15000, isPercentage: false, isActive: true },
  { id: "trt-4", name: "Charitable Donations", code: "CD", description: "Tax relief on approved charitable donations", defaultAmount: 0, maxAmount: 50000, isPercentage: true, isActive: true },
  { id: "trt-5", name: "Disability Allowance", code: "DA", description: "Additional allowance for disability", defaultAmount: 8000, maxAmount: 15000, isPercentage: false, isActive: true },
  { id: "trt-6", name: "Child Tax Credit", code: "CTC", description: "Tax credit for qualifying children", defaultAmount: 2000, maxAmount: 4000, isPercentage: false, isActive: true },
];

export const initialBenefitInKindTypes: BenefitInKindType[] = [
  { id: "bikt-1", name: "Health Insurance", code: "HI", description: "Employer-provided health insurance", taxRate: 10, isActive: true },
  { id: "bikt-2", name: "Company Car", code: "CC", description: "Company vehicle for personal use", taxRate: 15, isActive: true },
  { id: "bikt-3", name: "Education Allowance", code: "EA", description: "Tuition and education reimbursement", taxRate: 0, isActive: true },
  { id: "bikt-4", name: "Housing Allowance", code: "HA", description: "Employer-provided housing benefit", taxRate: 12, isActive: true },
  { id: "bikt-5", name: "Meal Allowance", code: "MA", description: "Daily meal allowance", taxRate: 5, isActive: true },
  { id: "bikt-6", name: "Transport Allowance", code: "TA", description: "Transportation benefit", taxRate: 8, isActive: true },
];

export const initialApprovers: PayrollApprover[] = [
  { id: "pa-1", userId: "U001", name: "Sarah Thompson", email: "sarah.t@company.com", role: "HR Director", approvalLevel: 1, isActive: true },
  { id: "pa-2", userId: "U002", name: "Michael Chang", email: "michael.c@company.com", role: "CFO", approvalLevel: 2, isActive: true },
  { id: "pa-3", userId: "U003", name: "Jennifer Adams", email: "jennifer.a@company.com", role: "VP Finance", approvalLevel: 3, isActive: true },
];

export const initialAdministrators: PayrollAdministrator[] = [
  {
    id: "pad-1", userId: "U004", name: "Rachel Green", email: "rachel.g@company.com", isActive: true, assignedAt: "2024-01-15",
    permissions: [
      { id: "pp-1", name: "run_payroll", description: "Run payroll processing", granted: true },
      { id: "pp-2", name: "edit_paygrades", description: "Edit pay grade details", granted: true },
      { id: "pp-3", name: "manage_employees", description: "Manage employee payroll inclusion", granted: true },
      { id: "pp-4", name: "configure_tax", description: "Configure tax tables and reliefs", granted: false },
      { id: "pp-5", name: "generate_reports", description: "Generate and download reports", granted: true },
      { id: "pp-6", name: "submit_payment", description: "Submit payroll for payment", granted: false },
    ],
  },
  {
    id: "pad-2", userId: "U005", name: "Tom Baker", email: "tom.b@company.com", isActive: true, assignedAt: "2024-02-01",
    permissions: [
      { id: "pp-7", name: "run_payroll", description: "Run payroll processing", granted: true },
      { id: "pp-8", name: "edit_paygrades", description: "Edit pay grade details", granted: true },
      { id: "pp-9", name: "manage_employees", description: "Manage employee payroll inclusion", granted: true },
      { id: "pp-10", name: "configure_tax", description: "Configure tax tables and reliefs", granted: true },
      { id: "pp-11", name: "generate_reports", description: "Generate and download reports", granted: true },
      { id: "pp-12", name: "submit_payment", description: "Submit payroll for payment", granted: true },
    ],
  },
];

export const initialPayslipSettings: PayslipSetting[] = [
  { id: "ps-1", settingName: "Show Bank Details", settingValue: "true", isEnabled: true },
  { id: "ps-2", settingName: "Show YTD Totals", settingValue: "true", isEnabled: true },
  { id: "ps-3", settingName: "Show Tax Breakdown", settingValue: "true", isEnabled: true },
  { id: "ps-4", settingName: "Show Benefits in Kind", settingValue: "true", isEnabled: true },
  { id: "ps-5", settingName: "Show Pension Contributions", settingValue: "true", isEnabled: true },
  { id: "ps-6", settingName: "Show Employee ID", settingValue: "true", isEnabled: true },
  { id: "ps-7", settingName: "Show Department", settingValue: "false", isEnabled: false },
  { id: "ps-8", settingName: "Show Pay Period Dates", settingValue: "true", isEnabled: true },
  { id: "ps-9", settingName: "Include Company Logo", settingValue: "true", isEnabled: true },
  { id: "ps-10", settingName: "Show Payment Reference", settingValue: "true", isEnabled: true },
];

export const initialPayslipFields: PayslipField[] = [
  { id: "pf-1", fieldName: "employee_name", fieldType: "employee_info", isVisible: true, displayOrder: 1, label: "Employee Name" },
  { id: "pf-2", fieldName: "employee_id", fieldType: "employee_info", isVisible: true, displayOrder: 2, label: "Employee ID" },
  { id: "pf-3", fieldName: "department", fieldType: "employee_info", isVisible: false, displayOrder: 3, label: "Department" },
  { id: "pf-4", fieldName: "job_title", fieldType: "employee_info", isVisible: true, displayOrder: 4, label: "Job Title" },
  { id: "pf-5", fieldName: "pay_period", fieldType: "employee_info", isVisible: true, displayOrder: 5, label: "Pay Period" },
  { id: "pf-6", fieldName: "base_salary", fieldType: "earnings", isVisible: true, displayOrder: 6, label: "Basic Salary" },
  { id: "pf-7", fieldName: "allowances", fieldType: "earnings", isVisible: true, displayOrder: 7, label: "Allowances" },
  { id: "pf-8", fieldName: "overtime", fieldType: "earnings", isVisible: true, displayOrder: 8, label: "Overtime" },
  { id: "pf-9", fieldName: "bonus", fieldType: "earnings", isVisible: true, displayOrder: 9, label: "Bonus" },
  { id: "pf-10", fieldName: "gross_pay", fieldType: "earnings", isVisible: true, displayOrder: 10, label: "Gross Pay" },
  { id: "pf-11", fieldName: "income_tax", fieldType: "taxes", isVisible: true, displayOrder: 11, label: "Income Tax" },
  { id: "pf-12", fieldName: "social_security", fieldType: "deductions", isVisible: true, displayOrder: 12, label: "Social Security" },
  { id: "pf-13", fieldName: "pension", fieldType: "deductions", isVisible: true, displayOrder: 13, label: "Pension" },
  { id: "pf-14", fieldName: "health_insurance", fieldType: "deductions", isVisible: true, displayOrder: 14, label: "Health Insurance" },
  { id: "pf-15", fieldName: "other_deductions", fieldType: "deductions", isVisible: true, displayOrder: 15, label: "Other Deductions" },
  { id: "pf-16", fieldName: "total_deductions", fieldType: "deductions", isVisible: true, displayOrder: 16, label: "Total Deductions" },
  { id: "pf-17", fieldName: "net_pay", fieldType: "earnings", isVisible: true, displayOrder: 17, label: "Net Pay" },
  { id: "pf-18", fieldName: "bank_details", fieldType: "employee_info", isVisible: true, displayOrder: 18, label: "Bank Details" },
  { id: "pf-19", fieldName: "ytd_gross", fieldType: "custom", isVisible: true, displayOrder: 19, label: "YTD Gross Pay" },
  { id: "pf-20", fieldName: "ytd_tax", fieldType: "custom", isVisible: true, displayOrder: 20, label: "YTD Tax" },
];

export const initialBonusConfigurations: BonusConfiguration[] = [
  { id: "bc-1", name: "13th Month Pay", type: "13th_month", calculationMethod: "percentage_of_salary", defaultAmount: 0, percentage: 100, isTaxable: true, isActive: true, applicablePayGroups: ["pg-1", "pg-4"] },
  { id: "bc-2", name: "Annual Performance Bonus", type: "bonus", calculationMethod: "custom", defaultAmount: 5000, percentage: 0, isTaxable: true, isActive: true, applicablePayGroups: ["pg-1", "pg-2", "pg-4"] },
  { id: "bc-3", name: "Transport Allowance", type: "allowance", calculationMethod: "fixed", defaultAmount: 500, percentage: 0, isTaxable: false, isActive: true, applicablePayGroups: ["pg-1", "pg-2", "pg-3"] },
  { id: "bc-4", name: "Sales Commission", type: "commission", calculationMethod: "custom", defaultAmount: 0, percentage: 0, isTaxable: true, isActive: true, applicablePayGroups: ["pg-1"] },
  { id: "bc-5", name: "Meal Allowance", type: "allowance", calculationMethod: "fixed", defaultAmount: 200, percentage: 0, isTaxable: false, isActive: true, applicablePayGroups: ["pg-1", "pg-2"] },
];

export const initialArrearRecords: ArrearRecord[] = [
  { id: "ar-1", employeeId: "EMP001", employeeName: "Alice Johnson", type: "promotion", amount: 8500, effectiveDate: "2024-04-01", processedDate: "2024-06-15", status: "processed", description: "Promotion from Grade B to Grade C - arrears for Apr-Jun" },
  { id: "ar-2", employeeId: "EMP003", employeeName: "Carol Davis", type: "correction", amount: 2200, effectiveDate: "2024-05-01", status: "pending", description: "Salary correction - missed increment in Jan 2024" },
  { id: "ar-3", employeeId: "EMP005", employeeName: "Eva Martinez", type: "promotion", amount: 15000, effectiveDate: "2024-03-01", processedDate: "2024-05-30", status: "processed", description: "Promotion from Grade D to Grade E - arrears for Mar-May" },
  { id: "ar-4", employeeId: "EMP009", employeeName: "Ivy Chen", type: "backpay", amount: 3600, effectiveDate: "2024-01-01", status: "pending", description: "Backpay for delayed onboarding" },
];

export const initialProratableDeductions: ProratableDeduction[] = [
  { id: "pd-1", name: "Salary Advance Repayment", type: "advance", calculationMethod: "monthly", isActive: true },
  { id: "pd-2", name: "Company Loan Repayment", type: "loan", calculationMethod: "monthly", isActive: true },
  { id: "pd-3", name: "Court-Ordered Garnishment", type: "garnishment", calculationMethod: "monthly", isActive: true },
  { id: "pd-4", name: "Uniform Deduction", type: "other", calculationMethod: "quarterly", isActive: true },
];

export const initialPayrollRuns: PayrollRun[] = [
  { id: "pr-1", name: "June 2024 - Monthly Payroll", payGroupId: "pg-1", payGroupName: "Monthly Salaried", period: "June 2024", startDate: "2024-06-01", endDate: "2024-06-30", status: "paid", type: "regular", totalEmployees: 145, totalGross: 1850000, totalDeductions: 412500, totalTax: 287500, totalNet: 1150000, processedAt: "2024-06-25", completedAt: "2024-06-27", paidAt: "2024-06-28", createdBy: "Rachel Green" },
  { id: "pr-2", name: "June 2024 - Bi-Weekly Payroll", payGroupId: "pg-2", payGroupName: "Bi-Weekly Hourly", period: "June 2024 (2nd Half)", startDate: "2024-06-17", endDate: "2024-06-30", status: "completed", type: "regular", totalEmployees: 82, totalGross: 680000, totalDeductions: 152000, totalTax: 98000, totalNet: 430000, processedAt: "2024-06-26", completedAt: "2024-06-27", createdBy: "Tom Baker" },
  { id: "pr-3", name: "July 2024 - Monthly Payroll", payGroupId: "pg-1", payGroupName: "Monthly Salaried", period: "July 2024", startDate: "2024-07-01", endDate: "2024-07-31", status: "preview", type: "regular", totalEmployees: 148, totalGross: 1920000, totalDeductions: 428000, totalTax: 298000, totalNet: 1194000, processedAt: "2024-07-25", createdBy: "Rachel Green" },
  { id: "pr-4", name: "July 2024 - Off-Cycle Bonus", payGroupId: "pg-1", payGroupName: "Monthly Salaried", period: "July 2024 (Off-Cycle)", startDate: "2024-07-15", endDate: "2024-07-15", status: "draft", type: "off-cycle", totalEmployees: 12, totalGross: 180000, totalDeductions: 40000, totalTax: 28000, totalNet: 112000, createdBy: "Tom Baker" },
  { id: "pr-5", name: "May 2024 - Monthly Payroll", payGroupId: "pg-1", payGroupName: "Monthly Salaried", period: "May 2024", startDate: "2024-05-01", endDate: "2024-05-31", status: "paid", type: "regular", totalEmployees: 143, totalGross: 1800000, totalDeductions: 400000, totalTax: 275000, totalNet: 1125000, processedAt: "2024-05-25", completedAt: "2024-05-27", paidAt: "2024-05-28", createdBy: "Rachel Green" },
];

export const initialOffCycleUpdates: OffCycleUpdate[] = [
  { id: "oc-1", employeeId: "EMP001", employeeName: "Alice Johnson", payrollRunId: "pr-4", type: "bonus", amount: 15000, description: "Project completion bonus", status: "approved", createdAt: "2024-07-10" },
  { id: "oc-2", employeeId: "EMP003", employeeName: "Carol Davis", payrollRunId: "pr-4", type: "bonus", amount: 5000, description: "Spot recognition award", status: "pending", createdAt: "2024-07-11" },
  { id: "oc-3", employeeId: "EMP005", employeeName: "Eva Martinez", payrollRunId: "pr-4", type: "deduction", amount: -2000, description: "Advance repayment adjustment", status: "pending", createdAt: "2024-07-12" },
  { id: "oc-4", employeeId: "EMP007", employeeName: "Grace Lee", payrollRunId: "pr-4", type: "adjustment", amount: 800, description: "Overtime correction for June", status: "approved", createdAt: "2024-07-09" },
];

export const initialPayrollReports: PayrollReport[] = [
  { id: "rpt-1", name: "Monthly Payroll Summary", description: "Summary of all payroll runs for the month", type: "summary", columns: ["period", "pay_group", "total_employees", "gross_pay", "deductions", "tax", "net_pay"], filters: {}, createdAt: "2024-01-15", updatedAt: "2024-06-20", lastGenerated: "2024-06-28" },
  { id: "rpt-2", name: "Employee Pay Detail", description: "Detailed breakdown per employee", type: "detailed", columns: ["employee_name", "department", "base_salary", "allowances", "deductions", "tax", "net_pay"], filters: {}, createdAt: "2024-02-01", updatedAt: "2024-05-15", lastGenerated: "2024-06-27" },
  { id: "rpt-3", name: "Tax Withholding Report", description: "Tax withheld per employee by period", type: "tax", columns: ["employee_name", "taxable_income", "tax_withheld", "effective_rate"], filters: {}, createdAt: "2024-01-20", updatedAt: "2024-06-20" },
  { id: "rpt-4", name: "Pension Contribution Report", description: "Employee and employer pension contributions", type: "pension", columns: ["employee_name", "employee_contribution", "employer_contribution", "total"], filters: {}, createdAt: "2024-03-01", updatedAt: "2024-06-25", lastGenerated: "2024-06-28" },
  { id: "rpt-5", name: "Year-to-Date Summary", description: "YTD earnings, deductions and tax for all employees", type: "ytd", columns: ["employee_name", "ytd_gross", "ytd_tax", "ytd_deductions", "ytd_net"], filters: {}, createdAt: "2024-01-01", updatedAt: "2024-06-28", lastGenerated: "2024-06-28" },
];

export const samplePayslip: PayslipData = {
  id: "psl-1",
  employeeId: "EMP001",
  employeeName: "Alice Johnson",
  employeeCode: "EMP001",
  department: "Engineering",
  payPeriod: "June 2024",
  payDate: "2024-06-28",
  baseSalary: 6250,
  allowances: [
    { name: "Transport Allowance", amount: 500 },
    { name: "Meal Allowance", amount: 200 },
  ],
  grossPay: 6950,
  deductions: [
    { name: "Health Insurance", amount: 240 },
    { name: "Pension Contribution", amount: 375 },
    { name: "Social Security", amount: 468.75 },
  ],
  taxes: [
    { name: "Federal Income Tax", amount: 1050 },
    { name: "State Tax", amount: 350 },
  ],
  totalDeductions: 2483.75,
  netPay: 4466.25,
  bankName: "First National Bank",
  accountNumber: "****4521",
  yearToDate: {
    grossPay: 41700,
    totalTax: 8400,
    totalDeductions: 14902.50,
    netPay: 18397.50,
  },
};

export const samplePensionReport: PensionReport[] = [
  { id: "pen-1", employeeId: "EMP001", employeeName: "Alice Johnson", employeeCode: "EMP001", pensionFund: "National Pension Fund", employeeContribution: 375, employerContribution: 375, totalContribution: 750, period: "June 2024" },
  { id: "pen-2", employeeId: "EMP002", employeeName: "Bob Williams", employeeCode: "EMP002", pensionFund: "National Pension Fund", employeeContribution: 600, employerContribution: 600, totalContribution: 1200, period: "June 2024" },
  { id: "pen-3", employeeId: "EMP003", employeeName: "Carol Davis", employeeCode: "EMP003", pensionFund: "National Pension Fund", employeeContribution: 260, employerContribution: 260, totalContribution: 520, period: "June 2024" },
  { id: "pen-4", employeeId: "EMP004", employeeName: "David Brown", employeeCode: "EMP004", pensionFund: "National Pension Fund", employeeContribution: 400, employerContribution: 400, totalContribution: 800, period: "June 2024" },
  { id: "pen-5", employeeId: "EMP005", employeeName: "Eva Martinez", employeeCode: "EMP005", pensionFund: "National Pension Fund", employeeContribution: 775, employerContribution: 775, totalContribution: 1550, period: "June 2024" },
];

export const sampleAccountStatements: PayrollAccountStatement[] = [
  { id: "pas-1", employeeId: "EMP001", employeeName: "Alice Johnson", accountNumber: "****4521", bankName: "First National Bank", period: "June 2024", grossPay: 6950, totalDeductions: 2483.75, netPay: 4466.25, paymentDate: "2024-06-28", paymentRef: "PAY-JUN24-001" },
  { id: "pas-2", employeeId: "EMP002", employeeName: "Bob Williams", accountNumber: "****7832", bankName: "Chase Bank", period: "June 2024", grossPay: 10500, totalDeductions: 3675, netPay: 6825, paymentDate: "2024-06-28", paymentRef: "PAY-JUN24-002" },
  { id: "pas-3", employeeId: "EMP003", employeeName: "Carol Davis", accountNumber: "****1234", bankName: "Wells Fargo", period: "June 2024", grossPay: 4750, totalDeductions: 1520, netPay: 3230, paymentDate: "2024-06-28", paymentRef: "PAY-JUN24-003" },
  { id: "pas-4", employeeId: "EMP004", employeeName: "David Brown", accountNumber: "****5678", bankName: "Bank of America", period: "June 2024", grossPay: 7250, totalDeductions: 2537.50, netPay: 4712.50, paymentDate: "2024-06-28", paymentRef: "PAY-JUN24-004" },
  { id: "pas-5", employeeId: "EMP005", employeeName: "Eva Martinez", accountNumber: "****9012", bankName: "Citibank", period: "June 2024", grossPay: 13500, totalDeductions: 4725, netPay: 8775, paymentDate: "2024-06-28", paymentRef: "PAY-JUN24-005" },
];
