"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { SurveyQuestionCategory, SurveyQuestion, Survey, SurveyResponse } from "@/types/hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ClipboardList,
  HelpCircle,
  Eye,
  Download,
  CalendarClock,
  ListChecks,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

const answerTypeLabels: Record<string, string> = {
  text: "Text",
  textarea: "Text Area",
  rating: "Rating",
  single_choice: "Single Choice",
  multi_choice: "Multi Choice",
  yes_no: "Yes / No",
};

const answerTypeBadge: Record<string, string> = {
  text: "bg-blue-100 text-blue-800 border-blue-200",
  textarea: "bg-indigo-100 text-indigo-800 border-indigo-200",
  rating: "bg-amber-100 text-amber-800 border-amber-200",
  single_choice: "bg-green-100 text-green-800 border-green-200",
  multi_choice: "bg-purple-100 text-purple-800 border-purple-200",
  yes_no: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

const surveyStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  active: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-red-100 text-red-800 border-red-200",
};

const hasOptions = (t: string) => t === "single_choice" || t === "multi_choice";

const defaultCategoryForm: Omit<SurveyQuestionCategory, "id" | "createdAt" | "questionCount"> = {
  name: "",
  description: "",
};

const defaultQuestionForm: Omit<SurveyQuestion, "id" | "createdAt"> = {
  title: "",
  description: "",
  answerType: "text",
  options: [],
  assignableRoles: [],
  categoryId: "",
  categoryName: "",
  isCompulsory: false,
  isActive: true,
};

const defaultSurveyForm: Omit<Survey, "id" | "createdAt" | "responseCount" | "questionCount"> = {
  name: "",
  description: "",
  questionIds: [],
  status: "draft",
  startDate: "",
  endDate: "",
};

const roles = ["Admin", "Manager", "Employee", "Supervisor", "HR"];

export default function SurveyFeedback() {
  const {
    surveyQuestionCategories,
    addSurveyQuestionCategory,
    updateSurveyQuestionCategory,
    deleteSurveyQuestionCategory,
    surveyQuestions,
    addSurveyQuestion,
    updateSurveyQuestion,
    deleteSurveyQuestion,
    surveys,
    addSurvey,
    updateSurvey,
    deleteSurvey,
    surveyResponses,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("question-categories");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [surveyFilter, setSurveyFilter] = useState("all");

  // Category state
  const [catForm, setCatForm] = useState(defaultCategoryForm);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  // Question state
  const [qForm, setQForm] = useState(defaultQuestionForm);
  const [qDialogOpen, setQDialogOpen] = useState(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [deleteQId, setDeleteQId] = useState<string | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<SurveyQuestion | null>(null);
  const [optionInput, setOptionInput] = useState("");
  const [roleInput, setRoleInput] = useState("");

  // Survey state
  const [sForm, setSForm] = useState(defaultSurveyForm);
  const [sDialogOpen, setSDialogOpen] = useState(false);
  const [editingSId, setEditingSId] = useState<string | null>(null);
  const [deleteSId, setDeleteSId] = useState<string | null>(null);
  const [extendDialogId, setExtendDialogId] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [responsesDialogId, setResponsesDialogId] = useState<string | null>(null);

  // Response view state
  const [viewResponse, setViewResponse] = useState<SurveyResponse | null>(null);

  const filteredCategories = surveyQuestionCategories.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuestions = surveyQuestions.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || q.categoryId === categoryFilter;
    return matchSearch && matchCat;
  });

  const filteredSurveys = surveys;

  const filteredResponses = surveyResponses.filter((r) => surveyFilter === "all" || r.surveyId === surveyFilter);

  // ── Category CRUD ────────────────────────────────────────────

  const openCreateCat = () => {
    setEditingCatId(null);
    setCatForm(defaultCategoryForm);
    setCatDialogOpen(true);
  };

  const openEditCat = (cat: SurveyQuestionCategory) => {
    setEditingCatId(cat.id);
    setCatForm({ name: cat.name, description: cat.description });
    setCatDialogOpen(true);
  };

  const saveCat = () => {
    if (editingCatId) updateSurveyQuestionCategory(editingCatId, catForm);
    else addSurveyQuestionCategory({ ...catForm, createdAt: new Date().toISOString(), questionCount: 0 });
    setCatDialogOpen(false);
  };

  // ── Question CRUD ────────────────────────────────────────────

  const openCreateQ = () => {
    setEditingQId(null);
    setQForm(defaultQuestionForm);
    setOptionInput("");
    setRoleInput("");
    setQDialogOpen(true);
  };

  const openEditQ = (q: SurveyQuestion) => {
    setEditingQId(q.id);
    setQForm({
      title: q.title,
      description: q.description,
      answerType: q.answerType,
      options: [...q.options],
      assignableRoles: [...q.assignableRoles],
      categoryId: q.categoryId,
      categoryName: q.categoryName,
      isCompulsory: q.isCompulsory,
      isActive: q.isActive,
    });
    setOptionInput("");
    setRoleInput("");
    setQDialogOpen(true);
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setQForm({ ...qForm, options: [...qForm.options, optionInput.trim()] });
      setOptionInput("");
    }
  };

  const removeOption = (idx: number) => {
    setQForm({ ...qForm, options: qForm.options.filter((_, i) => i !== idx) });
  };

  const addRole = () => {
    if (roleInput.trim() && !qForm.assignableRoles.includes(roleInput.trim())) {
      setQForm({ ...qForm, assignableRoles: [...qForm.assignableRoles, roleInput.trim()] });
      setRoleInput("");
    }
  };

  const removeRole = (idx: number) => {
    setQForm({ ...qForm, assignableRoles: qForm.assignableRoles.filter((_, i) => i !== idx) });
  };

  const saveQuestion = () => {
    const catName = surveyQuestionCategories.find((c) => c.id === qForm.categoryId)?.name || "";
    const data = { ...qForm, categoryName: catName };
    if (editingQId) updateSurveyQuestion(editingQId, data);
    else addSurveyQuestion({ ...data, createdAt: new Date().toISOString() });
    setQDialogOpen(false);
  };

  // ── Survey CRUD ──────────────────────────────────────────────

  const openCreateS = () => {
    setEditingSId(null);
    setSForm(defaultSurveyForm);
    setSDialogOpen(true);
  };

  const openEditS = (s: Survey) => {
    setEditingSId(s.id);
    setSForm({
      name: s.name,
      description: s.description,
      questionIds: [...s.questionIds],
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
    });
    setSDialogOpen(true);
  };

  const toggleSurveyQuestion = (qId: string) => {
    const ids = sForm.questionIds.includes(qId)
      ? sForm.questionIds.filter((id) => id !== qId)
      : [...sForm.questionIds, qId];
    setSForm({ ...sForm, questionIds: ids });
  };

  const saveSurvey = () => {
    if (editingSId) updateSurvey(editingSId, sForm);
    else addSurvey({ ...sForm, createdAt: new Date().toISOString(), questionCount: sForm.questionIds.length, responseCount: 0 });
    setSDialogOpen(false);
  };

  const openExtend = (s: Survey) => {
    setExtendDialogId(s.id);
    setExtendDate(s.endDate);
  };

  const saveExtend = () => {
    if (extendDialogId) updateSurvey(extendDialogId, { endDate: extendDate });
    setExtendDialogId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Survey &amp; Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="question-categories">Question Categories</TabsTrigger>
            <TabsTrigger value="questions">Survey Questions</TabsTrigger>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Question Categories ────────────────────── */}
          <TabsContent value="question-categories" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button size="sm" onClick={openCreateCat}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Question Count</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell>{cat.description}</TableCell>
                        <TableCell>{cat.questionCount}</TableCell>
                        <TableCell>{formatDate(cat.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCat(cat)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteCatId(cat.id)}>
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

          {/* ─── Tab 2: Survey Questions ───────────────────────── */}
          <TabsContent value="questions" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {surveyQuestionCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={openCreateQ}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Answer Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Compulsory</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No questions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuestions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={answerTypeBadge[q.answerType]}>
                            {answerTypeLabels[q.answerType]}
                          </Badge>
                        </TableCell>
                        <TableCell>{q.categoryName || "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {q.assignableRoles.map((r) => (
                              <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{q.isCompulsory ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={q.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                            {q.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewQuestion(q)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditQ(q)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteQId(q.id)}>
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

          {/* ─── Tab 3: Surveys ────────────────────────────────── */}
          <TabsContent value="surveys" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search surveys..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button size="sm" onClick={openCreateS}>
                <Plus className="mr-2 h-4 w-4" />
                Add Survey
              </Button>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSurveys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No surveys found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSurveys.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{s.description}</TableCell>
                        <TableCell>{s.questionCount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={surveyStatusColors[s.status]}>
                            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(s.startDate)}</TableCell>
                        <TableCell>{formatDate(s.endDate)}</TableCell>
                        <TableCell>{s.responseCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {s.status === "active" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Administer" onClick={() => {}}>
                                <ListChecks className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Extend End Date" onClick={() => openExtend(s)}>
                              <CalendarClock className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View Responses" onClick={() => setResponsesDialogId(s.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Export Summary" onClick={() => {}}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditS(s)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteSId(s.id)}>
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

          {/* ─── Tab 4: Survey Responses ───────────────────────── */}
          <TabsContent value="responses" className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <Select value={surveyFilter} onValueChange={setSurveyFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by survey" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Surveys</SelectItem>
                  {surveys.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No responses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResponses.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.respondentName}</TableCell>
                        <TableCell>{r.respondentRole}</TableCell>
                        <TableCell>{formatDate(r.submittedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewResponse(r)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* ─── Category Create/Edit Dialog ──────────────────────── */}
        <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCatId ? "Edit Category" : "Create Category"}</DialogTitle>
              <DialogDescription>{editingCatId ? "Update question category." : "Add a new question category."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Category name" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveCat}>{editingCatId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Delete Confirmation */}
        <Dialog open={!!deleteCatId} onOpenChange={(open) => !open && setDeleteCatId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>Are you sure you want to delete this category? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteCatId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteCatId) deleteSurveyQuestionCategory(deleteCatId);
                  setDeleteCatId(null);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Question Create/Edit Dialog ──────────────────────── */}
        <Dialog open={qDialogOpen} onOpenChange={setQDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQId ? "Edit Question" : "Create Question"}</DialogTitle>
              <DialogDescription>{editingQId ? "Update question details." : "Add a new survey question."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={qForm.title} onChange={(e) => setQForm({ ...qForm, title: e.target.value })} placeholder="Question title" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={qForm.description} onChange={(e) => setQForm({ ...qForm, description: e.target.value })} placeholder="Description / helper text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Answer Type</Label>
                  <Select value={qForm.answerType} onValueChange={(v) => setQForm({ ...qForm, answerType: v as SurveyQuestion["answerType"], options: hasOptions(v) ? qForm.options : [] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="single_choice">Single Choice</SelectItem>
                      <SelectItem value="multi_choice">Multi Choice</SelectItem>
                      <SelectItem value="yes_no">Yes / No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={qForm.categoryId} onValueChange={(v) => setQForm({ ...qForm, categoryId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {surveyQuestionCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {hasOptions(qForm.answerType) && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="flex gap-2">
                    <Input value={optionInput} onChange={(e) => setOptionInput(e.target.value)} placeholder="Add option" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())} />
                    <Button type="button" variant="outline" onClick={addOption}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {qForm.options.map((opt, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {opt}
                        <button onClick={() => removeOption(i)} className="ml-1 text-muted-foreground hover:text-destructive">&times;</button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Assignable Roles</Label>
                <div className="flex gap-2">
                  <Select value={roleInput} onValueChange={setRoleInput}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={addRole}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {qForm.assignableRoles.map((r, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {r}
                      <button onClick={() => removeRole(i)} className="ml-1 text-muted-foreground hover:text-destructive">&times;</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Compulsory</Label>
                <Switch checked={qForm.isCompulsory} onCheckedChange={(v) => setQForm({ ...qForm, isCompulsory: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={qForm.isActive} onCheckedChange={(v) => setQForm({ ...qForm, isActive: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveQuestion}>{editingQId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Question Delete Confirmation */}
        <Dialog open={!!deleteQId} onOpenChange={(open) => !open && setDeleteQId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
              <DialogDescription>Are you sure you want to delete this question? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteQId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteQId) deleteSurveyQuestion(deleteQId);
                  setDeleteQId(null);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Question Preview Dialog */}
        <Dialog open={!!previewQuestion} onOpenChange={(open) => !open && setPreviewQuestion(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Question Preview
              </DialogTitle>
            </DialogHeader>
            {previewQuestion && (
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">{previewQuestion.title}</p>
                  {previewQuestion.description && <p className="text-sm text-muted-foreground mt-1">{previewQuestion.description}</p>}
                </div>
                <div>
                  <Badge variant="outline" className={answerTypeBadge[previewQuestion.answerType]}>
                    {answerTypeLabels[previewQuestion.answerType]}
                  </Badge>
                  {previewQuestion.isCompulsory && <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-200">Required</Badge>}
                </div>
                {previewQuestion.answerType === "text" && <Input disabled placeholder="Text answer" />}
                {previewQuestion.answerType === "textarea" && <Textarea disabled placeholder="Text area answer" />}
                {previewQuestion.answerType === "rating" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button key={n} variant="outline" size="icon" disabled>{n}</Button>
                    ))}
                  </div>
                )}
                {previewQuestion.answerType === "single_choice" && previewQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" disabled name="preview" className="h-4 w-4" />
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
                {previewQuestion.answerType === "multi_choice" && previewQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="checkbox" disabled className="h-4 w-4" />
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
                {previewQuestion.answerType === "yes_no" && (
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2"><input type="radio" disabled name="preview" className="h-4 w-4" /><span className="text-sm">Yes</span></div>
                    <div className="flex items-center gap-2"><input type="radio" disabled name="preview" className="h-4 w-4" /><span className="text-sm">No</span></div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Roles: {previewQuestion.assignableRoles.join(", ") || "All"}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewQuestion(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Survey Create/Edit Dialog ───────────────────────── */}
        <Dialog open={sDialogOpen} onOpenChange={setSDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSId ? "Edit Survey" : "Create Survey"}</DialogTitle>
              <DialogDescription>{editingSId ? "Update survey details." : "Create a new survey."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })} placeholder="Survey name" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={sForm.description} onChange={(e) => setSForm({ ...sForm, description: e.target.value })} placeholder="Description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={sForm.startDate} onChange={(e) => setSForm({ ...sForm, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={sForm.endDate} onChange={(e) => setSForm({ ...sForm, endDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={sForm.status} onValueChange={(v) => setSForm({ ...sForm, status: v as Survey["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Questions</Label>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {surveyQuestions.length === 0 && <p className="text-sm text-muted-foreground">No questions available.</p>}
                  {surveyQuestions.map((q) => (
                    <label key={q.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer">
                      <Checkbox checked={sForm.questionIds.includes(q.id)} onCheckedChange={() => toggleSurveyQuestion(q.id)} />
                      <span className="text-sm">{q.title}</span>
                      <Badge variant="outline" className={`ml-auto text-xs ${answerTypeBadge[q.answerType]}`}>
                        {answerTypeLabels[q.answerType]}
                      </Badge>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{sForm.questionIds.length} question(s) selected</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveSurvey}>{editingSId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Survey Delete Confirmation */}
        <Dialog open={!!deleteSId} onOpenChange={(open) => !open && setDeleteSId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Survey</DialogTitle>
              <DialogDescription>Are you sure you want to delete this survey? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteSId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteSId) deleteSurvey(deleteSId);
                  setDeleteSId(null);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend End Date Dialog */}
        <Dialog open={!!extendDialogId} onOpenChange={(open) => !open && setExtendDialogId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Extend End Date</DialogTitle>
              <DialogDescription>Select a new end date for this survey.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New End Date</Label>
                <Input type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExtendDialogId(null)}>Cancel</Button>
              <Button onClick={saveExtend}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Responses Dialog (from Surveys tab) */}
        <Dialog open={!!responsesDialogId} onOpenChange={(open) => !open && setResponsesDialogId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Survey Responses</DialogTitle>
              <DialogDescription>
                {surveys.find((s) => s.id === responsesDialogId)?.name} — {surveyResponses.filter((r) => r.surveyId === responsesDialogId).length} response(s)
              </DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveyResponses.filter((r) => r.surveyId === responsesDialogId).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No responses yet.</TableCell>
                    </TableRow>
                  ) : (
                    surveyResponses
                      .filter((r) => r.surveyId === responsesDialogId)
                      .map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.respondentName}</TableCell>
                          <TableCell>{r.respondentRole}</TableCell>
                          <TableCell>{formatDate(r.submittedAt)}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResponsesDialogId(null)}>Close</Button>
              <Button variant="outline" onClick={() => {}}>
                <Download className="mr-2 h-4 w-4" />
                Export Summary
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Single Response Dialog */}
        <Dialog open={!!viewResponse} onOpenChange={(open) => !open && setViewResponse(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Response Details</DialogTitle>
              <DialogDescription>
                {viewResponse?.respondentName} ({viewResponse?.respondentRole}) — Submitted {viewResponse && formatDate(viewResponse.submittedAt)}
              </DialogDescription>
            </DialogHeader>
            {viewResponse && (
              <div className="space-y-4">
                {viewResponse.answers.map((a, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Q{i + 1}: {a.questionTitle}</p>
                    <p className="text-sm font-semibold">
                      {Array.isArray(a.answer) ? a.answer.join(", ") : String(a.answer)}
                    </p>
                  </div>
                ))}
                {viewResponse.answers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No answers recorded.</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewResponse(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
