"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateInputSchema, UpdateInput, UpdateOutput } from "@/agents/update-agent/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AgentStatusBanner } from "@/components/agents/agent-status-banner";
import { Loader2, Mail, MessageSquare, AlertTriangle, CheckCircle2, ArrowRight, Pencil } from "lucide-react";

export function UpdateAgent() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<UpdateOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(true);

  const { register, handleSubmit } = useForm<UpdateInput>({
    resolver: zodResolver(updateInputSchema),
    defaultValues: {
      projectName: "Jubilee Hills Villa",
      clientName: "Lakshmi Rao",
      currentPhase: "Execution",
      completedThisWeek: "Completed false ceiling work in living and dining areas. Electrical rough-in done in all bedrooms. Marble flooring started in master bedroom.",
      inProgress: "Tiling in bathrooms (2 of 3 done). Modular kitchen delivery expected Friday. Painting prep underway in bedrooms.",
      upcomingMilestones: "Kitchen installation next week. Master bedroom completion by 15th. Final electrical inspection scheduled for 18th.",
      issues: "Marble supplier had a batch mismatch – ordered replacement, 3-day delay expected. Won't affect overall timeline.",
      clientDecisionsNeeded: "Client needs to confirm pendant light selection for dining (sent 3 options via email on Monday – awaiting response). Also needs to confirm curtain fabric for master.",
      overallHealth: "On Track",
    },
  });

  const onSubmit = async (data: UpdateInput) => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/agents/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setOutput(json.data);
      setCompletedAt(new Date());
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const status = loading ? "loading" : error ? "error" : output ? "success" : "idle";
  const healthColor = { "On Track": "bg-green-50 text-green-700", "At Risk": "bg-yellow-50 text-yellow-700", Delayed: "bg-red-50 text-red-700" };
  const ownerColor = { Studio: "bg-zinc-100 text-zinc-600", Client: "bg-blue-50 text-blue-700", Vendor: "bg-purple-50 text-purple-700" };

  return (
    <div className="space-y-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-zinc-200 rounded-md text-xs text-zinc-500 hover:border-zinc-300 transition-colors"
        >
          <span>Project Status Input (collapsed)</span>
          <span className="flex items-center gap-1 text-zinc-400"><Pencil className="w-3 h-3" /> Show form</span>
        </button>
      )}

      {showForm && (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-zinc-900">Project Status Input</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Name</label>
                <Input {...register("projectName")} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Client Name</label>
                <Input {...register("clientName")} className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Current Phase</label>
                <Input {...register("currentPhase")} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Overall Health</label>
                <select {...register("overallHealth")} className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 bg-white">
                  <option>On Track</option>
                  <option>At Risk</option>
                  <option>Delayed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Completed This Week</label>
              <Textarea {...register("completedThisWeek")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">In Progress</label>
              <Textarea {...register("inProgress")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Upcoming Milestones</label>
              <Textarea {...register("upcomingMilestones")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Issues (optional)</label>
              <Textarea {...register("issues")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Client Decisions Needed (optional)</label>
              <Textarea {...register("clientDecisionsNeeded")} rows={2} className="text-sm resize-none" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Update...</> : "Generate Client Update"}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      <AgentStatusBanner
        status={status}
        errorMessage={error}
        agentName="Aryan"
        completedAt={completedAt}
        onEditInputs={() => setShowForm(true)}
      />

      {output && (
        <div className="space-y-4">
          {/* Email Update */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-zinc-900">Email Update</h3>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">{output.subject}</span>
              </div>

              <div className="space-y-4 bg-zinc-50 rounded-lg p-4">
                <p className="text-sm text-zinc-700">{output.weeklyUpdate.greeting}</p>
                <p className="text-sm text-zinc-700 leading-relaxed">{output.weeklyUpdate.progressSummary}</p>

                <div>
                  <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">This Week</p>
                  <ul className="space-y-1">
                    {output.weeklyUpdate.accomplishments.map((a, i) => (
                      <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">Status</p>
                  <p className="text-sm text-zinc-700">{output.weeklyUpdate.currentStatus}</p>
                </div>

                {output.weeklyUpdate.clientActions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Action Required from You</p>
                    <ul className="space-y-1">
                      {output.weeklyUpdate.clientActions.map((a, i) => (
                        <li key={i} className="text-xs text-blue-700">· {a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wide">Next Steps</p>
                  <div className="space-y-1.5">
                    {output.weeklyUpdate.nextSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="text-sm text-zinc-700 flex-1">{step.action}</span>
                        <span className="text-xs text-zinc-400">{step.date}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${ownerColor[step.owner]}`}>{step.owner}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-zinc-700">{output.weeklyUpdate.closing}</p>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Version */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                <h3 className="text-xs font-semibold text-zinc-900">WhatsApp Version</h3>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed">{output.whatsappVersion}</p>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card className="bg-zinc-50 border-zinc-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Internal Notes (Not for Client)</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${output.internalNotes.projectHealthScore >= 7 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  Health {output.internalNotes.projectHealthScore}/10
                </span>
              </div>
              {output.internalNotes.risks.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-zinc-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risks
                  </p>
                  {output.internalNotes.risks.map((r, i) => (
                    <div key={i} className="text-xs text-zinc-600 mb-1.5 pl-2 border-l-2 border-yellow-300">
                      <span className="font-medium">{r.issue}</span> — {r.action}
                    </div>
                  ))}
                </div>
              )}
              {output.internalNotes.teamReminders.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Team Reminders</p>
                  <ul className="space-y-1">
                    {output.internalNotes.teamReminders.map((r, i) => (
                      <li key={i} className="text-xs text-zinc-600">· {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
