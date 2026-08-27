"use client";

import { useState } from "react";
import { usePayroll } from "@/contexts/payroll-context";
import { PayrollReport } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Download, FileText, Search, Play, RefreshCw } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { samplePensionReport, sampleAccountStatements } from "@/services/mock-data";

const AVAILABLE_COLUMNS = [
  { id: "period", label: "Period" },
  { id: "employee_name", label: "Employee Name" },
  { id: "department", label: "Department" },
  { id: "pay_group", label: "Pay Group" },
  { id: "base_salary", label: "Base Salary" },
  { id: "allowances", label: "Allowances" },
  { id: "deductions", label: "Deductions" },
  { id: "tax", label: "Tax" },
  { id: "net_pay", label: "Net Pay" },
  { id: "gross_pay", label: "Gross Pay" },
  { id: "effective_rate", label: "Effective Rate" },
  { id: "ytd_gross", label: "YTD Gross" },
  { id: "ytd_tax", label: "YTD Tax" },
  { id: "ytd_deductions", label: "YTD Deductions" },
  { id: "ytd_net", label: "YTD Net" },
  { id: "employee_contribution", label: "Employee Contribution" },
  { id: "employer_contribution", label: "Employer Contribution" },
  { id: "total", label: "Total" },
];

const REPORT_TYPE_BADGES: Record<string, string> = {
  summary: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  detailed: "bg-green-100 text-green-800 hover:bg-green-100",
  tax: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  pension: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  ytd: "bg-teal-100 text-teal-800 hover:bg-teal-100",
  custom: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

const defaultFormState = {
  name: "",
  description: "",
  type: "summary" as PayrollReport["type"],
  columns: [] as string[],
};

export default function Reports() {
  const { payrollReports, addPayrollReport, updatePayrollReport, deletePayrollReport } = usePayroll();

  const [activeTab, setActiveTab] = useState("custom-reports");
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [pensionSearch, setPensionSearch] = useState("");
  const [statementSearch, setStatementSearch] = useState("");
  const [generatingMessage, setGeneratingMessage] = useState<string | null>(null);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormState(defaultFormState);
    setDialogOpen(true);
  };

  const openEditDialog = (report: PayrollReport) => {
    setEditingId(report.id);
    setFormState({
      name: report.name,
      description: report.description,
      type: report.type,
      columns: [...report.columns],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formState.name.trim()) return;

    if (editingId) {
      updatePayrollReport(editingId, { ...formState });
    } else {
      addPayrollReport({ ...formState, filters: {} });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deletePayrollReport(id);
    setDeleteConfirmId(null);
  };

  const handleGenerate = (id: string) => {
    setGeneratingId(id);
    setTimeout(() => {
      updatePayrollReport(id, { lastGenerated: new Date().toISOString().split("T")[0] });
      setGeneratingId(null);
      setGeneratingMessage(id);
      setTimeout(() => setGeneratingMessage(null), 2000);
    }, 1000);
  };

  const toggleColumn = (colId: string) => {
    setFormState((prev) => ({
      ...prev,
      columns: prev.columns.includes(colId)
        ? prev.columns.filter((c) => c !== colId)
        : [...prev.columns, colId],
    }));
  };

  const filteredPension = samplePensionReport.filter(
    (p) =>
      p.employeeName.toLowerCase().includes(pensionSearch.toLowerCase()) ||
      p.employeeCode.toLowerCase().includes(pensionSearch.toLowerCase()) ||
      p.pensionFund.toLowerCase().includes(pensionSearch.toLowerCase())
  );

  const filteredStatements = sampleAccountStatements.filter(
    (s) =>
      s.employeeName.toLowerCase().includes(statementSearch.toLowerCase()) ||
      s.bankName.toLowerCase().includes(statementSearch.toLowerCase()) ||
      s.paymentRef.toLowerCase().includes(statementSearch.toLowerCase())
  );

  const totalPensionContributions = samplePensionReport.reduce((sum, p) => sum + p.totalContribution, 0);
  const totalEmployeeContributions = samplePensionReport.reduce((sum, p) => sum + p.employeeContribution, 0);
  const totalEmployerContributions = samplePensionReport.reduce((sum, p) => sum + p.employerContribution, 0);

  const handleSimulatedDownload = (type: string) => {
    setGeneratingMessage(type);
    setTimeout(() => setGeneratingMessage(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Reports & Downloads</h2>
            <p className="text-muted-foreground">
              Manage payroll reports, pension statements, and downloadable files.
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="custom-reports">Custom Reports</TabsTrigger>
            <TabsTrigger value="pension-reports">Pension Reports</TabsTrigger>
            <TabsTrigger value="account-statements">Account Statements</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="custom-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Reports</CardTitle>
                  <CardDescription>Create, manage, and generate custom payroll reports.</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingId ? "Edit Report" : "Create Report"}</DialogTitle>
                      <DialogDescription>
                        {editingId
                          ? "Update the report configuration below."
                          : "Define a new custom report with your preferred columns."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="rpt-name">Name</Label>
                        <Input
                          id="rpt-name"
                          placeholder="e.g. Monthly Payroll Summary"
                          value={formState.name}
                          onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rpt-desc">Description</Label>
                        <Input
                          id="rpt-desc"
                          placeholder="e.g. Summary of all payroll runs for the month"
                          value={formState.description}
                          onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Select
                          value={formState.type}
                          onValueChange={(v) =>
                            setFormState((s) => ({ ...s, type: v as PayrollReport["type"] }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="summary">Summary</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="tax">Tax</SelectItem>
                            <SelectItem value="pension">Pension</SelectItem>
                            <SelectItem value="ytd">Year-to-Date</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Columns</Label>
                        <div className="grid grid-cols-2 gap-2 rounded-md border p-3 max-h-48 overflow-y-auto">
                          {AVAILABLE_COLUMNS.map((col) => (
                            <div key={col.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`col-${col.id}`}
                                checked={formState.columns.includes(col.id)}
                                onCheckedChange={() => toggleColumn(col.id)}
                              />
                              <Label
                                htmlFor={`col-${col.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {col.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={!formState.name.trim()}>
                        {editingId ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Columns</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Generated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No reports found. Create your first report to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payrollReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {report.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={REPORT_TYPE_BADGES[report.type]}
                            >
                              {report.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {report.columns.length} columns
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            {report.lastGenerated ? formatDate(report.lastGenerated) : (
                              <span className="text-muted-foreground text-sm">Never</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleGenerate(report.id)}
                                disabled={generatingId === report.id}
                                title="Generate Report"
                              >
                                {generatingId === report.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(report)}
                                title="Edit Report"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Dialog
                                open={deleteConfirmId === report.id}
                                onOpenChange={(open) => !open && setDeleteConfirmId(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteConfirmId(report.id)}
                                    title="Delete Report"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Report</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete &quot;{report.name}&quot;? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDelete(report.id)}>
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
              {generatingMessage && (
                <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  Report generated successfully.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pension-reports" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Contributions</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalPensionContributions)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {samplePensionReport.length} employees enrolled
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Employee Contributions</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalEmployeeContributions)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Average: {formatCurrency(totalEmployeeContributions / samplePensionReport.length)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Employer Contributions</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalEmployerContributions)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Match rate: 100%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pension Report</CardTitle>
                  <CardDescription>Employee and employer pension contribution details.</CardDescription>
                </div>
                <Button onClick={() => handleSimulatedDownload("pension-report")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Pension Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative max-w-sm mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or fund..."
                  value={pensionSearch}
                  onChange={(e) => setPensionSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Pension Fund</TableHead>
                      <TableHead className="text-right">Employee Contribution</TableHead>
                      <TableHead className="text-right">Employer Contribution</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPension.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No pension records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPension.map((pension) => (
                        <TableRow key={pension.id}>
                          <TableCell className="font-medium">{pension.employeeName}</TableCell>
                          <TableCell>{pension.employeeCode}</TableCell>
                          <TableCell>{pension.pensionFund}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(pension.employeeContribution)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(pension.employerContribution)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(pension.totalContribution)}
                          </TableCell>
                          <TableCell>{pension.period}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {generatingMessage === "pension-report" && (
                <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  Pension report downloaded successfully.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account-statements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Account Statements</CardTitle>
                  <CardDescription>Employee payroll account statements with payment details.</CardDescription>
                </div>
                <Button onClick={() => handleSimulatedDownload("account-statements")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Statements
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative max-w-sm mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, bank, or reference..."
                  value={statementSearch}
                  onChange={(e) => setStatementSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Ref</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStatements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          No account statements found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStatements.map((stmt) => (
                        <TableRow key={stmt.id}>
                          <TableCell className="font-medium">{stmt.employeeName}</TableCell>
                          <TableCell>{stmt.accountNumber}</TableCell>
                          <TableCell>{stmt.bankName}</TableCell>
                          <TableCell>{stmt.period}</TableCell>
                          <TableCell className="text-right">{formatCurrency(stmt.grossPay)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(stmt.totalDeductions)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(stmt.netPay)}</TableCell>
                          <TableCell>{formatDate(stmt.paymentDate)}</TableCell>
                          <TableCell className="font-mono text-xs">{stmt.paymentRef}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {generatingMessage === "account-statements" && (
                <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  Account statements downloaded successfully.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Quick Downloads</CardTitle>
          <CardDescription>Download commonly used payroll reports and files.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              { title: "Payroll Summary Report", desc: "Overview of all payroll data", icon: FileText, key: "payroll-summary" },
              { title: "YTD Report", desc: "Year-to-date earnings & deductions", icon: FileText, key: "ytd-report" },
              { title: "Tax Report", desc: "Tax withholdings by employee", icon: FileText, key: "tax-report" },
              { title: "Pension Report", desc: "Pension contribution details", icon: FileText, key: "pension-report-dl" },
              { title: "Bank Payment File", desc: "Bank transfer instructions", icon: FileText, key: "bank-payment" },
            ].map((item) => (
              <Card key={item.key} className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="rounded-full bg-muted p-3">
                      <item.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSimulatedDownload(item.key)}
                    >
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {generatingMessage && !["pension-report", "account-statements"].includes(generatingMessage) && (
            <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
              Download started successfully.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
