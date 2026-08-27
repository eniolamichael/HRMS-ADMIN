"use client";
import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { PayGrade } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Upload, Pencil, Trash2, Search, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CURRENCIES = ["USD", "EUR", "GBP", "NGN"] as const;

type PayGradeFormData = {
  name: string;
  code: string;
  payGroupId: string;
  currency: string;
  defaultAnnualGross: number;
  maximumGross: number;
  isTaxable: boolean;
  minSalary: number;
  maxSalary: number;
};

const EMPTY_FORM: PayGradeFormData = {
  name: "",
  code: "",
  payGroupId: "",
  currency: "USD",
  defaultAnnualGross: 0,
  maximumGross: 0,
  isTaxable: true,
  minSalary: 0,
  maxSalary: 0,
};

export default function PayGradesPage() {
  const {
    payGrades,
    payGroups,
    addPayGrade,
    updatePayGrade,
    deletePayGrade,
    bulkUploadPayGrades,
    bulkEditPayGrades,
    employees,
  } = usePayroll();

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<PayGrade | null>(null);
  const [formData, setFormData] = useState<PayGradeFormData>(EMPTY_FORM);
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkEditData, setBulkEditData] = useState<PayGrade[]>([]);

  const filteredPayGrades = payGrades.filter((pg) => {
    const q = searchQuery.toLowerCase();
    return (
      pg.name.toLowerCase().includes(q) ||
      pg.code.toLowerCase().includes(q) ||
      pg.payGroupName.toLowerCase().includes(q) ||
      pg.currency.toLowerCase().includes(q)
    );
  });

  const getPayGroupName = (payGroupId: string) =>
    payGroups.find((pg) => pg.id === payGroupId)?.name ?? "—";

  const getEmployeeCount = (gradeId: string) =>
    employees.filter((e) => e.payGradeId === gradeId).length;

  const openCreateDialog = () => {
    setFormData(EMPTY_FORM);
    setCreateDialogOpen(true);
  };

  const openEditDialog = (grade: PayGrade) => {
    setSelectedGrade(grade);
    setFormData({
      name: grade.name,
      code: grade.code,
      payGroupId: grade.payGroupId,
      currency: grade.currency,
      defaultAnnualGross: grade.defaultAnnualGross,
      maximumGross: grade.maximumGross,
      isTaxable: grade.isTaxable,
      minSalary: grade.minSalary,
      maxSalary: grade.maxSalary,
    });
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    addPayGrade({
      ...formData,
      payGroupName: getPayGroupName(formData.payGroupId),
      isActive: true,
      employeeCount: 0,
    });
    setCreateDialogOpen(false);
  };

  const handleEdit = () => {
    if (!selectedGrade) return;
    updatePayGrade(selectedGrade.id, {
      ...formData,
      payGroupName: getPayGroupName(formData.payGroupId),
    });
    setEditDialogOpen(false);
    setSelectedGrade(null);
  };

  const handleDelete = (grade: PayGrade) => {
    setSelectedGrade(grade);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedGrade) deletePayGrade(selectedGrade.id);
    setDeleteDialogOpen(false);
    setSelectedGrade(null);
  };

  const handleBulkUpload = () => {
    const lines = bulkCsvText.trim().split("\n");
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const records = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? "";
      });
      return {
        name: row.name ?? "",
        code: row.code ?? "",
        payGroupId: row.paygroupid ?? row.pay_group_id ?? "",
        payGroupName: getPayGroupName(row.paygroupid ?? row.pay_group_id ?? ""),
        currency: row.currency ?? "USD",
        defaultAnnualGross: parseFloat(row.defaultannualgross ?? row.default_annual_gross ?? "0") || 0,
        maximumGross: parseFloat(row.maximumgross ?? row.maximum_gross ?? "0") || 0,
        isTaxable: (row.istaxable ?? row.is_taxable ?? "true") === "true",
        minSalary: parseFloat(row.minsalary ?? row.min_salary ?? "0") || 0,
        maxSalary: parseFloat(row.maxsalary ?? row.max_salary ?? "0") || 0,
        isActive: true,
        employeeCount: 0,
      } as Omit<PayGrade, "id" | "createdAt" | "updatedAt">;
    });
    bulkUploadPayGrades(records);
    setBulkCsvText("");
    setBulkUploadDialogOpen(false);
  };

  const openBulkEditDialog = () => {
    setBulkEditData(payGrades.map((g) => ({ ...g })));
    setBulkEditDialogOpen(true);
  };

  const updateBulkEditField = (id: string, field: keyof PayGrade, value: string | number | boolean) => {
    setBulkEditData((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleBulkEditSave = () => {
    bulkEditPayGrades(bulkEditData);
    setBulkEditDialogOpen(false);
  };

  const PayGradeFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pg-name">Name</Label>
          <Input
            id="pg-name"
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Grade A - Entry Level"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pg-code">Code</Label>
          <Input
            id="pg-code"
            value={formData.code}
            onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value }))}
            placeholder="e.g. GA"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Pay Group</Label>
          <Select
            value={formData.payGroupId}
            onValueChange={(v) => setFormData((f) => ({ ...f, payGroupId: v }))}
          >
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
          <Label>Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(v) => setFormData((f) => ({ ...f, currency: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pg-default-gross">Default Annual Gross</Label>
          <Input
            id="pg-default-gross"
            type="number"
            value={formData.defaultAnnualGross || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, defaultAnnualGross: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pg-max-gross">Maximum Gross</Label>
          <Input
            id="pg-max-gross"
            type="number"
            value={formData.maximumGross || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, maximumGross: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pg-min-salary">Min Salary</Label>
          <Input
            id="pg-min-salary"
            type="number"
            value={formData.minSalary || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, minSalary: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pg-max-salary">Max Salary</Label>
          <Input
            id="pg-max-salary"
            type="number"
            value={formData.maxSalary || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, maxSalary: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={formData.isTaxable}
          onCheckedChange={(v) => setFormData((f) => ({ ...f, isTaxable: v }))}
        />
        <Label>Taxable</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Pay Grades</CardTitle>
            <CardDescription>
              Manage pay grades, salary ranges, and tax settings (FR-196 to FR-204)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={bulkUploadDialogOpen} onOpenChange={setBulkUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Pay Grades</DialogTitle>
                  <DialogDescription>
                    Paste CSV data below. Header row required with columns: name, code, payGroupId, currency, defaultAnnualGross, maximumGross, isTaxable, minSalary, maxSalary
                  </DialogDescription>
                </DialogHeader>
                <textarea
                  className="w-full h-64 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono resize-y"
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  placeholder={`name,code,payGroupId,currency,defaultAnnualGross,maximumGross,isTaxable,minSalary,maxSalary\nGrade A,GA,pg-1,USD,36000,45000,true,3000,3750`}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBulkUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkUpload}>Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={bulkEditDialogOpen} onOpenChange={setBulkEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={openBulkEditDialog}>
                  <Edit className="mr-2 h-4 w-4" />
                  Bulk Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Edit Pay Grades</DialogTitle>
                  <DialogDescription>
                    Edit pay grade details inline. Changes will be saved when you click Save.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {bulkEditData.map((grade) => (
                    <div key={grade.id} className="grid grid-cols-4 gap-3 p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={grade.name}
                          onChange={(e) => updateBulkEditField(grade.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Code</Label>
                        <Input
                          value={grade.code}
                          onChange={(e) => updateBulkEditField(grade.id, "code", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Currency</Label>
                        <Select
                          value={grade.currency}
                          onValueChange={(v) => updateBulkEditField(grade.id, "currency", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Default Annual Gross</Label>
                        <Input
                          type="number"
                          value={grade.defaultAnnualGross}
                          onChange={(e) =>
                            updateBulkEditField(grade.id, "defaultAnnualGross", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Maximum Gross</Label>
                        <Input
                          type="number"
                          value={grade.maximumGross}
                          onChange={(e) =>
                            updateBulkEditField(grade.id, "maximumGross", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Min Salary</Label>
                        <Input
                          type="number"
                          value={grade.minSalary}
                          onChange={(e) =>
                            updateBulkEditField(grade.id, "minSalary", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Max Salary</Label>
                        <Input
                          type="number"
                          value={grade.maxSalary}
                          onChange={(e) =>
                            updateBulkEditField(grade.id, "maxSalary", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Pay Group</Label>
                        <Select
                          value={grade.payGroupId}
                          onValueChange={(v) => {
                            updateBulkEditField(grade.id, "payGroupId", v);
                            updateBulkEditField(grade.id, "payGroupName", getPayGroupName(v));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                      <div className="flex items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={grade.isTaxable}
                            onCheckedChange={(v) => updateBulkEditField(grade.id, "isTaxable", v)}
                          />
                          <Label className="text-xs">Taxable</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBulkEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkEditSave}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Pay Grade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Pay Grade</DialogTitle>
                  <DialogDescription>
                    Define a new pay grade with salary ranges and tax settings.
                  </DialogDescription>
                </DialogHeader>
                {PayGradeFormFields()}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pay grades..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Pay Group</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Default Annual Gross</TableHead>
                  <TableHead className="text-right">Max Gross</TableHead>
                  <TableHead>Taxable</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayGrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No pay grades found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayGrades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-mono font-medium">{grade.code}</TableCell>
                      <TableCell>{grade.name}</TableCell>
                      <TableCell>{grade.payGroupName}</TableCell>
                      <TableCell>{grade.currency}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(grade.defaultAnnualGross, grade.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(grade.maximumGross, grade.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={grade.isTaxable ? "default" : "secondary"}>
                          {grade.isTaxable ? "Taxable" : "Non-Taxable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {getEmployeeCount(grade.id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={grade.isActive ? "default" : "destructive"}>
                          {grade.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(grade)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(grade)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredPayGrades.length} of {payGrades.length} pay grades
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Pay Grade</DialogTitle>
            <DialogDescription>Update the pay grade details below.</DialogDescription>
          </DialogHeader>
          {PayGradeFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pay Grade</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedGrade?.name}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
