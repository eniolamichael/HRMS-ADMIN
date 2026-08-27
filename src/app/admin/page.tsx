"use client";

import { HrmsProvider, useHrms } from "@/contexts/hrms-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import Dashboard from "@/components/admin/dashboard";
import AuthAccessControl from "@/components/admin/auth-access-control";
import EmployeeHris from "@/components/admin/employee-hris";
import OrgStructure from "@/components/admin/org-structure";
import ApprovalWorkflowManager from "@/components/admin/approval-workflow";
import LeaveManagement from "@/components/admin/leave-management";
import AttendanceScheduling from "@/components/admin/attendance-scheduling";
import Recruitment from "@/components/admin/recruitment";
import Performance from "@/components/admin/performance";
import PromotionManagement from "@/components/admin/promotion";
import ExitManagement from "@/components/admin/exit-management";
import Learning from "@/components/admin/learning";
import Onboarding from "@/components/admin/onboarding";
import Disciplinary from "@/components/admin/disciplinary";
import AssetManagement from "@/components/admin/asset-management";
import SurveyFeedback from "@/components/admin/survey-feedback";
import ReportsAnalytics from "@/components/admin/reports-analytics";
import NotificationsAudit from "@/components/admin/notifications-audit";

function AdminContent() {
  const { activeTab, setActiveTab } = useHrms();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard setActiveTab={setActiveTab} />;
      case "auth-access":
        return <AuthAccessControl />;
      case "employee-hris":
        return <EmployeeHris />;
      case "org-structure":
        return <OrgStructure />;
      case "approval-workflow":
        return <ApprovalWorkflowManager />;
      case "leave-management":
        return <LeaveManagement />;
      case "attendance-scheduling":
        return <AttendanceScheduling />;
      case "recruitment":
        return <Recruitment />;
      case "performance":
        return <Performance />;
      case "promotion":
        return <PromotionManagement />;
      case "exit-management":
        return <ExitManagement />;
      case "learning":
        return <Learning />;
      case "onboarding":
        return <Onboarding />;
      case "disciplinary":
        return <Disciplinary />;
      case "asset-management":
        return <AssetManagement />;
      case "survey-feedback":
        return <SurveyFeedback />;
      case "reports-analytics":
        return <ReportsAnalytics />;
      case "notifications-audit":
        return <NotificationsAudit />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <HrmsProvider>
      <AdminContent />
    </HrmsProvider>
  );
}
