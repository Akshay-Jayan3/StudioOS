"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proposalInputSchema, ProposalInput, ProposalOutput } from "@/agents/proposal-agent/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AgentStatusBanner } from "@/components/agents/agent-status-banner";
import { Loader2, CheckCircle2, Sparkles, Save, Check, ArrowRight, FolderPlus } from "lucide-react";
import Link from "next/link";

export type ProposalPrefill = Partial<{
  clientName: string;
  projectName: string;
  projectType: string;
  spaceDetails: string;
  budget: string;
  timeline: string;
  styleDirection: string;
  keyRequirements: string;
}>;

function formatForCopy(output: ProposalOutput): string {
  return `${output.proposalTitle}
${"=".repeat(40)}

${output.executiveSummary}

PROJECT SCOPE
${output.projectScope.map((s) => `${s.area}: ${s.description}\n${s.included.map((i) => `  - ${i}`).join("\n")}`).join("\n\n")}

TIMELINE (${output.timeline.totalDuration})
${output.timeline.phases.map((p) => `${p.phase} (${p.duration}): ${p.milestones.join(", ")}`).join("\n")}

PRICING
Design Fee: ${output.pricing.designFee.amount} (${output.pricing.designFee.basis})
Procurement Estimate: ${output.pricing.procurementEstimate}
Total Estimate: ${output.pricing.totalEstimate}

Payment Schedule:
${output.pricing.paymentSchedule.map((p) => `${p.milestone}: ${p.percentage}% (${p.amount})`).join("\n")}

EXCLUSIONS
${output.exclusions.map((e) => `- ${e}`).join("\n")}

TERMS
${output.terms.map((t) => `- ${t}`).join("\n")}

${output.closingNote}`;
}

export function ProposalAgent({ prefill }: { prefill?: ProposalPrefill } = {}) {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<ProposalOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [wasPrefilled, setWasPrefilled] = useState(false);

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedProjectName, setSavedProjectName] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<ProposalInput | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue } = useForm<any>({
    resolver: zodResolver(proposalInputSchema) as any,
    defaultValues: {
      clientName: "Priya Menon",
      projectName: "Banjara Hills 3BHK",
      projectType: "Full Home Interior",
      spaceDetails: "1800 sqft, 3 bedrooms, living + dining, kitchen, 2 bathrooms, 9ft ceilings",
      budget: "₹18 lakhs",
      timeline: "Complete by September 2024",
      styleDirection: "Modern warm with wood textures, earthy neutrals, biophilic elements",
      keyRequirements: "Home office in master, good storage, statement dining light, kid-friendly materials, vendor management by studio",
      studioName: "Aura Interiors",
    },
  });

  useEffect(() => {
    if (!prefill) return;
    Object.entries(prefill).forEach(([key, value]) => {
      if (value) setValue(key, value);
    });
    setWasPrefilled(true);
  }, [prefill, setValue]);

  const onSubmit = async (data: ProposalInput) => {
    setLoading(true);
    setError(null);
    setOutput(null);
    setSavedProjectName(null);
    try {
      const res = await fetch("/api/agents/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setOutput(json.data);
      setLastInput(data);
      setCreatedProjectId(null);
      setCompletedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!output || !lastInput) return;
    setCreatingProject(true);
    try {
      const budgetNum = parseInt(output.pricing.totalEstimate.replace(/[^0-9]/g, ""), 10) || null;
      const startDate = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lastInput.projectName,
          status: "Discovery",
          budget: budgetNum,
          start_date: startDate,
          description: `Client: ${lastInput.clientName}. ${output.executiveSummary || ""}`.slice(0, 500),
        }),
      });
      if (res.ok) {
        const project = await res.json();
        setCreatedProjectId(project.id);
        // Attach this proposal to the project it just created
        await fetch(`/api/projects/${project.id}/save-proposal`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposal: output }),
        });
      }
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSaveToProject = async () => {
    if (!selectedProjectId || !output) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/save-proposal`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal: output }),
      });
      if (res.ok) {
        const project = projects.find((p) => p.id === selectedProjectId);
        setSavedProjectName(project?.name || "project");
      }
    } finally {
      setSaving(false);
    }
  };

  const status = loading ? "loading" : error ? "error" : output ? "success" : "idle";

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* LEFT: Form */}
      <div className="sticky top-6 self-start space-y-3">
      {wasPrefilled && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
          <Sparkles className="w-3.5 h-3.5" /> Pre-filled from Priya's discovery brief
        </div>
      )}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-zinc-900">Project Brief</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Client Name</label>
                <Input {...register("clientName")} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Name</label>
                <Input {...register("projectName")} className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Type</label>
                <Input {...register("projectType")} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Studio Name</label>
                <Input {...register("studioName")} className="text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Space Details</label>
              <Textarea {...register("spaceDetails")} rows={2} className="text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Budget</label>
                <Input {...register("budget")} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Timeline</label>
                <Input {...register("timeline")} className="text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Style Direction</label>
              <Textarea {...register("styleDirection")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Key Requirements</label>
              <Textarea {...register("keyRequirements")} rows={2} className="text-sm resize-none" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Proposal...</> : "Generate Proposal"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>

      {/* RIGHT: Results */}
      <div className="space-y-4">
        <AgentStatusBanner
          status={status}
          errorMessage={error}
          agentName="Ravi"
          completedAt={completedAt}
          copyText={output ? formatForCopy(output) : undefined}
        />

        {!output && !loading && (
          <div className="flex items-center justify-center h-64 border border-dashed border-zinc-200 rounded-lg">
            <p className="text-xs text-zinc-400">Proposal will appear here</p>
          </div>
        )}

      {output && (
        <>
          {/* Create Project — the real next step once a proposal is ready */}
          <Card className="border-zinc-900">
            <CardContent className="p-4">
              {createdProjectId ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <Check className="w-3.5 h-3.5" /> Project created and proposal attached
                  </div>
                  <Link href={`/admin/projects/${createdProjectId}`}>
                    <Button size="sm" className="gap-1.5">
                      Open Project <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <FolderPlus className="w-3.5 h-3.5 text-zinc-400" />
                    Client accepted? Create the project from this proposal.
                  </div>
                  <Button size="sm" className="gap-1.5 shrink-0" disabled={creatingProject} onClick={handleCreateProject}>
                    {creatingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Project"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save to Project (existing) */}
          <Card className="bg-zinc-50 border-zinc-200">
            <CardContent className="p-3">
              {savedProjectName ? (
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <Check className="w-3.5 h-3.5" /> Saved to {savedProjectName}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="flex-1 text-xs border border-zinc-200 rounded-md px-2 py-1.5 bg-white"
                  >
                    <option value="">Attach this proposal to a project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 shrink-0" disabled={!selectedProjectId || saving} onClick={handleSaveToProject}>
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Header */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-base font-semibold text-zinc-900 mb-1">{output.proposalTitle}</h2>
              <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">{output.executiveSummary}</p>
            </CardContent>
          </Card>

          {/* Scope */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-zinc-900 mb-3">Project Scope</h3>
              <div className="space-y-3">
                {output.projectScope.map((scope, i) => (
                  <div key={i} className="border border-zinc-100 rounded-md p-3">
                    <p className="text-xs font-semibold text-zinc-900 mb-1">{scope.area}</p>
                    <p className="text-xs text-zinc-500 mb-2">{scope.description}</p>
                    <ul className="space-y-0.5">
                      {scope.included.map((item, j) => (
                        <li key={j} className="text-xs text-zinc-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-zinc-900">Timeline</h3>
                <span className="text-xs text-zinc-500">{output.timeline.totalDuration}</span>
              </div>
              <div className="space-y-2">
                {output.timeline.phases.map((phase, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</div>
                      {i < output.timeline.phases.length - 1 && <div className="w-px flex-1 bg-zinc-200 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium text-zinc-900">{phase.phase}</p>
                        <span className="text-[10px] text-zinc-400">{phase.duration}</span>
                      </div>
                      <ul className="space-y-0.5">
                        {phase.milestones.map((m, j) => (
                          <li key={j} className="text-xs text-zinc-500">· {m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-zinc-900">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-zinc-900 mb-3">Investment Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Design Fee ({output.pricing.designFee.basis})</span>
                  <span className="font-semibold text-zinc-900">{output.pricing.designFee.amount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Procurement Estimate</span>
                  <span className="font-semibold text-zinc-900">{output.pricing.procurementEstimate}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-zinc-200 pt-2 mt-2">
                  <span className="font-semibold text-zinc-900">Total Estimate</span>
                  <span className="font-bold text-zinc-900">{output.pricing.totalEstimate}</span>
                </div>
              </div>
              <h4 className="text-xs font-semibold text-zinc-700 mb-2">Payment Schedule</h4>
              <div className="space-y-1.5">
                {output.pricing.paymentSchedule.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-zinc-50 px-3 py-2 rounded">
                    <span className="text-zinc-600">{p.milestone}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">{p.percentage}%</span>
                      <span className="font-medium text-zinc-900">{p.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exclusions & Terms */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-2">Exclusions</h3>
                <ul className="space-y-1">
                  {output.exclusions.map((e, i) => (
                    <li key={i} className="text-xs text-zinc-600">· {e}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-2">Terms</h3>
                <ul className="space-y-1">
                  {output.terms.map((t, i) => (
                    <li key={i} className="text-xs text-zinc-600">· {t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-50">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-600 italic leading-relaxed">{output.closingNote}</p>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </div>
  );
}
