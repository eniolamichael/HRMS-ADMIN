"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import {
  AppraisalObjective,
  AppraisalCycle,
  AppraisalPeriod,
  BSCConfig,
  OKRConfig,
  CoreValue,
  AppraisalWorkflow,
  AppraisalWorkflowStage,
  Appraisal,
} from "@/types/hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Play,
  Upload,
  Download,
  Route,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

export default function Performance() {
  const {
    objectives,
    addObjective,
    updateObjective,
    deleteObjective,
    appraisalCycles,
    addAppraisalCycle,
    updateAppraisalCycle,
    deleteAppraisalCycle,
    appraisalPeriods,
    addAppraisalPeriod,
    updateAppraisalPeriod,
    deleteAppraisalPeriod,
    bscConfig,
    updateBscConfig,
    okrConfig,
    updateOkrConfig,
    coreValues,
    addCoreValue,
    updateCoreValue,
    deleteCoreValue,
    appraisalWorkflows,
    addAppraisalWorkflow,
    updateAppraisalWorkflow,
    deleteAppraisalWorkflow,
    appraisals,
    updateAppraisal,
    departments,
    divisions,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("objectives");
  const [objSubTab, setObjSubTab] = useState("company");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<
    "objective" | "cycle" | "period" | "coreValue" | "workflow" | null
  >(null);

  // Objective state
  const [objDialogOpen, setObjDialogOpen] = useState(false);
  const [editingObjId, setEditingObjId] = useState<string | null>(null);
  const [objForm, setObjForm] = useState({
    level: "company" as AppraisalObjective["level"],
    name: "",
    description: "",
    targetValue: "",
    weight: 0,
    divisionId: "",
    departmentId: "",
  });

  // Cycle state
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [cycleForm, setCycleForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  // Period state
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [periodForm, setPeriodForm] = useState({
    cycleId: "",
    name: "",
    startDate: "",
    endDate: "",
    status: "upcoming" as AppraisalPeriod["status"],
  });

  // Core Value state
  const [cvDialogOpen, setCvDialogOpen] = useState(false);
  const [editingCvId, setEditingCvId] = useState<string | null>(null);
  const [cvForm, setCvForm] = useState({
    name: "",
    description: "",
    weight: 0,
    isActive: true,
  });

  // Workflow state
  const [wfDialogOpen, setWfDialogOpen] = useState(false);
  const [editingWfId, setEditingWfId] = useState<string | null>(null);
  const [wfForm, setWfForm] = useState({
    name: "",
    description: "",
    stages: [] as { id: string; name: string; type: AppraisalWorkflowStage["type"]; reviewers: string[] }[],
    isActive: true,
  });

  // Appraisal state
  const [viewAppraisalOpen, setViewAppraisalOpen] = useState(false);
  const [viewingAppraisal, setViewingAppraisal] = useState<Appraisal | null>(null);
  const [uploadScoresOpen, setUploadScoresOpen] = useState(false);
  const [rerouteDialogOpen, setRerouteDialogOpen] = useState(false);
  const [rerouteAppraisalId, setRerouteAppraisalId] = useState<string | null>(null);
  const [rerouteReviewer, setRerouteReviewer] = useState("");

  // BSC local state
  const [localBsc, setLocalBsc] = useState<BSCConfig>(bscConfig);
  // OKR local state
  const [localOkr, setLocalOkr] = useState<OKRConfig>(okrConfig);

  // ─── OBJECTIVES ───
  const companyObjectives = objectives.filter((o) => o.level === "company");
  const divisionObjectives = objectives.filter((o) => o.level === "division");
  const departmentObjectives = objectives.filter((o) => o.level === "department");

  const currentObjectives =
    objSubTab === "company"
      ? companyObjectives
      : objSubTab === "division"
      ? divisionObjectives
      : departmentObjectives;

  const openCreateObj = () => {
    setEditingObjId(null);
    setObjForm({ level: objSubTab as AppraisalObjective["level"], name: "", description: "", targetValue: "", weight: 0, divisionId: "", departmentId: "" });
    setObjDialogOpen(true);
  };

  const openEditObj = (o: AppraisalObjective) => {
    setEditingObjId(o.id);
    setObjForm({
      level: o.level,
      name: o.name,
      description: o.description,
      targetValue: o.targetValue ?? "",
      weight: o.weight ?? 0,
      divisionId: o.divisionId ?? "",
      departmentId: o.departmentId ?? "",
    });
    setObjDialogOpen(true);
  };

  const handleSaveObj = () => {
    if (!objForm.name.trim()) return;
    if (editingObjId) {
      updateObjective(editingObjId, objForm);
    } else {
      addObjective({ ...objForm, createdAt: new Date().toISOString() });
    }
    setObjDialogOpen(false);
  };

  // ─── CYCLES ───
  const openCreateCycle = () => {
    setEditingCycleId(null);
    setCycleForm({ name: "", description: "", startDate: "", endDate: "", isActive: true });
    setCycleDialogOpen(true);
  };

  const openEditCycle = (c: AppraisalCycle) => {
    setEditingCycleId(c.id);
    setCycleForm({ name: c.name, description: c.description, startDate: c.startDate, endDate: c.endDate, isActive: c.isActive });
    setCycleDialogOpen(true);
  };

  const handleSaveCycle = () => {
    if (!cycleForm.name.trim()) return;
    if (editingCycleId) {
      updateAppraisalCycle(editingCycleId, cycleForm);
    } else {
      addAppraisalCycle({ ...cycleForm, createdAt: new Date().toISOString() });
    }
    setCycleDialogOpen(false);
  };

  // ─── PERIODS ───
  const openCreatePeriod = () => {
    setEditingPeriodId(null);
    setPeriodForm({ cycleId: "", name: "", startDate: "", endDate: "", status: "upcoming" });
    setPeriodDialogOpen(true);
  };

  const openEditPeriod = (p: AppraisalPeriod) => {
    setEditingPeriodId(p.id);
    setPeriodForm({ cycleId: p.cycleId, name: p.name, startDate: p.startDate, endDate: p.endDate, status: p.status });
    setPeriodDialogOpen(true);
  };

  const handleSavePeriod = () => {
    if (!periodForm.name.trim()) return;
    const cycle = appraisalCycles.find((c) => c.id === periodForm.cycleId);
    if (editingPeriodId) {
      updateAppraisalPeriod(editingPeriodId, { ...periodForm, cycleName: cycle?.name ?? "" });
    } else {
      addAppraisalPeriod({ ...periodForm, cycleName: cycle?.name ?? "" });
    }
    setPeriodDialogOpen(false);
  };

  // ─── BSC / OKR ───
  const bscTotal = localBsc.weightFinancial + localBsc.weightCustomer + localBsc.weightInternalProcess + localBsc.weightLearningGrowth;

  const handleSaveBsc = () => {
    updateBscConfig(localBsc);
  };

  const handleSaveOkr = () => {
    updateOkrConfig(localOkr);
  };

  // ─── CORE VALUES ───
  const openCreateCv = () => {
    setEditingCvId(null);
    setCvForm({ name: "", description: "", weight: 0, isActive: true });
    setCvDialogOpen(true);
  };

  const openEditCv = (v: CoreValue) => {
    setEditingCvId(v.id);
    setCvForm({ name: v.name, description: v.description, weight: v.weight, isActive: v.isActive });
    setCvDialogOpen(true);
  };

  const handleSaveCv = () => {
    if (!cvForm.name.trim()) return;
    if (editingCvId) {
      updateCoreValue(editingCvId, cvForm);
    } else {
      addCoreValue(cvForm);
    }
    setCvDialogOpen(false);
  };

  // ─── WORKFLOWS ───
  const openCreateWf = () => {
    setEditingWfId(null);
    setWfForm({ name: "", description: "", stages: [], isActive: true });
    setWfDialogOpen(true);
  };

  const openEditWf = (w: AppraisalWorkflow) => {
    setEditingWfId(w.id);
    setWfForm({
      name: w.name,
      description: w.description,
      stages: w.stages.map((s) => ({ id: s.id, name: s.name, type: s.type, reviewers: s.reviewers })),
      isActive: w.isActive,
    });
    setWfDialogOpen(true);
  };

  const addWfStage = () => {
    setWfForm((prev) => ({
      ...prev,
      stages: [...prev.stages, { id: generateId(), name: "", type: "self_assessment", reviewers: [] }],
    }));
  };

  const removeWfStage = (stageId: string) => {
    setWfForm((prev) => ({ ...prev, stages: prev.stages.filter((s) => s.id !== stageId) }));
  };

  const moveWfStage = (stageId: string, direction: "up" | "down") => {
    setWfForm((prev) => {
      const idx = prev.stages.findIndex((s) => s.id === stageId);
      if (idx === -1) return prev;
      const newStages = [...prev.stages];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newStages.length) return prev;
      [newStages[idx], newStages[swapIdx]] = [newStages[swapIdx], newStages[idx]];
      return { ...prev, stages: newStages };
    });
  };

  const handleSaveWf = () => {
    if (!wfForm.name.trim()) return;
    if (editingWfId) {
      updateAppraisalWorkflow(editingWfId, {
        ...wfForm,
        stages: wfForm.stages.map((s, i) => ({ ...s, order: i + 1 })),
      });
    } else {
      addAppraisalWorkflow({
        ...wfForm,
        stages: wfForm.stages.map((s, i) => ({ ...s, order: i + 1 })),
        createdAt: new Date().toISOString(),
      });
    }
    setWfDialogOpen(false);
  };

  // ─── APPRAISALS ───
  const filteredAppraisals = appraisals.filter((a) => {
    const matchSearch =
      a.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      a.departmentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const appraisalStatusColor = (s: Appraisal["status"]) => {
    switch (s) {
      case "not_started":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "submitted":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "under_review":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const appraisalStatusLabel = (s: Appraisal["status"]) => {
    switch (s) {
      case "not_started": return "Not Started";
      case "in_progress": return "In Progress";
      case "submitted": return "Submitted";
      case "under_review": return "Under Review";
      case "completed": return "Completed";
    }
  };

  const handleStartAppraisal = (id: string) => {
    updateAppraisal(id, { status: "in_progress" });
  };

  const handleReroute = () => {
    if (!rerouteAppraisalId || !rerouteReviewer.trim()) return;
    updateAppraisal(rerouteAppraisalId, {
      scores: [
        ...(appraisals.find((a) => a.id === rerouteAppraisalId)?.scores ?? []),
        {
          id: generateId(),
          stageId: "",
          stageName: "Rerouted",
          reviewerId: rerouteReviewer,
          reviewerName: rerouteReviewer,
        },
      ],
    });
    setRerouteDialogOpen(false);
    setRerouteAppraisalId(null);
    setRerouteReviewer("");
  };

  // ─── DELETE ───
  const confirmDelete = (id: string, type: "objective" | "cycle" | "period" | "coreValue" | "workflow") => {
    setDeleteConfirmId(id);
    setDeleteType(type);
  };

  const handleDelete = () => {
    if (!deleteConfirmId || !deleteType) return;
    switch (deleteType) {
      case "objective":
        deleteObjective(deleteConfirmId);
        break;
      case "cycle":
        deleteAppraisalCycle(deleteConfirmId);
        break;
      case "period":
        deleteAppraisalPeriod(deleteConfirmId);
        break;
      case "coreValue":
        deleteCoreValue(deleteConfirmId);
        break;
      case "workflow":
        deleteAppraisalWorkflow(deleteConfirmId);
        break;
    }
    setDeleteConfirmId(null);
    setDeleteType(null);
  };

  const stageTypeLabel = (t: AppraisalWorkflowStage["type"]) => {
    switch (t) {
      case "self_assessment": return "Self Assessment";
      case "manager_review": return "Manager Review";
      case "countersign": return "Countersign";
      case "final_review": return "Final Review";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="cycles">Appraisal Cycles & Periods</TabsTrigger>
          <TabsTrigger value="configuration">Appraisal Configuration</TabsTrigger>
          <TabsTrigger value="workflows">Appraisal Workflows</TabsTrigger>
          <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB 1: OBJECTIVES ═══════════ */}
        <TabsContent value="objectives" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Objectives</CardTitle>
                <CardDescription>Set company, division, and department-level objectives.</CardDescription>
              </div>
              <Button onClick={openCreateObj}>
                <Plus className="mr-2 h-4 w-4" />
                Add Objective
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={objSubTab} onValueChange={setObjSubTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="company">Company</TabsTrigger>
                  <TabsTrigger value="division">Division</TabsTrigger>
                  <TabsTrigger value="department">Department</TabsTrigger>
                </TabsList>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Weight</TableHead>
                        {objSubTab !== "company" && <TableHead>{objSubTab === "division" ? "Division" : "Department"}</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentObjectives.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={objSubTab === "company" ? 5 : 6} className="h-24 text-center text-muted-foreground">
                            No objectives found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentObjectives.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium">{o.name}</TableCell>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">{o.description}</TableCell>
                            <TableCell>{o.targetValue || "—"}</TableCell>
                            <TableCell>{o.weight ? `${o.weight}%` : "—"}</TableCell>
                            {objSubTab !== "company" && (
                              <TableCell className="text-muted-foreground">
                                {objSubTab === "division"
                                  ? divisions.find((d) => d.id === o.divisionId)?.name || "—"
                                  : departments.find((d) => d.id === o.departmentId)?.name || "—"}
                              </TableCell>
                            )}
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditObj(o)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => confirmDelete(o.id, "objective")}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB 2: CYCLES & PERIODS ═══════════ */}
        <TabsContent value="cycles" className="space-y-6 mt-6">
          {/* Cycles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Appraisal Cycles</CardTitle>
                <CardDescription>Define annual or periodic appraisal cycles.</CardDescription>
              </div>
              <Button onClick={openCreateCycle}>
                <Plus className="mr-2 h-4 w-4" />
                Create Cycle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appraisalCycles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No cycles found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      appraisalCycles.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">{c.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(c.startDate)} – {formatDate(c.endDate)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                              {c.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditCycle(c)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(c.id, "cycle")}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

          {/* Periods */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Appraisal Periods</CardTitle>
                <CardDescription>Define periods within appraisal cycles.</CardDescription>
              </div>
              <Button onClick={openCreatePeriod}>
                <Plus className="mr-2 h-4 w-4" />
                Create Period
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appraisalPeriods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No periods found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      appraisalPeriods.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground">{p.cycleName}</TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(p.startDate)} – {formatDate(p.endDate)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
                              p.status === "active"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : p.status === "closed"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}>
                              {p.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditPeriod(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(p.id, "period")}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

        {/* ═══════════ TAB 3: CONFIGURATION ═══════════ */}
        <TabsContent value="configuration" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* BSC Card */}
            <Card>
              <CardHeader>
                <CardTitle>Balanced Scorecard (BSC)</CardTitle>
                <CardDescription>Configure BSC weight distribution for performance scoring.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable BSC</Label>
                  <Switch
                    checked={localBsc.enabled}
                    onCheckedChange={(c) => setLocalBsc((s) => ({ ...s, enabled: c }))}
                  />
                </div>
                <Separator />
                <div className="space-y-4" style={{ opacity: localBsc.enabled ? 1 : 0.5, pointerEvents: localBsc.enabled ? "auto" : "none" }}>
                  {([
                    { key: "weightFinancial" as const, label: "Financial" },
                    { key: "weightCustomer" as const, label: "Customer" },
                    { key: "weightInternalProcess" as const, label: "Internal Process" },
                    { key: "weightLearningGrowth" as const, label: "Learning & Growth" },
                  ]).map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Label>{label}</Label>
                        <span className="font-medium">{localBsc[key]}%</span>
                      </div>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        value={localBsc[key]}
                        onChange={(e) => setLocalBsc((s) => ({ ...s, [key]: parseInt(e.target.value) }))}
                        className="h-2 w-full"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className={`font-bold ${bscTotal === 100 ? "text-green-600" : "text-destructive"}`}>
                      {bscTotal}%
                    </span>
                  </div>
                </div>
                <Button onClick={handleSaveBsc} disabled={!localBsc.enabled || bscTotal !== 100}>
                  Save BSC Settings
                </Button>
              </CardContent>
            </Card>

            {/* OKR Card */}
            <Card>
              <CardHeader>
                <CardTitle>OKR Settings</CardTitle>
                <CardDescription>Configure Objectives and Key Results limits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable OKR</Label>
                  <Switch
                    checked={localOkr.enabled}
                    onCheckedChange={(c) => setLocalOkr((s) => ({ ...s, enabled: c }))}
                  />
                </div>
                <Separator />
                <div className="space-y-4" style={{ opacity: localOkr.enabled ? 1 : 0.5, pointerEvents: localOkr.enabled ? "auto" : "none" }}>
                  <div className="space-y-2">
                    <Label>Objective Limit Per User</Label>
                    <Input
                      type="number"
                      min={1}
                      value={localOkr.objectiveLimitPerUser}
                      onChange={(e) => setLocalOkr((s) => ({ ...s, objectiveLimitPerUser: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Key Result Limit Per Objective</Label>
                    <Input
                      type="number"
                      min={1}
                      value={localOkr.keyResultLimitPerObjective}
                      onChange={(e) => setLocalOkr((s) => ({ ...s, keyResultLimitPerObjective: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveOkr} disabled={!localOkr.enabled}>
                  Save OKR Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Core Values Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Core Values</CardTitle>
                <CardDescription>Define core values used in performance appraisals.</CardDescription>
              </div>
              <Button onClick={openCreateCv}>
                <Plus className="mr-2 h-4 w-4" />
                Add Core Value
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coreValues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No core values defined.
                        </TableCell>
                      </TableRow>
                    ) : (
                      coreValues.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[250px] truncate">{v.description}</TableCell>
                          <TableCell>{v.weight}%</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${v.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                              {v.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditCv(v)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(v.id, "coreValue")}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

        {/* ═══════════ TAB 4: APPRAISAL WORKFLOWS ═══════════ */}
        <TabsContent value="workflows" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Appraisal Workflows</CardTitle>
                <CardDescription>Define the stages in your appraisal process.</CardDescription>
              </div>
              <Button onClick={openCreateWf}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Stages</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appraisalWorkflows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No workflows found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      appraisalWorkflows.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="font-medium">{w.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">{w.description}</TableCell>
                          <TableCell>{w.stages.length}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${w.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                              {w.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditWf(w)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  updateAppraisalWorkflow(w.id, { isActive: !w.isActive })
                                }
                              >
                                <Switch checked={w.isActive} className="pointer-events-none" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(w.id, "workflow")}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

        {/* ═══════════ TAB 5: APPRAISALS ═══════════ */}
        <TabsContent value="appraisals" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Appraisals</CardTitle>
                <CardDescription>Track and manage employee performance appraisals.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appraisals..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppraisals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No appraisals found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppraisals.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.employeeName}</TableCell>
                          <TableCell className="text-muted-foreground">{a.departmentName}</TableCell>
                          <TableCell>{a.periodName}</TableCell>
                          <TableCell className="text-muted-foreground">{a.workflowName}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${appraisalStatusColor(a.status)}`}>
                              {appraisalStatusLabel(a.status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(a.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {a.status === "not_started" && (
                                <Button variant="ghost" size="icon" title="Start Appraisal" onClick={() => handleStartAppraisal(a.id)}>
                                  <Play className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setViewingAppraisal(a); setViewAppraisalOpen(true); }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(a.status === "in_progress" || a.status === "submitted" || a.status === "under_review") && (
                                <Button variant="ghost" size="icon" title="Upload Scores" onClick={() => setUploadScoresOpen(true)}>
                                  <Upload className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              {a.status !== "completed" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Reroute"
                                  onClick={() => { setRerouteAppraisalId(a.id); setRerouteDialogOpen(true); }}
                                >
                                  <Route className="h-4 w-4 text-purple-600" />
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
        </TabsContent>
      </Tabs>

      {/* ═══════════ OBJECTIVE DIALOG ═══════════ */}
      <Dialog open={objDialogOpen} onOpenChange={setObjDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingObjId ? "Edit Objective" : "Create Objective"}</DialogTitle>
            <DialogDescription>Define a performance objective.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={objForm.level}
                onValueChange={(v) => setObjForm((s) => ({ ...s, level: v as AppraisalObjective["level"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="division">Division</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {objForm.level === "division" && (
              <div className="space-y-2">
                <Label>Division</Label>
                <Select value={objForm.divisionId} onValueChange={(v) => setObjForm((s) => ({ ...s, divisionId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.filter((d) => d.isActive).map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {objForm.level === "department" && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={objForm.departmentId} onValueChange={(v) => setObjForm((s) => ({ ...s, departmentId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter((d) => d.isActive).map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Increase revenue by 20%"
                value={objForm.name}
                onChange={(e) => setObjForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the objective..."
                value={objForm.description}
                onChange={(e) => setObjForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Value</Label>
                <Input
                  placeholder="e.g. 20%"
                  value={objForm.targetValue}
                  onChange={(e) => setObjForm((s) => ({ ...s, targetValue: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={objForm.weight}
                  onChange={(e) => setObjForm((s) => ({ ...s, weight: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setObjDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveObj} disabled={!objForm.name.trim()}>
              {editingObjId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ CYCLE DIALOG ═══════════ */}
      <Dialog open={cycleDialogOpen} onOpenChange={setCycleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCycleId ? "Edit Cycle" : "Create Appraisal Cycle"}</DialogTitle>
            <DialogDescription>Define the cycle details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. 2026 Annual Review"
                value={cycleForm.name}
                onChange={(e) => setCycleForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this cycle..."
                value={cycleForm.description}
                onChange={(e) => setCycleForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={cycleForm.startDate}
                  onChange={(e) => setCycleForm((s) => ({ ...s, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={cycleForm.endDate}
                  onChange={(e) => setCycleForm((s) => ({ ...s, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={cycleForm.isActive}
                onCheckedChange={(c) => setCycleForm((s) => ({ ...s, isActive: c }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCycleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCycle} disabled={!cycleForm.name.trim()}>
              {editingCycleId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ PERIOD DIALOG ═══════════ */}
      <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPeriodId ? "Edit Period" : "Create Appraisal Period"}</DialogTitle>
            <DialogDescription>Define a period within an appraisal cycle.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Cycle</Label>
              <Select value={periodForm.cycleId} onValueChange={(v) => setPeriodForm((s) => ({ ...s, cycleId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {appraisalCycles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Q1 2026"
                value={periodForm.name}
                onChange={(e) => setPeriodForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={periodForm.startDate}
                  onChange={(e) => setPeriodForm((s) => ({ ...s, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={periodForm.endDate}
                  onChange={(e) => setPeriodForm((s) => ({ ...s, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={periodForm.status}
                onValueChange={(v) => setPeriodForm((s) => ({ ...s, status: v as AppraisalPeriod["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePeriod} disabled={!periodForm.name.trim()}>
              {editingPeriodId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ CORE VALUE DIALOG ═══════════ */}
      <Dialog open={cvDialogOpen} onOpenChange={setCvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCvId ? "Edit Core Value" : "Add Core Value"}</DialogTitle>
            <DialogDescription>Define a core value for appraisals.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Innovation"
                value={cvForm.name}
                onChange={(e) => setCvForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this value..."
                value={cvForm.description}
                onChange={(e) => setCvForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={cvForm.weight}
                onChange={(e) => setCvForm((s) => ({ ...s, weight: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={cvForm.isActive}
                onCheckedChange={(c) => setCvForm((s) => ({ ...s, isActive: c }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCvDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCv} disabled={!cvForm.name.trim()}>
              {editingCvId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ WORKFLOW DIALOG ═══════════ */}
      <Dialog open={wfDialogOpen} onOpenChange={setWfDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWfId ? "Edit Workflow" : "Create Appraisal Workflow"}</DialogTitle>
            <DialogDescription>Define the stages in the appraisal process.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Standard Appraisal Process"
                value={wfForm.name}
                onChange={(e) => setWfForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this workflow..."
                value={wfForm.description}
                onChange={(e) => setWfForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stages</Label>
                <Button variant="outline" size="sm" onClick={addWfStage}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Stage
                </Button>
              </div>
              {wfForm.stages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No stages added.</p>
              )}
              {wfForm.stages.map((stage, idx) => (
                <div key={stage.id} className="flex items-center gap-2 rounded-md border p-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground w-6">{idx + 1}.</span>
                  <Input
                    placeholder="Stage name"
                    value={stage.name}
                    onChange={(e) =>
                      setWfForm((prev) => ({
                        ...prev,
                        stages: prev.stages.map((s) => (s.id === stage.id ? { ...s, name: e.target.value } : s)),
                      }))
                    }
                    className="flex-1"
                  />
                  <Select
                    value={stage.type}
                    onValueChange={(v) =>
                      setWfForm((prev) => ({
                        ...prev,
                        stages: prev.stages.map((s) =>
                          s.id === stage.id ? { ...s, type: v as AppraisalWorkflowStage["type"] } : s
                        ),
                      }))
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_assessment">Self Assessment</SelectItem>
                      <SelectItem value="manager_review">Manager Review</SelectItem>
                      <SelectItem value="countersign">Countersign</SelectItem>
                      <SelectItem value="final_review">Final Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveWfStage(stage.id, "up")} disabled={idx === 0}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveWfStage(stage.id, "down")} disabled={idx === wfForm.stages.length - 1}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeWfStage(stage.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWfDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveWf} disabled={!wfForm.name.trim()}>
              {editingWfId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ VIEW APPRAISAL DETAIL ═══════════ */}
      <Dialog open={viewAppraisalOpen} onOpenChange={setViewAppraisalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingAppraisal?.employeeName} — Appraisal</DialogTitle>
            <DialogDescription>Performance appraisal details and scores per stage.</DialogDescription>
          </DialogHeader>
          {viewingAppraisal && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <p className="font-medium">{viewingAppraisal.departmentName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Period:</span>
                  <p className="font-medium">{viewingAppraisal.periodName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Workflow:</span>
                  <p className="font-medium">{viewingAppraisal.workflowName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${appraisalStatusColor(viewingAppraisal.status)}`}>
                    {appraisalStatusLabel(viewingAppraisal.status)}
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium">Scorecards</Label>
                {viewingAppraisal.scores.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">No scores recorded yet.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {viewingAppraisal.scores.map((sc) => (
                      <div key={sc.id} className="rounded-md border p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{sc.stageName}</span>
                          {sc.score !== undefined && (
                            <Badge variant="outline">{sc.score}/100</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">Reviewer: {sc.reviewerName}</p>
                        {sc.comments && <p className="text-muted-foreground mt-1">{sc.comments}</p>}
                        {sc.completedAt && <p className="text-xs text-muted-foreground mt-1">Completed: {formatDate(sc.completedAt)}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAppraisalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ UPLOAD SCORES DIALOG ═══════════ */}
      <Dialog open={uploadScoresOpen} onOpenChange={setUploadScoresOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Scores</DialogTitle>
            <DialogDescription>Upload appraisal scores via CSV or manual entry.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={"employee_id,score,comments\nEMP001,85,Strong performance"}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadScoresOpen(false)}>Cancel</Button>
            <Button onClick={() => setUploadScoresOpen(false)}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ REROUTE DIALOG ═══════════ */}
      <Dialog open={rerouteDialogOpen} onOpenChange={setRerouteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reroute Appraisal</DialogTitle>
            <DialogDescription>Select a new reviewer for this appraisal.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>New Reviewer</Label>
              <Input
                placeholder="Enter reviewer name or ID"
                value={rerouteReviewer}
                onChange={(e) => setRerouteReviewer(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRerouteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReroute} disabled={!rerouteReviewer.trim()}>Reroute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ DELETE CONFIRM ═══════════ */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(o) => { if (!o) { setDeleteConfirmId(null); setDeleteType(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirmId(null); setDeleteType(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
