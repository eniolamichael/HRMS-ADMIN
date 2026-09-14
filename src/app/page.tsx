"use client";

import Link from "next/link";
import { Shield, DollarSign, Users, Building2, UserCog } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">FASYL HRMS</h1>
          </div>
          <p className="text-gray-400 text-lg">Enterprise Human Resource Management System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all cursor-pointer group h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                  <Building2 className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Administrator Portal</h2>
                  <p className="text-gray-400 text-sm">Full HRMS Administration</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-6">
                Manage employees, departments, leave, payroll, recruitment, performance,
                and all HR operations from a centralized admin dashboard.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Employee Management", "Leave", "Payroll", "Recruitment", "Performance", "Reports"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          <Link href="/hod">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all cursor-pointer group h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                  <UserCog className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Head of Department</h2>
                  <p className="text-gray-400 text-sm">Line Manager Portal</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-6">
                Manage your team, approve leave and exit requests, raise job requisitions,
                appraise subordinates, and escalate disciplinary cases.
              </p>
              <div className="flex flex-wrap gap-2">
                {["My Team", "Approvals", "Leave", "Appraisals", "Requisitions", "Reports"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          <Link href="/payroll">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all cursor-pointer group h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Payroll Module</h2>
                  <p className="text-gray-400 text-sm">Payroll Management System</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-6">
                Run payroll, manage pay groups and pay grades, configure taxes,
                process off-cycle updates, and generate payroll reports.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Pay Groups", "Pay Grades", "Tax Config", "Run Payroll", "Reports", "Off-Cycle"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">FASYL Technology Group - Enterprise HRMS v2.0.0</p>
        </div>
      </div>
    </div>
  );
}