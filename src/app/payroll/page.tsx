"use client";

import { PayrollProvider, usePayroll } from "@/contexts/payroll-context";
import { PayrollModuleTab } from "@/types/payroll";
import { PayrollSidebar } from "@/components/payroll/payroll-sidebar";
import Dashboard from "@/components/payroll/dashboard";
import PayGroups from "@/components/payroll/pay-groups";
import PayGrades from "@/components/payroll/pay-grades";
import EmployeePayroll from "@/components/payroll/employee-payroll";
import TaxConfiguration from "@/components/payroll/tax-configuration";
import Administration from "@/components/payroll/administration";
import PayslipSettings from "@/components/payroll/payslip-settings";
import BonusConfiguration from "@/components/payroll/bonus-configuration";
import Arrears from "@/components/payroll/arrears";
import RunPayroll from "@/components/payroll/run-payroll";
import OffCyclePayroll from "@/components/payroll/off-cycle";
import Reports from "@/components/payroll/reports";

function PayrollContent() {
  const { activeTab, setActiveTab } = usePayroll();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveTab} />;
      case "pay-groups":
        return <PayGroups />;
      case "pay-grades":
        return <PayGrades />;
      case "employees":
        return <EmployeePayroll />;
      case "tax-configuration":
        return <TaxConfiguration />;
      case "administration":
        return <Administration />;
      case "payslip-settings":
        return <PayslipSettings />;
      case "bonus-configuration":
        return <BonusConfiguration />;
      case "arrears":
        return <Arrears />;
      case "run-payroll":
        return <RunPayroll />;
      case "off-cycle":
        return <OffCyclePayroll />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <PayrollSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default function PayrollPage() {
  return (
    <PayrollProvider>
      <PayrollContent />
    </PayrollProvider>
  );
}
