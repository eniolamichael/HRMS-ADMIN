"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import {
  Department,
  Division,
  JobRole,
  CompanyDocument,
  CompanyDocumentFolder,
  OrganogramNode,
} from "@/types/hrms";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
  FileText,
  Upload,
  Download,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  Image,
  LayoutGrid,
  Users,
  Briefcase,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

const defaultCompanyForm = {
  name: "",
  email: "",
  phone: "",
  country: "",
  currency: "NGN",
  website: "",
  address: "",
  description: "",
  ceoName: "",
  cfoName: "",
};

const defaultDeptForm = {
  name: "",
  code: "",
  description: "",
  headName: "",
  parentId: "",
  isActive: true,
};

const defaultDivisionForm = {
  name: "",
  code: "",
  description: "",
  headName: "",
  departmentIds: [] as string[],
  isActive: true,
};

const defaultJobRoleForm = {
  name: "",
  code: "",
  description: "",
  departmentId: "",
  minSalary: 0,
  maxSalary: 0,
  isActive: true,
};

const defaultDocForm = {
  name: "",
  description: "",
  folderId: "",
};

const WORKFLOW_MODULES = [
  "Leave",
  "Promotion",
  "Job Requisition",
  "Exit",
  "Employee Creation",
  "General",
];

function OrgNode({ node, depth = 0 }: { node: OrganogramNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
        style={{ marginLeft: depth * 28 }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{node.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {node.title} • {node.departmentName}
          </p>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="border-l-2 border-muted ml-5">
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildTree(nodes: OrganogramNode[]): OrganogramNode[] {
  const map = new Map<string, OrganogramNode>();
  const roots: OrganogramNode[] = [];

  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));

  nodes.forEach((n) => {
    const node = map.get(n.id)!;
    if (n.parentId && map.has(n.parentId)) {
      map.get(n.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function OrgStructure() {
  const {
    companyInfo,
    updateCompanyInfo,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    divisions,
    addDivision,
    updateDivision,
    deleteDivision,
    jobRoles,
    addJobRole,
    updateJobRole,
    deleteJobRole,
    companyDocuments,
    addCompanyDocument,
    deleteCompanyDocument,
    companyFolders,
    addCompanyFolder,
    employees,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("company");
  const [companyForm, setCompanyForm] = useState(
    companyInfo
      ? {
          name: companyInfo.name,
          email: companyInfo.email,
          phone: companyInfo.phone,
          country: companyInfo.country,
          currency: companyInfo.currency,
          website: companyInfo.website,
          address: companyInfo.address,
          description: companyInfo.description,
          ceoName: companyInfo.ceoName || "",
          cfoName: companyInfo.cfoName || "",
        }
      : defaultCompanyForm
  );

  // Department state
  const [deptForm, setDeptForm] = useState(defaultDeptForm);
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [deptEditingId, setDeptEditingId] = useState<string | null>(null);
  const [deptDeleteId, setDeptDeleteId] = useState<string | null>(null);

  // Division state
  const [divForm, setDivForm] = useState(defaultDivisionForm);
  const [divDialogOpen, setDivDialogOpen] = useState(false);
  const [divEditingId, setDivEditingId] = useState<string | null>(null);
  const [divDeleteId, setDivDeleteId] = useState<string | null>(null);

  // Job Role state
  const [roleForm, setRoleForm] = useState(defaultJobRoleForm);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleEditingId, setRoleEditingId] = useState<string | null>(null);
  const [roleDeleteId, setRoleDeleteId] = useState<string | null>(null);

  // Document state
  const [docForm, setDocForm] = useState(defaultDocForm);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docSearch, setDocSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Org state
  const [orgSearch, setOrgSearch] = useState("");

  const handleSaveCompany = () => {
    if (!companyInfo) return;
    updateCompanyInfo({
      ...companyInfo,
      ...companyForm,
      updatedAt: new Date().toISOString(),
    });
  };

  // Department CRUD
  const openDeptCreate = () => {
    setDeptEditingId(null);
    setDeptForm(defaultDeptForm);
    setDeptDialogOpen(true);
  };

  const openDeptEdit = (dept: Department) => {
    setDeptEditingId(dept.id);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      headName: dept.headName || "",
      parentId: dept.parentId || "",
      isActive: dept.isActive,
    });
    setDeptDialogOpen(true);
  };

  const handleSaveDept = () => {
    if (!deptForm.name.trim() || !deptForm.code.trim()) return;
    if (deptEditingId) {
      updateDepartment(deptEditingId, deptForm);
    } else {
      addDepartment({
        ...deptForm,
        headId: "",
        employeeCount: 0,
        createdAt: new Date().toISOString(),
      });
    }
    setDeptDialogOpen(false);
  };

  // Division CRUD
  const openDivCreate = () => {
    setDivEditingId(null);
    setDivForm(defaultDivisionForm);
    setDivDialogOpen(true);
  };

  const openDivEdit = (div: Division) => {
    setDivEditingId(div.id);
    setDivForm({
      name: div.name,
      code: div.code,
      description: div.description,
      headName: div.headName || "",
      departmentIds: div.departmentIds || [],
      isActive: div.isActive,
    });
    setDivDialogOpen(true);
  };

  const handleSaveDiv = () => {
    if (!divForm.name.trim() || !divForm.code.trim()) return;
    if (divEditingId) {
      updateDivision(divEditingId, divForm);
    } else {
      addDivision({
        ...divForm,
        headId: "",
        createdAt: new Date().toISOString(),
      });
    }
    setDivDialogOpen(false);
  };

  // Job Role CRUD
  const openRoleCreate = () => {
    setRoleEditingId(null);
    setRoleForm(defaultJobRoleForm);
    setRoleDialogOpen(true);
  };

  const openRoleEdit = (role: JobRole) => {
    setRoleEditingId(role.id);
    setRoleForm({
      name: role.name,
      code: role.code,
      description: role.description,
      departmentId: role.departmentId,
      minSalary: role.minSalary,
      maxSalary: role.maxSalary,
      isActive: role.isActive,
    });
    setRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleForm.name.trim() || !roleForm.code.trim()) return;
    const dept = departments.find((d) => d.id === roleForm.departmentId);
    if (roleEditingId) {
      updateJobRole(roleEditingId, {
        ...roleForm,
        departmentName: dept?.name || "",
      });
    } else {
      addJobRole({
        ...roleForm,
        departmentName: dept?.name || "",
        employeeCount: 0,
        isActive: roleForm.isActive,
        createdAt: new Date().toISOString(),
      });
    }
    setRoleDialogOpen(false);
  };

  // Document helpers
  const filteredDocs = companyDocuments.filter((doc) => {
    const matchFolder = selectedFolder ? doc.folderId === selectedFolder : true;
    const matchSearch = doc.name.toLowerCase().includes(docSearch.toLowerCase());
    return matchFolder && matchSearch;
  });

  const handleSaveDoc = () => {
    if (!docForm.name.trim()) return;
    const folder = companyFolders.find((f) => f.id === docForm.folderId);
    addCompanyDocument({
      ...docForm,
      fileName: docForm.name + ".pdf",
      folderName: folder?.name || "",
      uploadDate: new Date().toISOString(),
      fileSize: Math.floor(Math.random() * 5000000) + 100000,
    });
    setDocDialogOpen(false);
    setDocForm(defaultDocForm);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addCompanyFolder({
      name: newFolderName,
      documentCount: 0,
    });
    setNewFolderName("");
    setFolderDialogOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const orgTree = buildTree([]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Company Information
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Company Documents
          </TabsTrigger>
          <TabsTrigger value="organogram" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Organogram
          </TabsTrigger>
          <TabsTrigger value="structure" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Departments & Job Roles
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Company Information */}
        <TabsContent value="company" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Manage your company&apos;s profile and branding details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyForm.email}
                    onChange={(e) =>
                      setCompanyForm((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={companyForm.phone}
                    onChange={(e) =>
                      setCompanyForm((s) => ({ ...s, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-country">Country</Label>
                  <Input
                    id="company-country"
                    value={companyForm.country}
                    onChange={(e) =>
                      setCompanyForm((s) => ({
                        ...s,
                        country: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-currency">Currency</Label>
                  <Input
                    id="company-currency"
                    value={companyForm.currency}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={companyForm.website}
                    onChange={(e) =>
                      setCompanyForm((s) => ({
                        ...s,
                        website: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Textarea
                  id="company-address"
                  value={companyForm.address}
                  onChange={(e) =>
                    setCompanyForm((s) => ({ ...s, address: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-desc">Description</Label>
                <Textarea
                  id="company-desc"
                  value={companyForm.description}
                  onChange={(e) =>
                    setCompanyForm((s) => ({
                      ...s,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Leadership</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ceo-name">CEO Name</Label>
                    <Input
                      id="ceo-name"
                      value={companyForm.ceoName}
                      onChange={(e) =>
                        setCompanyForm((s) => ({
                          ...s,
                          ceoName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cfo-name">CFO Name</Label>
                    <Input
                      id="cfo-name"
                      value={companyForm.cfoName}
                      onChange={(e) =>
                        setCompanyForm((s) => ({
                          ...s,
                          cfoName: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Company Logo</h3>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
                    <Image className="h-10 w-10" />
                    <p className="text-sm font-medium">Click to upload logo</p>
                    <p className="text-xs">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Login Slider Images
                  </h3>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-10 w-10" />
                    <p className="text-sm font-medium">
                      Upload slider images
                    </p>
                    <p className="text-xs">PNG, JPG up to 5MB each</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveCompany}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Company Documents */}
        <TabsContent value="documents" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Company Documents</CardTitle>
                  <CardDescription>
                    Organize and manage company-wide documents.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFolderDialogOpen(true)}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Create Folder
                  </Button>
                  <Button onClick={() => setDocDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {/* Folders Sidebar */}
                <div className="w-56 shrink-0 space-y-1">
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedFolder === null
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    All Documents
                  </button>
                  {companyFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedFolder === folder.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Folder className="h-4 w-4 shrink-0" />
                        {folder.name}
                      </span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {folder.documentCount}
                      </Badge>
                    </button>
                  ))}
                </div>

                {/* Documents Table */}
                <div className="flex-1 min-w-0">
                  <div className="relative mb-4 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Folder</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>File Size</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocs.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No documents found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDocs.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">
                                {doc.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                {doc.description || "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {doc.folderName || "Unsorted"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(doc.uploadDate)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatFileSize(doc.fileSize)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Dialog
                                    open={false}
                                    onOpenChange={() => {}}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          deleteCompanyDocument(doc.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </DialogTrigger>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Document Dialog */}
          <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a new document to the company library.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    value={docForm.name}
                    onChange={(e) =>
                      setDocForm((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="e.g. Employee Handbook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={docForm.description}
                    onChange={(e) =>
                      setDocForm((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Folder</Label>
                  <Select
                    value={docForm.folderId}
                    onValueChange={(v) =>
                      setDocForm((s) => ({ ...s, folderId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyFolders.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8" />
                    <p className="text-sm">Click to select a file</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDocDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveDoc} disabled={!docForm.name.trim()}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Folder Dialog */}
          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize documents.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label>Folder Name</Label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Policies"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setFolderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 3: Organogram */}
        <TabsContent value="organogram" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organizational Chart</CardTitle>
                  <CardDescription>
                    Visual representation of the company hierarchy.
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Organogram
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search org chart..."
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                {orgTree.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No organizational data available.
                  </p>
                ) : (
                  orgTree.map((node) => <OrgNode key={node.id} node={node} />)
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Departments & Job Roles */}
        <TabsContent value="structure" className="space-y-6 mt-6">
          <Tabs defaultValue="departments">
            <TabsList>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="divisions">Divisions</TabsTrigger>
              <TabsTrigger value="job-roles">Job Roles</TabsTrigger>
            </TabsList>

            {/* Departments Sub-tab */}
            <TabsContent value="departments" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Departments</CardTitle>
                      <CardDescription>
                        Manage organizational departments.
                      </CardDescription>
                    </div>
                    <Button onClick={openDeptCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Department
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Head</TableHead>
                          <TableHead>Parent Dept</TableHead>
                          <TableHead>Employees</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departments.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No departments found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          departments.map((dept) => (
                            <TableRow key={dept.id}>
                              <TableCell className="font-medium">
                                {dept.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{dept.code}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {dept.headName || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {dept.parentName || "—"}
                              </TableCell>
                              <TableCell>{dept.employeeCount}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                                    dept.isActive
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }`}
                                >
                                  {dept.isActive ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openDeptEdit(dept)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Dialog
                                    open={deptDeleteId === dept.id}
                                    onOpenChange={(o) =>
                                      !o && setDeptDeleteId(null)
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeptDeleteId(dept.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Delete Department
                                        </DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to delete &quot;
                                          {dept.name}&quot;? This action cannot
                                          be undone.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setDeptDeleteId(null)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            deleteDepartment(dept.id);
                                            setDeptDeleteId(null);
                                          }}
                                        >
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

            {/* Divisions Sub-tab */}
            <TabsContent value="divisions" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Divisions</CardTitle>
                      <CardDescription>
                        Manage organizational divisions.
                      </CardDescription>
                    </div>
                    <Button onClick={openDivCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Division
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Head</TableHead>
                          <TableHead>Departments</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {divisions.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No divisions found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          divisions.map((div) => (
                            <TableRow key={div.id}>
                              <TableCell className="font-medium">
                                {div.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{div.code}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {div.headName || "—"}
                              </TableCell>
                              <TableCell>
                                {div.departmentIds?.length || 0}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                                    div.isActive
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }`}
                                >
                                  {div.isActive ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openDivEdit(div)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Dialog
                                    open={divDeleteId === div.id}
                                    onOpenChange={(o) =>
                                      !o && setDivDeleteId(null)
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDivDeleteId(div.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Delete Division
                                        </DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to delete &quot;
                                          {div.name}&quot;? This action cannot
                                          be undone.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setDivDeleteId(null)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            deleteDivision(div.id);
                                            setDivDeleteId(null);
                                          }}
                                        >
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

            {/* Job Roles Sub-tab */}
            <TabsContent value="job-roles" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job Roles</CardTitle>
                      <CardDescription>
                        Manage job roles and salary ranges.
                      </CardDescription>
                    </div>
                    <Button onClick={openRoleCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Job Role
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Salary Range</TableHead>
                          <TableHead>Employees</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobRoles.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No job roles found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          jobRoles.map((role) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">
                                {role.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{role.code}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {role.departmentName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                ₦{role.minSalary.toLocaleString()} - ₦
                                {role.maxSalary.toLocaleString()}
                              </TableCell>
                              <TableCell>{role.employeeCount}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                                    role.isActive
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }`}
                                >
                                  {role.isActive ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openRoleEdit(role)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Dialog
                                    open={roleDeleteId === role.id}
                                    onOpenChange={(o) =>
                                      !o && setRoleDeleteId(null)
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setRoleDeleteId(role.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Delete Job Role
                                        </DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to delete &quot;
                                          {role.name}&quot;? This action cannot
                                          be undone.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setRoleDeleteId(null)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            deleteJobRole(role.id);
                                            setRoleDeleteId(null);
                                          }}
                                        >
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
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Department Create/Edit Dialog */}
      <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deptEditingId ? "Edit Department" : "Create Department"}
            </DialogTitle>
            <DialogDescription>
              {deptEditingId
                ? "Update department details."
                : "Add a new department to the organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input
                value={deptForm.name}
                onChange={(e) =>
                  setDeptForm((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={deptForm.code}
                onChange={(e) =>
                  setDeptForm((s) => ({ ...s, code: e.target.value }))
                }
                placeholder="e.g. ENG"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={deptForm.description}
                onChange={(e) =>
                  setDeptForm((s) => ({ ...s, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Head Name</Label>
              <Input
                value={deptForm.headName}
                onChange={(e) =>
                  setDeptForm((s) => ({ ...s, headName: e.target.value }))
                }
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Department</Label>
              <Select
                value={deptForm.parentId}
                onValueChange={(v) =>
                  setDeptForm((s) => ({ ...s, parentId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (Top-level)" />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    .filter((d) => d.id !== deptEditingId)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={deptForm.isActive}
                onCheckedChange={(c) =>
                  setDeptForm((s) => ({ ...s, isActive: c }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeptDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDept}
              disabled={!deptForm.name.trim() || !deptForm.code.trim()}
            >
              {deptEditingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Division Create/Edit Dialog */}
      <Dialog open={divDialogOpen} onOpenChange={setDivDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {divEditingId ? "Edit Division" : "Create Division"}
            </DialogTitle>
            <DialogDescription>
              {divEditingId
                ? "Update division details."
                : "Add a new division to the organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Division Name</Label>
              <Input
                value={divForm.name}
                onChange={(e) =>
                  setDivForm((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="e.g. Technology"
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={divForm.code}
                onChange={(e) =>
                  setDivForm((s) => ({ ...s, code: e.target.value }))
                }
                placeholder="e.g. TECH"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={divForm.description}
                onChange={(e) =>
                  setDivForm((s) => ({ ...s, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Head Name</Label>
              <Input
                value={divForm.headName}
                onChange={(e) =>
                  setDivForm((s) => ({ ...s, headName: e.target.value }))
                }
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={divForm.isActive}
                onCheckedChange={(c) =>
                  setDivForm((s) => ({ ...s, isActive: c }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDivDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDiv}
              disabled={!divForm.name.trim() || !divForm.code.trim()}
            >
              {divEditingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Role Create/Edit Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {roleEditingId ? "Edit Job Role" : "Create Job Role"}
            </DialogTitle>
            <DialogDescription>
              {roleEditingId
                ? "Update job role details."
                : "Add a new job role to the organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={roleForm.name}
                onChange={(e) =>
                  setRoleForm((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="e.g. Senior Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={roleForm.code}
                onChange={(e) =>
                  setRoleForm((s) => ({ ...s, code: e.target.value }))
                }
                placeholder="e.g. SRE-01"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm((s) => ({ ...s, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={roleForm.departmentId}
                onValueChange={(v) =>
                  setRoleForm((s) => ({ ...s, departmentId: v }))
                }
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Salary (₦)</Label>
                <Input
                  type="number"
                  value={roleForm.minSalary}
                  onChange={(e) =>
                    setRoleForm((s) => ({
                      ...s,
                      minSalary: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Salary (₦)</Label>
                <Input
                  type="number"
                  value={roleForm.maxSalary}
                  onChange={(e) =>
                    setRoleForm((s) => ({
                      ...s,
                      maxSalary: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={roleForm.isActive}
                onCheckedChange={(c) =>
                  setRoleForm((s) => ({ ...s, isActive: c }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={
                !roleForm.name.trim() ||
                !roleForm.code.trim() ||
                !roleForm.departmentId
              }
            >
              {roleEditingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
