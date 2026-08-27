"use client";

import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { TaxTable, TaxBracket, TaxReliefType, BenefitInKindType } from "@/types/payroll";
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
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency, generateId } from "@/lib/utils";

const COUNTRIES = ["Nigeria", "United States", "United Kingdom", "Ghana", "South Africa", "Kenya"] as const;
const CURRENCIES = ["NGN", "USD", "GBP", "GHS", "ZAR", "KES"] as const;

type TaxTableFormData = {
  name: string;
  country: string;
  currency: string;
  taxYear: number;
  effectiveDate: string;
  isActive: boolean;
};

type TaxBracketFormData = {
  minAmount: number;
  maxAmount: number | null;
  rate: number;
  fixedAmount: number;
};

type TaxReliefFormData = {
  name: string;
  code: string;
  description: string;
  defaultAmount: number;
  maxAmount: number;
  isPercentage: boolean;
  isActive: boolean;
};

type BIKFormData = {
  name: string;
  code: string;
  description: string;
  taxRate: number;
  isActive: boolean;
};

const EMPTY_TAX_TABLE: TaxTableFormData = {
  name: "",
  country: "",
  currency: "NGN",
  taxYear: new Date().getFullYear(),
  effectiveDate: "",
  isActive: true,
};

const EMPTY_BRACKET: TaxBracketFormData = {
  minAmount: 0,
  maxAmount: null,
  rate: 0,
  fixedAmount: 0,
};

const EMPTY_RELIEF: TaxReliefFormData = {
  name: "",
  code: "",
  description: "",
  defaultAmount: 0,
  maxAmount: 0,
  isPercentage: false,
  isActive: true,
};

const EMPTY_BIK: BIKFormData = {
  name: "",
  code: "",
  description: "",
  taxRate: 0,
  isActive: true,
};

export default function TaxConfigurationPage() {
  const {
    taxTables,
    addTaxTable,
    updateTaxTable,
    deleteTaxTable,
    taxReliefTypes,
    addTaxReliefType,
    updateTaxReliefType,
    deleteTaxReliefType,
    benefitInKindTypes,
    addBenefitInKindType,
    updateBenefitInKindType,
    deleteBenefitInKindType,
  } = usePayroll();

  const [activeTab, setActiveTab] = useState("tax-tables");
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);

  // Tax Table state
  const [taxTableDialogOpen, setTaxTableDialogOpen] = useState(false);
  const [editingTaxTable, setEditingTaxTable] = useState<TaxTable | null>(null);
  const [taxTableForm, setTaxTableForm] = useState<TaxTableFormData>(EMPTY_TAX_TABLE);
  const [deleteTaxTableDialogOpen, setDeleteTaxTableDialogOpen] = useState(false);
  const [taxTableToDelete, setTaxTableToDelete] = useState<TaxTable | null>(null);

  // Bracket state
  const [bracketDialogOpen, setBracketDialogOpen] = useState(false);
  const [editingBracket, setEditingBracket] = useState<TaxBracket | null>(null);
  const [bracketForm, setBracketForm] = useState<TaxBracketFormData>(EMPTY_BRACKET);
  const [bracketParentTableId, setBracketParentTableId] = useState<string | null>(null);

  // Tax Relief state
  const [reliefDialogOpen, setReliefDialogOpen] = useState(false);
  const [editingRelief, setEditingRelief] = useState<TaxReliefType | null>(null);
  const [reliefForm, setReliefForm] = useState<TaxReliefFormData>(EMPTY_RELIEF);
  const [deleteReliefDialogOpen, setDeleteReliefDialogOpen] = useState(false);
  const [reliefToDelete, setReliefToDelete] = useState<TaxReliefType | null>(null);

  // BIK state
  const [bikDialogOpen, setBikDialogOpen] = useState(false);
  const [editingBik, setEditingBik] = useState<BenefitInKindType | null>(null);
  const [bikForm, setBikForm] = useState<BIKFormData>(EMPTY_BIK);
  const [deleteBikDialogOpen, setDeleteBikDialogOpen] = useState(false);
  const [bikToDelete, setBikToDelete] = useState<BenefitInKindType | null>(null);

  // ─── Tax Table Handlers ──────────────────────────────────────────

  const openCreateTaxTable = () => {
    setEditingTaxTable(null);
    setTaxTableForm(EMPTY_TAX_TABLE);
    setTaxTableDialogOpen(true);
  };

  const openEditTaxTable = (table: TaxTable) => {
    setEditingTaxTable(table);
    setTaxTableForm({
      name: table.name,
      country: table.country,
      currency: table.currency,
      taxYear: table.taxYear,
      effectiveDate: table.effectiveDate,
      isActive: table.isActive,
    });
    setTaxTableDialogOpen(true);
  };

  const handleSaveTaxTable = () => {
    if (editingTaxTable) {
      updateTaxTable(editingTaxTable.id, {
        name: taxTableForm.name,
        country: taxTableForm.country,
        currency: taxTableForm.currency,
        taxYear: taxTableForm.taxYear,
        effectiveDate: taxTableForm.effectiveDate,
        isActive: taxTableForm.isActive,
      });
    } else {
      addTaxTable({
        name: taxTableForm.name,
        country: taxTableForm.country,
        currency: taxTableForm.currency,
        taxYear: taxTableForm.taxYear,
        effectiveDate: taxTableForm.effectiveDate,
        isActive: taxTableForm.isActive,
        brackets: [],
      });
    }
    setTaxTableDialogOpen(false);
  };

  const handleDeleteTaxTable = () => {
    if (taxTableToDelete) deleteTaxTable(taxTableToDelete.id);
    setDeleteTaxTableDialogOpen(false);
    setTaxTableToDelete(null);
  };

  const toggleExpandTable = (tableId: string) => {
    setExpandedTableId((prev) => (prev === tableId ? null : tableId));
  };

  // ─── Bracket Handlers ────────────────────────────────────────────

  const openAddBracket = (tableId: string) => {
    setEditingBracket(null);
    setBracketForm(EMPTY_BRACKET);
    setBracketParentTableId(tableId);
    setBracketDialogOpen(true);
  };

  const openEditBracket = (tableId: string, bracket: TaxBracket) => {
    setEditingBracket(bracket);
    setBracketForm({
      minAmount: bracket.minAmount,
      maxAmount: bracket.maxAmount,
      rate: bracket.rate,
      fixedAmount: bracket.fixedAmount,
    });
    setBracketParentTableId(tableId);
    setBracketDialogOpen(true);
  };

  const handleSaveBracket = () => {
    if (!bracketParentTableId) return;
    const table = taxTables.find((t) => t.id === bracketParentTableId);
    if (!table) return;

    if (editingBracket) {
      const updatedBrackets = table.brackets.map((b) =>
        b.id === editingBracket.id
          ? { ...b, ...bracketForm }
          : b
      );
      updateTaxTable(table.id, { brackets: updatedBrackets });
    } else {
      const newBracket: TaxBracket = {
        id: generateId(),
        ...bracketForm,
      };
      updateTaxTable(table.id, { brackets: [...table.brackets, newBracket] });
    }
    setBracketDialogOpen(false);
  };

  const handleDeleteBracket = (tableId: string, bracketId: string) => {
    const table = taxTables.find((t) => t.id === tableId);
    if (!table) return;
    updateTaxTable(table.id, {
      brackets: table.brackets.filter((b) => b.id !== bracketId),
    });
  };

  // ─── Tax Relief Handlers ─────────────────────────────────────────

  const openCreateRelief = () => {
    setEditingRelief(null);
    setReliefForm(EMPTY_RELIEF);
    setReliefDialogOpen(true);
  };

  const openEditRelief = (relief: TaxReliefType) => {
    setEditingRelief(relief);
    setReliefForm({
      name: relief.name,
      code: relief.code,
      description: relief.description,
      defaultAmount: relief.defaultAmount,
      maxAmount: relief.maxAmount,
      isPercentage: relief.isPercentage,
      isActive: relief.isActive,
    });
    setReliefDialogOpen(true);
  };

  const handleSaveRelief = () => {
    if (editingRelief) {
      updateTaxReliefType(editingRelief.id, reliefForm);
    } else {
      addTaxReliefType(reliefForm);
    }
    setReliefDialogOpen(false);
  };

  const handleDeleteRelief = () => {
    if (reliefToDelete) deleteTaxReliefType(reliefToDelete.id);
    setDeleteReliefDialogOpen(false);
    setReliefToDelete(null);
  };

  // ─── BIK Handlers ────────────────────────────────────────────────

  const openCreateBik = () => {
    setEditingBik(null);
    setBikForm(EMPTY_BIK);
    setBikDialogOpen(true);
  };

  const openEditBik = (bik: BenefitInKindType) => {
    setEditingBik(bik);
    setBikForm({
      name: bik.name,
      code: bik.code,
      description: bik.description,
      taxRate: bik.taxRate,
      isActive: bik.isActive,
    });
    setBikDialogOpen(true);
  };

  const handleSaveBik = () => {
    if (editingBik) {
      updateBenefitInKindType(editingBik.id, bikForm);
    } else {
      addBenefitInKindType(bikForm);
    }
    setBikDialogOpen(false);
  };

  const handleDeleteBik = () => {
    if (bikToDelete) deleteBenefitInKindType(bikToDelete.id);
    setDeleteBikDialogOpen(false);
    setBikToDelete(null);
  };

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
          <CardDescription>
            Manage tax tables, tax relief types, and benefit-in-kind types (FR-207 to FR-211)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="tax-tables">Tax Tables</TabsTrigger>
              <TabsTrigger value="tax-reliefs">Tax Relief Types</TabsTrigger>
              <TabsTrigger value="bik-types">Benefit-in-Kind Types</TabsTrigger>
            </TabsList>

            {/* ═══════════════ TAB 1: TAX TABLES ═══════════════ */}
            <TabsContent value="tax-tables">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {taxTables.length} tax table{taxTables.length !== 1 && "s"} configured
                </p>
                <Dialog open={taxTableDialogOpen} onOpenChange={setTaxTableDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={openCreateTaxTable}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Tax Table
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTaxTable ? "Edit Tax Table" : "Create Tax Table"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingTaxTable
                          ? "Update the tax table details below."
                          : "Define a new tax table with brackets for a specific country and year."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="tt-name">Name</Label>
                        <Input
                          id="tt-name"
                          value={taxTableForm.name}
                          onChange={(e) =>
                            setTaxTableForm((f) => ({ ...f, name: e.target.value }))
                          }
                          placeholder="e.g. Nigeria Personal Income Tax 2024"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Select
                            value={taxTableForm.country}
                            onValueChange={(v) =>
                              setTaxTableForm((f) => ({ ...f, country: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Select
                            value={taxTableForm.currency}
                            onValueChange={(v) =>
                              setTaxTableForm((f) => ({ ...f, currency: v }))
                            }
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
                          <Label htmlFor="tt-year">Tax Year</Label>
                          <Input
                            id="tt-year"
                            type="number"
                            value={taxTableForm.taxYear}
                            onChange={(e) =>
                              setTaxTableForm((f) => ({
                                ...f,
                                taxYear: parseInt(e.target.value) || new Date().getFullYear(),
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tt-effective">Effective Date</Label>
                          <Input
                            id="tt-effective"
                            type="date"
                            value={taxTableForm.effectiveDate}
                            onChange={(e) =>
                              setTaxTableForm((f) => ({ ...f, effectiveDate: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={taxTableForm.isActive}
                          onCheckedChange={(v) =>
                            setTaxTableForm((f) => ({ ...f, isActive: v }))
                          }
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setTaxTableDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTaxTable}>
                        {editingTaxTable ? "Save Changes" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Tax Year</TableHead>
                      <TableHead className="text-center">Brackets</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxTables.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No tax tables configured. Create one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      taxTables.map((table) => (
                        <>
                          <TableRow key={table.id}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleExpandTable(table.id)}
                              >
                                {expandedTableId === table.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">{table.name}</TableCell>
                            <TableCell>{table.country}</TableCell>
                            <TableCell>{table.taxYear}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{table.brackets.length}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={table.isActive ? "default" : "destructive"}>
                                {table.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditTaxTable(table)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setTaxTableToDelete(table);
                                    setDeleteTaxTableDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedTableId === table.id && (
                            <TableRow key={`${table.id}-expanded`}>
                              <TableCell colSpan={7} className="bg-muted/50 p-0">
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold">
                                      Tax Brackets — {table.name}
                                    </h4>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openAddBracket(table.id)}
                                    >
                                      <Plus className="mr-2 h-3 w-3" />
                                      Add Bracket
                                    </Button>
                                  </div>
                                  {table.brackets.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                      No brackets defined. Add a bracket to configure tax rates.
                                    </p>
                                  ) : (
                                    <div className="border rounded-md">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Min Amount</TableHead>
                                            <TableHead>Max Amount</TableHead>
                                            <TableHead className="text-right">Rate (%)</TableHead>
                                            <TableHead className="text-right">Fixed Amount</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {table.brackets.map((bracket) => (
                                            <TableRow key={bracket.id}>
                                              <TableCell>
                                                {formatCurrency(bracket.minAmount, table.currency)}
                                              </TableCell>
                                              <TableCell>
                                                {bracket.maxAmount !== null
                                                  ? formatCurrency(bracket.maxAmount, table.currency)
                                                  : "No limit"}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {bracket.rate}%
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {formatCurrency(bracket.fixedAmount, table.currency)}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                      openEditBracket(table.id, bracket)
                                                    }
                                                  >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                      handleDeleteBracket(table.id, bracket.id)
                                                    }
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </Button>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ═══════════════ TAB 2: TAX RELIEF TYPES ═══════════════ */}
            <TabsContent value="tax-reliefs">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {taxReliefTypes.length} tax relief type{taxReliefTypes.length !== 1 && "s"} configured
                </p>
                <Dialog open={reliefDialogOpen} onOpenChange={setReliefDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={openCreateRelief}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Tax Relief Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRelief ? "Edit Tax Relief Type" : "Create Tax Relief Type"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingRelief
                          ? "Update the tax relief type details below."
                          : "Define a new tax relief type for employee deductions."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tr-name">Name</Label>
                          <Input
                            id="tr-name"
                            value={reliefForm.name}
                            onChange={(e) =>
                              setReliefForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="e.g. Pension Contribution"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tr-code">Code</Label>
                          <Input
                            id="tr-code"
                            value={reliefForm.code}
                            onChange={(e) =>
                              setReliefForm((f) => ({ ...f, code: e.target.value }))
                            }
                            placeholder="e.g. PEN"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tr-desc">Description</Label>
                        <Input
                          id="tr-desc"
                          value={reliefForm.description}
                          onChange={(e) =>
                            setReliefForm((f) => ({ ...f, description: e.target.value }))
                          }
                          placeholder="Description of the tax relief"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tr-default">Default Amount</Label>
                          <Input
                            id="tr-default"
                            type="number"
                            value={reliefForm.defaultAmount || ""}
                            onChange={(e) =>
                              setReliefForm((f) => ({
                                ...f,
                                defaultAmount: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tr-max">Max Amount</Label>
                          <Input
                            id="tr-max"
                            type="number"
                            value={reliefForm.maxAmount || ""}
                            onChange={(e) =>
                              setReliefForm((f) => ({
                                ...f,
                                maxAmount: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={reliefForm.isPercentage}
                            onCheckedChange={(v) =>
                              setReliefForm((f) => ({ ...f, isPercentage: v }))
                            }
                          />
                          <Label>Percentage-based</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={reliefForm.isActive}
                            onCheckedChange={(v) =>
                              setReliefForm((f) => ({ ...f, isActive: v }))
                            }
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setReliefDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveRelief}>
                        {editingRelief ? "Save Changes" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Default Amount</TableHead>
                      <TableHead className="text-right">Max Amount</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxReliefTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No tax relief types configured. Create one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      taxReliefTypes.map((relief) => (
                        <TableRow key={relief.id}>
                          <TableCell className="font-mono font-medium">{relief.code}</TableCell>
                          <TableCell>{relief.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{relief.description}</TableCell>
                          <TableCell className="text-right">{relief.defaultAmount}</TableCell>
                          <TableCell className="text-right">{relief.maxAmount}</TableCell>
                          <TableCell>
                            <Badge variant={relief.isPercentage ? "default" : "secondary"}>
                              {relief.isPercentage ? "Percentage" : "Fixed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={relief.isActive ? "default" : "destructive"}>
                              {relief.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditRelief(relief)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setReliefToDelete(relief);
                                  setDeleteReliefDialogOpen(true);
                                }}
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
            </TabsContent>

            {/* ═══════════════ TAB 3: BENEFIT-IN-KIND TYPES ═══════════════ */}
            <TabsContent value="bik-types">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {benefitInKindTypes.length} BIK type{benefitInKindTypes.length !== 1 && "s"} configured
                </p>
                <Dialog open={bikDialogOpen} onOpenChange={setBikDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={openCreateBik}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create BIK Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingBik ? "Edit BIK Type" : "Create BIK Type"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingBik
                          ? "Update the benefit-in-kind type details below."
                          : "Define a new benefit-in-kind type with its tax rate."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bik-name">Name</Label>
                          <Input
                            id="bik-name"
                            value={bikForm.name}
                            onChange={(e) =>
                              setBikForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="e.g. Company Vehicle"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bik-code">Code</Label>
                          <Input
                            id="bik-code"
                            value={bikForm.code}
                            onChange={(e) =>
                              setBikForm((f) => ({ ...f, code: e.target.value }))
                            }
                            placeholder="e.g. VEH"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bik-desc">Description</Label>
                        <Input
                          id="bik-desc"
                          value={bikForm.description}
                          onChange={(e) =>
                            setBikForm((f) => ({ ...f, description: e.target.value }))
                          }
                          placeholder="Description of the benefit-in-kind"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bik-rate">Tax Rate (%)</Label>
                        <Input
                          id="bik-rate"
                          type="number"
                          value={bikForm.taxRate || ""}
                          onChange={(e) =>
                            setBikForm((f) => ({
                              ...f,
                              taxRate: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={bikForm.isActive}
                          onCheckedChange={(v) =>
                            setBikForm((f) => ({ ...f, isActive: v }))
                          }
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBikDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveBik}>
                        {editingBik ? "Save Changes" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Tax Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benefitInKindTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No BIK types configured. Create one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      benefitInKindTypes.map((bik) => (
                        <TableRow key={bik.id}>
                          <TableCell className="font-mono font-medium">{bik.code}</TableCell>
                          <TableCell>{bik.name}</TableCell>
                          <TableCell className="max-w-[250px] truncate">{bik.description}</TableCell>
                          <TableCell className="text-right">{bik.taxRate}%</TableCell>
                          <TableCell>
                            <Badge variant={bik.isActive ? "default" : "destructive"}>
                              {bik.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditBik(bik)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setBikToDelete(bik);
                                  setDeleteBikDialogOpen(true);
                                }}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ═══════════════ BRACKET DIALOG ═══════════════ */}
      <Dialog open={bracketDialogOpen} onOpenChange={setBracketDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBracket ? "Edit Tax Bracket" : "Add Tax Bracket"}
            </DialogTitle>
            <DialogDescription>
              {editingBracket
                ? "Update the bracket details below."
                : "Define a new tax bracket with rate and thresholds."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="br-min">Min Amount</Label>
                <Input
                  id="br-min"
                  type="number"
                  value={bracketForm.minAmount || ""}
                  onChange={(e) =>
                    setBracketForm((f) => ({
                      ...f,
                      minAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="br-max">Max Amount</Label>
                <Input
                  id="br-max"
                  type="number"
                  value={bracketForm.maxAmount ?? ""}
                  onChange={(e) =>
                    setBracketForm((f) => ({
                      ...f,
                      maxAmount: e.target.value === "" ? null : parseFloat(e.target.value) || null,
                    }))
                  }
                  placeholder="Leave empty for no limit"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="br-rate">Rate (%)</Label>
                <Input
                  id="br-rate"
                  type="number"
                  step="0.01"
                  value={bracketForm.rate || ""}
                  onChange={(e) =>
                    setBracketForm((f) => ({
                      ...f,
                      rate: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="br-fixed">Fixed Amount</Label>
                <Input
                  id="br-fixed"
                  type="number"
                  value={bracketForm.fixedAmount || ""}
                  onChange={(e) =>
                    setBracketForm((f) => ({
                      ...f,
                      fixedAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBracketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBracket}>
              {editingBracket ? "Save Changes" : "Add Bracket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ DELETE TAX TABLE DIALOG ═══════════════ */}
      <Dialog open={deleteTaxTableDialogOpen} onOpenChange={setDeleteTaxTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tax Table</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{taxTableToDelete?.name}&rdquo;? This will
              also remove all associated brackets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTaxTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTaxTable}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ DELETE TAX RELIEF DIALOG ═══════════════ */}
      <Dialog open={deleteReliefDialogOpen} onOpenChange={setDeleteReliefDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tax Relief Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{reliefToDelete?.name}&rdquo;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteReliefDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRelief}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ DELETE BIK DIALOG ═══════════════ */}
      <Dialog open={deleteBikDialogOpen} onOpenChange={setDeleteBikDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete BIK Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{bikToDelete?.name}&rdquo;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBikDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBik}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
