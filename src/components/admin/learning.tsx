"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { Course, LearningGroup, LearningAward, LearningTag } from "@/types/hrms";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  Users,
  Award,
  Tag,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react";

const courseCategories = ["Technical", "Soft Skills", "Compliance", "Leadership", "Safety", "Onboarding"];
const courseStatuses: Course["status"][] = ["draft", "published", "active", "completed"];
const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  published: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
};

const defaultCourseForm = {
  name: "",
  description: "",
  category: "Technical",
  duration: "",
  instructor: "",
  maxEnrollees: 0,
  enrolledCount: 0,
  status: "draft" as Course["status"],
};

const defaultGroupForm = {
  name: "",
  description: "",
  memberIds: [] as string[],
};

const defaultAwardForm = {
  name: "",
  description: "",
  courseId: "",
  courseName: "",
  criteria: "",
  isActive: true,
};

const defaultTagForm = {
  name: "",
  collection: "",
};

export default function Learning() {
  const {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    learningGroups,
    addLearningGroup,
    updateLearningGroup,
    deleteLearningGroup,
    learningAwards,
    addLearningAward,
    updateLearningAward,
    deleteLearningAward,
    learningTags,
    addLearningTag,
    updateLearningTag,
    deleteLearningTag,
    employees,
  } = useHrms();

  const [tab, setTab] = useState("courses");
  const [search, setSearch] = useState("");

  // Course state
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  // Group state
  const [groupForm, setGroupForm] = useState(defaultGroupForm);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  // Award state
  const [awardForm, setAwardForm] = useState(defaultAwardForm);
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [deleteAwardId, setDeleteAwardId] = useState<string | null>(null);

  // Tag state
  const [tagForm, setTagForm] = useState(defaultTagForm);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);

  // Learning rights (simulated)
  const [rights, setRights] = useState({
    adminCreateCourse: true,
    adminEditCourse: true,
    adminDeleteCourse: true,
    adminManageGroups: true,
    adminManageAwards: true,
    adminManageTags: true,
    managerEnrollEmployees: true,
    managerViewProgress: true,
    managerAssignCourses: true,
    managerCreateGroups: false,
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = learningGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAwards = learningAwards.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.criteria.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTags = learningTags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.collection.toLowerCase().includes(search.toLowerCase())
  );

  // ── Course handlers ────────────────────────────────────────────────────────
  const openCreateCourse = () => {
    setEditingCourseId(null);
    setCourseForm(defaultCourseForm);
    setCourseDialogOpen(true);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      name: course.name,
      description: course.description,
      category: course.category,
      duration: course.duration,
      instructor: course.instructor,
      maxEnrollees: course.maxEnrollees,
      enrolledCount: course.enrolledCount,
      status: course.status,
    });
    setCourseDialogOpen(true);
  };

  const saveCourse = () => {
    if (editingCourseId) {
      updateCourse(editingCourseId, courseForm);
    } else {
      addCourse({
        ...courseForm,
        enrolledCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      });
    }
    setCourseDialogOpen(false);
  };

  const confirmDeleteCourse = () => {
    if (deleteCourseId) {
      deleteCourse(deleteCourseId);
      setDeleteCourseId(null);
    }
  };

  // ── Group handlers ─────────────────────────────────────────────────────────
  const openCreateGroup = () => {
    setEditingGroupId(null);
    setGroupForm(defaultGroupForm);
    setGroupDialogOpen(true);
  };

  const openEditGroup = (group: LearningGroup) => {
    setEditingGroupId(group.id);
    setGroupForm({
      name: group.name,
      description: group.description,
      memberIds: [...group.memberIds],
    });
    setGroupDialogOpen(true);
  };

  const saveGroup = () => {
    const payload = {
      ...groupForm,
      memberCount: groupForm.memberIds.length,
    };
    if (editingGroupId) {
      updateLearningGroup(editingGroupId, payload);
    } else {
      addLearningGroup({
        ...payload,
        createdAt: new Date().toISOString().split("T")[0],
      });
    }
    setGroupDialogOpen(false);
  };

  const confirmDeleteGroup = () => {
    if (deleteGroupId) {
      deleteLearningGroup(deleteGroupId);
      setDeleteGroupId(null);
    }
  };

  const toggleGroupMember = (employeeId: string) => {
    setGroupForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(employeeId)
        ? prev.memberIds.filter((id) => id !== employeeId)
        : [...prev.memberIds, employeeId],
    }));
  };

  // ── Award handlers ─────────────────────────────────────────────────────────
  const openCreateAward = () => {
    setEditingAwardId(null);
    setAwardForm(defaultAwardForm);
    setAwardDialogOpen(true);
  };

  const openEditAward = (award: LearningAward) => {
    setEditingAwardId(award.id);
    setAwardForm({
      name: award.name,
      description: award.description,
      courseId: award.courseId || "",
      courseName: award.courseName || "",
      criteria: award.criteria,
      isActive: award.isActive,
    });
    setAwardDialogOpen(true);
  };

  const saveAward = () => {
    const course = courses.find((c) => c.id === awardForm.courseId);
    const payload = {
      ...awardForm,
      courseName: course?.name || awardForm.courseName,
    };
    if (editingAwardId) {
      updateLearningAward(editingAwardId, payload);
    } else {
      addLearningAward(payload);
    }
    setAwardDialogOpen(false);
  };

  const confirmDeleteAward = () => {
    if (deleteAwardId) {
      deleteLearningAward(deleteAwardId);
      setDeleteAwardId(null);
    }
  };

  // ── Tag handlers ───────────────────────────────────────────────────────────
  const openCreateTag = () => {
    setEditingTagId(null);
    setTagForm(defaultTagForm);
    setTagDialogOpen(true);
  };

  const openEditTag = (tag: LearningTag) => {
    setEditingTagId(tag.id);
    setTagForm({
      name: tag.name,
      collection: tag.collection,
    });
    setTagDialogOpen(true);
  };

  const saveTag = () => {
    if (editingTagId) {
      updateLearningTag(editingTagId, tagForm);
    } else {
      addLearningTag({
        ...tagForm,
        createdAt: new Date().toISOString().split("T")[0],
      });
    }
    setTagDialogOpen(false);
  };

  const confirmDeleteTag = () => {
    if (deleteTagId) {
      deleteLearningTag(deleteTagId);
      setDeleteTagId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Learning Management</h2>
          <p className="text-muted-foreground">Manage courses, groups, awards, tags, and learning rights.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="courses" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-1.5">
            <Users className="h-4 w-4" />
            Learning Groups
          </TabsTrigger>
          <TabsTrigger value="awards-tags" className="gap-1.5">
            <Award className="h-4 w-4" />
            Awards &amp; Tags
          </TabsTrigger>
          <TabsTrigger value="rights" className="gap-1.5">
            <Settings className="h-4 w-4" />
            Learning Rights
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: COURSES                                                     */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Courses</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-8 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateCourse}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingCourseId ? "Edit Course" : "Create Course"}</DialogTitle>
                      <DialogDescription>
                        {editingCourseId ? "Update course details below." : "Fill in the details to create a new course."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                          value={courseForm.name}
                          onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Course name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={courseForm.description}
                          onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Course description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Category</Label>
                          <Select
                            value={courseForm.category}
                            onValueChange={(v) => setCourseForm((f) => ({ ...f, category: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {courseCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <Select
                            value={courseForm.status}
                            onValueChange={(v) => setCourseForm((f) => ({ ...f, status: v as Course["status"] }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {courseStatuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Duration</Label>
                          <Input
                            value={courseForm.duration}
                            onChange={(e) => setCourseForm((f) => ({ ...f, duration: e.target.value }))}
                            placeholder="e.g. 4 weeks"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Instructor</Label>
                          <Input
                            value={courseForm.instructor}
                            onChange={(e) => setCourseForm((f) => ({ ...f, instructor: e.target.value }))}
                            placeholder="Instructor name"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Max Enrollees</Label>
                        <Input
                          type="number"
                          value={courseForm.maxEnrollees}
                          onChange={(e) =>
                            setCourseForm((f) => ({ ...f, maxEnrollees: parseInt(e.target.value) || 0 }))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveCourse}>{editingCourseId ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrolled / Max</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No courses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{course.description}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>{course.duration}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>
                          {course.enrolledCount} / {course.maxEnrollees}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[course.status]}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditCourse(course)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteCourseId(course.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Delete confirmation */}
          <Dialog open={!!deleteCourseId} onOpenChange={() => setDeleteCourseId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Course</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this course? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteCourseId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteCourse}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: LEARNING GROUPS                                             */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="groups">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Learning Groups</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search groups..."
                    className="pl-8 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateGroup}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingGroupId ? "Edit Learning Group" : "Create Learning Group"}</DialogTitle>
                      <DialogDescription>
                        {editingGroupId
                          ? "Update group details and members."
                          : "Create a new learning group and assign members."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                          value={groupForm.name}
                          onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Group name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={groupForm.description}
                          onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Group description"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Members ({groupForm.memberIds.length} selected)</Label>
                        <div className="max-h-48 overflow-y-auto rounded-md border p-3 space-y-2">
                          {employees.map((emp) => (
                            <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={groupForm.memberIds.includes(emp.id)}
                                onChange={() => toggleGroupMember(emp.id)}
                              />
                              <span className="text-sm">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">{emp.departmentName}</span>
                            </label>
                          ))}
                          {employees.length === 0 && (
                            <p className="text-sm text-muted-foreground">No employees available.</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveGroup}>{editingGroupId ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No learning groups found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{group.description}</TableCell>
                        <TableCell>{group.memberCount}</TableCell>
                        <TableCell>{group.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditGroup(group)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteGroupId(group.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Delete confirmation */}
          <Dialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Learning Group</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this learning group? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteGroupId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteGroup}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: AWARDS & TAGS                                               */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="awards-tags" className="space-y-6">
          {/* Awards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Learning Awards
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search awards..."
                    className="pl-8 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateAward}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Award
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingAwardId ? "Edit Award" : "Create Award"}</DialogTitle>
                      <DialogDescription>
                        {editingAwardId ? "Update award details." : "Define a new learning award."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                          value={awardForm.name}
                          onChange={(e) => setAwardForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Award name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={awardForm.description}
                          onChange={(e) => setAwardForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Award description"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Linked Course</Label>
                        <Select
                          value={awardForm.courseId}
                          onValueChange={(v) => setAwardForm((f) => ({ ...f, courseId: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Criteria</Label>
                        <Input
                          value={awardForm.criteria}
                          onChange={(e) => setAwardForm((f) => ({ ...f, criteria: e.target.value }))}
                          placeholder="e.g. Complete all modules with 90%+ score"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Label>Active</Label>
                        <Switch
                          checked={awardForm.isActive}
                          onCheckedChange={(v) => setAwardForm((f) => ({ ...f, isActive: v }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAwardDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveAward}>{editingAwardId ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAwards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No awards found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAwards.map((award) => (
                      <TableRow key={award.id}>
                        <TableCell className="font-medium">{award.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{award.description}</TableCell>
                        <TableCell>{award.courseName || "—"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{award.criteria}</TableCell>
                        <TableCell>
                          {award.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditAward(award)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteAwardId(award.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Learning Tags
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tags..."
                    className="pl-8 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateTag}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTagId ? "Edit Tag" : "Create Tag"}</DialogTitle>
                      <DialogDescription>
                        {editingTagId ? "Update tag details." : "Create a new learning tag."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                          value={tagForm.name}
                          onChange={(e) => setTagForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Tag name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Collection</Label>
                        <Input
                          value={tagForm.collection}
                          onChange={(e) => setTagForm((f) => ({ ...f, collection: e.target.value }))}
                          placeholder="e.g. Skills, Department, Level"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveTag}>{editingTagId ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No tags found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell>{tag.collection}</TableCell>
                        <TableCell>{tag.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditTag(tag)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTagId(tag.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Delete confirmations */}
          <Dialog open={!!deleteAwardId} onOpenChange={() => setDeleteAwardId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Award</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this award? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteAwardId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteAward}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!deleteTagId} onOpenChange={() => setDeleteTagId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Tag</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this tag? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteTagId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteTag}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: LEARNING RIGHTS                                              */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="rights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Learning Rights &amp; Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Admin rights */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Administrator Rights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Create Courses</p>
                      <p className="text-sm text-muted-foreground">Allow administrators to create new courses.</p>
                    </div>
                    <Switch
                      checked={rights.adminCreateCourse}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, adminCreateCourse: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Edit Courses</p>
                      <p className="text-sm text-muted-foreground">Allow administrators to edit existing courses.</p>
                    </div>
                    <Switch
                      checked={rights.adminEditCourse}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, adminEditCourse: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Delete Courses</p>
                      <p className="text-sm text-muted-foreground">Allow administrators to delete courses.</p>
                    </div>
                    <Switch
                      checked={rights.adminDeleteCourse}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, adminDeleteCourse: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Manage Learning Groups</p>
                      <p className="text-sm text-muted-foreground">
                        Allow administrators to create, edit, and delete learning groups.
                      </p>
                    </div>
                    <Switch
                      checked={rights.adminManageGroups}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, adminManageGroups: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Manage Awards</p>
                      <p className="text-sm text-muted-foreground">
                        Allow administrators to create, edit, and delete learning awards.
                      </p>
                    </div>
                    <Switch
                      checked={rights.adminManageAwards}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, adminManageAwards: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Manage Tags</p>
                      <p className="text-sm text-muted-foreground">
                        Allow administrators to create, edit, and delete learning tags.
                      </p>
                    </div>
                    <Switch
                      checked={rights.adminManageTags}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, adminManageTags: v }))}
                    />
                  </div>
                </div>
              </div>

              {/* Manager rights */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Manager Rights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Enroll Employees</p>
                      <p className="text-sm text-muted-foreground">
                        Allow managers to enroll their team members in courses.
                      </p>
                    </div>
                    <Switch
                      checked={rights.managerEnrollEmployees}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, managerEnrollEmployees: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">View Progress</p>
                      <p className="text-sm text-muted-foreground">
                        Allow managers to view team members&apos; learning progress.
                      </p>
                    </div>
                    <Switch
                      checked={rights.managerViewProgress}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, managerViewProgress: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Assign Courses</p>
                      <p className="text-sm text-muted-foreground">
                        Allow managers to assign mandatory courses to team members.
                      </p>
                    </div>
                    <Switch
                      checked={rights.managerAssignCourses}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, managerAssignCourses: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Create Learning Groups</p>
                      <p className="text-sm text-muted-foreground">
                        Allow managers to create learning groups for their departments.
                      </p>
                    </div>
                    <Switch
                      checked={rights.managerCreateGroups}
                      onCheckedChange={(v) => setRights((r) => ({ ...r, managerCreateGroups: v }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
