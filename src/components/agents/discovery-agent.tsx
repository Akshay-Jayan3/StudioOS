"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { discoveryInputSchema, DiscoveryInput, DiscoveryOutput } from "@/agents/discovery-agent/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AgentStatusBanner } from "@/components/agents/agent-status-banner";
import { Loader2, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";

export function DiscoveryAgent({ onGenerateProposal }: { onGenerateProposal?: () => void } = {}) {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<DiscoveryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);

  const { register, handleSubmit } = useForm<DiscoveryInput>({
    resolver: zodResolver(discoveryInputSchema),
    defaultValues: {
      clientName: "Priya Menon",
      projectType: "Full Home Interior – 3BHK",
      spaceDescription: "1800 sqft apartment in Banjara Hills, Hyderabad. 3 bedrooms, living + dining, kitchen, 2 bathrooms. 9ft ceilings. East-West facing.",
      budget: "₹18 lakhs all-inclusive",
      timeline: "Move-in by October 2024, so ideally done by September",
      stylePreferences: "Modern but warm, not too minimal. Saw some projects on Pinterest – neutral tones, lots of wood textures, some greenery. Wife likes earthy colors.",
      mustHaves: "A home office space in the master bedroom. Good storage in all rooms. A statement dining light. Kid-friendly materials for the living room.",
      painPoints: "Previous contractor left mid-project. Hate surprises – want to know costs upfront. Need someone who can manage vendors so we don't have to.",
      additionalNotes: "Wife is the main decision maker. They have a 4-year-old. Husband travels for work frequently.",
    },
  });

  const onSubmit = async (data: DiscoveryInput) => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/agents/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setOutput(json.data);
      setCompletedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const status = loading ? "loading" : error ? "error" : output ? "success" : "idle";

  const severityColor = { High: "text-red-600 bg-red-50", Medium: "text-yellow-700 bg-yellow-50", Low: "text-green-700 bg-green-50" };
  const priorityColor = { "Must Have": "bg-zinc-900 text-white", "Nice to Have": "bg-zinc-100 text-zinc-700", Optional: "bg-zinc-50 text-zinc-400" };
  const fitLabel = output ? (output.readinessScore >= 7 ? "Strong Fit" : output.readinessScore >= 5 ? "Workable Fit" : "Needs More Discovery") : "";
  const fitColor = output ? (output.readinessScore >= 7 ? "bg-green-500" : output.readinessScore >= 5 ? "bg-yellow-500" : "bg-red-500") : "";

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* LEFT: Form */}
      <div className="sticky top-6 self-start space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-900">Client Questionnaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 mb-1 block">Client Name</label>
                  <Input {...register("clientName")} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Type</label>
                  <Input {...register("projectType")} className="text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Space Description</label>
                <Textarea {...register("spaceDescription")} rows={2} className="text-sm resize-none" />
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
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Style Preferences</label>
                <Textarea {...register("stylePreferences")} rows={2} className="text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Must Haves</label>
                <Textarea {...register("mustHaves")} rows={2} className="text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Pain Points</label>
                <Textarea {...register("painPoints")} rows={2} className="text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Additional Notes</label>
                <Textarea {...register("additionalNotes")} rows={2} className="text-sm resize-none" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : "Run Discovery Analysis"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Results */}
      <div className="space-y-4">
        <AgentStatusBanner status={status} errorMessage={error} agentName="Priya" completedAt={completedAt} />

        {!output && !loading && (
          <div className="flex items-center justify-center h-64 border border-dashed border-zinc-200 rounded-lg">
            <p className="text-xs text-zinc-400">Discovery brief will appear here</p>
          </div>
        )}

        {output && (
          <>
            {/* Hero summary card */}
            <Card className="border-zinc-900">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Discovery Brief</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${fitColor}`} />
                    <span className="text-xs font-semibold text-zinc-900">{fitLabel}</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">{output.projectSummary}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                  <span className="text-xs text-zinc-400">Readiness Score</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${output.readinessScore >= 7 ? "bg-green-100 text-green-700" : output.readinessScore >= 5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {output.readinessScore}/10
                  </span>
                </div>
                {onGenerateProposal && (
                  <Button size="sm" className="w-full mt-3 gap-1.5" onClick={onGenerateProposal}>
                    Generate Proposal <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Risks — highest priority, shown first */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Risks
                </h3>
                <div className="space-y-2">
                  {output.risks.map((r, i) => (
                    <div key={i} className={`p-2.5 rounded-md ${severityColor[r.severity]}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-medium">{r.risk}</span>
                        <span className="text-[10px] font-medium opacity-70 shrink-0">{r.severity}</span>
                      </div>
                      <p className="text-xs opacity-75">{r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Questions — second priority */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Next Questions to Ask
                </h3>
                <ol className="space-y-1.5">
                  {output.nextQuestions.map((q, i) => (
                    <li key={i} className="text-xs text-zinc-700 flex items-start gap-2">
                      <span className="text-zinc-400 font-medium shrink-0">{i + 1}.</span> {q}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Client Goals */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Client Goals
                </h3>
                <ul className="space-y-1.5">
                  {output.clientGoals.map((g, i) => (
                    <li key={i} className="text-xs text-zinc-700 flex items-start gap-2">
                      <span className="text-zinc-300 shrink-0">·</span> {g}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Budget Analysis */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-3">Budget Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Stated</span>
                    <span className="font-medium text-zinc-900">{output.budgetAnalysis.stated}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Realistic</span>
                    <span className="font-medium text-zinc-900">{output.budgetAnalysis.realistic}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Assessment</span>
                    <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${output.budgetAnalysis.assessment === "Adequate" ? "bg-green-50 text-green-700" : output.budgetAnalysis.assessment === "Tight" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                      {output.budgetAnalysis.assessment}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-2 pt-2 border-t border-zinc-100">{output.budgetAnalysis.recommendation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-900 mb-3">Requirements</h3>
                <div className="space-y-2">
                  {output.requirements.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-zinc-700">{r.item}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${priorityColor[r.priority]}`}>
                        {r.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Designer notes */}
            <Card className="border-zinc-200 bg-zinc-50">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">Internal Designer Notes</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{output.designerNotes}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
