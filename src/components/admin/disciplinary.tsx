"use client";

import { useState, useMemo } from "react";
import { useHrms } from "@/contexts/hrms-context";
import {
  DisciplinaryCase,
  DisciplinaryMeeting,
  DisciplinaryCommittee,
  DisciplinaryMember,
  QueryTemplate,
  DisciplinaryTerminology,
  DisciplinaryOutcome,
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
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Gavel,
  BookOpen,
  Shield,
  Paperclip,
  Activity,
} from "lucide-react";
import { generateId, formatDate } from "@/lib/utils";

// ─────────────── Helpers ───────────────

const severityColor = (s: DisciplinaryCase["severity"]): string => {
  switch (s) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "major":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
};

const caseStatusBadge = (status: DisciplinaryCase["status"]) => {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    open: "outline",
    under_investigation: "secondary",
    hearing_scheduled: "secondary",
    resolved: "default",
    escalated: "destructive",
    closed: "secondary",
  };
  return map[status] ?? "outline";
};

const meetingStatusBadge = (status: DisciplinaryMeeting["status"]) => {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    scheduled: "secondary",
    completed: "default",
    cancelled: "destructive",
  };
  return map[status] ?? "outline";
};

const statusLabel = (s: string) =>
  s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ─────────────── Defaults ───────────────

const defaultCaseForm = {
  employeeId: "",
  employeeName: "",
  offenseCategory: "",
  offense: "",
  description: "",
  severity: "minor" as DisciplinaryCase["severity"],
};

const defaultMeetingForm = {
  caseId: "",
  caseNumber: "",
  date: "",
  time: "",
  location: "",
  attendees: [] as string[],
  minutes: "",
};

const defaultCommitteeForm = {
  name: "",
  level: "I" as DisciplinaryCommittee["level"],
  members: [] as DisciplinaryMember[],
  isActive: true,
};

const defaultMemberForm: DisciplinaryMember = {
  userId: "",
  name: "",
  role: "",
  committeeLevel: "I",
};

const defaultQueryForm = {
  name: "",
  subject: "",
  body: "",
  category: "",
};

const defaultTerminologyForm = {
  term: "",
  definition: "",
  category: "",
  lastModified: "",
  modifiedBy: "",
};

const defaultOutcomeForm = {
  caseId: "",
  outcome: "warning" as DisciplinaryOutcome["outcome"],
  description: "",
  appealDeadline: "",
  appealStatus: "none" as DisciplinaryOutcome["appealStatus"],
  issuedDate: "",
};

// ─────────────── Component ───────────────

export default function Disciplinary() {
  const {
    employees,
    disciplinaryCases,
    addDisciplinaryCase,
    updateDisciplinaryCase,
    deleteDisciplinaryCase,
    disciplinaryMeetings,
    addDisciplinaryMeeting,
    updateDisciplinaryMeeting,
    deleteDisciplinaryMeeting,
    disciplinaryCommittees,
    addDisciplinaryCommittee,
    updateDisciplinaryCommittee,
    deleteDisciplinaryCommittee,
    queryTemplates,
    addQueryTemplate,
    updateQueryTemplate,
    deleteQueryTemplate,
    disciplinaryTerminology,
    addDisciplinaryTerminology,
    updateDisciplinaryTerminology,
    deleteDisciplinaryTerminology,
    disciplinaryOutcomes,
    addDisciplinaryOutcome,
    updateDisciplinaryOutcome,
    deleteDisciplinaryOutcome,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("cases");

  // ── Cases state ──
  const [caseSearch, setCaseSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [viewCase, setViewCase] = useState<DisciplinaryCase | null>(null);
  const [commentDialogCaseId, setCommentDialogCaseId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [deleteCaseId, setDeleteCaseId] = useState<string | null>(null);

  // ── Meetings state ──
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [meetingForm, setMeetingForm] = useState(defaultMeetingForm);
  const [deleteMeetingId, setDeleteMeetingId] = useState<string | null>(null);

  // ── Committees state ──
  const [committeeDialogOpen, setCommitteeDialogOpen] = useState(false);
  const [editingCommitteeId, setEditingCommitteeId] = useState<string | null>(null);
  const [committeeForm, setCommitteeForm] = useState(defaultCommitteeForm);
  const [deleteCommitteeId, setDeleteCommitteeId] = useState<string | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<DisciplinaryMember>(defaultMemberForm);
  const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null);

  // ── Query templates state ──
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [queryForm, setQueryForm] = useState(defaultQueryForm);
  const [deleteQueryId, setDeleteQueryId] = useState<string | null>(null);

  // ── Terminology state ──
  const [termDialogOpen, setTermDialogOpen] = useState(false);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [termForm, setTermForm] = useState(defaultTerminologyForm);
  const [deleteTermId, setDeleteTermId] = useState<string | null>(null);

  // ── Outcomes state ──
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
  const [editingOutcomeId, setEditingOutcomeId] = useState<string | null>(null);
  const [outcomeForm, setOutcomeForm] = useState(defaultOutcomeForm);

  // ─────────────── Filtered data ───────────────

  const filteredCases = useMemo(() => {
    let list = [...disciplinaryCases];
    if (caseSearch) {
      const q = caseSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.employeeName.toLowerCase().includes(q) ||
          c.offense.toLowerCase().includes(q)
      );
    }
    if (severityFilter !== "all") {
      list = list.filter((c) => c.severity === severityFilter);
    }
    return list;
  }, [disciplinaryCases, caseSearch, severityFilter]);

  // ─────────────── Case handlers ───────────────

  const addComment = () => {
    if (!commentDialogCaseId || !commentText.trim()) return;
    const c = disciplinaryCases.find((x) => x.id === commentDialogCaseId);
    if (!c) return;
    updateDisciplinaryCase(commentDialogCaseId, {
      description: `${c.description}\n\n[Comment]: ${commentText}`,
    });
    setCommentText("");
    setCommentDialogCaseId(null);
  };

  // ─────────────── Meeting handlers ───────────────

  const openAddMeeting = () => {
    setEditingMeetingId(null);
    setMeetingForm(defaultMeetingForm);
    setMeetingDialogOpen(true);
  };

  const openEditMeeting = (m: DisciplinaryMeeting) => {
    setEditingMeetingId(m.id);
    setMeetingForm({
      caseId: m.caseId,
      caseNumber: m.caseNumber,
      date: m.date,
      time: m.time,
      location: m.location,
      attendees: [...m.attendees],
      minutes: m.minutes,
    });
    setMeetingDialogOpen(true);
  };

  const saveMeeting = () => {
    const data = {
      ...meetingForm,
      status: "scheduled" as const,
    };
    if (editingMeetingId) {
      updateDisciplinaryMeeting(editingMeetingId, data);
    } else {
      addDisciplinaryMeeting(data);
    }
    setMeetingDialogOpen(false);
  };

  // ─────────────── Committee handlers ───────────────

  const openAddCommittee = () => {
    setEditingCommitteeId(null);
    setCommitteeForm(defaultCommitteeForm);
    setCommitteeDialogOpen(true);
  };

  const openEditCommittee = (c: DisciplinaryCommittee) => {
    setEditingCommitteeId(c.id);
    setCommitteeForm({
      name: c.name,
      level: c.level,
      members: [...c.members],
      isActive: c.isActive,
    });
    setCommitteeDialogOpen(true);
  };

  const saveCommittee = () => {
    if (editingCommitteeId) {
      updateDisciplinaryCommittee(editingCommitteeId, committeeForm);
    } else {
      addDisciplinaryCommittee(committeeForm);
    }
    setCommitteeDialogOpen(false);
  };

  const openAddMember = () => {
    setEditingMemberIdx(null);
    setMemberForm({ ...defaultMemberForm, committeeLevel: committeeForm.level });
    setMemberDialogOpen(true);
  };

  const openEditMember = (idx: number) => {
    setEditingMemberIdx(idx);
    setMemberForm({ ...committeeForm.members[idx] });
    setMemberDialogOpen(true);
  };

  const saveMember = () => {
    const members = [...committeeForm.members];
    if (editingMemberIdx !== null) {
      members[editingMemberIdx] = memberForm;
    } else {
      members.push(memberForm);
    }
    setCommitteeForm((prev) => ({ ...prev, members }));
    setMemberDialogOpen(false);
  };

  const removeMember = (idx: number) => {
    const members = committeeForm.members.filter((_, i) => i !== idx);
    setCommitteeForm((prev) => ({ ...prev, members }));
  };

  // ─────────────── Query template handlers ───────────────

  const openAddQuery = () => {
    setEditingQueryId(null);
    setQueryForm(defaultQueryForm);
    setQueryDialogOpen(true);
  };

  const openEditQuery = (q: QueryTemplate) => {
    setEditingQueryId(q.id);
    setQueryForm({
      name: q.name,
      subject: q.subject,
      body: q.body,
      category: q.category,
    });
    setQueryDialogOpen(true);
  };

  const saveQuery = () => {
    const data = { ...queryForm, createdAt: new Date().toISOString() };
    if (editingQueryId) {
      updateQueryTemplate(editingQueryId, data);
    } else {
      addQueryTemplate(data);
    }
    setQueryDialogOpen(false);
  };

  // ─────────────── Terminology handlers ───────────────

  const openAddTerm = () => {
    setEditingTermId(null);
    setTermForm(defaultTerminologyForm);
    setTermDialogOpen(true);
  };

  const openEditTerm = (t: DisciplinaryTerminology) => {
    setEditingTermId(t.id);
    setTermForm({
      term: t.term,
      definition: t.definition,
      category: t.category,
      lastModified: t.lastModified,
      modifiedBy: t.modifiedBy,
    });
    setTermDialogOpen(true);
  };

  const saveTerm = () => {
    const data = {
      ...termForm,
      lastModified: new Date().toISOString(),
      modifiedBy: "Admin",
    };
    if (editingTermId) {
      updateDisciplinaryTerminology(editingTermId, data);
    } else {
      addDisciplinaryTerminology(data);
    }
    setTermDialogOpen(false);
  };

  // ─────────────── Outcome handlers ───────────────

  const openAddOutcome = () => {
    setEditingOutcomeId(null);
    setOutcomeForm(defaultOutcomeForm);
    setOutcomeDialogOpen(true);
  };

  const openEditOutcome = (o: DisciplinaryOutcome) => {
    setEditingOutcomeId(o.id);
    setOutcomeForm({
      caseId: o.caseId,
      outcome: o.outcome,
      description: o.description,
      appealDeadline: o.appealDeadline,
      appealStatus: o.appealStatus,
      issuedDate: o.issuedDate,
    });
    setOutcomeDialogOpen(true);
  };

  const saveOutcome = () => {
    const data = { ...outcomeForm, issuedDate: outcomeForm.issuedDate || new Date().toISOString() };
    if (editingOutcomeId) {
      updateDisciplinaryOutcome(editingOutcomeId, data);
    } else {
      addDisciplinaryOutcome(data);
    }
    setOutcomeDialogOpen(false);
  };

  // ─────────────── Render ───────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Disciplinary Management</h2>
        <p className="text-muted-foreground">
          Manage disciplinary cases, meetings, committees, queries, and outcomes.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cases">
            <Gavel className="mr-1 h-4 w-4" /> Cases
          </TabsTrigger>
          <TabsTrigger value="meetings">
            <Calendar className="mr-1 h-4 w-4" /> Meetings
          </TabsTrigger>
          <TabsTrigger value="committees">
            <Users className="mr-1 h-4 w-4" /> Committees
          </TabsTrigger>
          <TabsTrigger value="queries">
            <FileText className="mr-1 h-4 w-4" /> Query Templates
          </TabsTrigger>
          <TabsTrigger value="terminology">
            <BookOpen className="mr-1 h-4 w-4" /> Terminology &amp; Outcomes
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB 1: Cases ═══════════ */}
        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Disciplinary Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases..."
                    className="pl-8"
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case #</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Offense Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No cases found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCases.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.caseNumber}</TableCell>
                          <TableCell>{c.employeeName}</TableCell>
                          <TableCell>{c.offenseCategory}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${severityColor(c.severity)}`}
                            >
                              {c.severity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={caseStatusBadge(c.status)}>
                              {statusLabel(c.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(c.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setViewCase(c)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setCommentDialogCaseId(c.id)}
                                title="Add Comment"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteCaseId(c.id)}
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
            </CardContent>
          </Card>

          {/* View Case Details Dialog */}
          <Dialog open={!!viewCase} onOpenChange={() => setViewCase(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Case Details — {viewCase?.caseNumber}</DialogTitle>
              </DialogHeader>
              {viewCase && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Employee</span>
                      <p className="font-medium">{viewCase.employeeName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Offense Category</span>
                      <p className="font-medium">{viewCase.offenseCategory}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Offense</span>
                      <p className="font-medium">{viewCase.offense}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Severity</span>
                      <p>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${severityColor(viewCase.severity)}`}
                        >
                          {viewCase.severity}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status</span>
                      <p>
                        <Badge variant={caseStatusBadge(viewCase.status)}>
                          {statusLabel(viewCase.status)}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date</span>
                      <p className="font-medium">{formatDate(viewCase.createdAt)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className="text-muted-foreground">Description</span>
                    <p className="mt-1 whitespace-pre-wrap">{viewCase.description}</p>
                  </div>

                  {viewCase.attachments.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5" /> Attachments
                        </span>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          {viewCase.attachments.map((a, i) => (
                            <li key={i} className="text-sm">{a}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {viewCase.assignedMembers.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> Committee Members
                        </span>
                        <div className="mt-1 space-y-1">
                          {viewCase.assignedMembers.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">
                                Level {m.committeeLevel}
                              </Badge>
                              <span className="font-medium">{m.name}</span>
                              <span className="text-muted-foreground">({m.role})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" /> Activity Log
                    </span>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2 text-sm">
                        <Badge variant="secondary" className="text-xs shrink-0">Created</Badge>
                        <span>{formatDate(viewCase.createdAt)}</span>
                      </div>
                      {viewCase.description.includes("[Comment]") && (
                        <div className="flex gap-2 text-sm">
                          <Badge variant="outline" className="text-xs shrink-0">Comment</Badge>
                          <span className="text-muted-foreground whitespace-pre-wrap">
                            {viewCase.description.split("[Comment]:").pop()?.trim()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Comment Dialog */}
          <Dialog
            open={!!commentDialogCaseId}
            onOpenChange={() => setCommentDialogCaseId(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Comment</DialogTitle>
                <DialogDescription>Add a comment to this disciplinary case.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  rows={4}
                  placeholder="Enter your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCommentDialogCaseId(null)}>
                  Cancel
                </Button>
                <Button onClick={addComment}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Case Confirmation */}
          <Dialog open={!!deleteCaseId} onOpenChange={() => setDeleteCaseId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Case</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this disciplinary case?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteCaseId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (deleteCaseId) deleteDisciplinaryCase(deleteCaseId);
                    setDeleteCaseId(null);
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════ TAB 2: Meetings ═══════════ */}
        <TabsContent value="meetings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Disciplinary Meetings</CardTitle>
              <Button size="sm" onClick={openAddMeeting}>
                <Plus className="mr-1 h-4 w-4" /> Schedule Meeting
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disciplinaryMeetings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No meetings scheduled.
                        </TableCell>
                      </TableRow>
                    ) : (
                      disciplinaryMeetings.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.caseNumber}</TableCell>
                          <TableCell>{m.date}</TableCell>
                          <TableCell>{m.time}</TableCell>
                          <TableCell>{m.location}</TableCell>
                          <TableCell>
                            <Badge variant={meetingStatusBadge(m.status)}>
                              {statusLabel(m.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditMeeting(m)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteMeetingId(m.id)}
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

              {/* Meeting Dialog */}
              <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingMeetingId ? "Edit Meeting" : "Schedule Meeting"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Case</Label>
                      <Select
                        value={meetingForm.caseId}
                        onValueChange={(v) => {
                          const c = disciplinaryCases.find((x) => x.id === v);
                          setMeetingForm((p) => ({
                            ...p,
                            caseId: v,
                            caseNumber: c?.caseNumber ?? "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select case" />
                        </SelectTrigger>
                        <SelectContent>
                          {disciplinaryCases.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.caseNumber} — {c.employeeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={meetingForm.date}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, date: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={meetingForm.time}
                          onChange={(e) =>
                            setMeetingForm((p) => ({ ...p, time: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={meetingForm.location}
                        onChange={(e) =>
                          setMeetingForm((p) => ({ ...p, location: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minutes</Label>
                      <Textarea
                        value={meetingForm.minutes}
                        onChange={(e) =>
                          setMeetingForm((p) => ({ ...p, minutes: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveMeeting}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Meeting */}
              <Dialog open={!!deleteMeetingId} onOpenChange={() => setDeleteMeetingId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Meeting</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this meeting?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteMeetingId(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (deleteMeetingId) deleteDisciplinaryMeeting(deleteMeetingId);
                        setDeleteMeetingId(null);
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

        {/* ═══════════ TAB 3: Committees ═══════════ */}
        <TabsContent value="committees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Disciplinary Committees</CardTitle>
              <Button size="sm" onClick={openAddCommittee}>
                <Plus className="mr-1 h-4 w-4" /> Create Committee
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disciplinaryCommittees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No committees created.
                        </TableCell>
                      </TableRow>
                    ) : (
                      disciplinaryCommittees.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Level {c.level}</Badge>
                          </TableCell>
                          <TableCell>{c.members.length}</TableCell>
                          <TableCell>
                            <Badge variant={c.isActive ? "default" : "secondary"}>
                              {c.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditCommittee(c)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteCommitteeId(c.id)}
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

              {/* Committee Dialog */}
              <Dialog open={committeeDialogOpen} onOpenChange={setCommitteeDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCommitteeId ? "Edit Committee" : "Create Committee"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={committeeForm.name}
                          onChange={(e) =>
                            setCommitteeForm((p) => ({ ...p, name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Level</Label>
                        <Select
                          value={committeeForm.level}
                          onValueChange={(v) =>
                            setCommitteeForm((p) => ({
                              ...p,
                              level: v as DisciplinaryCommittee["level"],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="I">Level I</SelectItem>
                            <SelectItem value="II">Level II</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={committeeForm.isActive}
                        onCheckedChange={(v) =>
                          setCommitteeForm((p) => ({ ...p, isActive: v }))
                        }
                      />
                      <Label>Active</Label>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Members</Label>
                      <Button size="sm" variant="outline" onClick={openAddMember}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Member
                      </Button>
                    </div>

                    {committeeForm.members.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No members added yet.
                      </p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead className="w-[100px]" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {committeeForm.members.map((m, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{m.name}</TableCell>
                                <TableCell>{m.role}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => openEditMember(idx)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => removeMember(idx)}
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
                    <Button variant="outline" onClick={() => setCommitteeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveCommittee}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Member Dialog */}
              <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingMemberIdx !== null ? "Edit Member" : "Add Member"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={memberForm.name}
                        onChange={(e) =>
                          setMemberForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={memberForm.role}
                        onChange={(e) =>
                          setMemberForm((p) => ({ ...p, role: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveMember}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Committee */}
              <Dialog
                open={!!deleteCommitteeId}
                onOpenChange={() => setDeleteCommitteeId(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Committee</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this committee?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteCommitteeId(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (deleteCommitteeId) deleteDisciplinaryCommittee(deleteCommitteeId);
                        setDeleteCommitteeId(null);
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

        {/* ═══════════ TAB 4: Query Templates ═══════════ */}
        <TabsContent value="queries">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Query Templates</CardTitle>
              <Button size="sm" onClick={openAddQuery}>
                <Plus className="mr-1 h-4 w-4" /> Create Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryTemplates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No query templates yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      queryTemplates.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="font-medium">{q.name}</TableCell>
                          <TableCell>{q.subject}</TableCell>
                          <TableCell>{q.category}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditQuery(q)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteQueryId(q.id)}
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

              {/* Query Dialog */}
              <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingQueryId ? "Edit Query Template" : "Create Query Template"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={queryForm.name}
                        onChange={(e) =>
                          setQueryForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input
                        value={queryForm.subject}
                        onChange={(e) =>
                          setQueryForm((p) => ({ ...p, subject: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={queryForm.category}
                        onChange={(e) =>
                          setQueryForm((p) => ({ ...p, category: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Body</Label>
                      <Textarea
                        rows={6}
                        value={queryForm.body}
                        onChange={(e) =>
                          setQueryForm((p) => ({ ...p, body: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setQueryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveQuery}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Query */}
              <Dialog open={!!deleteQueryId} onOpenChange={() => setDeleteQueryId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Template</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this query template?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteQueryId(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (deleteQueryId) deleteQueryTemplate(deleteQueryId);
                        setDeleteQueryId(null);
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

        {/* ═══════════ TAB 5: Terminology & Outcomes ═══════════ */}
        <TabsContent value="terminology">
          <div className="space-y-6">
            {/* ── Terminology ── */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Terminology
                </CardTitle>
                <Button size="sm" onClick={openAddTerm}>
                  <Plus className="mr-1 h-4 w-4" /> Add Term
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Term</TableHead>
                        <TableHead>Definition</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disciplinaryTerminology.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No terminology defined.
                          </TableCell>
                        </TableRow>
                      ) : (
                        disciplinaryTerminology.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.term}</TableCell>
                            <TableCell className="max-w-[250px] truncate">
                              {t.definition}
                            </TableCell>
                            <TableCell>{t.category}</TableCell>
                            <TableCell>{formatDate(t.lastModified)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEditTerm(t)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => setDeleteTermId(t.id)}
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

                {/* Terminology Dialog */}
                <Dialog open={termDialogOpen} onOpenChange={setTermDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingTermId ? "Edit Term" : "Add Term"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Term</Label>
                        <Input
                          value={termForm.term}
                          onChange={(e) =>
                            setTermForm((p) => ({ ...p, term: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Definition</Label>
                        <Textarea
                          rows={3}
                          value={termForm.definition}
                          onChange={(e) =>
                            setTermForm((p) => ({ ...p, definition: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          value={termForm.category}
                          onChange={(e) =>
                            setTermForm((p) => ({ ...p, category: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setTermDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveTerm}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Delete Term */}
                <Dialog open={!!deleteTermId} onOpenChange={() => setDeleteTermId(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Term</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this term?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteTermId(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (deleteTermId) deleteDisciplinaryTerminology(deleteTermId);
                          setDeleteTermId(null);
                        }}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* ── Outcomes ── */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Case Outcomes
                </CardTitle>
                <Button size="sm" onClick={openAddOutcome}>
                  <Plus className="mr-1 h-4 w-4" /> Add Outcome
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Appeal Status</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disciplinaryOutcomes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No outcomes recorded.
                          </TableCell>
                        </TableRow>
                      ) : (
                        disciplinaryOutcomes.map((o) => {
                          const linkedCase = disciplinaryCases.find((c) => c.id === o.caseId);
                          return (
                            <TableRow key={o.id}>
                              <TableCell className="font-medium">
                                {linkedCase?.caseNumber ?? o.caseId}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{statusLabel(o.outcome)}</Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {o.description}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    o.appealStatus === "overturned"
                                      ? "destructive"
                                      : o.appealStatus === "upheld"
                                        ? "default"
                                        : o.appealStatus === "pending"
                                          ? "secondary"
                                          : "outline"
                                  }
                                >
                                  {statusLabel(o.appealStatus)}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(o.issuedDate)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEditOutcome(o)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Outcome Dialog */}
                <Dialog open={outcomeDialogOpen} onOpenChange={setOutcomeDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingOutcomeId ? "Edit Outcome" : "Add Outcome"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Case</Label>
                        <Select
                          value={outcomeForm.caseId}
                          onValueChange={(v) =>
                            setOutcomeForm((p) => ({ ...p, caseId: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select case" />
                          </SelectTrigger>
                          <SelectContent>
                            {disciplinaryCases.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.caseNumber} — {c.employeeName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Outcome</Label>
                        <Select
                          value={outcomeForm.outcome}
                          onValueChange={(v) =>
                            setOutcomeForm((p) => ({
                              ...p,
                              outcome: v as DisciplinaryOutcome["outcome"],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="suspension">Suspension</SelectItem>
                            <SelectItem value="termination">Termination</SelectItem>
                            <SelectItem value="demotion">Demotion</SelectItem>
                            <SelectItem value="counseling">Counseling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={outcomeForm.description}
                          onChange={(e) =>
                            setOutcomeForm((p) => ({ ...p, description: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Appeal Deadline</Label>
                          <Input
                            type="date"
                            value={outcomeForm.appealDeadline}
                            onChange={(e) =>
                              setOutcomeForm((p) => ({
                                ...p,
                                appealDeadline: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Appeal Status</Label>
                          <Select
                            value={outcomeForm.appealStatus}
                            onValueChange={(v) =>
                              setOutcomeForm((p) => ({
                                ...p,
                                appealStatus: v as DisciplinaryOutcome["appealStatus"],
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="upheld">Upheld</SelectItem>
                              <SelectItem value="overturned">Overturned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOutcomeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveOutcome}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
