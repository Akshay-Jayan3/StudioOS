"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { mockProjects } from "@/lib/mock-data";

const statusColor: Record<string, string> = {
  Discovery: "bg-blue-50 text-blue-700",
  Design: "bg-purple-50 text-purple-700",
  Approval: "bg-yellow-50 text-yellow-700",
  Execution: "bg-orange-50 text-orange-700",
  Completed: "bg-green-50 text-green-700",
};

const statusOrder = ["Discovery", "Design", "Approval", "Execution", "Completed"];

type AddProjectForm = {
  name: string;
  client_id: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: string;
  designer: string;
  description: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<AddProjectForm>({
    defaultValues: { status: "Discovery" },
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        setUsingMock(false);
      } else {
        throw new Error("API failed");
      }
    } catch {
      setProjects(mockProjects);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) setClients(await res.json());
    } catch {
      // ignore, mock mode
    }
  }

  async function onSubmit(data: AddProjectForm) {
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          budget: data.budget ? parseFloat(data.budget) * 100000 : null,
          client_id: data.client_id || null,
        }),
      });
      if (res.ok) {
        const newProject = await res.json();
        setProjects((prev) => [newProject, ...prev]);
        setOpen(false);
        reset();
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    if (usingMock) return;
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  async function deleteProject(id: string) {
    if (usingMock) return;
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <Header
        title="Projects"
        description={`All projects · ${projects.length} total${usingMock ? " (mock data)" : ""}`}
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> New Project
          </Button>
        }
      />

      {usingMock && (
        <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
          Showing mock data. Supabase connection not available.
        </div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {statusOrder.map((status) => {
          const count = projects.filter((p) => p.status === status).length;
          return (
            <div key={status} className={`rounded-lg px-4 py-3 border ${count > 0 ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50 opacity-50"}`}>
              <p className="text-xs text-zinc-500 mb-1">{status}</p>
              <p className="text-lg font-semibold text-zinc-900">{count}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => {
            const budget = project.budget || 0;
            const spent = project.spent || 0;
            const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
            const remaining = budget - spent;
            const clientName = project.clients?.name || project.client || "Unassigned";

            return (
              <Card key={project.id} className="hover:border-zinc-300 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Link href={`/admin/projects/${project.id}`} className="hover:underline">
                      <p className="text-sm font-semibold text-zinc-900">{project.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{clientName}</p>
                    </Link>
                    <div className="flex items-center gap-2">
                      {usingMock ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${statusColor[project.status]}`}>
                          {project.status}
                        </span>
                      ) : (
                        <select
                          value={project.status}
                          onChange={(e) => updateStatus(project.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-md border-0 cursor-pointer ${statusColor[project.status]}`}
                        >
                          {statusOrder.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                      {!usingMock && (
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-zinc-500 mb-3 line-clamp-1">{project.description}</p>
                  )}

                  {budget > 0 && (
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Budget utilisation</span>
                        <span className="text-xs font-medium text-zinc-700">{percent}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percent > 90 ? "bg-red-500" : percent > 70 ? "bg-yellow-500" : "bg-zinc-900"}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {budget > 0 && (
                    <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-3">
                      <div>
                        <p className="text-[10px] text-zinc-400 mb-0.5">Budget</p>
                        <p className="text-xs font-medium text-zinc-900">₹{(budget / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 mb-0.5">Spent</p>
                        <p className="text-xs font-medium text-zinc-900">₹{(spent / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 mb-0.5">Remaining</p>
                        <p className="text-xs font-medium text-zinc-900">₹{(remaining / 100000).toFixed(1)}L</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-medium text-zinc-600">
                        {(project.designer || "U").charAt(0)}
                      </div>
                      <span className="text-xs text-zinc-500">{project.designer || "Unassigned"}</span>
                    </div>
                    {(project.start_date || project.startDate) && (
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <span>{(project.start_date || project.startDate)?.split("T")[0]}</span>
                        <span>→</span>
                        <span>{(project.end_date || project.endDate)?.split("T")[0]}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {projects.length === 0 && (
            <p className="text-xs text-zinc-400 col-span-2 text-center py-12">No projects yet</p>
          )}
        </div>
      )}

      {/* New Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Name *</label>
              <Input {...register("name", { required: true })} className="text-sm" placeholder="Banjara Hills Residence" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Client</label>
              <select {...register("client_id")} className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 bg-white">
                <option value="">— Unassigned —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Status</label>
                <select {...register("status")} className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 bg-white">
                  {statusOrder.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Designer</label>
                <Input {...register("designer")} className="text-sm" placeholder="Ananya S." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Start Date</label>
                <Input type="date" {...register("start_date")} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">End Date</label>
                <Input type="date" {...register("end_date")} className="text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Budget (in Lakhs)</label>
              <Input {...register("budget")} className="text-sm" placeholder="18" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Description</label>
              <Textarea {...register("description")} rows={2} className="text-sm resize-none" placeholder="2BHK apartment, living/dining/2 bedrooms" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1" disabled={saving}>
                {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Creating...</> : "Create Project"}
              </Button>
            </div>
            {usingMock && (
              <p className="text-[10px] text-zinc-400 text-center">Connect Supabase to persist projects</p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
