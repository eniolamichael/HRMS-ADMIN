"use client";

import { useState, useMemo } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { Notification, AuditLog } from "@/types/hrms";
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
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Trash2,
  Shield,
  Eye,
  Clock,
  AlertTriangle,
  Info,
  CheckSquare,
} from "lucide-react";
import { formatDate, generateId } from "@/lib/utils";

type NotificationFilter = "all" | "unread" | "read";

const MODULES = [
  "Employee",
  "Leave",
  "Attendance",
  "Recruitment",
  "Payroll",
  "Performance",
  "Promotion",
  "Exit",
  "Learning",
  "Disciplinary",
  "Asset",
  "Survey",
];

export default function NotificationsAudit() {
  const {
    notifications,
    addNotification,
    updateNotification,
    deleteNotification,
    markNotificationRead,
    auditLogs,
    addAuditLog,
    deleteAuditLog,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("notifications");
  const [notifFilter, setNotifFilter] = useState<NotificationFilter>("all");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditModuleFilter, setAuditModuleFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteReadConfirmOpen, setDeleteReadConfirmOpen] = useState(false);

  // ── Notifications Tab ───────────────────────────────────────────────────

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (notifFilter === "unread") return !n.isRead;
      if (notifFilter === "read") return n.isRead;
      return true;
    });
  }, [notifications, notifFilter]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const handleMarkAllRead = () => {
    notifications
      .filter((n) => !n.isRead)
      .forEach((n) => markNotificationRead(n.id));
  };

  const handleBulkDeleteRead = () => {
    notifications
      .filter((n) => n.isRead)
      .forEach((n) => deleteNotification(n.id));
    setDeleteReadConfirmOpen(false);
  };

  const notifTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "info":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "error":
      case "alert":
        return "bg-red-100 text-red-700 border-red-200";
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const notifTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "info":
        return <Info className="h-3.5 w-3.5" />;
      case "warning":
        return <AlertTriangle className="h-3.5 w-3.5" />;
      case "error":
      case "alert":
        return <XCircle className="h-3.5 w-3.5" />;
      case "success":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      default:
        return <Bell className="h-3.5 w-3.5" />;
    }
  };

  // ── Audit Trail Tab ─────────────────────────────────────────────────────

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      const matchSearch =
        auditSearch === "" ||
        l.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        l.details.toLowerCase().includes(auditSearch.toLowerCase());
      const matchModule = auditModuleFilter === "all" || l.module === auditModuleFilter;
      let matchDate = true;
      if (dateFrom) matchDate = matchDate && l.timestamp >= dateFrom;
      if (dateTo) matchDate = matchDate && l.timestamp <= dateTo;
      return matchSearch && matchModule && matchDate;
    });
  }, [auditLogs, auditSearch, auditModuleFilter, dateFrom, dateTo]);

  const privilegedLogs = useMemo(() => {
    return filteredAuditLogs.filter(
      (l) =>
        l.action.toLowerCase().includes("delete") ||
        l.action.toLowerCase().includes("approve") ||
        l.action.toLowerCase().includes("terminate") ||
        l.action.toLowerCase().includes("admin") ||
        l.action.toLowerCase().includes("escalate") ||
        l.module === "Reports" ||
        l.module === "Payroll"
    );
  }, [filteredAuditLogs]);

  const handleExportAuditLogs = () => {
    const header = "User,Action,Module,Details,IP Address,Timestamp";
    const rows = filteredAuditLogs
      .map((l) => `${l.userName},${l.action},${l.module},"${l.details}",${l.ipAddress},${l.timestamp}`)
      .join("\n");
    const blob = new Blob([`${header}\n${rows}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-trail.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Shield className="mr-2 h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Notifications ──────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>View and manage system notifications.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Mark All as Read
                  </Button>
                  <Dialog open={deleteReadConfirmOpen} onOpenChange={setDeleteReadConfirmOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Read
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Read Notifications</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete all read notifications? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteReadConfirmOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleBulkDeleteRead}>
                          Delete All Read
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <Select value={notifFilter} onValueChange={(v) => setNotifFilter(v as NotificationFilter)}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No notifications found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <TableRow key={notif.id} className={!notif.isRead ? "bg-muted/30" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {!notif.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                              {notif.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[250px] truncate">
                            {notif.message}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${notifTypeBadge(notif.type)}`}>
                              {notifTypeIcon(notif.type)}
                              {notif.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{notif.recipientId}</TableCell>
                          <TableCell>
                            {notif.isRead ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(notif.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {!notif.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => markNotificationRead(notif.id)}
                                  title="Mark as Read"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteNotification(notif.id)}
                              >
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

        {/* ── Tab 2: Audit Trail ────────────────────────────────────────── */}
        <TabsContent value="audit" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Track all system activity across modules.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search audit logs..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={auditModuleFilter} onValueChange={setAuditModuleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {MODULES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-[160px]"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-[160px]"
                    />
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportAuditLogs}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No audit logs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.module}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[250px] truncate">
                            {log.details}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{log.ipAddress}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(log.timestamp)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* ── Privileged User Activity Section ──────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Track Privileged User Activity
              </CardTitle>
              <CardDescription>
                High-sensitivity actions such as deletions, approvals, and escalations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {privilegedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No privileged activity found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      privilegedLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.module}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[250px] truncate">
                            {log.details}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{log.ipAddress}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(log.timestamp)}</TableCell>
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
    </div>
  );
}
