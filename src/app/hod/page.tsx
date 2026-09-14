"use client";

import { HrmsProvider } from "@/contexts/hrms-context";
import { HodProvider, useHod } from "@/contexts/hod-context";
import { HodSidebar } from "@/components/hod/hod-sidebar";
import HodDashboard from "@/components/hod/hod-dashboard";
import HodMyTeam from "@/components/hod/hod-my-team";
import HodApprovals from "@/components/hod/hod-approvals";
import HodLeaveApprovals from "@/components/hod/hod-leave-approvals";
import HodScheduling from "@/components/hod/hod-scheduling";
import HodJobRequisitions from "@/components/hod/hod-job-requisitions";
import HodAppraisals from "@/components/hod/hod-appraisals";
import HodPromotions from "@/components/hod/hod-promotions";
import HodExitRequests from "@/components/hod/hod-exit-requests";
import HodDisciplinary from "@/components/hod/hod-disciplinary";
import HodReports from "@/components/hod/hod-reports";

function HodContent() {
  const { activeTab } = useHod();

  const renderContent = () => {
    switch (activeTab) {
      case "hod-dashboard":
        return <HodDashboard />;
      case "hod-my-team":
        return <HodMyTeam />;
      case "hod-approvals":
        return <HodApprovals />;
      case "hod-leave-approvals":
        return <HodLeaveApprovals />;
      case "hod-scheduling":
        return <HodScheduling />;
      case "hod-job-requisitions":
        return <HodJobRequisitions />;
      case "hod-appraisals":
        return <HodAppraisals />;
      case "hod-promotions":
        return <HodPromotions />;
      case "hod-exit-requests":
        return <HodExitRequests />;
      case "hod-disciplinary":
        return <HodDisciplinary />;
      case "hod-reports":
        return <HodReports />;
      default:
        return <HodDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <HodSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

export default function HodPage() {
  return (
    <HrmsProvider>
      <HodProvider>
        <HodContent />
      </HodProvider>
    </HrmsProvider>
  );
}