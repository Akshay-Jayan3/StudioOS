"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Phone, Mail, Bot, Loader2, UserPlus, Clock, FileText, AlertTriangle, HelpCircle, CheckCircle2, Search } from "lucide-react";
import type { Lead } from "@/lib/supabase/types";
import { mockLeads } from "@/lib/mock-data";
import Link from "next/link";

const statusColor: Record<string, string> = {
  "New Lead": "bg-zinc-100 text-zinc-700",
  "Discovery Scheduled": "bg-blue-50 text-blue-700",
  "Proposal Sent": "bg-yellow-50 text-yellow-700",
  Won: "bg-green-50 text-green-700",
  Lost: "bg-red-50 text-red-700",
};

const columns = ["New Lead", "Discovery Scheduled", "Proposal Sent", "Won", "Lost"];

const addLeadSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  project_type: z.string().optional(),
  budget: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type AddLeadForm = z.infer<typeof addLeadSchema>;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);
  const [lostDialogLead, setLostDialogLead] = useState<any | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [lostNotes, setLostNotes] = useState("");
  const [revisitDate, setRevisitDate] = useState("");
  const [savingLost, setSavingLost] = useState(false);
  const [viewBriefLead, setViewBriefLead] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddLeadForm>({
    resolver: zodResolver(addLeadSchema),
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length >= 0) {
          setLeads(data);
          setUsingMock(false);
        } else {
          throw new Error("Invalid response");
        }
      } else {
        throw new Error("API failed");
      }
    } catch {
      // Fall back to mock data if Supabase not connected
      setLeads(mockLeads as any);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: AddLeadForm) {
    setSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          budget: data.budget ? parseFloat(data.budget.replace(/[^0-9.]/g, "")) * 100000 : null,
        }),
      });
      if (res.ok) {
        const newLead = await res.json();
        setLeads((prev) => [newLead, ...prev]);
        setOpen(false);
        reset();
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string, lead?: any) {
    if (usingMock) return;
    if (status === "Lost") {
      setLostDialogLead(lead);
      setLostReason("");
      setLostNotes("");
      setRevisitDate("");
      return;
    }
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: status as any } : l)));
  }

  async function confirmLost() {
    if (!lostDialogLead) return;
    setSavingLost(true);
    try {
      await fetch(`/api/leads/${lostDialogLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Lost",
          lost_reason: lostReason || null,
          lost_notes: lostNotes || null,
          revisit_date: revisitDate || null,
        }),
      });
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lostDialogLead.id
            ? { ...l, status: "Lost" as any, lost_reason: lostReason, lost_notes: lostNotes, revisit_date: revisitDate }
            : l
        )
      );
      setLostDialogLead(null);
    } finally {
      setSavingLost(false);
    }
  }

  async function convertToClient(lead: any) {
    if (usingMock) return;
    setConverting(lead.id);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          notes: `Converted from lead ${lead.id}. ${lead.notes || ""}`.trim(),
        }),
      });
      if (res.ok) {
        alert(`${lead.name} added as a client. Go to Projects to create their first project.`);
      }
    } finally {
      setConverting(null);
    }
  }

  const byStatus = (status: string) => leads.filter((l) => (l as any).status === status);

  return (
    <div>
      <Header
        title="Leads"
        description={`Sales pipeline · ${leads.length} leads${usingMock ? " (mock data — connect Supabase to save)" : ""}`}
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Lead
          </Button>
        }
      />

      {usingMock && (
        <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
          Showing mock data. Add your Supabase credentials to <code className="font-mono">.env.local</code> to enable persistence.
        </div>
      )}

      {/* Pipeline Summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {columns.map((status) => {
          const count = byStatus(status).length;
          const total = byStatus(status).reduce((s, l) => s + ((l as any).budget || 0), 0);
          return (
            <div key={status} className="bg-white border border-zinc-200 rounded-lg px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1">{status}</p>
              <p className="text-lg font-semibold text-zinc-900">{count}</p>
              {total > 0 && <p className="text-[10px] text-zinc-400">₹{(total / 100000).toFixed(1)}L</p>}
            </div>
          );
        })}
      </div>

      {/* Nurture Queue — lost leads with a revisit date */}
      {!usingMock && leads.some((l: any) => l.status === "Lost" && l.revisit_date) && (
        <Card className="mb-6 border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold text-orange-800 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Nurture Queue — Revisit These Leads
            </h3>
            <div className="space-y-2">
              {leads
                .filter((l: any) => l.status === "Lost" && l.revisit_date)
                .sort((a: any, b: any) => new Date(a.revisit_date).getTime() - new Date(b.revisit_date).getTime())
                .map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-orange-100">
                    <div>
                      <p className="text-xs font-medium text-zinc-900">{lead.name}</p>
                      <p className="text-[10px] text-zinc-500">{lead.lost_reason || "No reason recorded"}</p>
                    </div>
                    <span className="text-xs font-medium text-orange-700">
                      Revisit: {new Date(lead.revisit_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Project Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">AI Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-zinc-900">{lead.name}</p>
                      <p className="text-xs text-zinc-400">{(lead as any).created_at?.split("T")[0] || (lead as any).createdAt}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <a href={`mailto:${lead.email}`} className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </a>
                        {lead.phone && (
                          <span className="text-xs text-zinc-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-zinc-700">{(lead as any).project_type || (lead as any).projectType || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-zinc-900">
                        {(lead as any).budget ? `₹${((lead as any).budget / 100000).toFixed(1)}L` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-zinc-500">{(lead as any).source || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {(lead as any).ai_score ? (
                        <div className="flex items-center gap-1.5">
                          <Bot className="w-3 h-3 text-zinc-400" />
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${(lead as any).ai_score >= 7 ? "bg-green-100 text-green-700" : (lead as any).ai_score >= 5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {(lead as any).ai_score}/10
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {usingMock ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${statusColor[(lead as any).status]}`}>
                          {(lead as any).status}
                        </span>
                      ) : (
                        <select
                          value={(lead as any).status}
                          onChange={(e) => updateStatus(lead.id, e.target.value, lead)}
                          className={`text-xs font-medium px-2 py-1 rounded-md border-0 cursor-pointer ${statusColor[(lead as any).status]}`}
                        >
                          {columns.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {!usingMock && (
                          <Link href={`/admin/ai-employees?tab=discovery&leadId=${lead.id}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                              <Search className="w-3 h-3" /> Discovery
                            </Button>
                          </Link>
                        )}
                        {(lead as any).discovery_brief && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => setViewBriefLead(lead)}
                          >
                            <FileText className="w-3 h-3" /> Brief
                          </Button>
                        )}
                        {!usingMock && (lead as any).status === "Won" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            disabled={converting === lead.id}
                            onClick={() => convertToClient(lead)}
                          >
                            {converting === lead.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserPlus className="w-3 h-3" />
                            )}
                            To Client
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Add New Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Name *</label>
              <Input {...register("name")} className="text-sm" placeholder="Priya Menon" />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Email *</label>
              <Input {...register("email")} className="text-sm" placeholder="priya@gmail.com" />
              {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Phone</label>
                <Input {...register("phone")} className="text-sm" placeholder="+91 98400 12345" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Source</label>
                <Input {...register("source")} className="text-sm" placeholder="Instagram" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Type</label>
              <Input {...register("project_type")} className="text-sm" placeholder="Full Home Interior" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Budget (in Lakhs)</label>
              <Input {...register("budget")} className="text-sm" placeholder="18" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Notes</label>
              <Input {...register("notes")} className="text-sm" placeholder="Any initial notes..." />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1" disabled={saving}>
                {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</> : "Add Lead"}
              </Button>
            </div>
            {usingMock && (
              <p className="text-[10px] text-zinc-400 text-center">Connect Supabase to persist leads</p>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Lost Reason Dialog */}
      <Dialog open={!!lostDialogLead} onOpenChange={(v) => !v && setLostDialogLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Mark "{lostDialogLead?.name}" as Lost</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Reason</label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 bg-white"
              >
                <option value="">— Select reason —</option>
                <option value="Budget mismatch">Budget mismatch</option>
                <option value="Went with competitor">Went with competitor</option>
                <option value="Bad timing">Bad timing</option>
                <option value="Ghosted">Ghosted / stopped responding</option>
                <option value="Changed mind">Changed mind about project</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Notes</label>
              <Textarea
                value={lostNotes}
                onChange={(e) => setLostNotes(e.target.value)}
                rows={2}
                className="text-sm resize-none"
                placeholder="Any context worth remembering..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Revisit Date (optional)</label>
              <Input
                type="date"
                value={revisitDate}
                onChange={(e) => setRevisitDate(e.target.value)}
                className="text-sm"
              />
              <p className="text-[10px] text-zinc-400 mt-1">Set this to add the lead to your Nurture Queue</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setLostDialogLead(null)}>
                Cancel
              </Button>
              <Button type="button" size="sm" className="flex-1" disabled={savingLost} onClick={confirmLost}>
                {savingLost ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</> : "Confirm Lost"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Saved Discovery Brief */}
      <Dialog open={!!viewBriefLead} onOpenChange={(v) => !v && setViewBriefLead(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">{viewBriefLead?.name}'s Discovery Brief</DialogTitle>
          </DialogHeader>
          {viewBriefLead?.discovery_brief && (
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-xs font-semibold text-zinc-900 mb-1">Summary</p>
                <p className="text-sm text-zinc-700 leading-relaxed">{viewBriefLead.discovery_brief.projectSummary}</p>
                <p className="text-xs text-zinc-400 mt-1">Readiness: {viewBriefLead.discovery_brief.readinessScore}/10</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Risks
                </p>
                <ul className="space-y-1">
                  {viewBriefLead.discovery_brief.risks?.map((r: any, i: number) => (
                    <li key={i} className="text-xs text-zinc-600">
                      <span className="font-medium">[{r.severity}]</span> {r.risk} — {r.mitigation}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Next Questions
                </p>
                <ol className="space-y-1">
                  {viewBriefLead.discovery_brief.nextQuestions?.map((q: string, i: number) => (
                    <li key={i} className="text-xs text-zinc-600">{i + 1}. {q}</li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Client Goals
                </p>
                <ul className="space-y-1">
                  {viewBriefLead.discovery_brief.clientGoals?.map((g: string, i: number) => (
                    <li key={i} className="text-xs text-zinc-600">· {g}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-50 rounded-md p-3">
                <p className="text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wide">Designer Notes</p>
                <p className="text-xs text-zinc-600">{viewBriefLead.discovery_brief.designerNotes}</p>
              </div>
              {viewBriefLead.discovery_brief_saved_at && (
                <p className="text-[10px] text-zinc-400 text-center">
                  Saved {new Date(viewBriefLead.discovery_brief_saved_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
