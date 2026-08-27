"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import {
  WorkSchedule,
  TimeBlock,
  LatenessPolicy,
  AbsenteeismPolicy,
  GeofenceConfig,
  AttendanceRecord,
  Project,
  ProjectTask,
  TaskSheet,
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
  MapPin,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  ListTodo,
  LayoutGrid,
} from "lucide-react";
import { formatDate, formatCurrency, generateId } from "@/lib/utils";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusColors: Record<string, string> = {
  present: "bg-green-100 text-green-800 border-green-200",
  absent: "bg-red-100 text-red-800 border-red-200",
  late: "bg-yellow-100 text-yellow-800 border-yellow-200",
  half_day: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  on_hold: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  todo: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  review: "bg-purple-100 text-purple-800 border-purple-200",
  done: "bg-green-100 text-green-800 border-green-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const defaultScheduleForm: Omit<WorkSchedule, "id" | "createdAt" | "employeeCount"> = {
  name: "",
  type: "full_time",
  startTime: "09:00",
  endTime: "17:00",
  breakMinutes: 60,
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  isActive: true,
};

const defaultTimeBlockForm: Omit<TimeBlock, "id"> = {
  name: "",
  startTime: "",
  endTime: "",
  color: "#3B82F6",
};

const defaultLatenessForm: Omit<LatenessPolicy, "id" | "isActive"> = {
  name: "",
  graceMinutes: 15,
  actionAfterGrace: "warning",
  deductionAmount: 0,
};

const defaultAbsenteeismForm: Omit<AbsenteeismPolicy, "id" | "isActive"> = {
  name: "",
  maxConsecutiveDays: 3,
  maxMonthlyOccurrences: 2,
  action: "warning",
};

const defaultGeofenceForm: Omit<GeofenceConfig, "id" | "employeeCount"> = {
  name: "",
  latitude: 0,
  longitude: 0,
  radius: 100,
  isActive: true,
};

const defaultProjectForm: Omit<Project, "id" | "createdAt" | "taskCount"> = {
  name: "",
  description: "",
  budget: 0,
  startDate: "",
  endDate: "",
  status: "active",
};

const defaultTaskForm: Omit<ProjectTask, "id" | "createdAt"> = {
  projectId: "",
  projectName: "",
  name: "",
  description: "",
  assignedTo: "",
  assignedToName: "",
  dueDate: "",
  status: "todo",
  priority: "medium",
};

export default function AttendanceScheduling() {
  const {
    workSchedules,
    addWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
    timeBlocks,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    latenessPolicies,
    addLatenessPolicy,
    updateLatenessPolicy,
    deleteLatenessPolicy,
    absenteeismPolicies,
    addAbsenteeismPolicy,
    updateAbsenteeismPolicy,
    deleteAbsenteeismPolicy,
    geofences,
    addGeofence,
    updateGeofence,
    deleteGeofence,
    attendanceRecords,
    projects,
    addProject,
    updateProject,
    deleteProject,
    projectTasks,
    addProjectTask,
    updateProjectTask,
    deleteProjectTask,
    taskSheets,
    employees,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("schedules");
  const [search, setSearch] = useState("");

  // Schedule state
  const [scheduleForm, setScheduleForm] = useState(defaultScheduleForm);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);

  // Time Block state
  const [timeBlockForm, setTimeBlockForm] = useState(defaultTimeBlockForm);
  const [timeBlockDialogOpen, setTimeBlockDialogOpen] = useState(false);
  const [editingTimeBlockId, setEditingTimeBlockId] = useState<string | null>(null);
  const [deleteTimeBlockId, setDeleteTimeBlockId] = useState<string | null>(null);

  // Lateness state
  const [latenessForm, setLatenessForm] = useState(defaultLatenessForm);
  const [latenessDialogOpen, setLatenessDialogOpen] = useState(false);
  const [editingLatenessId, setEditingLatenessId] = useState<string | null>(null);

  // Absenteeism state
  const [absenteeismForm, setAbsenteeismForm] = useState(defaultAbsenteeismForm);
  const [absenteeismDialogOpen, setAbsenteeismDialogOpen] = useState(false);
  const [editingAbsenteeismId, setEditingAbsenteeismId] = useState<string | null>(null);

  // Geofence state
  const [geofenceForm, setGeofenceForm] = useState(defaultGeofenceForm);
  const [geofenceDialogOpen, setGeofenceDialogOpen] = useState(false);
  const [editingGeofenceId, setEditingGeofenceId] = useState<string | null>(null);
  const [deleteGeofenceId, setDeleteGeofenceId] = useState<string | null>(null);

  // Attendance state
  const [attendanceDateFilter, setAttendanceDateFilter] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");

  // Projects sub-tab state
  const [projectSubTab, setProjectSubTab] = useState("projects");
  const [projectForm, setProjectForm] = useState(defaultProjectForm);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [taskForm, setTaskForm] = useState(defaultTaskForm);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // ---- SCHEDULES ----
  const filteredSchedules = workSchedules.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSaveSchedule = () => {
    if (!scheduleForm.name.trim()) return;
    if (editingScheduleId) {
      updateWorkSchedule(editingScheduleId, scheduleForm);
    } else {
      addWorkSchedule({ ...scheduleForm, createdAt: new Date().toISOString(), employeeCount: 0 });
    }
    setScheduleDialogOpen(false);
  };

  const toggleScheduleDay = (day: string) => {
    setScheduleForm((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  // ---- TIME BLOCKS ----
  const handleSaveTimeBlock = () => {
    if (!timeBlockForm.name.trim()) return;
    if (editingTimeBlockId) {
      updateTimeBlock(editingTimeBlockId, timeBlockForm);
    } else {
      addTimeBlock(timeBlockForm);
    }
    setTimeBlockDialogOpen(false);
  };

  // ---- LATENESS ----
  const handleSaveLateness = () => {
    if (!latenessForm.name.trim()) return;
    if (editingLatenessId) {
      updateLatenessPolicy(editingLatenessId, latenessForm);
    } else {
      addLatenessPolicy({ ...latenessForm, isActive: true });
    }
    setLatenessDialogOpen(false);
  };

  // ---- ABSENTEEISM ----
  const handleSaveAbsenteeism = () => {
    if (!absenteeismForm.name.trim()) return;
    if (editingAbsenteeismId) {
      updateAbsenteeismPolicy(editingAbsenteeismId, absenteeismForm);
    } else {
      addAbsenteeismPolicy({ ...absenteeismForm, isActive: true });
    }
    setAbsenteeismDialogOpen(false);
  };

  // ---- GEOFENCE ----
  const handleSaveGeofence = () => {
    if (!geofenceForm.name.trim()) return;
    if (editingGeofenceId) {
      updateGeofence(editingGeofenceId, geofenceForm);
    } else {
      addGeofence({ ...geofenceForm, employeeCount: 0 });
    }
    setGeofenceDialogOpen(false);
  };

  // ---- ATTENDANCE ----
  const filteredAttendance = attendanceRecords.filter((r) => {
    const matchesSearch = r.employeeName.toLowerCase().includes(attendanceSearch.toLowerCase());
    const matchesDate = !attendanceDateFilter || r.date === attendanceDateFilter;
    return matchesSearch && matchesDate;
  });

  // ---- PROJECTS ----
  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredTasks = projectTasks.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.projectName.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTaskSheets = taskSheets.filter((ts) => ts.employeeName.toLowerCase().includes(search.toLowerCase()));

  const handleSaveProject = () => {
    if (!projectForm.name.trim()) return;
    if (editingProjectId) {
      updateProject(editingProjectId, projectForm);
    } else {
      addProject({ ...projectForm, taskCount: 0, createdAt: new Date().toISOString() });
    }
    setProjectDialogOpen(false);
  };

  const handleSaveTask = () => {
    if (!taskForm.name.trim()) return;
    const proj = projects.find((p) => p.id === taskForm.projectId);
    if (editingTaskId) {
      updateProjectTask(editingTaskId, { ...taskForm, projectName: proj?.name ?? "" });
    } else {
      addProjectTask({ ...taskForm, projectName: proj?.name ?? "", createdAt: new Date().toISOString() });
    }
    setTaskDialogOpen(false);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="schedules">Work Schedules</TabsTrigger>
        <TabsTrigger value="timeblocks">Time Blocks</TabsTrigger>
        <TabsTrigger value="policies">Policies</TabsTrigger>
        <TabsTrigger value="geofencing">Geofencing</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="projects">Projects & Tasks</TabsTrigger>
      </TabsList>

      {/* =============== TAB 1: WORK SCHEDULES =============== */}
      <TabsContent value="schedules" className="space-y-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Work Schedules</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search schedules..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-64" />
              </div>
              <Button
                onClick={() => {
                  setEditingScheduleId(null);
                  setScheduleForm(defaultScheduleForm);
                  setScheduleDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" /> Create Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((sched) => (
                  <TableRow key={sched.id}>
                    <TableCell className="font-medium">{sched.name}</TableCell>
                    <TableCell>
                      <Badge className={sched.type === "full_time" ? "bg-blue-100 text-blue-800 border-blue-200 border" : "bg-purple-100 text-purple-800 border-purple-200 border"}>
                        {sched.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{sched.startTime}</TableCell>
                    <TableCell>{sched.endTime}</TableCell>
                    <TableCell>{sched.breakMinutes} min</TableCell>
                    <TableCell>{sched.days.join(", ")}</TableCell>
                    <TableCell>
                      <Badge className={sched.isActive ? "bg-green-100 text-green-800 border-green-200 border" : "bg-red-100 text-red-800 border-red-200 border"}>
                        {sched.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{sched.employeeCount}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingScheduleId(sched.id);
                          setScheduleForm({
                            name: sched.name,
                            type: sched.type,
                            startTime: sched.startTime,
                            endTime: sched.endTime,
                            breakMinutes: sched.breakMinutes,
                            days: sched.days,
                            isActive: sched.isActive,
                          });
                          setScheduleDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteScheduleId(sched.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingScheduleId ? "Edit Work Schedule" : "Create Work Schedule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={scheduleForm.name} onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={scheduleForm.type} onValueChange={(v: WorkSchedule["type"]) => setScheduleForm({ ...scheduleForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="rotational">Rotational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Break Minutes</Label>
                <Input type="number" value={scheduleForm.breakMinutes} onChange={(e) => setScheduleForm({ ...scheduleForm, breakMinutes: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Days</Label>
                <div className="flex gap-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center gap-1">
                      <Checkbox checked={scheduleForm.days.includes(day)} onCheckedChange={() => toggleScheduleDay(day)} />
                      <span className="text-sm">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={scheduleForm.isActive} onCheckedChange={(v) => setScheduleForm({ ...scheduleForm, isActive: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSchedule} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Delete Confirm */}
        <Dialog open={!!deleteScheduleId} onOpenChange={() => setDeleteScheduleId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Schedule</DialogTitle>
              <DialogDescription>Are you sure you want to delete this work schedule?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteScheduleId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (deleteScheduleId) { deleteWorkSchedule(deleteScheduleId); setDeleteScheduleId(null); } }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* =============== TAB 2: TIME BLOCKS =============== */}
      <TabsContent value="timeblocks" className="space-y-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Time Blocks</CardTitle>
            <Button
              onClick={() => {
                setEditingTimeBlockId(null);
                setTimeBlockForm(defaultTimeBlockForm);
                setTimeBlockDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Time Block
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeBlocks.map((tb) => (
                  <TableRow key={tb.id}>
                    <TableCell className="font-medium">{tb.name}</TableCell>
                    <TableCell>{tb.startTime}</TableCell>
                    <TableCell>{tb.endTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: tb.color }} />
                        <span className="text-sm text-gray-500">{tb.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTimeBlockId(tb.id);
                          setTimeBlockForm({ name: tb.name, startTime: tb.startTime, endTime: tb.endTime, color: tb.color });
                          setTimeBlockDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTimeBlockId(tb.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Time Block Dialog */}
        <Dialog open={timeBlockDialogOpen} onOpenChange={setTimeBlockDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTimeBlockId ? "Edit Time Block" : "Create Time Block"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={timeBlockForm.name} onChange={(e) => setTimeBlockForm({ ...timeBlockForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={timeBlockForm.startTime} onChange={(e) => setTimeBlockForm({ ...timeBlockForm, startTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={timeBlockForm.endTime} onChange={(e) => setTimeBlockForm({ ...timeBlockForm, endTime: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-3">
                  <Input type="color" value={timeBlockForm.color} onChange={(e) => setTimeBlockForm({ ...timeBlockForm, color: e.target.value })} className="w-16 h-10 p-1" />
                  <Input value={timeBlockForm.color} onChange={(e) => setTimeBlockForm({ ...timeBlockForm, color: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTimeBlockDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTimeBlock} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Time Block Delete Confirm */}
        <Dialog open={!!deleteTimeBlockId} onOpenChange={() => setDeleteTimeBlockId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Time Block</DialogTitle>
              <DialogDescription>Are you sure you want to delete this time block?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTimeBlockId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (deleteTimeBlockId) { deleteTimeBlock(deleteTimeBlockId); setDeleteTimeBlockId(null); } }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* =============== TAB 3: POLICIES =============== */}
      <TabsContent value="policies" className="space-y-6">
        {/* Lateness Policies */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Lateness Policies</CardTitle>
            <Button
              onClick={() => {
                setEditingLatenessId(null);
                setLatenessForm(defaultLatenessForm);
                setLatenessDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Policy
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grace Minutes</TableHead>
                  <TableHead>Action After Grace</TableHead>
                  <TableHead>Deduction Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latenessPolicies.map((lp) => (
                  <TableRow key={lp.id}>
                    <TableCell className="font-medium">{lp.name}</TableCell>
                    <TableCell>{lp.graceMinutes} min</TableCell>
                    <TableCell className="capitalize">{lp.actionAfterGrace}</TableCell>
                    <TableCell>{lp.deductionAmount > 0 ? `$${lp.deductionAmount}` : "-"}</TableCell>
                    <TableCell>
                      <Badge className={lp.isActive ? "bg-green-100 text-green-800 border-green-200 border" : "bg-gray-100 text-gray-600 border-gray-200 border"}>
                        {lp.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingLatenessId(lp.id);
                          setLatenessForm({ name: lp.name, graceMinutes: lp.graceMinutes, actionAfterGrace: lp.actionAfterGrace, deductionAmount: lp.deductionAmount });
                          setLatenessDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteLatenessPolicy(lp.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lateness Dialog */}
        <Dialog open={latenessDialogOpen} onOpenChange={setLatenessDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLatenessId ? "Edit Lateness Policy" : "Create Lateness Policy"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={latenessForm.name} onChange={(e) => setLatenessForm({ ...latenessForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Grace Minutes</Label>
                <Input type="number" value={latenessForm.graceMinutes} onChange={(e) => setLatenessForm({ ...latenessForm, graceMinutes: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Action After Grace</Label>
                <Select value={latenessForm.actionAfterGrace} onValueChange={(v: LatenessPolicy["actionAfterGrace"]) => setLatenessForm({ ...latenessForm, actionAfterGrace: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                    <SelectItem value="escalation">Escalation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {latenessForm.actionAfterGrace === "deduction" && (
                <div className="space-y-2">
                  <Label>Deduction Amount</Label>
                  <Input type="number" value={latenessForm.deductionAmount} onChange={(e) => setLatenessForm({ ...latenessForm, deductionAmount: parseFloat(e.target.value) || 0 })} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLatenessDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveLateness} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Absenteeism Policies */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Absenteeism Policies</CardTitle>
            <Button
              onClick={() => {
                setEditingAbsenteeismId(null);
                setAbsenteeismForm(defaultAbsenteeismForm);
                setAbsenteeismDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Policy
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Max Consecutive Days</TableHead>
                  <TableHead>Max Monthly Occurrences</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absenteeismPolicies.map((ap) => (
                  <TableRow key={ap.id}>
                    <TableCell className="font-medium">{ap.name}</TableCell>
                    <TableCell>{ap.maxConsecutiveDays}</TableCell>
                    <TableCell>{ap.maxMonthlyOccurrences}</TableCell>
                    <TableCell className="capitalize">{ap.action}</TableCell>
                    <TableCell>
                      <Badge className={ap.isActive ? "bg-green-100 text-green-800 border-green-200 border" : "bg-gray-100 text-gray-600 border-gray-200 border"}>
                        {ap.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingAbsenteeismId(ap.id);
                          setAbsenteeismForm({ name: ap.name, maxConsecutiveDays: ap.maxConsecutiveDays, maxMonthlyOccurrences: ap.maxMonthlyOccurrences, action: ap.action });
                          setAbsenteeismDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteAbsenteeismPolicy(ap.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Absenteeism Dialog */}
        <Dialog open={absenteeismDialogOpen} onOpenChange={setAbsenteeismDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAbsenteeismId ? "Edit Absenteeism Policy" : "Create Absenteeism Policy"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={absenteeismForm.name} onChange={(e) => setAbsenteeismForm({ ...absenteeismForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Max Consecutive Days</Label>
                <Input type="number" value={absenteeismForm.maxConsecutiveDays} onChange={(e) => setAbsenteeismForm({ ...absenteeismForm, maxConsecutiveDays: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Max Monthly Occurrences</Label>
                <Input type="number" value={absenteeismForm.maxMonthlyOccurrences} onChange={(e) => setAbsenteeismForm({ ...absenteeismForm, maxMonthlyOccurrences: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={absenteeismForm.action} onValueChange={(v: AbsenteeismPolicy["action"]) => setAbsenteeismForm({ ...absenteeismForm, action: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                    <SelectItem value="termination">Termination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAbsenteeismDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveAbsenteeism} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* =============== TAB 4: GEOFENCING =============== */}
      <TabsContent value="geofencing" className="space-y-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Geofencing</CardTitle>
            <Button
              onClick={() => {
                setEditingGeofenceId(null);
                setGeofenceForm(defaultGeofenceForm);
                setGeofenceDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Geofence
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {geofences.map((gf) => (
                  <TableRow key={gf.id}>
                    <TableCell className="font-medium">{gf.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">{gf.latitude.toFixed(4)}, {gf.longitude.toFixed(4)}</TableCell>
                    <TableCell>{gf.radius}m</TableCell>
                    <TableCell>{gf.employeeCount}</TableCell>
                    <TableCell>
                      <Badge className={gf.isActive ? "bg-green-100 text-green-800 border-green-200 border" : "bg-gray-100 text-gray-600 border-gray-200 border"}>
                        {gf.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingGeofenceId(gf.id);
                          setGeofenceForm({ name: gf.name, latitude: gf.latitude, longitude: gf.longitude, radius: gf.radius, isActive: gf.isActive });
                          setGeofenceDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteGeofenceId(gf.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Geofence Dialog */}
        <Dialog open={geofenceDialogOpen} onOpenChange={setGeofenceDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingGeofenceId ? "Edit Geofence" : "Create Geofence"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={geofenceForm.name} onChange={(e) => setGeofenceForm({ ...geofenceForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="any" value={geofenceForm.latitude} onChange={(e) => setGeofenceForm({ ...geofenceForm, latitude: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="any" value={geofenceForm.longitude} onChange={(e) => setGeofenceForm({ ...geofenceForm, longitude: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Radius (meters)</Label>
                <Input type="number" value={geofenceForm.radius} onChange={(e) => setGeofenceForm({ ...geofenceForm, radius: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={geofenceForm.isActive} onCheckedChange={(v) => setGeofenceForm({ ...geofenceForm, isActive: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGeofenceDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveGeofence} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Geofence Delete Confirm */}
        <Dialog open={!!deleteGeofenceId} onOpenChange={() => setDeleteGeofenceId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Geofence</DialogTitle>
              <DialogDescription>Are you sure you want to delete this geofence configuration?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteGeofenceId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (deleteGeofenceId) { deleteGeofence(deleteGeofenceId); setDeleteGeofenceId(null); } }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* =============== TAB 5: ATTENDANCE RECORDS =============== */}
      <TabsContent value="attendance" className="space-y-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Attendance Records</CardTitle>
            <div className="flex items-center gap-3">
              <Input type="date" value={attendanceDateFilter} onChange={(e) => setAttendanceDateFilter(e.target.value)} className="w-48" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search employee..." value={attendanceSearch} onChange={(e) => setAttendanceSearch(e.target.value)} className="pl-10 w-64" />
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Export All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Geofence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.employeeName}</TableCell>
                    <TableCell>{formatDate(rec.date)}</TableCell>
                    <TableCell>{rec.clockIn}</TableCell>
                    <TableCell>{rec.clockOut || "-"}</TableCell>
                    <TableCell>{rec.hoursWorked.toFixed(1)}h</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[rec.status]} border`}>{rec.status}</Badge>
                    </TableCell>
                    <TableCell>{rec.geofenceName || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* =============== TAB 6: PROJECTS & TASKS =============== */}
      <TabsContent value="projects" className="space-y-4">
        <Tabs value={projectSubTab} onValueChange={setProjectSubTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="sheets">Task Sheets</TabsTrigger>
          </TabsList>

          {/* ---- Projects Sub-tab ---- */}
          <TabsContent value="projects" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Projects</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-64" />
                  </div>
                  <Button
                    onClick={() => {
                      setEditingProjectId(null);
                      setProjectForm(defaultProjectForm);
                      setProjectDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((proj) => (
                      <TableRow key={proj.id}>
                        <TableCell className="font-medium">{proj.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-gray-500">{proj.description}</TableCell>
                        <TableCell>{formatCurrency(proj.budget)}</TableCell>
                        <TableCell>{formatDate(proj.startDate)}</TableCell>
                        <TableCell>{formatDate(proj.endDate)}</TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[proj.status]} border`}>{proj.status.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell>{proj.taskCount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProjectId(proj.id);
                              setProjectForm({
                                name: proj.name,
                                description: proj.description,
                                budget: proj.budget,
                                startDate: proj.startDate,
                                endDate: proj.endDate,
                                status: proj.status,
                              });
                              setProjectDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteProject(proj.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Project Dialog */}
            <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingProjectId ? "Edit Project" : "Create Project"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget</Label>
                    <Input type="number" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={projectForm.startDate} onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" value={projectForm.endDate} onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={projectForm.status} onValueChange={(v: Project["status"]) => setProjectForm({ ...projectForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveProject} className="bg-blue-600 hover:bg-blue-700">Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ---- Tasks Sub-tab ---- */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Tasks</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-64" />
                  </div>
                  <Button
                    onClick={() => {
                      setEditingTaskId(null);
                      setTaskForm(defaultTaskForm);
                      setTaskDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.projectName}</TableCell>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>{task.assignedToName || "-"}</TableCell>
                        <TableCell>{formatDate(task.dueDate)}</TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[task.status]} border`}>{task.status.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[task.priority]} border`}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTaskId(task.id);
                              setTaskForm({
                                projectId: task.projectId,
                                projectName: task.projectName,
                                name: task.name,
                                description: task.description,
                                assignedTo: task.assignedTo ?? "",
                                assignedToName: task.assignedToName ?? "",
                                dueDate: task.dueDate,
                                status: task.status,
                                priority: task.priority,
                              });
                              setTaskDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteProjectTask(task.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Task Dialog */}
            <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingTaskId ? "Edit Task" : "Create Task"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Project *</Label>
                    <Select value={taskForm.projectId} onValueChange={(v) => setTaskForm({ ...taskForm, projectId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Task Name *</Label>
                    <Input value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Select
                      value={taskForm.assignedTo}
                      onValueChange={(v) => {
                        const emp = employees.find((e) => e.id === v);
                        setTaskForm({ ...taskForm, assignedTo: v, assignedToName: emp ? `${emp.firstName} ${emp.lastName}` : "" });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.filter((e) => e.status === "active").map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={taskForm.status} onValueChange={(v: ProjectTask["status"]) => setTaskForm({ ...taskForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={taskForm.priority} onValueChange={(v: ProjectTask["priority"]) => setTaskForm({ ...taskForm, priority: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveTask} className="bg-blue-600 hover:bg-blue-700">Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ---- Task Sheets Sub-tab ---- */}
          <TabsContent value="sheets" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Task Sheets</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-64" />
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTaskSheets.map((ts) => (
                      <TableRow key={ts.id}>
                        <TableCell className="font-medium">{ts.employeeName}</TableCell>
                        <TableCell>{ts.projectName}</TableCell>
                        <TableCell>{formatDate(ts.date)}</TableCell>
                        <TableCell>{ts.hoursWorked}h</TableCell>
                        <TableCell className="max-w-[250px] truncate text-sm text-gray-500">{ts.description}</TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[ts.status]} border`}>{ts.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}
