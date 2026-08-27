"use client";

import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { PayrollApprover, PayrollAdministrator, PayrollPermission } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Shield, Key } from "lucide-react";

const ALL_PERMISSIONS: Omit<PayrollPermission, "id" | "granted">[] = [
  { name: "run_payroll", description: "Initiate and process payroll runs" },
  { name: "edit_paygrades", description: "Create, modify, and delete pay grades" },
  { name: "manage_employees", description: "Add, update, and remove employee payroll records" },
  { name: "configure_tax", description: "Configure tax tables, reliefs, and benefits in kind" },
  { name: "generate_reports", description: "Generate and export payroll reports" },
  { name: "submit_payment", description: "Submit approved payroll for payment processing" },
];

const defaultApproverForm = {
  name: "",
  email: "",
  role: "",
  approvalLevel: 1,
  isActive: true,
};

const defaultAdminForm = {
  name: "",
  email: "",
  isActive: true,
};

export default function Administration() {
  const {
    approvers, addApprover, updateApprover, removeApprover,
    administrators, addAdministrator, updateAdministrator, removeAdministrator, updateAdministratorPermissions,
  } = usePayroll();

  const [approverForm, setApproverForm] = useState(defaultApproverForm);
  const [approverEditId, setApproverEditId] = useState<string | null>(null);
  const [approverDialogOpen, setApproverDialogOpen] = useState(false);
  const [approverDeleteId, setApproverDeleteId] = useState<string | null>(null);

  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [adminEditId, setAdminEditId] = useState<string | null>(null);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminDeleteId, setAdminDeleteId] = useState<string | null>(null);

  const [permDialogAdminId, setPermDialogAdminId] = useState<string | null>(null);
  const [permDraft, setPermDraft] = useState<PayrollPermission[]>([]);

  const openApproverCreate = () => {
    setApproverEditId(null);
    setApproverForm(defaultApproverForm);
    setApproverDialogOpen(true);
  };

  const openApproverEdit = (a: PayrollApprover) => {
    setApproverEditId(a.id);
    setApproverForm({ name: a.name, email: a.email, role: a.role, approvalLevel: a.approvalLevel, isActive: a.isActive });
    setApproverDialogOpen(true);
  };

  const handleSaveApprover = () => {
    if (!approverForm.name.trim() || !approverForm.email.trim()) return;
    if (approverEditId) {
      updateApprover(approverEditId, approverForm);
    } else {
      addApprover({ ...approverForm, userId: crypto.randomUUID() });
    }
    setApproverDialogOpen(false);
  };

  const handleDeleteApprover = (id: string) => {
    removeApprover(id);
    setApproverDeleteId(null);
  };

  const openAdminCreate = () => {
    setAdminEditId(null);
    setAdminForm(defaultAdminForm);
    setAdminDialogOpen(true);
  };

  const openAdminEdit = (a: PayrollAdministrator) => {
    setAdminEditId(a.id);
    setAdminForm({ name: a.name, email: a.email, isActive: a.isActive });
    setAdminDialogOpen(true);
  };

  const handleSaveAdmin = () => {
    if (!adminForm.name.trim() || !adminForm.email.trim()) return;
    if (adminEditId) {
      updateAdministrator(adminEditId, adminForm);
    } else {
      addAdministrator({
        ...adminForm,
        userId: crypto.randomUUID(),
        permissions: ALL_PERMISSIONS.map((p) => ({ ...p, id: crypto.randomUUID(), granted: false })),
        assignedAt: new Date().toISOString().split("T")[0],
      });
    }
    setAdminDialogOpen(false);
  };

  const handleDeleteAdmin = (id: string) => {
    removeAdministrator(id);
    setAdminDeleteId(null);
  };

  const openPermDialog = (adminId: string) => {
    const admin = administrators.find((a) => a.id === adminId);
    if (!admin) return;
    setPermDialogAdminId(adminId);
    setPermDraft([...admin.permissions]);
  };

  const togglePerm = (permId: string) => {
    setPermDraft((prev) => prev.map((p) => (p.id === permId ? { ...p, granted: !p.granted } : p)));
  };

  const handleSavePermissions = () => {
    if (permDialogAdminId) {
      updateAdministratorPermissions(permDialogAdminId, permDraft);
    }
    setPermDialogAdminId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payroll Administration
          </CardTitle>
          <CardDescription>Manage payroll approvers, administrators, and their permissions (FR-212 to FR-214).</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="approvers">
            <TabsList className="mb-4">
              <TabsTrigger value="approvers">Payroll Approvers</TabsTrigger>
              <TabsTrigger value="administrators">Payroll Administrators</TabsTrigger>
            </TabsList>

            <TabsContent value="approvers" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={approverDialogOpen} onOpenChange={setApproverDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openApproverCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Approver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{approverEditId ? "Edit Approver" : "Add Approver"}</DialogTitle>
                      <DialogDescription>
                        {approverEditId ? "Update the approver details below." : "Add a new payroll approver to the approval chain."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="ap-name">Name</Label>
                        <Input
                          id="ap-name"
                          placeholder="e.g. Jane Smith"
                          value={approverForm.name}
                          onChange={(e) => setApproverForm((s) => ({ ...s, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ap-email">Email</Label>
                        <Input
                          id="ap-email"
                          type="email"
                          placeholder="e.g. jane@company.com"
                          value={approverForm.email}
                          onChange={(e) => setApproverForm((s) => ({ ...s, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ap-role">Role</Label>
                        <Input
                          id="ap-role"
                          placeholder="e.g. Finance Manager"
                          value={approverForm.role}
                          onChange={(e) => setApproverForm((s) => ({ ...s, role: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ap-level">Approval Level</Label>
                        <Input
                          id="ap-level"
                          type="number"
                          min={1}
                          value={approverForm.approvalLevel}
                          onChange={(e) => setApproverForm((s) => ({ ...s, approvalLevel: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ap-active">Active</Label>
                        <Switch
                          id="ap-active"
                          checked={approverForm.isActive}
                          onCheckedChange={(checked) => setApproverForm((s) => ({ ...s, isActive: checked }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setApproverDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveApprover} disabled={!approverForm.name.trim() || !approverForm.email.trim()}>
                        {approverEditId ? "Update" : "Add"}
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
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Approval Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No approvers configured.
                        </TableCell>
                      </TableRow>
                    ) : (
                      approvers.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.name}</TableCell>
                          <TableCell className="text-muted-foreground">{a.email}</TableCell>
                          <TableCell>{a.role}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              L{a.approvalLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={a.isActive ? "default" : "secondary"}>
                              {a.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openApproverEdit(a)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog open={approverDeleteId === a.id} onOpenChange={(open) => !open && setApproverDeleteId(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setApproverDeleteId(a.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Remove Approver</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to remove &quot;{a.name}&quot; from the approval chain?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setApproverDeleteId(null)}>Cancel</Button>
                                    <Button variant="destructive" onClick={() => handleDeleteApprover(a.id)}>Remove</Button>
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
            </TabsContent>

            <TabsContent value="administrators" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAdminCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Administrator
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{adminEditId ? "Edit Administrator" : "Add Administrator"}</DialogTitle>
                      <DialogDescription>
                        {adminEditId ? "Update the administrator details below." : "Assign a new payroll administrator."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-name">Name</Label>
                        <Input
                          id="admin-name"
                          placeholder="e.g. John Doe"
                          value={adminForm.name}
                          onChange={(e) => setAdminForm((s) => ({ ...s, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="e.g. john@company.com"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm((s) => ({ ...s, email: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="admin-active">Active</Label>
                        <Switch
                          id="admin-active"
                          checked={adminForm.isActive}
                          onCheckedChange={(checked) => setAdminForm((s) => ({ ...s, isActive: checked }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveAdmin} disabled={!adminForm.name.trim() || !adminForm.email.trim()}>
                        {adminEditId ? "Update" : "Add"}
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
                      <TableHead>Email</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {administrators.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No administrators assigned.
                        </TableCell>
                      </TableRow>
                    ) : (
                      administrators.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell className="font-medium">{ad.name}</TableCell>
                          <TableCell className="text-muted-foreground">{ad.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {ad.permissions
                                .filter((p) => p.granted)
                                .map((p) => (
                                  <Badge key={p.id} variant="secondary" className="text-xs">
                                    {p.name}
                                  </Badge>
                                ))}
                              {ad.permissions.filter((p) => p.granted).length === 0 && (
                                <span className="text-xs text-muted-foreground">No permissions</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ad.isActive ? "default" : "secondary"}>
                              {ad.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{ad.assignedAt}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openPermDialog(ad.id)}>
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openAdminEdit(ad)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog open={adminDeleteId === ad.id} onOpenChange={(open) => !open && setAdminDeleteId(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setAdminDeleteId(ad.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Remove Administrator</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to remove &quot;{ad.name}&quot; as a payroll administrator?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setAdminDeleteId(null)}>Cancel</Button>
                                    <Button variant="destructive" onClick={() => handleDeleteAdmin(ad.id)}>Remove</Button>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={permDialogAdminId !== null} onOpenChange={(open) => !open && setPermDialogAdminId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Configure payroll permissions for {administrators.find((a) => a.id === permDialogAdminId)?.name ?? ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {permDraft.map((perm) => (
              <div key={perm.id} className="flex items-start gap-3 rounded-md border p-3">
                <Checkbox
                  id={`perm-${perm.id}`}
                  checked={perm.granted}
                  onCheckedChange={() => togglePerm(perm.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={`perm-${perm.id}`} className="font-medium cursor-pointer">
                    {perm.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{perm.description}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermDialogAdminId(null)}>Cancel</Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
