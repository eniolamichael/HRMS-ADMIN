"use client";

import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { PayrollRun } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Play, Eye, CheckCircle, Send, CreditCard, Search, DollarSign, Users, Clock, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type RunStatus = PayrollRun["status"];

const statusConfig: Record<RunStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  draft: { label: "Draft", variant: "secondary" },
  processing: { label: "Processing", variant: "outline", className: "border-amber-500 text-amber-600 bg-amber-50" },
  preview: { label: "Preview", variant: "outline", className: "border-blue-500 text-blue-600 bg-blue-50" },
  completed: { label: "Completed", variant: "outline", className: "border-green-500 text-green-600 bg-green-50" },
  paid: { label: "Paid", variant: "outline", className: "border-emerald-500 text-emerald-600 bg-emerald-50" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const defaultFormState = {
  name: "",
  payGroupId: "",
  period: "",
  startDate: "",
  endDate: "",
  type: "regular" as PayrollRun["type"],
};

export default function RunPayroll() {
  const { payrollRuns, createPayrollRun, processPayroll, previewPayroll, completePayroll, submitForPayment, payGroups, employees } = usePayroll();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formState, setFormState] = useState(defaultFormState);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payslipDialogRun, setPayslipDialogRun] = useState<PayrollRun | null>(null);
  const [paymentDialogRun, setPaymentDialogRun] = useState<PayrollRun | null>(null);

  const filtered = payrollRuns.filter((run) => {
    const matchesSearch =
      run.name.toLowerCase().includes(search.toLowerCase()) ||
      run.payGroupName.toLowerCase().includes(search.toLowerCase()) ||
      run.period.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRuns = payrollRuns.length;
  const processingCount = payrollRuns.filter((r) => r.status === "processing").length;
  const completedCount = payrollRuns.filter((r) => r.status === "completed").length;
  const paidCount = payrollRuns.filter((r) => r.status === "paid").length;
  const totalGross = payrollRuns.reduce((sum, r) => sum + r.totalGross, 0);
  const totalNet = payrollRuns.reduce((sum, r) => sum + r.totalNet, 0);

  const getEmployeeCountForPayGroup = (payGroupId: string) =>
    employees.filter((e) => e.payGroupId === payGroupId && e.status === "active").length;

  const handleCreateRun = () => {
    if (!formState.name.trim() || !formState.payGroupId || !formState.period || !formState.startDate || !formState.endDate) return;

    const pg = payGroups.find((g) => g.id === formState.payGroupId);
    const empCount = getEmployeeCountForPayGroup(formState.payGroupId);

    createPayrollRun({
      name: formState.name,
      payGroupId: formState.payGroupId,
      payGroupName: pg?.name || "",
      period: formState.period,
      startDate: formState.startDate,
      endDate: formState.endDate,
      status: "draft",
      type: formState.type,
      totalEmployees: empCount,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      totalTax: 0,
      createdBy: "Current User",
    });

    setFormState(defaultFormState);
    setDialogOpen(false);
  };

  const handleProcess = (id: string) => {
    processPayroll(id);
    const run = payrollRuns.find((r) => r.id === id);
    if (run) {
      const empCount = getEmployeeCountForPayGroup(run.payGroupId);
      const grossPerEmployee = 5000;
      const deductionsPerEmployee = 500;
      const taxPerEmployee = 800;
      const netPerEmployee = grossPerEmployee - deductionsPerEmployee - taxPerEmployee;
      const updatePayrollRun = usePayroll().updatePayrollRun;
      updatePayrollRun(id, {
        totalEmployees: empCount,
        totalGross: grossPerEmployee * empCount,
        totalDeductions: deductionsPerEmployee * empCount,
        totalTax: taxPerEmployee * empCount,
        totalNet: netPerEmployee * empCount,
      });
    }
  };

  const handlePreview = (id: string) => {
    previewPayroll(id);
  };

  const handleComplete = (id: string) => {
    completePayroll(id);
  };

  const handleSendPayslips = (run: PayrollRun) => {
    setPayslipDialogRun(run);
  };

  const confirmSendPayslips = () => {
    if (payslipDialogRun) {
      alert(`Payslips for "${payslipDialogRun.name}" have been sent to ${payslipDialogRun.totalEmployees} employees.`);
      setPayslipDialogRun(null);
    }
  };

  const handleSubmitForPayment = (run: PayrollRun) => {
    setPaymentDialogRun(run);
  };

  const confirmSubmitForPayment = () => {
    if (paymentDialogRun) {
      submitForPayment(paymentDialogRun.id);
      setPaymentDialogRun(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{totalRuns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{processingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gross</p>
                <p className="text-2xl font-bold">{formatCurrency(totalGross)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Net</p>
                <p className="text-2xl font-bold">{formatCurrency(totalNet)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
          <CardDescription>Manage and process payroll runs for your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payroll runs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Run New Payroll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Run New Payroll</DialogTitle>
                  <DialogDescription>Create a new payroll run for processing.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="run-name">Name</Label>
                    <Input
                      id="run-name"
                      placeholder="e.g. August 2026 Regular Payroll"
                      value={formState.name}
                      onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Group</Label>
                    <Select
                      value={formState.payGroupId}
                      onValueChange={(v) => setFormState((s) => ({ ...s, payGroupId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pay group" />
                      </SelectTrigger>
                      <SelectContent>
                        {payGroups.filter((pg) => pg.isActive).map((pg) => (
                          <SelectItem key={pg.id} value={pg.id}>
                            {pg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="run-period">Period</Label>
                    <Input
                      id="run-period"
                      placeholder="e.g. August 2026"
                      value={formState.period}
                      onChange={(e) => setFormState((s) => ({ ...s, period: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="run-start">Start Date</Label>
                      <Input
                        id="run-start"
                        type="date"
                        value={formState.startDate}
                        onChange={(e) => setFormState((s) => ({ ...s, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="run-end">End Date</Label>
                      <Input
                        id="run-end"
                        type="date"
                        value={formState.endDate}
                        onChange={(e) => setFormState((s) => ({ ...s, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formState.type}
                      onValueChange={(v) => setFormState((s) => ({ ...s, type: v as PayrollRun["type"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="off-cycle">Off-Cycle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRun}
                    disabled={!formState.name.trim() || !formState.payGroupId || !formState.period || !formState.startDate || !formState.endDate}
                  >
                    Create Payroll Run
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Pay Group</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      No payroll runs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((run) => {
                    const sc = statusConfig[run.status];
                    return (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.name}</TableCell>
                        <TableCell>{run.payGroupName}</TableCell>
                        <TableCell>{run.period}</TableCell>
                        <TableCell className="capitalize">{run.type.replace("-", " ")}</TableCell>
                        <TableCell className="text-center">{run.totalEmployees}</TableCell>
                        <TableCell className="text-right">{formatCurrency(run.totalGross)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(run.totalDeductions)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(run.totalTax)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(run.totalNet)}</TableCell>
                        <TableCell>
                          <Badge variant={sc.variant} className={sc.className}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {run.status === "draft" && (
                              <Button variant="ghost" size="sm" onClick={() => handleProcess(run.id)}>
                                <Play className="mr-1 h-3 w-3" />
                                Process
                              </Button>
                            )}
                            {run.status === "processing" && (
                              <Button variant="ghost" size="sm" onClick={() => handlePreview(run.id)}>
                                <Eye className="mr-1 h-3 w-3" />
                                Preview
                              </Button>
                            )}
                            {run.status === "preview" && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleComplete(run.id)}>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Complete
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleSendPayslips(run)}>
                                  <Send className="mr-1 h-3 w-3" />
                                  Send Payslips
                                </Button>
                              </>
                            )}
                            {run.status === "completed" && (
                              <Button variant="ghost" size="sm" onClick={() => handleSubmitForPayment(run)}>
                                <CreditCard className="mr-1 h-3 w-3" />
                                Submit for Payment
                              </Button>
                            )}
                            {run.status === "paid" && (
                              <span className="text-xs text-muted-foreground">
                                Paid on {run.paidAt ? formatDate(run.paidAt) : "N/A"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!payslipDialogRun} onOpenChange={(open) => !open && setPayslipDialogRun(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payslips</DialogTitle>
            <DialogDescription>
              Are you sure you want to send payslips for &quot;{payslipDialogRun?.name}&quot; to {payslipDialogRun?.totalEmployees} employees?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-4 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Payroll Run:</span>
              <span className="font-medium">{payslipDialogRun?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Period:</span>
              <span className="font-medium">{payslipDialogRun?.period}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Employees:</span>
              <span className="font-medium">{payslipDialogRun?.totalEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Net Pay:</span>
              <span className="font-medium">{formatCurrency(payslipDialogRun?.totalNet || 0)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayslipDialogRun(null)}>
              Cancel
            </Button>
            <Button onClick={confirmSendPayslips}>
              <Send className="mr-2 h-4 w-4" />
              Send Payslips
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentDialogRun} onOpenChange={(open) => !open && setPaymentDialogRun(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Payment</DialogTitle>
            <DialogDescription>
              Confirm submission of &quot;{paymentDialogRun?.name}&quot; for payment processing.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-4 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Payroll Run:</span>
              <span className="font-medium">{paymentDialogRun?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Period:</span>
              <span className="font-medium">{paymentDialogRun?.period}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Employees:</span>
              <span className="font-medium">{paymentDialogRun?.totalEmployees}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Total Gross:</span>
              <span className="font-medium">{formatCurrency(paymentDialogRun?.totalGross || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-semibold">Total Net Pay:</span>
              <span className="font-bold text-lg">{formatCurrency(paymentDialogRun?.totalNet || 0)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogRun(null)}>
              Cancel
            </Button>
            <Button onClick={confirmSubmitForPayment}>
              <CreditCard className="mr-2 h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}