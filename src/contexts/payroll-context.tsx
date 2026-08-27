"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
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
  PayrollModuleTab,
} from "@/types/payroll";
import {
  initialPayGroups,
  initialPayGrades,
  initialEmployees,
  initialTaxTables,
  initialTaxReliefTypes,
  initialBenefitInKindTypes,
  initialApprovers,
  initialAdministrators,
  initialPayslipSettings,
  initialPayslipFields,
  initialBonusConfigurations,
  initialArrearRecords,
  initialProratableDeductions,
  initialPayrollRuns,
  initialOffCycleUpdates,
  initialPayrollReports,
} from "@/services/mock-data";
import { generateId } from "@/lib/utils";

interface PayrollContextType {
  activeTab: PayrollModuleTab;
  setActiveTab: (tab: PayrollModuleTab) => void;
  employeePayrolls: EmployeePayroll[];
  addEmployeePayroll: (emp: Omit<EmployeePayroll, "id">) => void;
  removeEmployeePayroll: (id: string) => void;

  payGroups: PayGroup[];
  addPayGroup: (pg: Omit<PayGroup, "id" | "createdAt" | "updatedAt">) => void;
  updatePayGroup: (id: string, pg: Partial<PayGroup>) => void;
  deletePayGroup: (id: string) => void;
  bulkUploadPayGroups: (pgs: Omit<PayGroup, "id" | "createdAt" | "updatedAt">[]) => void;

  payGrades: PayGrade[];
  addPayGrade: (pg: Omit<PayGrade, "id" | "createdAt" | "updatedAt">) => void;
  updatePayGrade: (id: string, pg: Partial<PayGrade>) => void;
  deletePayGrade: (id: string) => void;
  bulkUploadPayGrades: (pgs: Omit<PayGrade, "id" | "createdAt" | "updatedAt">[]) => void;
  bulkEditPayGrades: (pgs: Partial<PayGrade>[]) => void;

  employees: EmployeePayroll[];
  addEmployee: (emp: Omit<EmployeePayroll, "id">) => void;
  updateEmployee: (id: string, emp: Partial<EmployeePayroll>) => void;
  removeEmployee: (id: string) => void;
  bulkVerifyAccounts: (ids: string[]) => void;

  taxTables: TaxTable[];
  addTaxTable: (tt: Omit<TaxTable, "id" | "createdAt">) => void;
  updateTaxTable: (id: string, tt: Partial<TaxTable>) => void;
  deleteTaxTable: (id: string) => void;

  taxReliefTypes: TaxReliefType[];
  addTaxReliefType: (trt: Omit<TaxReliefType, "id">) => void;
  updateTaxReliefType: (id: string, trt: Partial<TaxReliefType>) => void;
  deleteTaxReliefType: (id: string) => void;

  benefitInKindTypes: BenefitInKindType[];
  addBenefitInKindType: (bikt: Omit<BenefitInKindType, "id">) => void;
  updateBenefitInKindType: (id: string, bikt: Partial<BenefitInKindType>) => void;
  deleteBenefitInKindType: (id: string) => void;

  approvers: PayrollApprover[];
  addApprover: (a: Omit<PayrollApprover, "id">) => void;
  updateApprover: (id: string, a: Partial<PayrollApprover>) => void;
  removeApprover: (id: string) => void;

  administrators: PayrollAdministrator[];
  addAdministrator: (a: Omit<PayrollAdministrator, "id">) => void;
  updateAdministrator: (id: string, a: Partial<PayrollAdministrator>) => void;
  removeAdministrator: (id: string) => void;
  updateAdministratorPermissions: (id: string, permissions: PayrollAdministrator["permissions"]) => void;

  payslipSettings: PayslipSetting[];
  updatePayslipSetting: (id: string, s: Partial<PayslipSetting>) => void;

  payslipFields: PayslipField[];
  updatePayslipField: (id: string, f: Partial<PayslipField>) => void;
  reorderPayslipFields: (fields: PayslipField[]) => void;

  bonusConfigurations: BonusConfiguration[];
  addBonusConfiguration: (bc: Omit<BonusConfiguration, "id">) => void;
  updateBonusConfiguration: (id: string, bc: Partial<BonusConfiguration>) => void;
  deleteBonusConfiguration: (id: string) => void;

  arrearRecords: ArrearRecord[];
  addArrearRecord: (ar: Omit<ArrearRecord, "id">) => void;
  updateArrearRecord: (id: string, ar: Partial<ArrearRecord>) => void;
  processArrear: (id: string) => void;

  proratableDeductions: ProratableDeduction[];
  addProratableDeduction: (pd: Omit<ProratableDeduction, "id">) => void;
  updateProratableDeduction: (id: string, pd: Partial<ProratableDeduction>) => void;
  deleteProratableDeduction: (id: string) => void;

  payrollRuns: PayrollRun[];
  createPayrollRun: (pr: Omit<PayrollRun, "id">) => void;
  updatePayrollRun: (id: string, pr: Partial<PayrollRun>) => void;
  processPayroll: (id: string) => void;
  previewPayroll: (id: string) => void;
  completePayroll: (id: string) => void;
  submitForPayment: (id: string) => void;

  offCycleUpdates: OffCycleUpdate[];
  addOffCycleUpdate: (oc: Omit<OffCycleUpdate, "id">) => void;
  bulkUploadOffCycleUpdates: (ocs: Omit<OffCycleUpdate, "id">[]) => void;
  updateOffCycleUpdate: (id: string, oc: Partial<OffCycleUpdate>) => void;

  payrollReports: PayrollReport[];
  addPayrollReport: (r: Omit<PayrollReport, "id" | "createdAt" | "updatedAt">) => void;
  updatePayrollReport: (id: string, r: Partial<PayrollReport>) => void;
  deletePayrollReport: (id: string) => void;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export function PayrollProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<PayrollModuleTab>("dashboard");
  const [payGroups, setPayGroups] = useState<PayGroup[]>(initialPayGroups);
  const [payGrades, setPayGrades] = useState<PayGrade[]>(initialPayGrades);
  const [employees, setEmployees] = useState<EmployeePayroll[]>(initialEmployees);
  const [taxTables, setTaxTables] = useState<TaxTable[]>(initialTaxTables);
  const [taxReliefTypes, setTaxReliefTypes] = useState<TaxReliefType[]>(initialTaxReliefTypes);
  const [benefitInKindTypes, setBenefitInKindTypes] = useState<BenefitInKindType[]>(initialBenefitInKindTypes);
  const [approvers, setApprovers] = useState<PayrollApprover[]>(initialApprovers);
  const [administrators, setAdministrators] = useState<PayrollAdministrator[]>(initialAdministrators);
  const [payslipSettings, setPayslipSettings] = useState<PayslipSetting[]>(initialPayslipSettings);
  const [payslipFields, setPayslipFields] = useState<PayslipField[]>(initialPayslipFields);
  const [bonusConfigurations, setBonusConfigurations] = useState<BonusConfiguration[]>(initialBonusConfigurations);
  const [arrearRecords, setArrearRecords] = useState<ArrearRecord[]>(initialArrearRecords);
  const [proratableDeductions, setProratableDeductions] = useState<ProratableDeduction[]>(initialProratableDeductions);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(initialPayrollRuns);
  const [offCycleUpdates, setOffCycleUpdates] = useState<OffCycleUpdate[]>(initialOffCycleUpdates);
  const [payrollReports, setPayrollReports] = useState<PayrollReport[]>(initialPayrollReports);

  const now = () => new Date().toISOString().split("T")[0];

  const addPayGroup = useCallback((pg: Omit<PayGroup, "id" | "createdAt" | "updatedAt">) => {
    setPayGroups((prev) => [...prev, { ...pg, id: generateId(), createdAt: now(), updatedAt: now() }]);
  }, []);

  const updatePayGroup = useCallback((id: string, pg: Partial<PayGroup>) => {
    setPayGroups((prev) => prev.map((p) => (p.id === id ? { ...p, ...pg, updatedAt: now() } : p)));
  }, []);

  const deletePayGroup = useCallback((id: string) => {
    setPayGroups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const bulkUploadPayGroups = useCallback((pgs: Omit<PayGroup, "id" | "createdAt" | "updatedAt">[]) => {
    setPayGroups((prev) => [...prev, ...pgs.map((pg) => ({ ...pg, id: generateId(), createdAt: now(), updatedAt: now() }))]);
  }, []);

  const addPayGrade = useCallback((pg: Omit<PayGrade, "id" | "createdAt" | "updatedAt">) => {
    setPayGrades((prev) => [...prev, { ...pg, id: generateId(), createdAt: now(), updatedAt: now() }]);
  }, []);

  const updatePayGrade = useCallback((id: string, pg: Partial<PayGrade>) => {
    setPayGrades((prev) => prev.map((p) => (p.id === id ? { ...p, ...pg, updatedAt: now() } : p)));
  }, []);

  const deletePayGrade = useCallback((id: string) => {
    setPayGrades((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const bulkUploadPayGrades = useCallback((pgs: Omit<PayGrade, "id" | "createdAt" | "updatedAt">[]) => {
    setPayGrades((prev) => [...prev, ...pgs.map((pg) => ({ ...pg, id: generateId(), createdAt: now(), updatedAt: now() }))]);
  }, []);

  const bulkEditPayGrades = useCallback((pgs: Partial<PayGrade>[]) => {
    setPayGrades((prev) =>
      prev.map((p) => {
        const update = pgs.find((u) => u.id === p.id);
        return update ? { ...p, ...update, updatedAt: now() } : p;
      })
    );
  }, []);

  const addEmployee = useCallback((emp: Omit<EmployeePayroll, "id">) => {
    setEmployees((prev) => [...prev, { ...emp, id: generateId() }]);
  }, []);

  const updateEmployee = useCallback((id: string, emp: Partial<EmployeePayroll>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...emp } : e)));
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status: "inactive" as const, removalDate: now() } : e)));
  }, []);

  const bulkVerifyAccounts = useCallback((ids: string[]) => {
    setEmployees((prev) => prev.map((e) => (ids.includes(e.id) ? { ...e, accountVerified: true } : e)));
  }, []);

  const employeePayrolls = employees;
  const addEmployeePayroll = addEmployee;
  const removeEmployeePayroll = removeEmployee;

  const addTaxTable = useCallback((tt: Omit<TaxTable, "id" | "createdAt">) => {
    setTaxTables((prev) => [...prev, { ...tt, id: generateId(), createdAt: now() }]);
  }, []);

  const updateTaxTable = useCallback((id: string, tt: Partial<TaxTable>) => {
    setTaxTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...tt } : t)));
  }, []);

  const deleteTaxTable = useCallback((id: string) => {
    setTaxTables((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addTaxReliefType = useCallback((trt: Omit<TaxReliefType, "id">) => {
    setTaxReliefTypes((prev) => [...prev, { ...trt, id: generateId() }]);
  }, []);

  const updateTaxReliefType = useCallback((id: string, trt: Partial<TaxReliefType>) => {
    setTaxReliefTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...trt } : t)));
  }, []);

  const deleteTaxReliefType = useCallback((id: string) => {
    setTaxReliefTypes((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addBenefitInKindType = useCallback((bikt: Omit<BenefitInKindType, "id">) => {
    setBenefitInKindTypes((prev) => [...prev, { ...bikt, id: generateId() }]);
  }, []);

  const updateBenefitInKindType = useCallback((id: string, bikt: Partial<BenefitInKindType>) => {
    setBenefitInKindTypes((prev) => prev.map((b) => (b.id === id ? { ...b, ...bikt } : b)));
  }, []);

  const deleteBenefitInKindType = useCallback((id: string) => {
    setBenefitInKindTypes((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addApprover = useCallback((a: Omit<PayrollApprover, "id">) => {
    setApprovers((prev) => [...prev, { ...a, id: generateId() }]);
  }, []);

  const updateApprover = useCallback((id: string, a: Partial<PayrollApprover>) => {
    setApprovers((prev) => prev.map((ap) => (ap.id === id ? { ...ap, ...a } : ap)));
  }, []);

  const removeApprover = useCallback((id: string) => {
    setApprovers((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addAdministrator = useCallback((a: Omit<PayrollAdministrator, "id">) => {
    setAdministrators((prev) => [...prev, { ...a, id: generateId() }]);
  }, []);

  const updateAdministrator = useCallback((id: string, a: Partial<PayrollAdministrator>) => {
    setAdministrators((prev) => prev.map((ad) => (ad.id === id ? { ...ad, ...a } : ad)));
  }, []);

  const removeAdministrator = useCallback((id: string) => {
    setAdministrators((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAdministratorPermissions = useCallback((id: string, permissions: PayrollAdministrator["permissions"]) => {
    setAdministrators((prev) => prev.map((ad) => (ad.id === id ? { ...ad, permissions } : ad)));
  }, []);

  const updatePayslipSetting = useCallback((id: string, s: Partial<PayslipSetting>) => {
    setPayslipSettings((prev) => prev.map((ps) => (ps.id === id ? { ...ps, ...s } : ps)));
  }, []);

  const updatePayslipField = useCallback((id: string, f: Partial<PayslipField>) => {
    setPayslipFields((prev) => prev.map((pf) => (pf.id === id ? { ...pf, ...f } : pf)));
  }, []);

  const reorderPayslipFields = useCallback((fields: PayslipField[]) => {
    setPayslipFields(fields);
  }, []);

  const addBonusConfiguration = useCallback((bc: Omit<BonusConfiguration, "id">) => {
    setBonusConfigurations((prev) => [...prev, { ...bc, id: generateId() }]);
  }, []);

  const updateBonusConfiguration = useCallback((id: string, bc: Partial<BonusConfiguration>) => {
    setBonusConfigurations((prev) => prev.map((b) => (b.id === id ? { ...b, ...bc } : b)));
  }, []);

  const deleteBonusConfiguration = useCallback((id: string) => {
    setBonusConfigurations((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addArrearRecord = useCallback((ar: Omit<ArrearRecord, "id">) => {
    setArrearRecords((prev) => [...prev, { ...ar, id: generateId() }]);
  }, []);

  const updateArrearRecord = useCallback((id: string, ar: Partial<ArrearRecord>) => {
    setArrearRecords((prev) => prev.map((a) => (a.id === id ? { ...a, ...ar } : a)));
  }, []);

  const processArrear = useCallback((id: string) => {
    setArrearRecords((prev) => prev.map((a) => (a.id === id ? { ...a, status: "processed" as const, processedDate: now() } : a)));
  }, []);

  const addProratableDeduction = useCallback((pd: Omit<ProratableDeduction, "id">) => {
    setProratableDeductions((prev) => [...prev, { ...pd, id: generateId() }]);
  }, []);

  const updateProratableDeduction = useCallback((id: string, pd: Partial<ProratableDeduction>) => {
    setProratableDeductions((prev) => prev.map((p) => (p.id === id ? { ...p, ...pd } : p)));
  }, []);

  const deleteProratableDeduction = useCallback((id: string) => {
    setProratableDeductions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const createPayrollRun = useCallback((pr: Omit<PayrollRun, "id">) => {
    setPayrollRuns((prev) => [...prev, { ...pr, id: generateId() }]);
  }, []);

  const updatePayrollRun = useCallback((id: string, pr: Partial<PayrollRun>) => {
    setPayrollRuns((prev) => prev.map((p) => (p.id === id ? { ...p, ...pr } : p)));
  }, []);

  const processPayroll = useCallback((id: string) => {
    setPayrollRuns((prev) => prev.map((p) => (p.id === id ? { ...p, status: "processing" as const, processedAt: now() } : p)));
  }, []);

  const previewPayroll = useCallback((id: string) => {
    setPayrollRuns((prev) => prev.map((p) => (p.id === id ? { ...p, status: "preview" as const } : p)));
  }, []);

  const completePayroll = useCallback((id: string) => {
    setPayrollRuns((prev) => prev.map((p) => (p.id === id ? { ...p, status: "completed" as const, completedAt: now() } : p)));
  }, []);

  const submitForPayment = useCallback((id: string) => {
    setPayrollRuns((prev) => prev.map((p) => (p.id === id ? { ...p, status: "paid" as const, paidAt: now() } : p)));
  }, []);

  const addOffCycleUpdate = useCallback((oc: Omit<OffCycleUpdate, "id">) => {
    setOffCycleUpdates((prev) => [...prev, { ...oc, id: generateId() }]);
  }, []);

  const bulkUploadOffCycleUpdates = useCallback((ocs: Omit<OffCycleUpdate, "id">[]) => {
    setOffCycleUpdates((prev) => [...prev, ...ocs.map((oc) => ({ ...oc, id: generateId() }))]);
  }, []);

  const updateOffCycleUpdate = useCallback((id: string, oc: Partial<OffCycleUpdate>) => {
    setOffCycleUpdates((prev) => prev.map((o) => (o.id === id ? { ...o, ...oc } : o)));
  }, []);

  const addPayrollReport = useCallback((r: Omit<PayrollReport, "id" | "createdAt" | "updatedAt">) => {
    setPayrollReports((prev) => [...prev, { ...r, id: generateId(), createdAt: now(), updatedAt: now() }]);
  }, []);

  const updatePayrollReport = useCallback((id: string, r: Partial<PayrollReport>) => {
    setPayrollReports((prev) => prev.map((rp) => (rp.id === id ? { ...rp, ...r, updatedAt: now() } : rp)));
  }, []);

  const deletePayrollReport = useCallback((id: string) => {
    setPayrollReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <PayrollContext.Provider
      value={{
        activeTab, setActiveTab,
        employeePayrolls, addEmployeePayroll, removeEmployeePayroll,
        payGroups, addPayGroup, updatePayGroup, deletePayGroup, bulkUploadPayGroups,
        payGrades, addPayGrade, updatePayGrade, deletePayGrade, bulkUploadPayGrades, bulkEditPayGrades,
        employees, addEmployee, updateEmployee, removeEmployee, bulkVerifyAccounts,
        taxTables, addTaxTable, updateTaxTable, deleteTaxTable,
        taxReliefTypes, addTaxReliefType, updateTaxReliefType, deleteTaxReliefType,
        benefitInKindTypes, addBenefitInKindType, updateBenefitInKindType, deleteBenefitInKindType,
        approvers, addApprover, updateApprover, removeApprover,
        administrators, addAdministrator, updateAdministrator, removeAdministrator, updateAdministratorPermissions,
        payslipSettings, updatePayslipSetting,
        payslipFields, updatePayslipField, reorderPayslipFields,
        bonusConfigurations, addBonusConfiguration, updateBonusConfiguration, deleteBonusConfiguration,
        arrearRecords, addArrearRecord, updateArrearRecord, processArrear,
        proratableDeductions, addProratableDeduction, updateProratableDeduction, deleteProratableDeduction,
        payrollRuns, createPayrollRun, updatePayrollRun, processPayroll, previewPayroll, completePayroll, submitForPayment,
        offCycleUpdates, addOffCycleUpdate, bulkUploadOffCycleUpdates, updateOffCycleUpdate,
        payrollReports, addPayrollReport, updatePayrollReport, deletePayrollReport,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayroll() {
  const context = useContext(PayrollContext);
  if (!context) throw new Error("usePayroll must be used within a PayrollProvider");
  return context;
}
