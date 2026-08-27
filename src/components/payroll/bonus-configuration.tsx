"use client";
import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { BonusConfiguration } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const BONUS_TYPES = ["13th_month", "bonus", "allowance", "commission", "other"] as const;
const CALC_METHODS = ["fixed", "percentage_of_salary", "custom"] as const;

type BonusFormData = {
  name: string;
  type: BonusConfiguration["type"];
  calculationMethod: BonusConfiguration["calculationMethod"];
  defaultAmount: number;
  percentage: number;
  isTaxable: boolean;
  isActive: boolean;
  applicablePayGroups: string[];
};

const EMPTY_FORM: BonusFormData = {
  name: "",
  type: "bonus",
  calculationMethod: "fixed",
  defaultAmount: 0,
  percentage: 0,
  isTaxable: true,
  isActive: true,
  applicablePayGroups: [],
};

const TYPE_LABELS: Record<BonusConfiguration["type"], string> = {
  "13th_month": "13th Month",
  bonus: "Bonus",
  allowance: "Allowance",
  commission: "Commission",
  other: "Other",
};

const TYPE_VARIANT: Record<BonusConfiguration["type"], "default" | "secondary" | "outline" | "destructive"> = {
  "13th_month": "default",
  bonus: "secondary",
  allowance: "outline",
  commission: "default",
  other: "outline",
};

const CALC_METHOD_LABELS: Record<BonusConfiguration["calculationMethod"], string> = {
  fixed: "Fixed",
  percentage_of_salary: "% of Salary",
  custom: "Custom",
};

export default function BonusConfigurationPage() {
  const {
    bonusConfigurations,
    addBonusConfiguration,
    updateBonusConfiguration,
    deleteBonusConfiguration,
    payGroups,
  } = usePayroll();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<BonusConfiguration | null>(null);
  const [formData, setFormData] = useState<BonusFormData>(EMPTY_FORM);

  const openCreateDialog = () => {
    setFormData(EMPTY_FORM);
    setCreateDialogOpen(true);
  };

  const openEditDialog = (config: BonusConfiguration) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      type: config.type,
      calculationMethod: config.calculationMethod,
      defaultAmount: config.defaultAmount,
      percentage: config.percentage,
      isTaxable: config.isTaxable,
      isActive: config.isActive,
      applicablePayGroups: [...config.applicablePayGroups],
    });
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    addBonusConfiguration(formData);
    setCreateDialogOpen(false);
  };

  const handleEdit = () => {
    if (!selectedConfig) return;
    updateBonusConfiguration(selectedConfig.id, formData);
    setEditDialogOpen(false);
    setSelectedConfig(null);
  };

  const handleDelete = (config: BonusConfiguration) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedConfig) deleteBonusConfiguration(selectedConfig.id);
    setDeleteDialogOpen(false);
    setSelectedConfig(null);
  };

  const togglePayGroup = (pgId: string) => {
    setFormData((f) => ({
      ...f,
      applicablePayGroups: f.applicablePayGroups.includes(pgId)
        ? f.applicablePayGroups.filter((id) => id !== pgId)
        : [...f.applicablePayGroups, pgId],
    }));
  };

  const getPayGroupNames = (ids: string[]) =>
    ids
      .map((id) => payGroups.find((pg) => pg.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "—";

  const ConfigFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="bc-name">Name</Label>
        <Input
          id="bc-name"
          value={formData.name}
          onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Annual Performance Bonus"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData((f) => ({ ...f, type: v as BonusFormData["type"] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BONUS_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Calculation Method</Label>
          <Select
            value={formData.calculationMethod}
            onValueChange={(v) => setFormData((f) => ({ ...f, calculationMethod: v as BonusFormData["calculationMethod"] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CALC_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {CALC_METHOD_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bc-amount">Default Amount</Label>
          <Input
            id="bc-amount"
            type="number"
            value={formData.defaultAmount || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, defaultAmount: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bc-percentage">Percentage (%)</Label>
          <Input
            id="bc-percentage"
            type="number"
            value={formData.percentage || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, percentage: parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="bc-taxable">Taxable</Label>
        <Switch
          id="bc-taxable"
          checked={formData.isTaxable}
          onCheckedChange={(c) => setFormData((f) => ({ ...f, isTaxable: c }))}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="bc-active">Active</Label>
        <Switch
          id="bc-active"
          checked={formData.isActive}
          onCheckedChange={(c) => setFormData((f) => ({ ...f, isActive: c }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Applicable Pay Groups</Label>
        <div className="flex flex-wrap gap-2 rounded-md border p-3">
          {payGroups.map((pg) => (
            <Badge
              key={pg.id}
              variant={formData.applicablePayGroups.includes(pg.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => togglePayGroup(pg.id)}
            >
              {pg.name}
            </Badge>
          ))}
          {payGroups.length === 0 && (
            <span className="text-sm text-muted-foreground">No pay groups available</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bonus & Allowance Configurations</CardTitle>
            <CardDescription>
              Manage bonus types, allowances, commissions, and other recurring payments (FR-217).
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Create Bonus Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Bonus Configuration</DialogTitle>
                <DialogDescription>
                  Define a new bonus or allowance type for your payroll.
                </DialogDescription>
              </DialogHeader>
              <ConfigFormFields />
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name}>
                  Create
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
                <TableHead>Default Amount</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pay Groups</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonusConfigurations.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell>
                    <Badge variant={TYPE_VARIANT[config.type]}>{TYPE_LABELS[config.type]}</Badge>
                  </TableCell>
                  <TableCell>{CALC_METHOD_LABELS[config.calculationMethod]}</TableCell>
                  <TableCell>
                    {config.defaultAmount > 0 ? formatCurrency(config.defaultAmount) : "—"}
                  </TableCell>
                  <TableCell>
                    {config.percentage > 0 ? `${config.percentage}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.isTaxable ? "default" : "outline"}>
                      {config.isTaxable ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.isActive ? "default" : "secondary"}>
                      {config.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {getPayGroupNames(config.applicablePayGroups)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(config)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(config)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {bonusConfigurations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No bonus configurations found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Bonus Configuration</DialogTitle>
            <DialogDescription>Update the bonus or allowance configuration.</DialogDescription>
          </DialogHeader>
          <ConfigFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bonus Configuration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedConfig?.name}&rdquo;? This action cannot
              be undone.
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
