"use client";

import { useState } from "react";
import { useHod } from "@/contexts/hod-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Clock, Trash2, RotateCcw } from "lucide-react";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function HodScheduling() {
  const {
    workSchedules,
    addWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
    timeBlocks,
  } = useHod();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"full_time" | "rotational">("full_time");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [days, setDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const createSchedule = () => {
    if (!name.trim()) return;
    addWorkSchedule({
      name,
      type,
      startTime,
      endTime,
      breakMinutes,
      days,
      isActive: true,
      employeeCount: 0,
    });
    setShowCreate(false);
    setName("");
    setDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Scheduling</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage rotational work schedules for your team
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Create Schedule
        </Button>
      </div>

      {/* Time blocks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Time Blocks</CardTitle>
          <CardDescription>Configured shift time blocks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {timeBlocks.map((tb) => (
              <div
                key={tb.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{ borderColor: tb.color, background: `${tb.color}14` }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: tb.color }} />
                <span className="text-sm font-medium text-gray-700">{tb.name}</span>
                <span className="text-xs text-gray-500">
                  {tb.startTime}–{tb.endTime}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedules list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Work Schedules</CardTitle>
          <CardDescription>Rotational and fixed schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workSchedules.map((ws) => (
              <div key={ws.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{ws.name}</p>
                      <Badge
                        className={
                          ws.type === "rotational"
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-50"
                        }
                      >
                        {ws.type === "rotational" ? "Rotational" : "Full-time"}
                      </Badge>
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {ws.startTime} – {ws.endTime} · {ws.breakMinutes} min break
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ws.isActive}
                      onCheckedChange={(checked) => updateWorkSchedule(ws.id, { isActive: checked })}
                    />
                    <button
                      onClick={() => deleteWorkSchedule(ws.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Delete schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {ws.days.map((d) => (
                    <span key={d} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                      {d.slice(0, 3)}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">{ws.employeeCount} employees assigned</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Work Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Schedule Name</Label>
              <Input
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Night Rotation"
              />
            </div>
            <div>
              <Label>Schedule Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "full_time" | "rotational")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="rotational">Rotational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Start</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>End</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Break (min)</Label>
                <Input
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            {type === "rotational" && (
              <div>
                <Label className="flex items-center gap-1">
                  <RotateCcw className="h-3.5 w-3.5" /> Rotation Days
                </Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        days.includes(d)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={createSchedule} disabled={!name.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}