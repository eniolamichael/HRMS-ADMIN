"use client";

import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { PayGroup } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Upload, Pencil, Trash2, Search } from "lucide-react";

const defaultFormState = {
  name: "",
  description: "",
  payFrequency: "monthly" as PayGroup["payFrequency"],
  paymentDay: "1",
  isActive: true,
};

export default function PayGroups() {
  const { payGroups, addPayGroup, updatePayGroup, deletePayGroup, bulkUploadPayGroups, employees } = usePayroll();

  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCsv, setBulkCsv] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = payGroups.filter(
    (pg) =>
      pg.name.toLowerCase().includes(search.toLowerCase()) ||
      pg.description.toLowerCase().includes(search.toLowerCase())
  );

  const getEmployeeCount = (pgId: string) =>
    employees.filter((e) => e.payGroupId === pgId && e.status === "active").length;

  const openCreateDialog = () => {
    setEditingId(null);
    setFormState(defaultFormState);
    setDialogOpen(true);
  };

  const openEditDialog = (pg: PayGroup) => {
    setEditingId(pg.id);
    setFormState({
      name: pg.name,
      description: pg.description,
      payFrequency: pg.payFrequency,
      paymentDay: pg.paymentDay,
      isActive: pg.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formState.name.trim()) return;

    if (editingId) {
      updatePayGroup(editingId, { ...formState, employeeCount: getEmployeeCount(editingId) });
    } else {
      addPayGroup({ ...formState, employeeCount: 0 });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deletePayGroup(id);
    setDeleteConfirmId(null);
  };

  const handleBulkUpload = () => {
    const lines = bulkCsv.trim().split("\n");
    if (lines.length < 2) return;

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = header.indexOf("name");
    const descIdx = header.indexOf("description");
    const freqIdx = header.indexOf("payfrequency") !== -1 ? header.indexOf("payfrequency") : header.indexOf("pay_frequency");
    const dayIdx = header.indexOf("paymentday") !== -1 ? header.indexOf("paymentday") : header.indexOf("payment_day");

    const groups: Omit<PayGroup, "id" | "createdAt" | "updatedAt">[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 1 || !cols[nameIdx]) continue;

      groups.push({
        name: cols[nameIdx] || `Group ${i}`,
        description: cols[descIdx] || "",
        payFrequency: (["weekly", "bi-weekly", "semi-monthly", "monthly"].includes(cols[freqIdx])
          ? cols[freqIdx]
          : "monthly") as PayGroup["payFrequency"],
        paymentDay: cols[dayIdx] || "1",
        isActive: true,
        employeeCount: 0,
      });
    }

    if (groups.length > 0) {
      bulkUploadPayGroups(groups);
      setBulkCsv("");
      setBulkDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pay Groups</CardTitle>
          <CardDescription>Manage pay groups that define payment frequencies and schedules for employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pay groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
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
                    <DialogTitle>Bulk Upload Pay Groups</DialogTitle>
                    <DialogDescription>
                      Paste CSV data below. Expected columns: name, description, payFrequency, paymentDay
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted p-3 text-xs font-mono">
                      <p className="text-muted-foreground mb-1">Example format:</p>
                      <p>name,description,payFrequency,paymentDay</p>
                      <p>Weekly Staff,Weekly paid staff,weekly,5</p>
                      <p>Monthly Salaried,Monthly salary earners,monthly,28</p>
                    </div>
                    <textarea
                      className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="name,description,payFrequency,paymentDay"
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
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Pay Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Pay Group" : "Create Pay Group"}</DialogTitle>
                    <DialogDescription>
                      {editingId ? "Update the pay group details below." : "Define a new pay group for organizing employees by payment schedule."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="pg-name">Name</Label>
                      <Input
                        id="pg-name"
                        placeholder="e.g. Monthly Salaried"
                        value={formState.name}
                        onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pg-desc">Description</Label>
                      <Input
                        id="pg-desc"
                        placeholder="e.g. Employees paid monthly"
                        value={formState.description}
                        onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pay Frequency</Label>
                      <Select
                        value={formState.payFrequency}
                        onValueChange={(v) =>
                          setFormState((s) => ({ ...s, payFrequency: v as PayGroup["payFrequency"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="semi-monthly">Semi-Monthly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pg-day">Payment Day</Label>
                      <Input
                        id="pg-day"
                        placeholder="e.g. 28"
                        value={formState.paymentDay}
                        onChange={(e) => setFormState((s) => ({ ...s, paymentDay: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pg-active">Active</Label>
                      <Switch
                        id="pg-active"
                        checked={formState.isActive}
                        onCheckedChange={(checked) => setFormState((s) => ({ ...s, isActive: checked }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!formState.name.trim()}>
                      {editingId ? "Update" : "Create"}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Pay Frequency</TableHead>
                  <TableHead>Payment Day</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No pay groups found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((pg) => (
                    <TableRow key={pg.id}>
                      <TableCell className="font-medium">{pg.name}</TableCell>
                      <TableCell className="text-muted-foreground">{pg.description}</TableCell>
                      <TableCell className="capitalize">{pg.payFrequency.replace("-", " ")}</TableCell>
                      <TableCell>{pg.paymentDay}</TableCell>
                      <TableCell className="text-center">{getEmployeeCount(pg.id)}</TableCell>
                      <TableCell>
                        <Badge variant={pg.isActive ? "default" : "secondary"}>
                          {pg.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(pg)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Dialog open={deleteConfirmId === pg.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(pg.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Pay Group</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete &quot;{pg.name}&quot;? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                  Cancel
                                </Button>
                                <Button variant="destructive" onClick={() => handleDelete(pg.id)}>
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
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
