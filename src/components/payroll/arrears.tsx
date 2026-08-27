"use client";
import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { ArrearRecord, ProratableDeduction } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Play, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const ARREAR_TYPES = ["promotion", "correction", "backpay"] as const;
const DEDUCTION_TYPES = ["loan", "advance", "garnishment", "other"] as const;
const DEDUCTION_METHODS = ["monthly", "quarterly", "annual"] as const;

type ArrearFormData = {
  employeeId: string;
  type: ArrearRecord["type"];
  amount: number;
  effectiveDate: string;
  description: string;
};

const EMPTY_ARREAR_FORM: ArrearFormData = {
  employeeId: "",
  type: "promotion",
  amount: 0,
  effectiveDate: "",
  description: "",
};

type DeductionFormData = {
  name: string;
  type: ProratableDeduction["type"];
  calculationMethod: ProratableDeduction["calculationMethod"];
  isActive: boolean;
};

const EMPTY_DEDUCTION_FORM: DeductionFormData = {
  name: "",
  type: "loan",
  calculationMethod: "monthly",
  isActive: true,
};

const ARREAR_TYPE_LABELS: Record<ArrearRecord["type"], string> = {
  promotion: "Promotion",
  correction: "Correction",
  backpay: "Backpay",
};

const STATUS_VARIANT: Record<ArrearRecord["status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  processed: "default",
  cancelled: "destructive",
};

const STATUS_LABELS: Record<ArrearRecord["status"], string> = {
  pending: "Pending",
  processed: "Processed",
  cancelled: "Cancelled",
};

const DEDUCTION_TYPE_LABELS: Record<ProratableDeduction["type"], string> = {
  loan: "Loan",
  advance: "Advance",
  garnishment: "Garnishment",
  other: "Other",
};

const DEDUCTION_METHOD_LABELS: Record<ProratableDeduction["calculationMethod"], string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

export default function ArrearsPage() {
  const {
    arrearRecords,
    addArrearRecord,
    updateArrearRecord,
    processArrear,
    proratableDeductions,
    addProratableDeduction,
    updateProratableDeduction,
    deleteProratableDeduction,
    employees,
    payGroups,
  } = usePayroll();

  // Arrear state
  const [addArrearDialogOpen, setAddArrearDialogOpen] = useState(false);
  const [arrearFormData, setArrearFormData] = useState<ArrearFormData>(EMPTY_ARREAR_FORM);

  // Deduction state
  const [addDeductionDialogOpen, setAddDeductionDialogOpen] = useState(false);
  const [editDeductionDialogOpen, setEditDeductionDialogOpen] = useState(false);
  const [deleteDeductionDialogOpen, setDeleteDeductionDialogOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<ProratableDeduction | null>(null);
  const [deductionFormData, setDeductionFormData] = useState<DeductionFormData>(EMPTY_DEDUCTION_FORM);

  const getEmployeeName = (id: string) =>
    employees.find((e) => e.id === id)?.employeeName ?? "—";

  const getPayGroupName = (pgId: string) =>
    payGroups.find((pg) => pg.id === pgId)?.name ?? "—";

  // Arrear handlers
  const handleAddArrear = () => {
    const employee = employees.find((e) => e.id === arrearFormData.employeeId);
    addArrearRecord({
      ...arrearFormData,
      employeeName: employee?.employeeName ?? "",
      status: "pending",
    });
    setAddArrearDialogOpen(false);
    setArrearFormData(EMPTY_ARREAR_FORM);
  };

  const handleProcessArrear = (id: string) => {
    processArrear(id);
  };

  // Deduction handlers
  const openEditDeductionDialog = (deduction: ProratableDeduction) => {
    setSelectedDeduction(deduction);
    setDeductionFormData({
      name: deduction.name,
      type: deduction.type,
      calculationMethod: deduction.calculationMethod,
      isActive: deduction.isActive,
    });
    setEditDeductionDialogOpen(true);
  };

  const handleAddDeduction = () => {
    addProratableDeduction(deductionFormData);
    setAddDeductionDialogOpen(false);
    setDeductionFormData(EMPTY_DEDUCTION_FORM);
  };

  const handleEditDeduction = () => {
    if (!selectedDeduction) return;
    updateProratableDeduction(selectedDeduction.id, deductionFormData);
    setEditDeductionDialogOpen(false);
    setSelectedDeduction(null);
  };

  const handleDeleteDeduction = (deduction: ProratableDeduction) => {
    setSelectedDeduction(deduction);
    setDeleteDeductionDialogOpen(true);
  };

  const confirmDeleteDeduction = () => {
    if (selectedDeduction) deleteProratableDeduction(selectedDeduction.id);
    setDeleteDeductionDialogOpen(false);
    setSelectedDeduction(null);
  };

  const ArrearFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Employee</Label>
        <Select
          value={arrearFormData.employeeId}
          onValueChange={(v) => setArrearFormData((f) => ({ ...f, employeeId: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.employeeName} ({emp.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={arrearFormData.type}
            onValueChange={(v) => setArrearFormData((f) => ({ ...f, type: v as ArrearFormData["type"] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARREAR_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {ARREAR_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ar-amount">Amount</Label>
          <Input
            id="ar-amount"
            type="number"
            value={arrearFormData.amount || ""}
            onChange={(e) =>
              setArrearFormData((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ar-effective-date">Effective Date</Label>
        <Input
          id="ar-effective-date"
          type="date"
          value={arrearFormData.effectiveDate}
          onChange={(e) => setArrearFormData((f) => ({ ...f, effectiveDate: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ar-description">Description</Label>
        <Input
          id="ar-description"
          value={arrearFormData.description}
          onChange={(e) => setArrearFormData((f) => ({ ...f, description: e.target.value }))}
          placeholder="e.g. Promotion arrears for Apr-Jun"
        />
      </div>
    </div>
  );

  const DeductionFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="pd-name">Name</Label>
        <Input
          id="pd-name"
          value={deductionFormData.name}
          onChange={(e) => setDeductionFormData((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Salary Advance Repayment"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={deductionFormData.type}
            onValueChange={(v) => setDeductionFormData((f) => ({ ...f, type: v as DeductionFormData["type"] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEDUCTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {DEDUCTION_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Calculation Method</Label>
          <Select
            value={deductionFormData.calculationMethod}
            onValueChange={(v) =>
              setDeductionFormData((f) => ({ ...f, calculationMethod: v as DeductionFormData["calculationMethod"] }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEDUCTION_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {DEDUCTION_METHOD_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="pd-active">Active</Label>
        <Switch
          id="pd-active"
          checked={deductionFormData.isActive}
          onCheckedChange={(c) => setDeductionFormData((f) => ({ ...f, isActive: c }))}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="arrears">
        <TabsList>
          <TabsTrigger value="arrears">Arrear Records</TabsTrigger>
          <TabsTrigger value="deductions">Proratable Deductions</TabsTrigger>
        </TabsList>

        {/* Tab 1: Arrear Records */}
        <TabsContent value="arrears" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Arrear Records</CardTitle>
                <CardDescription>
                  Manage promotion arrears, salary corrections, and backpay records (FR-218).
                </CardDescription>
              </div>
              <Dialog open={addArrearDialogOpen} onOpenChange={setAddArrearDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setArrearFormData(EMPTY_ARREAR_FORM); setAddArrearDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Arrear
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Arrear Record</DialogTitle>
                    <DialogDescription>
                      Create a new arrear record for an employee.
                    </DialogDescription>
                  </DialogHeader>
                  <ArrearFormFields />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddArrearDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddArrear} disabled={!arrearFormData.employeeId || !arrearFormData.effectiveDate}>
                      Add Record
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Processed Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arrearRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ARREAR_TYPE_LABELS[record.type]}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(record.amount)}</TableCell>
                      <TableCell>{formatDate(record.effectiveDate)}</TableCell>
                      <TableCell>{record.processedDate ? formatDate(record.processedDate) : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[record.status]}>
                          {STATUS_LABELS[record.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-sm">
                        {record.description}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Process"
                            onClick={() => handleProcessArrear(record.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {record.status === "processed" && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {arrearRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No arrear records found. Add one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Proratable Deductions */}
        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Proratable Deductions</CardTitle>
                <CardDescription>
                  Manage proratable deductions such as loans, advances, and garnishments (FR-219).
                </CardDescription>
              </div>
              <Dialog open={addDeductionDialogOpen} onOpenChange={setAddDeductionDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setDeductionFormData(EMPTY_DEDUCTION_FORM); setAddDeductionDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Deduction
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Proratable Deduction</DialogTitle>
                    <DialogDescription>
                      Define a new proratable deduction type.
                    </DialogDescription>
                  </DialogHeader>
                  <DeductionFormFields />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddDeductionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDeduction} disabled={!deductionFormData.name}>
                      Add Deduction
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calculation Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proratableDeductions.map((deduction) => (
                    <TableRow key={deduction.id}>
                      <TableCell className="font-medium">{deduction.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{DEDUCTION_TYPE_LABELS[deduction.type]}</Badge>
                      </TableCell>
                      <TableCell>{DEDUCTION_METHOD_LABELS[deduction.calculationMethod]}</TableCell>
                      <TableCell>
                        <Badge variant={deduction.isActive ? "default" : "secondary"}>
                          {deduction.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDeductionDialog(deduction)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDeduction(deduction)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {proratableDeductions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No proratable deductions found. Add one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Deduction Dialog */}
      <Dialog open={editDeductionDialogOpen} onOpenChange={setEditDeductionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Proratable Deduction</DialogTitle>
            <DialogDescription>Update the deduction configuration.</DialogDescription>
          </DialogHeader>
          <DeductionFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDeductionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDeduction} disabled={!deductionFormData.name}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Deduction Dialog */}
      <Dialog open={deleteDeductionDialogOpen} onOpenChange={setDeleteDeductionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Proratable Deduction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedDeduction?.name}&rdquo;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDeductionDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDeduction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
