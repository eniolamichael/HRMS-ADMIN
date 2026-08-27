"use client";
import { useHrms } from "@/contexts/hrms-context";
import { AdminModuleTab } from "@/types/hrms";
import Link from "next/link";
import {
  LayoutDashboard,
  Shield,
  Users,
  Building2,
  GitBranch,
  Calendar,
  Clock,
  Briefcase,
  Target,
  TrendingUp,
  GraduationCap,
  DollarSign,
  UserMinus,
  UserPlus,
  AlertTriangle,
  Package,
  ClipboardList,
  BarChart3,
  Bell,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  id: AdminModuleTab;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Core",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "auth-access", label: "Authentication & Access Control", icon: Shield },
    ],
  },
  {
    label: "People Management",
    items: [
      { id: "employee-hris", label: "Employee / HRIS", icon: Users },
      { id: "org-structure", label: "Organization Structure", icon: Building2 },
      { id: "approval-workflow", label: "Approval Workflows", icon: GitBranch },
    ],
  },
  {
    label: "Workforce",
    items: [
      { id: "leave-management", label: "Leave Management", icon: Calendar },
      { id: "attendance-scheduling", label: "Attendance & Scheduling", icon: Clock },
    ],
  },
  {
    label: "Talent",
    items: [
      { id: "recruitment", label: "Recruitment", icon: Briefcase },
      { id: "performance", label: "Performance Management", icon: Target },
      { id: "promotion", label: "Promotion Management", icon: TrendingUp },
      { id: "learning", label: "Learning Management", icon: GraduationCap },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "payroll", label: "Payroll", icon: DollarSign },
      { id: "exit-management", label: "Exit Management", icon: UserMinus },
      { id: "onboarding", label: "Onboarding", icon: UserPlus },
      { id: "disciplinary", label: "Disciplinary", icon: AlertTriangle },
      { id: "asset-management", label: "Asset Management", icon: Package },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "survey-feedback", label: "Survey & Feedback", icon: ClipboardList },
      { id: "reports-analytics", label: "Reports & Analytics", icon: BarChart3 },
      { id: "notifications-audit", label: "Notifications & Audit", icon: Bell },
    ],
  },
];

export function AdminSidebar() {
  const { activeTab, setActiveTab } = useHrms();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="px-5 py-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-400" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              FASYL HRMS
            </h1>
            <p className="text-xs text-gray-400 mt-1">Administrator Portal</p>
          </div>
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

                if (item.id === "payroll") {
                  return (
                    <li key={item.id}>
                      <Link
                        href="/payroll"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mx-2"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                }

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
          href="/payroll"
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <DollarSign className="h-4 w-4" />
          Payroll Module
        </Link>
        <p className="text-xs text-gray-500 mt-3">v2.0.0</p>
      </div>
    </aside>
  );
}
