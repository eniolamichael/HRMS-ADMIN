"use client";

import { useState, useMemo } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { Employee, EmployeeDocument, EmployeeIDConfig, TrainingCertificate } from "@/types/hrms";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Upload,
  Pencil,
  Trash2,
  Search,
  Download,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  User,
  Briefcase,
  Settings2,
  AlertTriangle,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

const PAGE_SIZE = 10;

const defaultEmployeeForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  dateOfJoining: "",
  departmentId: "",
  departmentName: "",
  jobRoleId: "",
  jobRoleName: "",
  payGroupId: "",
  payGroupName: "",
  payGradeId: "",
  payGradeName: "",
  employmentType: "full_time" as Employee["employmentType"],
  contractStartDate: "",
  contractEndDate: "",
  address: "",
  city: "",
  state: "",
  country: "",
  emergencyContact: "",
  emergencyPhone: "",
  status: "active" as Employee["status"],
};

const defaultIDConfig: EmployeeIDConfig = {
  prefix: "EMP",
  suffix: "",
  nextNumber: 1001,
  digitLength: 4,
  format: "EMP-0001",
};

export default function EmployeeHRIS() {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    departments,
    jobRoles,
    employeeIDConfig,
    updateEmployeeIDConfig,
  } = useHrms();

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [empForm, setEmpForm] = useState(defaultEmployeeForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [viewTab, setViewTab] = useState("personal");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCsv, setBulkCsv] = useState("");
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [idConfigDialogOpen, setIdConfigDialogOpen] = useState(false);
  const [idConfig, setIdConfig] = useState<EmployeeIDConfig>(employeeIDConfig ?? defaultIDConfig);
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);
  const [bulkUpdateDept, setBulkUpdateDept] = useState("");
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState("");
  const [bulkUpdateIds, setBulkUpdateIds] = useState("");

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch =
        search === "" ||
        e.firstName.toLowerCase().includes(search.toLowerCase()) ||
        e.lastName.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === "all" || e.departmentId === filterDept;
      const matchStatus = filterStatus === "all" || e.status === filterStatus;
      const matchType = filterType === "all" || e.employmentType === filterType;
      return matchSearch && matchDept && matchStatus && matchType;
    });
  }, [employees, search, filterDept, filterStatus, filterType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreateDialog = () => {
    setEditingId(null);
    setEmpForm(defaultEmployeeForm);
    setDialogOpen(true);
  };

  const openEditDialog = (emp: Employee) => {
    setEditingId(emp.id);
    setEmpForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      gender: emp.gender,
      dateOfBirth: emp.dateOfBirth,
      dateOfJoining: emp.dateOfJoining,
      departmentId: emp.departmentId,
      departmentName: emp.departmentName,
      jobRoleId: emp.jobRoleId,
      jobRoleName: emp.jobRoleName,
      payGroupId: emp.payGroupId ?? "",
      payGroupName: emp.payGroupName ?? "",
      payGradeId: emp.payGradeId ?? "",
      payGradeName: emp.payGradeName ?? "",
      employmentType: emp.employmentType,
      contractStartDate: emp.contractStartDate ?? "",
      contractEndDate: emp.contractEndDate ?? "",
      address: emp.address ?? "",
      city: emp.city ?? "",
      state: emp.state ?? "",
      country: emp.country ?? "",
      emergencyContact: emp.emergencyContact ?? "",
      emergencyPhone: emp.emergencyPhone ?? "",
      status: emp.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!empForm.firstName.trim() || !empForm.lastName.trim() || !empForm.email.trim()) return;

    const dept = departments.find((d) => d.id === empForm.departmentId);
    const role = jobRoles.find((r) => r.id === empForm.jobRoleId);

    const payload = {
      ...empForm,
      departmentName: dept?.name ?? empForm.departmentName,
      jobRoleName: role?.name ?? empForm.jobRoleName,
    };

    if (editingId) {
      updateEmployee(editingId, payload);
    } else {
      const config = idConfig;
      const empId = `${config.prefix}-${String(config.nextNumber).padStart(config.digitLength, "0")}${config.suffix ? "-" + config.suffix : ""}`;
      addEmployee({
        ...payload,
        employeeId: empId,
        trainingCerts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      updateEmployeeIDConfig({ ...config, nextNumber: config.nextNumber + 1 });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    setDeleteConfirmId(null);
  };

  const handleBulkUpload = () => {
    const lines = bulkCsv.trim().split("\n");
    if (lines.length < 2) {
      setBulkErrors(["CSV must have a header row and at least one data row."]);
      return;
    }

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredCols = ["firstname", "lastname", "email", "phone"];
    const missingCols = requiredCols.filter((c) => !header.includes(c));
    if (missingCols.length > 0) {
      setBulkErrors([`Missing required columns: ${missingCols.join(", ")}`]);
      return;
    }

    const errors: string[] = [];
    const newEmployees: Omit<Employee, "id">[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const firstName = cols[header.indexOf("firstname")] || "";
      const lastName = cols[header.indexOf("lastname")] || "";
      const email = cols[header.indexOf("email")] || "";

      if (!firstName || !lastName || !email) {
        errors.push(`Row ${i + 1}: First name, last name, and email are required.`);
        continue;
      }

      if (employees.some((e) => e.email === email)) {
        errors.push(`Row ${i + 1}: Email "${email}" already exists.`);
        continue;
      }

      const config = idConfig;
      const empId = `${config.prefix}-${String(config.nextNumber + newEmployees.length).padStart(config.digitLength, "0")}${config.suffix ? "-" + config.suffix : ""}`;

      newEmployees.push({
        employeeId: empId,
        firstName,
        lastName,
        email,
        phone: cols[header.indexOf("phone")] || "",
        gender: cols[header.indexOf("gender")] || "",
        dateOfBirth: cols[header.indexOf("dateofbirth")] || "",
        dateOfJoining: cols[header.indexOf("dateofjoining")] || "",
        departmentId: "",
        departmentName: cols[header.indexOf("department")] || "",
        jobRoleId: "",
        jobRoleName: cols[header.indexOf("jobrole")] || "",
        status: "active",
        employmentType: (cols[header.indexOf("employmenttype")] || "full_time") as Employee["employmentType"],
        trainingCerts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setBulkErrors(errors);
    if (newEmployees.length > 0 && errors.length === 0) {
      newEmployees.forEach((emp) => addEmployee(emp));
      updateEmployeeIDConfig({ ...idConfig, nextNumber: idConfig.nextNumber + newEmployees.length });
      setBulkCsv("");
      setBulkDialogOpen(false);
    }
  };

  const handleBulkUpdate = () => {
    const ids = bulkUpdateIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) return;

    ids.forEach((empId) => {
      const emp = employees.find((e) => e.employeeId === empId);
      if (emp) {
        const updates: Partial<Employee> = {};
        if (bulkUpdateDept) {
          const dept = departments.find((d) => d.id === bulkUpdateDept);
          updates.departmentId = bulkUpdateDept;
          updates.departmentName = dept?.name ?? "";
        }
        if (bulkUpdateStatus) {
          updates.status = bulkUpdateStatus as Employee["status"];
        }
        updateEmployee(emp.id, updates);
      }
    });
    setBulkUpdateDialogOpen(false);
    setBulkUpdateDept("");
    setBulkUpdateStatus("");
    setBulkUpdateIds("");
  };

  const handleSaveIDConfig = () => {
    const preview = `${idConfig.prefix}-${String(idConfig.nextNumber).padStart(idConfig.digitLength, "0")}${idConfig.suffix ? "-" + idConfig.suffix : ""}`;
    updateEmployeeIDConfig({ ...idConfig, format: preview });
    setIdConfigDialogOpen(false);
  };

  const statusColor = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "on_leave":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "terminated":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const employmentTypeLabel = (t: Employee["employmentType"]) => {
    switch (t) {
      case "full_time":
        return "Full Time";
      case "part_time":
        return "Part Time";
      case "contract":
        return "Contract";
      case "intern":
        return "Intern";
    }
  };

  const sampleDocs: EmployeeDocument[] = [
    { id: "1", name: "Employment Contract", fileName: "contract.pdf", fileSize: 245000, uploadDate: "2024-01-15" },
    { id: "2", name: "ID Card Copy", fileName: "id_card.pdf", fileSize: 128000, uploadDate: "2024-01-15" },
    { id: "3", name: "Resume", fileName: "resume.pdf", fileSize: 310000, uploadDate: "2024-01-10" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee / HRIS Management
          </CardTitle>
          <CardDescription>Manage employee records, personal information, employment details, and documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={filterDept}
              onValueChange={(v) => {
                setFilterDept(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(v) => {
                setFilterStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterType}
              onValueChange={(v) => {
                setFilterType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Employment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Employees</DialogTitle>
                    <DialogDescription>
                      Paste CSV data below. Expected columns: firstName, lastName, email, phone, gender, dateOfBirth, dateOfJoining, department, jobRole, employmentType
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted p-3 text-xs font-mono">
                      <p className="text-muted-foreground mb-1">Example format:</p>
                      <p>firstName,lastName,email,phone,department,employmentType</p>
                      <p>John,Doe,john@example.com,+1234567890,Engineering,full_time</p>
                    </div>
                    <Textarea
                      className="min-h-[200px] font-mono text-sm"
                      placeholder="firstName,lastName,email,phone,..."
                      value={bulkCsv}
                      onChange={(e) => setBulkCsv(e.target.value)}
                    />
                    {bulkErrors.length > 0 && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-0.5">
                          {bulkErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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

              <Button
                variant="outline"
                onClick={() => {
                  const header = "firstName,lastName,email,phone,gender,dateOfBirth,dateOfJoining,department,jobRole,employmentType";
                  const blob = new Blob([header + "\n"], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "employee_template.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>

              <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Bulk Update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Update Employees</DialogTitle>
                    <DialogDescription>
                      Enter comma-separated Employee IDs to update. Leave fields empty to skip.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Employee IDs (comma-separated)</Label>
                      <Input
                        placeholder="e.g. EMP-0001, EMP-0002"
                        value={bulkUpdateIds}
                        onChange={(e) => setBulkUpdateIds(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Department</Label>
                      <Select value={bulkUpdateDept} onValueChange={setBulkUpdateDept}>
                        <SelectTrigger>
                          <SelectValue placeholder="Keep current" />
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
                    <div className="space-y-2">
                      <Label>New Status</Label>
                      <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Keep current" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkUpdate} disabled={!bulkUpdateIds.trim()}>
                      Apply Update
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>

              <Dialog open={idConfigDialogOpen} onOpenChange={setIdConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Employee ID Configuration</DialogTitle>
                    <DialogDescription>Configure the format for auto-generated employee IDs.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prefix</Label>
                        <Input
                          value={idConfig.prefix}
                          onChange={(e) => setIdConfig((s) => ({ ...s, prefix: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Suffix (optional)</Label>
                        <Input
                          value={idConfig.suffix}
                          onChange={(e) => setIdConfig((s) => ({ ...s, suffix: e.target.value }))}
                          placeholder="e.g. HQ"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Next Number</Label>
                        <Input
                          type="number"
                          value={idConfig.nextNumber}
                          onChange={(e) => setIdConfig((s) => ({ ...s, nextNumber: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Digit Length</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={idConfig.digitLength}
                          onChange={(e) => setIdConfig((s) => ({ ...s, digitLength: parseInt(e.target.value) || 4 }))}
                        />
                      </div>
                    </div>
                    <div className="rounded-md bg-muted p-3">
                      <p className="text-xs text-muted-foreground mb-1">Preview</p>
                      <p className="font-mono text-sm font-medium">
                        {idConfig.prefix}-{String(idConfig.nextNumber).padStart(idConfig.digitLength, "0")}
                        {idConfig.suffix ? `-${idConfig.suffix}` : ""}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIdConfigDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveIDConfig}>Save Configuration</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contract End</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((emp) => (
                    <TableRow
                      key={emp.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setViewEmployee(emp);
                        setViewTab("personal");
                      }}
                    >
                      <TableCell className="font-mono text-sm">{emp.employeeId}</TableCell>
                      <TableCell className="font-medium">{emp.firstName}</TableCell>
                      <TableCell>{emp.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                      <TableCell>{emp.departmentName}</TableCell>
                      <TableCell>{emp.jobRoleName}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${statusColor(emp.status)}`}>
                          {emp.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">{employmentTypeLabel(emp.employmentType)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {emp.contractEndDate ? formatDate(emp.contractEndDate) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(emp)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Dialog open={deleteConfirmId === emp.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(emp.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Employee</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete &quot;{emp.firstName} {emp.lastName}&quot; ({emp.employeeId})? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                  Cancel
                                </Button>
                                <Button variant="destructive" onClick={() => handleDelete(emp.id)}>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} employees
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the employee details below."
                : "Fill in the details to create a new employee record."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emp-first">First Name *</Label>
              <Input
                id="emp-first"
                value={empForm.firstName}
                onChange={(e) => setEmpForm((s) => ({ ...s, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-last">Last Name *</Label>
              <Input
                id="emp-last"
                value={empForm.lastName}
                onChange={(e) => setEmpForm((s) => ({ ...s, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-email">Email *</Label>
              <Input
                id="emp-email"
                type="email"
                value={empForm.email}
                onChange={(e) => setEmpForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-phone">Phone</Label>
              <Input
                id="emp-phone"
                value={empForm.phone}
                onChange={(e) => setEmpForm((s) => ({ ...s, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={empForm.gender} onValueChange={(v) => setEmpForm((s) => ({ ...s, gender: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-dob">Date of Birth</Label>
              <Input
                id="emp-dob"
                type="date"
                value={empForm.dateOfBirth}
                onChange={(e) => setEmpForm((s) => ({ ...s, dateOfBirth: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-join">Date of Joining</Label>
              <Input
                id="emp-join"
                type="date"
                value={empForm.dateOfJoining}
                onChange={(e) => setEmpForm((s) => ({ ...s, dateOfJoining: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={empForm.departmentId}
                onValueChange={(v) => setEmpForm((s) => ({ ...s, departmentId: v }))}
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
            <div className="space-y-2">
              <Label>Job Role</Label>
              <Select
                value={empForm.jobRoleId}
                onValueChange={(v) => setEmpForm((s) => ({ ...s, jobRoleId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={empForm.employmentType}
                onValueChange={(v) => setEmpForm((s) => ({ ...s, employmentType: v as Employee["employmentType"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {empForm.employmentType === "contract" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="emp-cstart">Contract Start Date</Label>
                  <Input
                    id="emp-cstart"
                    type="date"
                    value={empForm.contractStartDate}
                    onChange={(e) => setEmpForm((s) => ({ ...s, contractStartDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-cend">Contract End Date</Label>
                  <Input
                    id="emp-cend"
                    type="date"
                    value={empForm.contractEndDate}
                    onChange={(e) => setEmpForm((s) => ({ ...s, contractEndDate: e.target.value }))}
                  />
                </div>
              </>
            )}
            <div className="col-span-2">
              <Separator className="my-2" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="emp-address">Address</Label>
              <Input
                id="emp-address"
                value={empForm.address}
                onChange={(e) => setEmpForm((s) => ({ ...s, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-city">City</Label>
              <Input
                id="emp-city"
                value={empForm.city}
                onChange={(e) => setEmpForm((s) => ({ ...s, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-state">State</Label>
              <Input
                id="emp-state"
                value={empForm.state}
                onChange={(e) => setEmpForm((s) => ({ ...s, state: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-country">Country</Label>
              <Input
                id="emp-country"
                value={empForm.country}
                onChange={(e) => setEmpForm((s) => ({ ...s, country: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-emerg">Emergency Contact</Label>
              <Input
                id="emp-emerg"
                value={empForm.emergencyContact}
                onChange={(e) => setEmpForm((s) => ({ ...s, emergencyContact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-emerg-phone">Emergency Phone</Label>
              <Input
                id="emp-emerg-phone"
                value={empForm.emergencyPhone}
                onChange={(e) => setEmpForm((s) => ({ ...s, emergencyPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={empForm.status} onValueChange={(v) => setEmpForm((s) => ({ ...s, status: v as Employee["status"] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!empForm.firstName.trim() || !empForm.lastName.trim() || !empForm.email.trim()}
            >
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewEmployee} onOpenChange={(open) => !open && setViewEmployee(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewEmployee && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {viewEmployee.firstName} {viewEmployee.lastName}
                    </DialogTitle>
                    <DialogDescription>
                      {viewEmployee.employeeId} &middot; {viewEmployee.departmentName} &middot; {viewEmployee.jobRoleName}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={viewTab} onValueChange={setViewTab} className="mt-4">
                <TabsList>
                  <TabsTrigger value="personal">
                    <User className="mr-2 h-4 w-4" />
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="employment">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Employment
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    <FileText className="mr-2 h-4 w-4" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="training">
                    <Award className="mr-2 h-4 w-4" />
                    Training Certificates
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">First Name</p>
                      <p className="font-medium">{viewEmployee.firstName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Name</p>
                      <p className="font-medium">{viewEmployee.lastName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{viewEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{viewEmployee.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">{viewEmployee.gender || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{viewEmployee.dateOfBirth ? formatDate(viewEmployee.dateOfBirth) : "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {[viewEmployee.address, viewEmployee.city, viewEmployee.state, viewEmployee.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Emergency Contact</p>
                      <p className="font-medium">{viewEmployee.emergencyContact || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Emergency Phone</p>
                      <p className="font-medium">{viewEmployee.emergencyPhone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${statusColor(viewEmployee.status)}`}>
                        {viewEmployee.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="employment" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Employee ID</p>
                      <p className="font-mono font-medium">{viewEmployee.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date of Joining</p>
                      <p className="font-medium">{viewEmployee.dateOfJoining ? formatDate(viewEmployee.dateOfJoining) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{viewEmployee.departmentName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Job Role</p>
                      <p className="font-medium">{viewEmployee.jobRoleName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Employment Type</p>
                      <p className="font-medium capitalize">{employmentTypeLabel(viewEmployee.employmentType)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pay Group</p>
                      <p className="font-medium">{viewEmployee.payGroupName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pay Grade</p>
                      <p className="font-medium">{viewEmployee.payGradeName || "—"}</p>
                    </div>
                    {viewEmployee.employmentType === "contract" && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Contract Start</p>
                          <p className="font-medium">{viewEmployee.contractStartDate ? formatDate(viewEmployee.contractStartDate) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contract End</p>
                          <p className="font-medium">{viewEmployee.contractEndDate ? formatDate(viewEmployee.contractEndDate) : "—"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <div className="space-y-3">
                    {sampleDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.fileName} &middot; {formatDate(doc.uploadDate)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {sampleDocs.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="training" className="mt-4">
                  <div className="space-y-3">
                    {viewEmployee.trainingCerts && viewEmployee.trainingCerts.length > 0 ? (
                      viewEmployee.trainingCerts.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-3">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{cert.certificateName}</p>
                              <p className="text-xs text-muted-foreground">
                                Issued: {formatDate(cert.issueDate)}
                                {cert.expiryDate && ` · Expires: ${formatDate(cert.expiryDate)}`}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No training certificates on file.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setViewEmployee(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewEmployee(null);
                    openEditDialog(viewEmployee);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Employee
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
