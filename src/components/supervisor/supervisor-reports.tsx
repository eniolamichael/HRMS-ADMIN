"use client";

import { useSupervisor } from "@/contexts/supervisor-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { FileText, Bell, History, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SupervisorReports() {
  const {
    authorizedReports,
    supervisorNotifications,
    markNotificationRead,
    supervisorAuditLogs,
    supervisorName,
    departmentName,
  } = useSupervisor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Activity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Reports authorized for your role, notifications, and action history
        </p>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Authorized Reports</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications ({supervisorNotifications.filter((n) => !n.isRead).length})
          </TabsTrigger>
          <TabsTrigger value="audit">Activity Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Only reports where the report and underlying data are authorized for {supervisorName} ({departmentName})
          </div>
          {authorizedReports.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No reports are currently authorized for your role.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {authorizedReports.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <CardTitle className="text-base">{r.name}</CardTitle>
                      </div>
                      <Badge className="bg-gray-50 text-gray-600 hover:bg-gray-50">{r.module}</Badge>
                    </div>
                    <CardDescription className="mt-0.5">{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-gray-400">{r.type}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.fields.slice(0, 6).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                    <Button size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700">
                      <FileText className="h-4 w-4" /> Generate Preview
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-600" /> Notifications
              </CardTitle>
              <CardDescription>Workflow and event notifications routed to you</CardDescription>
            </CardHeader>
            <CardContent>
              {supervisorNotifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No notifications.</p>
              ) : (
                <div className="divide-y">
                  {supervisorNotifications.map((n) => (
                    <div key={n.id} className="py-3 flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.createdAt}</p>
                      </div>
                      {!n.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markNotificationRead(n.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Mark read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-600" /> Your Activity Trail
              </CardTitle>
              <CardDescription>Actions performed by you are retained for audit</CardDescription>
            </CardHeader>
            <CardContent>
              {supervisorAuditLogs.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  No recorded activity yet. Actions you take across modules will appear here.
                </p>
              ) : (
                <div className="divide-y">
                  {supervisorAuditLogs.slice().reverse().map((l) => (
                    <div key={l.id} className="py-3 flex items-start gap-3">
                      <Badge className="bg-gray-50 text-gray-600 hover:bg-gray-50 mt-0.5 shrink-0">
                        {l.module}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{l.action}</p>
                        <p className="text-xs text-gray-500">{l.details}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {l.timestamp} · {l.userName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}