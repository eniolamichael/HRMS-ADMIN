"use client";
import { useHod } from "@/contexts/hod-context";
import { HodModuleTab } from "@/types/hrms";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Inbox,
  Calendar,
  Clock,
  Briefcase,
  Target,
  TrendingUp,
  UserMinus,
  AlertTriangle,
  BarChart3,
  Shield,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  id: HodModuleTab;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { id: "hod-dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "My Team",
    items: [
      { id: "hod-my-team", label: "Team Members", icon: Users },
      { id: "hod-approvals", label: "Approvals", icon: Inbox },
      { id: "hod-leave-approvals", label: "Leave Approvals", icon: Calendar },
    ],
  },
  {
    label: "Workforce",
    items: [
      { id: "hod-scheduling", label: "Scheduling", icon: Clock },
      { id: "hod-job-requisitions", label: "Job Requisitions", icon: Briefcase },
    ],
  },
  {
    label: "Talent",
    items: [
      { id: "hod-appraisals", label: "Appraisals", icon: Target },
      { id: "hod-promotions", label: "Promotions", icon: TrendingUp },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "hod-exit-requests", label: "Exit Requests", icon: UserMinus },
      { id: "hod-disciplinary", label: "Disciplinary", icon: AlertTriangle },
      { id: "hod-reports", label: "Reports", icon: BarChart3 },
    ],
  },
];

export function HodSidebar() {
  const { activeTab, setActiveTab, hodName, departmentName, approvalTasks } = useHod();
  const pendingCount = approvalTasks.length;

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="px-5 py-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-emerald-400" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              FASYL HRMS
            </h1>
            <p className="text-xs text-gray-400 mt-1">Head of Department Portal</p>
          </div>
        </div>
        <div className="mt-4 bg-gray-800/60 rounded-lg p-3">
          <p className="text-sm font-medium text-white">{hodName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{departmentName}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <h2 className="text-xs text-gray-400 font-semibold uppercase px-4 py-2">
              {group.label}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors mx-2 ${
                        isActive
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.id === "hod-approvals" && pendingCount > 0 && (
                        <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {pendingCount}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-700/50">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Home
        </Link>
        <p className="text-xs text-gray-500 mt-3">v2.0.0</p>
      </div>
    </aside>
  );
}