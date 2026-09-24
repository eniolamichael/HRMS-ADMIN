"use client";

import { HrmsProvider } from "@/contexts/hrms-context";
import { SupervisorProvider, useSupervisor } from "@/contexts/supervisor-context";
import { SupervisorSidebar } from "@/components/supervisor/supervisor-sidebar";
import SupervisorDashboard from "@/components/supervisor/supervisor-dashboard";
import SupervisorDirectReports from "@/components/supervisor/supervisor-direct-reports";
import SupervisorApprovals from "@/components/supervisor/supervisor-approvals";
import SupervisorLeaveApprovals from "@/components/supervisor/supervisor-leave-approvals";
import SupervisorJobRequisitions from "@/components/supervisor/supervisor-job-requisitions";
import SupervisorAppraisals from "@/components/supervisor/supervisor-appraisals";
import SupervisorPromotions from "@/components/supervisor/supervisor-promotions";
import SupervisorExitRequests from "@/components/supervisor/supervisor-exit-requests";
import SupervisorDisciplinary from "@/components/supervisor/supervisor-disciplinary";
import SupervisorReports from "@/components/supervisor/supervisor-reports";

function SupervisorContent() {
  const { activeTab } = useSupervisor();

  const renderContent = () => {
    switch (activeTab) {
      case "sup-dashboard":
        return <SupervisorDashboard />;
      case "sup-direct-reports":
        return <SupervisorDirectReports />;
      case "sup-approvals":
        return <SupervisorApprovals />;
      case "sup-leave-approvals":
        return <SupervisorLeaveApprovals />;
      case "sup-job-requisitions":
        return <SupervisorJobRequisitions />;
      case "sup-appraisals":
        return <SupervisorAppraisals />;
      case "sup-promotions":
        return <SupervisorPromotions />;
      case "sup-exit-requests":
        return <SupervisorExitRequests />;
      case "sup-disciplinary":
        return <SupervisorDisciplinary />;
      case "sup-reports":
        return <SupervisorReports />;
      default:
        return <SupervisorDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SupervisorSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

export default function SupervisorPage() {
  return (
    <HrmsProvider>
      <SupervisorProvider>
        <SupervisorContent />
      </SupervisorProvider>
    </HrmsProvider>
  );
}