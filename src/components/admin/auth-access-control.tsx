"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { AdminUser, MFAConfig } from "@/types/hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Shield,
  Key,
  UserCheck,
  UserX,
  Mail,
  Smartphone,
  AppWindow,
  Info,
  Check,
  X,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

const defaultAdminForm = {
  name: "",
  email: "",
  role: "administrator" as const,
  status: "invited" as AdminUser["status"],
  mfaEnabled: false,
};

const defaultMFAConfig: MFAConfig = {
  method: "authenticator",
  isEnabled: false,
};

export default function AuthAccessControl() {
  const { adminUsers, addAdminUser, updateAdminUser, deleteAdminUser, mfaConfig, updateMfaConfig } = useHrms();

  const [activeTab, setActiveTab] = useState("admin-users");
  const [search, setSearch] = useState("");
  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [mfaForm, setMfaForm] = useState<MFAConfig>(mfaConfig ?? defaultMFAConfig);

  const filtered = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingId(null);
    setAdminForm(defaultAdminForm);
    setDialogOpen(true);
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingId(user.id);
    setAdminForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!adminForm.name.trim() || !adminForm.email.trim()) return;

    if (editingId) {
      updateAdminUser(editingId, {
        name: adminForm.name,
        email: adminForm.email,
        status: adminForm.status,
        mfaEnabled: adminForm.mfaEnabled,
      });
    } else {
      addAdminUser({
        ...adminForm,
        userId: generateId(),
        invitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteAdminUser(id);
    setDeleteConfirmId(null);
  };

  const handleSaveMFA = () => {
    updateMfaConfig(mfaForm);
  };

  const statusColor = (status: AdminUser["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-700 border-red-200";
      case "invited":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="admin-users">Admin Users</TabsTrigger>
          <TabsTrigger value="security-settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="admin-users" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Manage administrator accounts and their access levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search admins..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Admin
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>MFA Enabled</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No admin users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${statusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.mfaEnabled ? (
                              <span className="inline-flex items-center text-green-600">
                                <Check className="h-4 w-4" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-500">
                                <X className="h-4 w-4" />
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.lastLogin ? formatDate(user.lastLogin) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog open={deleteConfirmId === user.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(user.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Admin User</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete &quot;{user.name}&quot;? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDelete(user.id)}>
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
        </TabsContent>

        <TabsContent value="security-settings" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  MFA Configuration
                </CardTitle>
                <CardDescription>Configure multi-factor authentication settings for all admin users.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable MFA Globally</Label>
                    <p className="text-sm text-muted-foreground">
                      Require all admin users to set up MFA on login.
                    </p>
                  </div>
                  <Switch
                    checked={mfaForm.isEnabled}
                    onCheckedChange={(checked) => setMfaForm((s) => ({ ...s, isEnabled: checked }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Default MFA Method</Label>
                  <Select
                    value={mfaForm.method}
                    onValueChange={(v) =>
                      setMfaForm((s) => ({ ...s, method: v as MFAConfig["method"] }))
                    }
                    disabled={!mfaForm.isEnabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">
                        <span className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          SMS
                        </span>
                      </SelectItem>
                      <SelectItem value="email">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </span>
                      </SelectItem>
                      <SelectItem value="authenticator">
                        <span className="flex items-center gap-2">
                          <AppWindow className="h-4 w-4" />
                          Authenticator App
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveMFA}>
                  Save Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role-Based Access Control (RBAC)
                </CardTitle>
                <CardDescription>Understanding how access is managed across the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                    <div className="text-sm space-y-2">
                      <p>
                        <strong>Administrator:</strong> Full system access. Can manage all modules, configure settings, invite other admins, and perform all CRUD operations.
                      </p>
                      <p>
                        <strong>MFA Enforcement:</strong> When enabled globally, all admin users are required to set up multi-factor authentication. Users who haven&apos;t configured MFA will be prompted on their next login.
                      </p>
                      <p>
                        <strong>Session Security:</strong> Admin sessions are automatically invalidated after 30 minutes of inactivity. All admin actions are logged in the audit trail for compliance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4 space-y-2">
                  <h4 className="font-medium text-sm">Access Levels</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-green-500" />
                      <span><strong>Active</strong> — Full access to all admin features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <UserX className="h-3.5 w-3.5 text-red-500" />
                      <span><strong>Inactive</strong> — Account suspended, cannot log in</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-yellow-500" />
                      <span><strong>Invited</strong> — Pending acceptance, no access yet</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Admin User" : "Invite Admin User"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the admin user details below."
                : "Send an invitation to a new administrator."}
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
                placeholder="e.g. john@example.com"
                value={adminForm.email}
                onChange={(e) => setAdminForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value="Administrator" disabled />
            </div>
            {editingId && (
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <Select
                  value={adminForm.status}
                  onValueChange={(v) => setAdminForm((s) => ({ ...s, status: v as AdminUser["status"] }))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!adminForm.name.trim() || !adminForm.email.trim()}>
              {editingId ? "Update" : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
