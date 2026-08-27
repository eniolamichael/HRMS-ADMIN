"use client";

import { useState, useMemo } from "react";
import { useHrms } from "@/contexts/hrms-context";
import {
  OnboardingApplicant,
  OfferLetterTemplate,
  OnboardingTemplate,
  OnboardingTask,
  ConfirmationPolicy,
} from "@/types/hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  CheckCircle2,
  Mail,
  LogIn,
  UserPlus,
  Copy,
  Send,
  FileText,
  Users,
  Clock,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";

// ─────────────── Types ───────────────

type OfferStatusFilter = "all" | OnboardingApplicant["offerLetterStatus"];
type OnboardStatusFilter = "all" | OnboardingApplicant["onboardStatus"];

// ─────────────── Defaults ───────────────

const defaultApplicantForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  departmentId: "",
  departmentName: "",
};

const defaultOfferTemplateForm = {
  name: "",
  description: "",
  subject: "",
  body: "",
  isCompulsoryAcceptance: false,
  isActive: true,
};

const defaultOnboardingTemplateForm = {
  name: "",
  description: "",
  tasks: [] as OnboardingTask[],
  isActive: true,
};

const defaultTaskForm: OnboardingTask = {
  id: "",
  name: "",
  description: "",
  assigneeRole: "",
  dueDays: 0,
  isRequired: true,
  order: 0,
};

const defaultConfirmationForm = {
  name: "",
  description: "",
  durationDays: 90,
  confirmationWorkflowId: "",
  isActive: true,
};

// ─────────────── Helpers ───────────────

const offerBadgeVariant = (
  status: OnboardingApplicant["offerLetterStatus"]
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "accepted":
      return "default";
    case "sent":
      return "secondary";
    case "declined":
      return "destructive";
    default:
      return "outline";
  }
};

const onboardBadgeVariant = (
  status: OnboardingApplicant["onboardStatus"]
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    case "day_one":
      return "outline";
    default:
      return "outline";
  }
};

const statusLabel = (s: string) =>
  s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ─────────────── Component ───────────────

export default function Onboarding() {
  const {
    employees,
    departments,
    onboardingApplicants,
    addOnboardingApplicant,
    updateOnboardingApplicant,
    deleteOnboardingApplicant,
    offerLetterTemplates,
    addOfferLetterTemplate,
    updateOfferLetterTemplate,
    deleteOfferLetterTemplate,
    onboardingTemplates,
    addOnboardingTemplate,
    updateOnboardingTemplate,
    deleteOnboardingTemplate,
    confirmationPolicies,
    addConfirmationPolicy,
    updateConfirmationPolicy,
    deleteConfirmationPolicy,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("applicants");

  // ── Applicant state ──
  const [applicantSearch, setApplicantSearch] = useState("");
  const [offerStatusFilter, setOfferStatusFilter] = useState<OfferStatusFilter>("all");
  const [applicantDialogOpen, setApplicantDialogOpen] = useState(false);
  const [editingApplicantId, setEditingApplicantId] = useState<string | null>(null);
  const [applicantForm, setApplicantForm] = useState(defaultApplicantForm);
  const [viewApplicant, setViewApplicant] = useState<OnboardingApplicant | null>(null);
  const [deleteApplicantId, setDeleteApplicantId] = useState<string | null>(null);

  // ── Offer template state ──
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState(defaultOfferTemplateForm);
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);

  // ── Onboarding template state ──
  const [onboardTemplateDialogOpen, setOnboardTemplateDialogOpen] = useState(false);
  const [editingOnboardId, setEditingOnboardId] = useState<string | null>(null);
  const [onboardForm, setOnboardForm] = useState(defaultOnboardingTemplateForm);
  const [deleteOnboardId, setDeleteOnboardId] = useState<string | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<OnboardingTask>(defaultTaskForm);
  const [editingTaskIdx, setEditingTaskIdx] = useState<number | null>(null);

  // ── Confirmation policy state ──
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingConfirmId, setEditingConfirmId] = useState<string | null>(null);
  const [confirmForm, setConfirmForm] = useState(defaultConfirmationForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ─────────────── Filtered data ───────────────

  const filteredApplicants = useMemo(() => {
    let list = [...onboardingApplicants];
    if (applicantSearch) {
      const q = applicantSearch.toLowerCase();
      list = list.filter(
        (a) =>
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.position.toLowerCase().includes(q)
      );
    }
    if (offerStatusFilter !== "all") {
      list = list.filter((a) => a.offerLetterStatus === offerStatusFilter);
    }
    return list;
  }, [onboardingApplicants, applicantSearch, offerStatusFilter]);

  // ─────────────── Applicant handlers ───────────────

  const openAddApplicant = () => {
    setEditingApplicantId(null);
    setApplicantForm(defaultApplicantForm);
    setApplicantDialogOpen(true);
  };

  const openEditApplicant = (a: OnboardingApplicant) => {
    setEditingApplicantId(a.id);
    setApplicantForm({
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email,
      phone: a.phone,
      position: a.position,
      departmentId: a.departmentId,
      departmentName: a.departmentName,
    });
    setApplicantDialogOpen(true);
  };

  const saveApplicant = () => {
    const data = {
      ...applicantForm,
      offerLetterStatus: "pending" as const,
      onboardStatus: "pre_arrival" as const,
      loginSent: false,
      createdAt: new Date().toISOString(),
    };
    if (editingApplicantId) {
      updateOnboardingApplicant(editingApplicantId, data);
    } else {
      addOnboardingApplicant(data);
    }
    setApplicantDialogOpen(false);
  };

  const sendOfferLetter = (id: string) => {
    updateOnboardingApplicant(id, { offerLetterStatus: "sent" });
  };

  const acceptOffer = (id: string) => {
    updateOnboardingApplicant(id, { offerLetterStatus: "accepted" });
  };

  const sendLoginDetails = (id: string) => {
    updateOnboardingApplicant(id, { loginSent: true, onboardStatus: "day_one" });
  };

  const switchToEmployee = (id: string) => {
    updateOnboardingApplicant(id, { onboardStatus: "completed" });
  };

  // ─────────────── Offer template handlers ───────────────

  const openAddOffer = () => {
    setEditingOfferId(null);
    setOfferForm(defaultOfferTemplateForm);
    setOfferDialogOpen(true);
  };

  const openEditOffer = (t: OfferLetterTemplate) => {
    setEditingOfferId(t.id);
    setOfferForm({
      name: t.name,
      description: t.description,
      subject: t.subject,
      body: t.body,
      isCompulsoryAcceptance: t.isCompulsoryAcceptance,
      isActive: t.isActive,
    });
    setOfferDialogOpen(true);
  };

  const saveOffer = () => {
    const data = { ...offerForm, createdAt: new Date().toISOString() };
    if (editingOfferId) {
      updateOfferLetterTemplate(editingOfferId, data);
    } else {
      addOfferLetterTemplate(data);
    }
    setOfferDialogOpen(false);
  };

  const duplicateOffer = (t: OfferLetterTemplate) => {
    addOfferLetterTemplate({
      name: `${t.name} (Copy)`,
      description: t.description,
      subject: t.subject,
      body: t.body,
      isCompulsoryAcceptance: t.isCompulsoryAcceptance,
      isActive: false,
      createdAt: new Date().toISOString(),
    });
  };

  // ─────────────── Onboarding template handlers ───────────────

  const openAddOnboardTemplate = () => {
    setEditingOnboardId(null);
    setOnboardForm(defaultOnboardingTemplateForm);
    setOnboardTemplateDialogOpen(true);
  };

  const openEditOnboardTemplate = (t: OnboardingTemplate) => {
    setEditingOnboardId(t.id);
    setOnboardForm({
      name: t.name,
      description: t.description,
      tasks: [...t.tasks],
      isActive: t.isActive,
    });
    setOnboardTemplateDialogOpen(true);
  };

  const saveOnboardTemplate = () => {
    const data = { ...onboardForm, createdAt: new Date().toISOString() };
    if (editingOnboardId) {
      updateOnboardingTemplate(editingOnboardId, data);
    } else {
      addOnboardingTemplate(data);
    }
    setOnboardTemplateDialogOpen(false);
  };

  const openAddTask = () => {
    setEditingTaskIdx(null);
    setTaskForm({ ...defaultTaskForm, id: generateId(), order: onboardForm.tasks.length });
    setTaskDialogOpen(true);
  };

  const openEditTask = (idx: number) => {
    setEditingTaskIdx(idx);
    setTaskForm({ ...onboardForm.tasks[idx] });
    setTaskDialogOpen(true);
  };

  const saveTask = () => {
    const tasks = [...onboardForm.tasks];
    if (editingTaskIdx !== null) {
      tasks[editingTaskIdx] = taskForm;
    } else {
      tasks.push(taskForm);
    }
    setOnboardForm((prev) => ({ ...prev, tasks }));
    setTaskDialogOpen(false);
  };

  const removeTask = (idx: number) => {
    const tasks = onboardForm.tasks.filter((_, i) => i !== idx);
    setOnboardForm((prev) => ({ ...prev, tasks }));
  };

  // ─────────────── Confirmation policy handlers ───────────────

  const openAddConfirm = () => {
    setEditingConfirmId(null);
    setConfirmForm(defaultConfirmationForm);
    setConfirmDialogOpen(true);
  };

  const openEditConfirm = (p: ConfirmationPolicy) => {
    setEditingConfirmId(p.id);
    setConfirmForm({
      name: p.name,
      description: p.description,
      durationDays: p.durationDays,
      confirmationWorkflowId: p.confirmationWorkflowId ?? "",
      isActive: p.isActive,
    });
    setConfirmDialogOpen(true);
  };

  const saveConfirm = () => {
    const data = { ...confirmForm, createdAt: new Date().toISOString() };
    if (editingConfirmId) {
      updateConfirmationPolicy(editingConfirmId, data);
    } else {
      addConfirmationPolicy(data);
    }
    setConfirmDialogOpen(false);
  };

  // ─────────────── Render ───────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Onboarding &amp; Confirmation
        </h2>
        <p className="text-muted-foreground">
          Manage applicant onboarding, offer letters, templates and confirmation policies.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="applicants">
            <UserPlus className="mr-1 h-4 w-4" /> Onboarding Applicants
          </TabsTrigger>
          <TabsTrigger value="offer-templates">
            <FileText className="mr-1 h-4 w-4" /> Offer Letter Templates
          </TabsTrigger>
          <TabsTrigger value="onboard-templates">
            <ClipboardList className="mr-1 h-4 w-4" /> Onboarding Templates
          </TabsTrigger>
          <TabsTrigger value="confirmation">
            <CheckCircle2 className="mr-1 h-4 w-4" /> Confirmation Policies
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB 1: Applicants ═══════════ */}
        <TabsContent value="applicants">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Onboarding Applicants</CardTitle>
              <Dialog open={applicantDialogOpen} onOpenChange={setApplicantDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openAddApplicant}>
                    <Plus className="mr-1 h-4 w-4" /> Add Applicant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingApplicantId ? "Edit Applicant" : "Add Applicant"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in applicant details to begin the onboarding process.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={applicantForm.firstName}
                          onChange={(e) =>
                            setApplicantForm((p) => ({ ...p, firstName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={applicantForm.lastName}
                          onChange={(e) =>
                            setApplicantForm((p) => ({ ...p, lastName: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={applicantForm.email}
                          onChange={(e) =>
                            setApplicantForm((p) => ({ ...p, email: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={applicantForm.phone}
                          onChange={(e) =>
                            setApplicantForm((p) => ({ ...p, phone: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        value={applicantForm.position}
                        onChange={(e) =>
                          setApplicantForm((p) => ({ ...p, position: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select
                        value={applicantForm.departmentId}
                        onValueChange={(v) => {
                          const dept = departments.find((d) => d.id === v);
                          setApplicantForm((p) => ({
                            ...p,
                            departmentId: v,
                            departmentName: dept?.name ?? "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setApplicantDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveApplicant}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applicants..."
                    className="pl-8"
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={offerStatusFilter}
                  onValueChange={(v) => setOfferStatusFilter(v as OfferStatusFilter)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Offer Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Offer Status</TableHead>
                      <TableHead>Onboard Status</TableHead>
                      <TableHead>Login Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No applicants found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplicants.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">
                            {a.firstName} {a.lastName}
                          </TableCell>
                          <TableCell>{a.email}</TableCell>
                          <TableCell>{a.position}</TableCell>
                          <TableCell>{a.departmentName}</TableCell>
                          <TableCell>
                            <Badge variant={offerBadgeVariant(a.offerLetterStatus)}>
                              {statusLabel(a.offerLetterStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={onboardBadgeVariant(a.onboardStatus)}>
                              {statusLabel(a.onboardStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {a.loginSent ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setViewApplicant(a)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditApplicant(a)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteApplicantId(a.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              {a.offerLetterStatus === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Send Offer Letter"
                                  onClick={() => sendOfferLetter(a.id)}
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {a.offerLetterStatus === "sent" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Accept Offer"
                                  onClick={() => acceptOffer(a.id)}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {a.offerLetterStatus === "accepted" && !a.loginSent && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Send Login Details"
                                  onClick={() => sendLoginDetails(a.id)}
                                >
                                  <LogIn className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {a.offerLetterStatus === "accepted" && a.loginSent && a.onboardStatus !== "completed" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Switch to Employee"
                                  onClick={() => switchToEmployee(a.id)}
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                </Button>
                              )}
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

          {/* View Details Dialog */}
          <Dialog open={!!viewApplicant} onOpenChange={() => setViewApplicant(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Applicant Details</DialogTitle>
              </DialogHeader>
              {viewApplicant && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Name</span>
                      <p className="font-medium">
                        {viewApplicant.firstName} {viewApplicant.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email</span>
                      <p className="font-medium">{viewApplicant.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone</span>
                      <p className="font-medium">{viewApplicant.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Position</span>
                      <p className="font-medium">{viewApplicant.position}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department</span>
                      <p className="font-medium">{viewApplicant.departmentName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Offer Status</span>
                      <p>
                        <Badge variant={offerBadgeVariant(viewApplicant.offerLetterStatus)}>
                          {statusLabel(viewApplicant.offerLetterStatus)}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Onboard Status</span>
                      <p>
                        <Badge variant={onboardBadgeVariant(viewApplicant.onboardStatus)}>
                          {statusLabel(viewApplicant.onboardStatus)}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Login Sent</span>
                      <p className="font-medium">{viewApplicant.loginSent ? "Yes" : "No"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-medium">{formatDate(viewApplicant.createdAt)}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <Dialog open={!!deleteApplicantId} onOpenChange={() => setDeleteApplicantId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Applicant</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this applicant? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteApplicantId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (deleteApplicantId) deleteOnboardingApplicant(deleteApplicantId);
                    setDeleteApplicantId(null);
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════ TAB 2: Offer Letter Templates ═══════════ */}
        <TabsContent value="offer-templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Offer Letter Templates</CardTitle>
              <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openAddOffer}>
                    <Plus className="mr-1 h-4 w-4" /> Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOfferId ? "Edit Offer Template" : "Create Offer Template"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={offerForm.name}
                          onChange={(e) =>
                            setOfferForm((p) => ({ ...p, name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={offerForm.subject}
                          onChange={(e) =>
                            setOfferForm((p) => ({ ...p, subject: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={offerForm.description}
                        onChange={(e) =>
                          setOfferForm((p) => ({ ...p, description: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Body</Label>
                      <Textarea
                        rows={10}
                        value={offerForm.body}
                        onChange={(e) =>
                          setOfferForm((p) => ({ ...p, body: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={offerForm.isCompulsoryAcceptance}
                          onCheckedChange={(v) =>
                            setOfferForm((p) => ({ ...p, isCompulsoryAcceptance: v }))
                          }
                        />
                        <Label>Compulsory Acceptance</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={offerForm.isActive}
                          onCheckedChange={(v) =>
                            setOfferForm((p) => ({ ...p, isActive: v }))
                          }
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOfferDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveOffer}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Compulsory Accept</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offerLetterTemplates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No templates yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      offerLetterTemplates.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                          <TableCell>{t.subject}</TableCell>
                          <TableCell>
                            {t.isCompulsoryAcceptance ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.isActive ? "default" : "secondary"}>
                              {t.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditOffer(t)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => duplicateOffer(t)}
                                title="Duplicate"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteOfferId(t.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Delete Offer Template Confirmation */}
              <Dialog open={!!deleteOfferId} onOpenChange={() => setDeleteOfferId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Template</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this offer letter template?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOfferId(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (deleteOfferId) deleteOfferLetterTemplate(deleteOfferId);
                        setDeleteOfferId(null);
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB 3: Onboarding Templates ═══════════ */}
        <TabsContent value="onboard-templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Onboarding Templates</CardTitle>
              <Dialog open={onboardTemplateDialogOpen} onOpenChange={setOnboardTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openAddOnboardTemplate}>
                    <Plus className="mr-1 h-4 w-4" /> Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOnboardId ? "Edit Onboarding Template" : "Create Onboarding Template"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={onboardForm.name}
                        onChange={(e) =>
                          setOnboardForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={onboardForm.description}
                        onChange={(e) =>
                          setOnboardForm((p) => ({ ...p, description: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={onboardForm.isActive}
                        onCheckedChange={(v) =>
                          setOnboardForm((p) => ({ ...p, isActive: v }))
                        }
                      />
                      <Label>Active</Label>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Tasks</Label>
                      <Button size="sm" variant="outline" onClick={openAddTask}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Task
                      </Button>
                    </div>

                    {onboardForm.tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tasks added yet.
                      </p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Assignee Role</TableHead>
                              <TableHead>Due Days</TableHead>
                              <TableHead>Required</TableHead>
                              <TableHead className="w-[100px]" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {onboardForm.tasks.map((task, idx) => (
                              <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.name}</TableCell>
                                <TableCell>{task.assigneeRole}</TableCell>
                                <TableCell>{task.dueDays}</TableCell>
                                <TableCell>
                                  {task.isRequired ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => openEditTask(idx)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => removeTask(idx)}
                                    >
                                      <Trash2 className="h-3 w-3" />
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
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOnboardTemplateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveOnboardTemplate}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onboardingTemplates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No onboarding templates yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      onboardingTemplates.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{t.tasks.length} tasks</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.isActive ? "default" : "secondary"}>
                              {t.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditOnboardTemplate(t)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteOnboardId(t.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Task Dialog */}
              <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTaskIdx !== null ? "Edit Task" : "Add Task"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={taskForm.name}
                        onChange={(e) =>
                          setTaskForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={taskForm.description}
                        onChange={(e) =>
                          setTaskForm((p) => ({ ...p, description: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Assignee Role</Label>
                        <Input
                          value={taskForm.assigneeRole}
                          onChange={(e) =>
                            setTaskForm((p) => ({ ...p, assigneeRole: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Days</Label>
                        <Input
                          type="number"
                          min={0}
                          value={taskForm.dueDays}
                          onChange={(e) =>
                            setTaskForm((p) => ({
                              ...p,
                              dueDays: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={taskForm.isRequired}
                        onCheckedChange={(v) =>
                          setTaskForm((p) => ({ ...p, isRequired: v }))
                        }
                      />
                      <Label>Required</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveTask}>Save Task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Onboarding Template */}
              <Dialog open={!!deleteOnboardId} onOpenChange={() => setDeleteOnboardId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Template</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this onboarding template?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOnboardId(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (deleteOnboardId) deleteOnboardingTemplate(deleteOnboardId);
                        setDeleteOnboardId(null);
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB 4: Confirmation Policies ═══════════ */}
        <TabsContent value="confirmation">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Confirmation Policies</CardTitle>
              <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openAddConfirm}>
                    <Plus className="mr-1 h-4 w-4" /> Create Policy
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingConfirmId ? "Edit Confirmation Policy" : "Create Confirmation Policy"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={confirmForm.name}
                        onChange={(e) =>
                          setConfirmForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={confirmForm.description}
                        onChange={(e) =>
                          setConfirmForm((p) => ({ ...p, description: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (Days)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={confirmForm.durationDays}
                        onChange={(e) =>
                          setConfirmForm((p) => ({
                            ...p,
                            durationDays: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={confirmForm.isActive}
                        onCheckedChange={(v) =>
                          setConfirmForm((p) => ({ ...p, isActive: v }))
                        }
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveConfirm}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Duration (Days)</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmationPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No confirmation policies yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      confirmationPolicies.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{p.description}</TableCell>
                          <TableCell>{p.durationDays}</TableCell>
                          <TableCell>
                            <Badge variant={p.isActive ? "default" : "secondary"}>
                              {p.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditConfirm(p)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteConfirmId(p.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Users className="mr-1 h-4 w-4" /> Add to Employee
                </Button>
                <Button variant="outline" size="sm">
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Process Confirmation
                </Button>
              </div>

              {/* Delete Confirmation Policy */}
              <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Policy</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this confirmation policy?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (deleteConfirmId) deleteConfirmationPolicy(deleteConfirmId);
                        setDeleteConfirmId(null);
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
