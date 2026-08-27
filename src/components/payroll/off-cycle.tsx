"use client";

import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { OffCycleUpdate } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, CheckCircle, XCircle, Search, RefreshCw } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

const defaultFormState = {
  employeeId: "",
  payrollRunId: "",
  type: "bonus" as OffCycleUpdate["type"],
  amount: "",
  description: "",
};

export default function OffCycle() {
  const {
    offCycleUpdates,
    addOffCycleUpdate,
    bulkUploadOffCycleUpdates,
    updateOffCycleUpdate,
    employees,
    payrollRuns,
  } = usePayroll();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [formState, setFormState] = useState(defaultFormState);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCsv, setBulkCsv] = useState("");

  const activeEmployees = employees.filter((e) => e.status === "active");
  const eligiblePayrollRuns = payrollRuns.filter(
    (pr) => pr.status === "draft" || pr.type === "off-cycle"
  );

  const filtered = offCycleUpdates.filter((oc) => {
    const matchesSearch =
      oc.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      oc.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || oc.status === statusFilter;
    const matchesType = typeFilter === "all" || oc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalUpdates = offCycleUpdates.length;
  const pendingCount = offCycleUpdates.filter((oc) => oc.status === "pending").length;
  const approvedCount = offCycleUpdates.filter((oc) => oc.status === "approved").length;
  const rejectedCount = offCycleUpdates.filter((oc) => oc.status === "rejected").length;

  const handleSave = () => {
    if (!formState.employeeId || !formState.payrollRunId || !formState.amount) return;

    const employee = activeEmployees.find((e) => e.id === formState.employeeId);
    if (!employee) return;

    addOffCycleUpdate({
      employeeId: formState.employeeId,
      employeeName: employee.employeeName,
      payrollRunId: formState.payrollRunId,
      type: formState.type,
      amount: parseFloat(formState.amount),
      description: formState.description,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    });

    setFormState(defaultFormState);
    setDialogOpen(false);
  };

  const handleApprove = (id: string) => {
    updateOffCycleUpdate(id, { status: "approved" });
  };

  const handleReject = (id: string) => {
    updateOffCycleUpdate(id, { status: "rejected" });
  };

  const handleBulkUpload = () => {
    const lines = bulkCsv.trim().split("\n");
    if (lines.length < 2) return;

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const empIdIdx = header.indexOf("employeeid") !== -1 ? header.indexOf("employeeid") : header.indexOf("employee_id");
    const runIdIdx = header.indexOf("payrollrunid") !== -1 ? header.indexOf("payrollrunid") : header.indexOf("payroll_run_id");
    const typeIdx = header.indexOf("type");
    const amountIdx = header.indexOf("amount");
    const descIdx = header.indexOf("description");

    const updates: Omit<OffCycleUpdate, "id">[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 1) continue;

      const empId = cols[empIdIdx] || "";
      const runId = cols[runIdIdx] || "";
      const type = cols[typeIdx] || "bonus";
      const amount = parseFloat(cols[amountIdx]) || 0;
      const description = cols[descIdx] || "";

      if (!empId || !runId || amount <= 0) continue;

      const employee = activeEmployees.find((e) => e.id === empId);
      if (!employee) continue;

      updates.push({
        employeeId: empId,
        employeeName: employee.employeeName,
        payrollRunId: runId,
        type: (["bonus", "deduction", "adjustment", "correction"].includes(type)
          ? type
          : "bonus") as OffCycleUpdate["type"],
        amount,
        description,
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
      });
    }

    if (updates.length > 0) {
      bulkUploadOffCycleUpdates(updates);
      setBulkCsv("");
      setBulkDialogOpen(false);
    }
  };

  const getPayrollRunName = (runId: string) => {
    const run = payrollRuns.find((pr) => pr.id === runId);
    return run ? run.name : runId;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUpdates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <RefreshCw className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Off-Cycle Payroll Updates</CardTitle>
          <CardDescription>
            Manage off-cycle payroll adjustments including bonuses, deductions, and corrections (FR-222 to FR-224).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search updates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Off-Cycle Updates</DialogTitle>
                    <DialogDescription>
                      Paste CSV data below. Expected columns: employeeId, payrollRunId, type, amount, description
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted p-3 text-xs font-mono">
                      <p className="text-muted-foreground mb-1">Example format:</p>
                      <p>employeeId,payrollRunId,type,amount,description</p>
                      <p>EMP001,RUN001,bonus,500,Performance bonus</p>
                      <p>EMP002,RUN001,deduction,100,Loan repayment</p>
                    </div>
                    <Textarea
                      placeholder="employeeId,payrollRunId,type,amount,description"
                      className="min-h-[200px] font-mono"
                      value={bulkCsv}
                      onChange={(e) => setBulkCsv(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkUpload} disabled={!bulkCsv.trim()}>
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormState(defaultFormState)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Off-Cycle Update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Off-Cycle Update</DialogTitle>
                    <DialogDescription>
                      Create a new off-cycle payroll update for an employee.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Employee</Label>
                      <Select
                        value={formState.employeeId}
                        onValueChange={(v) => setFormState((s) => ({ ...s, employeeId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeEmployees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.employeeName} ({emp.employeeCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payroll Run</Label>
                      <Select
                        value={formState.payrollRunId}
                        onValueChange={(v) => setFormState((s) => ({ ...s, payrollRunId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payroll run" />
                        </SelectTrigger>
                        <SelectContent>
                          {eligiblePayrollRuns.map((run) => (
                            <SelectItem key={run.id} value={run.id}>
                              {run.name} ({run.period})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={formState.type}
                        onValueChange={(v) =>
                          setFormState((s) => ({ ...s, type: v as OffCycleUpdate["type"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bonus">Bonus</SelectItem>
                          <SelectItem value="deduction">Deduction</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                          <SelectItem value="correction">Correction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oc-amount">Amount</Label>
                      <Input
                        id="oc-amount"
                        type="number"
                        placeholder="0.00"
                        value={formState.amount}
                        onChange={(e) => setFormState((s) => ({ ...s, amount: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oc-desc">Description</Label>
                      <Textarea
                        id="oc-desc"
                        placeholder="Enter description for this update"
                        value={formState.description}
                        onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!formState.employeeId || !formState.payrollRunId || !formState.amount}
                    >
                      Create Update
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payroll Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No off-cycle updates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((oc) => (
                    <TableRow key={oc.id}>
                      <TableCell className="font-medium">{oc.employeeName}</TableCell>
                      <TableCell className="capitalize">{oc.type}</TableCell>
                      <TableCell>{formatCurrency(oc.amount)}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {oc.description}
                      </TableCell>
                      <TableCell>{getPayrollRunName(oc.payrollRunId)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[oc.status]}>
                          {oc.status.charAt(0).toUpperCase() + oc.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(oc.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {oc.status === "pending" && (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(oc.id)}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(oc.id)}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}