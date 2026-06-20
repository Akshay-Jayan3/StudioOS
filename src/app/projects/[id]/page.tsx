"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, Check, Trash2, Upload, FileText, Image as ImageIcon, Ruler, Star, Eye } from "lucide-react";
import Link from "next/link";

const fileTypeIcons: Record<string, any> = {
  measurement: Ruler,
  floor_plan: FileText,
  inspiration: ImageIcon,
  other: FileText,
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [testimonial, setTestimonial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [milestoneName, setMilestoneName] = useState("");
  const [milestoneDue, setMilestoneDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState("inspiration");
  const [requestingTestimonial, setRequestingTestimonial] = useState(false);
  const [viewProposal, setViewProposal] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [projectId]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [projRes, msRes, filesRes, testRes] = await Promise.all([
        fetch(`/api/projects`).then((r) => r.json()),
        fetch(`/api/milestones?project_id=${projectId}`).then((r) => r.json()),
        fetch(`/api/project-files?project_id=${projectId}`).then((r) => r.json()),
        fetch(`/api/testimonials?project_id=${projectId}`).then((r) => r.json()),
      ]);
      const proj = Array.isArray(projRes) ? projRes.find((p: any) => p.id === projectId) : null;
      setProject(proj);
      setMilestones(Array.isArray(msRes) ? msRes : []);
      setFiles(Array.isArray(filesRes) ? filesRes : []);
      setTestimonial(Array.isArray(testRes) && testRes.length > 0 ? testRes[0] : null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function addMilestone() {
    if (!milestoneName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          name: milestoneName,
          due_date: milestoneDue || null,
          completed: false,
        }),
      });
      if (res.ok) {
        const newMilestone = await res.json();
        setMilestones((prev) => [...prev, newMilestone]);
        setOpen(false);
        setMilestoneName("");
        setMilestoneDue("");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleMilestone(id: string, completed: boolean) {
    await fetch(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null }),
    });
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !completed } : m)));
  }

  async function deleteMilestone(id: string) {
    await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", projectId);
      formData.append("file_type", fileType);

      const res = await fetch("/api/project-files", { method: "POST", body: formData });
      if (res.ok) {
        const newFile = await res.json();
        setFiles((prev) => [newFile, ...prev]);
      }
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(id: string) {
    await fetch(`/api/project-files/${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function requestTestimonial() {
    if (!project) return;
    setRequestingTestimonial(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          client_name: project.clients?.name || project.client || "Client",
        }),
      });
      if (res.ok) {
        const newTestimonial = await res.json();
        setTestimonial(newTestimonial);
      }
    } finally {
      setRequestingTestimonial(false);
    }
  }

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div>
      <Link href="/projects" className="text-xs text-zinc-400 hover:text-zinc-700 mb-2 inline-block">
        ← Back to Projects
      </Link>
      <Header
        title={project?.name || "Project"}
        description={`${project?.clients?.name || project?.client || "Unassigned"} · ${project?.status || ""}`}
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Milestones */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Milestones</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{completedCount} of {milestones.length} complete</p>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Milestone
                </Button>
              </div>

              {milestones.length > 0 && (
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              )}

              <div className="space-y-2">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0 group">
                    <button
                      onClick={() => toggleMilestone(m.id, m.completed)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        m.completed ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {m.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${m.completed ? "text-zinc-400 line-through" : "text-zinc-900"}`}>{m.name}</p>
                    </div>
                    {m.due_date && (
                      <span className={`text-xs ${!m.completed && new Date(m.due_date) < new Date() ? "text-red-500 font-medium" : "text-zinc-400"}`}>
                        {new Date(m.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <button onClick={() => deleteMilestone(m.id)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {milestones.length === 0 && (
                  <p className="text-xs text-zinc-400 text-center py-8">No milestones yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-900">Project Files</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="text-xs border border-zinc-200 rounded-md px-2 py-1.5 bg-white"
                  >
                    <option value="measurement">Measurement</option>
                    <option value="floor_plan">Floor Plan</option>
                    <option value="inspiration">Inspiration</option>
                    <option value="other">Other</option>
                  </select>
                  <label className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {files.map((f) => {
                  const Icon = fileTypeIcons[f.file_type] || FileText;
                  return (
                    <div key={f.id} className="border border-zinc-200 rounded-md p-3 group relative">
                      <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                        <Icon className="w-6 h-6 text-zinc-400" />
                        <p className="text-[10px] text-zinc-600 text-center line-clamp-2">{f.file_name}</p>
                      </a>
                      <button
                        onClick={() => deleteFile(f.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                {files.length === 0 && (
                  <p className="text-xs text-zinc-400 col-span-3 text-center py-8">No files uploaded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-zinc-900 mb-3">Project Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Status</span>
                  <span className="font-medium text-zinc-900">{project?.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Designer</span>
                  <span className="font-medium text-zinc-900">{project?.designer || "Unassigned"}</span>
                </div>
                {project?.budget && (
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Budget</span>
                    <span className="font-medium text-zinc-900">₹{(project.budget / 100000).toFixed(1)}L</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {project?.latest_proposal && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Latest Proposal
                </h3>
                <p className="text-xs text-zinc-700 font-medium mb-1 line-clamp-1">{project.latest_proposal.proposalTitle}</p>
                <p className="text-xs text-zinc-500 mb-1">{project.latest_proposal.pricing?.totalEstimate}</p>
                {project.latest_proposal_saved_at && (
                  <p className="text-[10px] text-zinc-400 mb-3">
                    Saved {new Date(project.latest_proposal_saved_at).toLocaleDateString()}
                  </p>
                )}
                <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => setViewProposal(true)}>
                  <Eye className="w-3.5 h-3.5" /> View Full Proposal
                </Button>
              </CardContent>
            </Card>
          )}

          {project?.status === "Completed" && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" /> Testimonial
                </h3>
                {testimonial ? (
                  <div>
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                      {testimonial.status}
                    </span>
                    {testimonial.testimonial_text && (
                      <p className="text-xs text-zinc-600 mt-2 italic">"{testimonial.testimonial_text}"</p>
                    )}
                  </div>
                ) : (
                  <Button size="sm" className="w-full" disabled={requestingTestimonial} onClick={requestTestimonial}>
                    {requestingTestimonial ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Request Testimonial"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Milestone Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Add Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Name</label>
              <Input value={milestoneName} onChange={(e) => setMilestoneName(e.target.value)} className="text-sm" placeholder="Site measurement complete" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Due Date</label>
              <Input type="date" value={milestoneDue} onChange={(e) => setMilestoneDue(e.target.value)} className="text-sm" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" className="flex-1" disabled={saving} onClick={addMilestone}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Saved Proposal */}
      <Dialog open={viewProposal} onOpenChange={setViewProposal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">{project?.latest_proposal?.proposalTitle}</DialogTitle>
          </DialogHeader>
          {project?.latest_proposal && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{project.latest_proposal.executiveSummary}</p>

              <div>
                <p className="text-xs font-semibold text-zinc-900 mb-2">Project Scope</p>
                {project.latest_proposal.projectScope?.map((s: any, i: number) => (
                  <div key={i} className="mb-2">
                    <p className="text-xs font-medium text-zinc-800">{s.area}</p>
                    <p className="text-xs text-zinc-500">{s.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-900 mb-2">Timeline ({project.latest_proposal.timeline?.totalDuration})</p>
                {project.latest_proposal.timeline?.phases?.map((p: any, i: number) => (
                  <p key={i} className="text-xs text-zinc-600">· {p.phase} — {p.duration}</p>
                ))}
              </div>

              <div className="bg-zinc-50 rounded-md p-3">
                <p className="text-xs font-semibold text-zinc-900 mb-2">Pricing</p>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Design Fee</span>
                  <span className="font-medium text-zinc-900">{project.latest_proposal.pricing?.designFee?.amount}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Procurement</span>
                  <span className="font-medium text-zinc-900">{project.latest_proposal.pricing?.procurementEstimate}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-zinc-200 pt-1.5 mt-1.5">
                  <span className="font-semibold text-zinc-900">Total</span>
                  <span className="font-bold text-zinc-900">{project.latest_proposal.pricing?.totalEstimate}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 italic">{project.latest_proposal.closingNote}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
