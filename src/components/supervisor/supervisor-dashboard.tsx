"use client";

import { useSupervisor } from "@/contexts/supervisor-context";
import { useMemo } from "react";
import {
  Users,
  Inbox,
  CalendarClock,
  ClipboardCheck,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

export default function SupervisorDashboard() {
  const {
    supervisorName,
    departmentName,
    roleName,
    directReports,
    approvalTasks,
    teamLeaveRequests,
    teamAppraisals,
    teamExitRequests,
    teamDisciplinaryCases,
    myRequisitions,
    workflowStatus,
  } = useSupervisor();

  const pendingLeaves = teamLeaveRequests.filter((r) => r.status === "pending").length;
  const onLeave = directReports.filter((e) => e.status === "on_leave").length;
  const pendingAppraisals = teamAppraisals.filter(
    (a) => a.status === "in_progress" || a.status === "submitted",
  ).length;
  const openCases = teamDisciplinaryCases.filter(
    (c) => c.status !== "resolved" && c.status !== "closed",
  ).length;

  const recentLeaveActivity = useMemo(
    () =>
      teamLeaveRequests
        .slice()
        .sort((a, b) => (b.appliedDate > a.appliedDate ? 1 : -1))
        .slice(0, 5),
    [teamLeaveRequests],
  );

  const stats = [
    { label: "Direct Reports", value: directReports.length, icon: Users, color: "text-amber-600 bg-amber-100" },
    { label: "Pending Approvals", value: approvalTasks.length, icon: Inbox, color: "text-blue-600 bg-blue-100" },
    { label: "Pending Leave", value: pendingLeaves, icon: CalendarClock, color: "text-emerald-600 bg-emerald-100" },
    { label: "On Leave", value: onLeave, icon: ClipboardCheck, color: "text-purple-600 bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {supervisorName.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {roleName} · {departmentName} — overview of your direct reports and pending actions
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Approval Queue</h2>
              <p className="text-xs text-gray-500">Requests routed to you</p>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {approvalTasks.length} pending
            </span>
          </div>
          {approvalTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              You're all caught up — no pending approvals.
            </div>
          ) : (
            <ul className="divide-y">
              {approvalTasks.slice(0, 5).map((task) => (
                <li key={task.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {task.employeeName} · {task.module}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      task.action === "approve_decline"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {task.action === "approve_decline" ? "Decision needed" : "Review"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Workflow status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Workflow Status</h2>
            <p className="text-xs text-gray-500">Submit and approval volumes</p>
          </div>
          <div className="p-5 space-y-4">
            {workflowStatus.length === 0 && (
              <p className="text-sm text-gray-500">No active workflows yet.</p>
            )}
            {workflowStatus.map((row) => {
              const total = row.pending + row.approved + row.declined;
              const pct = total ? Math.round((row.approved / total) * 100) : 0;
              return (
                <div key={row.module}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-800">{row.module}</span>
                    <span className="text-gray-500">
                      {row.approved}/{total} approved
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {row.pending} pending · {row.declined} declined
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent leave activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Recent Leave Activity</h2>
            <p className="text-xs text-gray-500">Direct report leave requests</p>
          </div>
          <ul className="divide-y">
            {recentLeaveActivity.map((r) => (
              <li key={r.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {r.employeeName} · {r.leaveTypeName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.startDate} → {r.endDate} ({r.days} days)
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    r.status === "approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : r.status === "rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {r.status}
                </span>
              </li>
            ))}
            {recentLeaveActivity.length === 0 && (
              <li className="p-8 text-center text-sm text-gray-500">No leave activity.</li>
            )}
          </ul>
        </div>

        {/* Team insights */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Team Insights</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {myRequisitions.length} requisition(s)
                  </p>
                  <p className="text-xs text-gray-500">raised by you for vacant roles</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <CalendarClock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {pendingAppraisals} appraisal(s) to review
                  </p>
                  <p className="text-xs text-gray-500">assigned to you as reviewer</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {openCases} open disciplinary case(s)
                  </p>
                  <p className="text-xs text-gray-500">involving your reports</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {teamExitRequests.length} exit request(s)
                  </p>
                  <p className="text-xs text-gray-500">from your direct reports</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-sm">
            <h2 className="font-semibold mb-1">Direct Reports</h2>
            <p className="text-3xl font-bold">{directReports.length}</p>
            <p className="text-sm text-amber-100 mt-1">
              Employees reporting directly to you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}