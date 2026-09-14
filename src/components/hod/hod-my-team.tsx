"use client";

import { useState } from "react";
import { useHod } from "@/contexts/hod-context";
import { useHrms } from "@/contexts/hrms-context";
import { Search, Mail, Phone, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HodMyTeam() {
  const { teamMembers, directReports, hodId } = useHod();
  const hrms = useHrms();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = teamMembers.filter((e) =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = teamMembers.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            Employees within your authorized reporting structure
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const isDirect = emp.id === hodId || directReports.some((d) => d.id === emp.id);
          return (
            <button
              key={emp.id}
              onClick={() => setSelectedId(emp.id)}
              className="text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{emp.jobRoleName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {isDirect && (
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    Direct Report
                  </Badge>
                )}
                <Badge
                  className="capitalize"
                  variant={
                    emp.status === "active"
                      ? "default"
                      : emp.status === "on_leave"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {emp.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {emp.employeeId} · {emp.employmentType.replace("_", " ")}
              </p>
            </button>
          );
        })}
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <span>
                  {selected.firstName} {selected.lastName}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Profile</CardTitle>
                  <CardDescription>Basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-3.5 w-3.5" /> {selected.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-3.5 w-3.5" /> {selected.phone}
                  </div>
                  <p className="text-gray-600">Employee ID: {selected.employeeId}</p>
                  <p className="text-gray-600">Joined: {selected.dateOfJoining}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Position</CardTitle>
                  <CardDescription>Reporting details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm text-gray-600">
                  <p>Department: {selected.departmentName}</p>
                  <p>Job Role: {selected.jobRoleName}</p>
                  <p>Pay Grade: {selected.payGradeName ?? "—"}</p>
                  <p>Supervisor: {selected.supervisorName ?? "—"}</p>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}