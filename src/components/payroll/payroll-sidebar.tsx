"use client";
import { usePayroll } from "@/contexts/payroll-context";
import { PayrollModuleTab } from "@/types/payroll";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Award,
  UserCheck,
  Calculator,
  Settings,
  FileText,
  Gift,
  ArrowUpRight,
  PlayCircle,
  RefreshCw,
  BarChart3,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  id: PayrollModuleTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pay-groups", label: "Pay Groups", icon: Users },
  { id: "pay-grades", label: "Pay Grades", icon: Award },
  { id: "employees", label: "Employees", icon: UserCheck },
  { id: "tax-configuration", label: "Tax Configuration", icon: Calculator },
  { id: "administration", label: "Administration", icon: Settings },
  { id: "payslip-settings", label: "Payslip Settings", icon: FileText },
  { id: "bonus-configuration", label: "Bonus Configuration", icon: Gift },
  { id: "arrears", label: "Arrears", icon: ArrowUpRight },
  { id: "run-payroll", label: "Run Payroll", icon: PlayCircle },
  { id: "off-cycle", label: "Off-Cycle Payroll", icon: RefreshCw },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

export function PayrollSidebar() {
  const { activeTab, setActiveTab } = usePayroll();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="px-5 py-6 border-b border-gray-700/50">
        <h1 className="text-lg font-semibold tracking-tight">
          Payroll Management
        </h1>
        <p className="text-xs text-gray-400 mt-1">System Configuration</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isActive
                          ? "bg-gray-600 text-gray-200"
                          : "bg-gray-800 text-gray-400"
                      )}
                    >
                      {item.badge}
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
      </nav>

      <div className="px-5 py-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500">v1.0.0</p>
      </div>
    </aside>
  );
}
