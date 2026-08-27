"use client";

import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { PayslipSetting, PayslipField } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Eye, EyeOff, ArrowUp, ArrowDown, FileText, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import { samplePayslip } from "@/services/mock-data";
import { formatCurrency } from "@/lib/utils";

const fieldTypeBadgeVariant: Record<PayslipField["fieldType"], string> = {
  employee_info: "bg-blue-100 text-blue-800",
  earnings: "bg-green-100 text-green-800",
  deductions: "bg-red-100 text-red-800",
  taxes: "bg-orange-100 text-orange-800",
  custom: "bg-purple-100 text-purple-800",
};

export default function PayslipSettingsPage() {
  const { payslipSettings, updatePayslipSetting, payslipFields, updatePayslipField, reorderPayslipFields } = usePayroll();

  const [editingField, setEditingField] = useState<PayslipField | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sortedFields = [...payslipFields].sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleFields = sortedFields.filter((f) => f.isVisible);

  const handleToggleSetting = (id: string, enabled: boolean) => {
    updatePayslipSetting(id, {
      isEnabled: enabled,
      settingValue: String(enabled),
    });
  };

  const handleToggleFieldVisibility = (id: string, visible: boolean) => {
    updatePayslipField(id, { isVisible: visible });
  };

  const handleMoveUp = (field: PayslipField) => {
    if (field.displayOrder <= 1) return;
    const prev = sortedFields.find((f) => f.displayOrder === field.displayOrder - 1);
    if (!prev) return;
    reorderPayslipFields(
      payslipFields.map((f) => {
        if (f.id === field.id) return { ...f, displayOrder: f.displayOrder - 1 };
        if (f.id === prev.id) return { ...f, displayOrder: f.displayOrder + 1 };
        return f;
      })
    );
  };

  const handleMoveDown = (field: PayslipField) => {
    const maxOrder = Math.max(...payslipFields.map((f) => f.displayOrder));
    if (field.displayOrder >= maxOrder) return;
    const next = sortedFields.find((f) => f.displayOrder === field.displayOrder + 1);
    if (!next) return;
    reorderPayslipFields(
      payslipFields.map((f) => {
        if (f.id === field.id) return { ...f, displayOrder: f.displayOrder + 1 };
        if (f.id === next.id) return { ...f, displayOrder: f.displayOrder - 1 };
        return f;
      })
    );
  };

  const openEditLabel = (field: PayslipField) => {
    setEditingField(field);
    setEditLabel(field.label);
    setEditDialogOpen(true);
  };

  const saveLabel = () => {
    if (editingField && editLabel.trim()) {
      updatePayslipField(editingField.id, { label: editLabel.trim() });
    }
    setEditDialogOpen(false);
    setEditingField(null);
  };

  const getPayslipFieldValue = (fieldName: string): string => {
    switch (fieldName) {
      case "employee_name": return samplePayslip.employeeName;
      case "employee_id": return samplePayslip.employeeCode;
      case "department": return samplePayslip.department;
      case "job_title": return "Software Engineer";
      case "pay_period": return samplePayslip.payPeriod;
      case "base_salary": return formatCurrency(samplePayslip.baseSalary);
      case "allowances": return samplePayslip.allowances.map((a) => `${a.name}: ${formatCurrency(a.amount)}`).join(", ");
      case "overtime": return formatCurrency(0);
      case "bonus": return formatCurrency(0);
      case "gross_pay": return formatCurrency(samplePayslip.grossPay);
      case "income_tax": return samplePayslip.taxes.map((t) => `${t.name}: ${formatCurrency(t.amount)}`).join(", ");
      case "social_security": return formatCurrency(468.75);
      case "pension": return formatCurrency(375);
      case "health_insurance": return formatCurrency(240);
      case "other_deductions": return formatCurrency(0);
      case "total_deductions": return formatCurrency(samplePayslip.totalDeductions);
      case "net_pay": return formatCurrency(samplePayslip.netPay);
      case "bank_details": return `${samplePayslip.bankName} ${samplePayslip.accountNumber}`;
      case "ytd_gross": return formatCurrency(samplePayslip.yearToDate.grossPay);
      case "ytd_tax": return formatCurrency(samplePayslip.yearToDate.totalTax);
      default: return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payslip Settings</h2>
          <p className="text-muted-foreground">Configure payslip display options and field layout (FR-215, FR-216)</p>
        </div>
        <Button variant={showPreview ? "default" : "outline"} onClick={() => setShowPreview(!showPreview)}>
          <FileText className="mr-2 h-4 w-4" />
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Section 1: Payslip Settings
          </CardTitle>
          <CardDescription>Toggle which sections and information appear on generated payslips.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {payslipSettings.map((setting, idx) => (
              <div key={setting.id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{setting.settingName}</p>
                    <p className="text-xs text-muted-foreground">
                      Current value: <span className="font-mono">{setting.isEnabled ? "Enabled" : "Disabled"}</span>
                    </p>
                  </div>
                  <Switch
                    checked={setting.isEnabled}
                    onCheckedChange={(checked) => handleToggleSetting(setting.id, checked)}
                  />
                </div>
                {idx < payslipSettings.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 2: Payslip Fields Configuration</CardTitle>
          <CardDescription>
            Configure the order, visibility, and labels of fields shown on the payslip. Use the arrows to reorder fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Display Order</TableHead>
                <TableHead>Field Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Field Type</TableHead>
                <TableHead className="w-[100px]">Visible</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm">{field.displayOrder}</span>
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          disabled={field.displayOrder <= 1}
                          onClick={() => handleMoveUp(field)}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          disabled={field.displayOrder >= Math.max(...payslipFields.map((f) => f.displayOrder))}
                          onClick={() => handleMoveDown(field)}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{field.fieldName}</TableCell>
                  <TableCell>{field.label}</TableCell>
                  <TableCell>
                    <Badge className={fieldTypeBadgeVariant[field.fieldType]}>
                      {field.fieldType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {field.isVisible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={field.isVisible}
                        onCheckedChange={(checked) => handleToggleFieldVisibility(field.id, checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openEditLabel(field)}>
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit Label
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Sample Payslip Preview
            </CardTitle>
            <CardDescription>
              This preview reflects your current field configuration. Visible fields are shown in order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-white p-6 text-sm text-black shadow-sm max-w-lg mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">ACME Corporation</h3>
                <p className="text-xs text-gray-500">Payslip for {samplePayslip.payPeriod}</p>
                <p className="text-xs text-gray-500">Payment Date: {samplePayslip.payDate}</p>
              </div>

              <Separator className="mb-4" />

              <div className="space-y-3">
                {visibleFields.map((field) => {
                  const value = getPayslipFieldValue(field.fieldName);
                  const isTotal = field.fieldName === "gross_pay" || field.fieldName === "total_deductions" || field.fieldName === "net_pay";

                  if (isTotal) {
                    return (
                      <div key={field.id} className="flex justify-between border-t pt-2 font-semibold">
                        <span>{field.label}</span>
                        <span>{value}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={field.id} className="flex justify-between">
                      <span className="text-gray-600">{field.label}</span>
                      <span className="font-mono">{value}</span>
                    </div>
                  );
                })}
              </div>

              {visibleFields.length === 0 && (
                <p className="text-center text-gray-400 py-8">No visible fields configured.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field Label</DialogTitle>
            <DialogDescription>
              Update the display label for <span className="font-mono">{editingField?.fieldName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="field-label">Label</Label>
              <Input
                id="field-label"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="Enter field label"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveLabel} disabled={!editLabel.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
