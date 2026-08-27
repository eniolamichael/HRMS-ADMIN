"use client";

import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { EmployeePayroll } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Search, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  active: { variant: "default", label: "Active" },
  inactive: { variant: "secondary", label: "Inactive" },
  suspended: { variant: "outline", label: "Suspended" },
};

interface FormData {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  payGroupId: string;
  payGradeId: string;
  baseSalary: number;
  bankName: string;
  accountNumber: string;
}

const emptyForm: FormData = {
  employeeId: "",
  employeeName: "",
  employeeCode: "",
  department: "",
  payGroupId: "",
  payGradeId: "",
  baseSalary: 0,
  bankName: "",
  accountNumber: "",
};

export default function EmployeePayrollPage() {
  const { employeePayrolls, payGroups, payGrades, addEmployeePayroll, removeEmployeePayroll, bulkVerifyAccounts } = usePayroll();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bulkVerifyDialogOpen, setBulkVerifyDialogOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const filteredEmployees = employeePayrolls?.filter((emp: any) => {
    const matchesSearch =
      emp.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedUnverified = filteredEmployees.filter((emp) => selectedIds.includes(emp.id) && !emp.accountVerified);

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(filteredEmployees.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  }

  function handleSelectOne(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  }

  function openConfirmRemove(id: string) {
    setPendingRemoveId(id);
    setConfirmDialogOpen(true);
  }

  function confirmRemove() {
    if (pendingRemoveId) {
      removeEmployeePayroll(pendingRemoveId);
    }
    setPendingRemoveId(null);
    setConfirmDialogOpen(false);
  }

  function openBulkVerifyDialog() {
    if (selectedUnverified.length === 0) return;
    setBulkVerifyDialogOpen(true);
  }

  function confirmBulkVerify() {
    bulkVerifyAccounts(selectedUnverified.map((e) => e.id));
    setSelectedIds([]);
    setBulkVerifyDialogOpen(false);
  }

  function handleAddEmployee() {
    addEmployeePayroll({
      ...formData,
      payGroupName: payGroups.find((pg) => pg.id === formData.payGroupId)?.name ?? "",
      payGradeName: payGrades.find((pg) => pg.id === formData.payGradeId)?.name ?? "",
      status: "active",
      accountVerified: false,
      taxReliefs: [],
      benefitsInKind: [],
      inclusionDate: new Date().toISOString().split("T")[0],
    });
    setFormData(emptyForm);
    setAddDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Payroll Inclusion</CardTitle>
              <CardDescription>Manage employee inclusion in payroll processing (FR-205, FR-206)</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedUnverified.length > 0 && (
                <Button variant="outline" onClick={openBulkVerifyDialog}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Bulk Verify ({selectedUnverified.length})
                </Button>
              )}
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Employee to Payroll</DialogTitle>
                    <DialogDescription>Enter employee details to include them in payroll processing.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input id="employeeId" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} placeholder="EMP-001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeCode">Employee Code</Label>
                      <Input id="employeeCode" value={formData.employeeCode} onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })} placeholder="E001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeName">Employee Name</Label>
                      <Input id="employeeName" value={formData.employeeName} onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Engineering" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pay Group</Label>
                      <Select value={formData.payGroupId} onValueChange={(val) => setFormData({ ...formData, payGroupId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pay group" />
                        </SelectTrigger>
                        <SelectContent>
                          {payGroups.map((pg) => (
                            <SelectItem key={pg.id} value={pg.id}>
                              {pg.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Pay Grade</Label>
                      <Select value={formData.payGradeId} onValueChange={(val) => setFormData({ ...formData, payGradeId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pay grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {payGrades.map((pg) => (
                            <SelectItem key={pg.id} value={pg.id}>
                              {pg.name} ({formatCurrency(pg.minSalary)} - {formatCurrency(pg.maxSalary)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseSalary">Base Salary</Label>
                      <Input id="baseSalary" type="number" value={formData.baseSalary || ""} onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input id="bankName" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} placeholder="First Bank" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input id="accountNumber" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} placeholder="1234567890" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEmployee} disabled={!formData.employeeId || !formData.employeeName || !formData.payGroupId || !formData.payGradeId}>
                      Add Employee
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0} onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                  </TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Pay Group</TableHead>
                  <TableHead>Pay Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => {
                    const statusInfo = statusConfig[emp.status] || statusConfig.active;
                    return (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <Checkbox checked={selectedIds.includes(emp.id)} onCheckedChange={(checked) => handleSelectOne(emp.id, !!checked)} />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{emp.employeeId}</TableCell>
                        <TableCell className="font-medium">{emp.employeeName}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>{payGroups.find((pg) => pg.id === emp.payGroupId)?.name ?? "—"}</TableCell>
                        <TableCell>{payGrades.find((pg) => pg.id === emp.payGradeId)?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(emp.baseSalary)}</TableCell>
                        <TableCell>{emp.bankName || "—"}</TableCell>
                        <TableCell>
                          {emp.accountVerified ? (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-red-600">
                              <XCircle className="h-4 w-4" /> Unverified
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {emp.status !== "inactive" && (
                            <Button variant="ghost" size="icon" onClick={() => openConfirmRemove(emp.id)} title="Remove Employee">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
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

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this employee from payroll? Their status will be set to inactive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkVerifyDialogOpen} onOpenChange={setBulkVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Verify Accounts</DialogTitle>
            <DialogDescription>
              You are about to verify {selectedUnverified.length} account(s). This will mark them as verified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkVerify}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verify Accounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
