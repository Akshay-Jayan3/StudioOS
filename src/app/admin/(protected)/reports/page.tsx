import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { mockProjects, mockLeads } from "@/lib/mock-data";
import { TrendingUp, Users, FolderKanban, Bot } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// Manual-work estimates per agent — used to turn a real task count into an
// hours-saved / value-saved figure. Not pulled from anywhere: AI run counts are
// real, but how long the equivalent manual work would take is an estimate.
const AGENT_ESTIMATES: Record<string, { label: string; hoursPerTask: number }> = {
  "Discovery Agent": { label: "Priya (Discovery)", hoursPerTask: 2 },
  "Proposal Agent": { label: "Ravi (Proposals)", hoursPerTask: 4 },
  "Content Agent": { label: "Neha (Content)", hoursPerTask: 2 },
  "Update Agent": { label: "Aryan (Updates)", hoursPerTask: 2 },
  "Testimonial Agent": { label: "Vikram (Testimonials)", hoursPerTask: 1 },
  "Lead Intake Agent": { label: "Nila (Lead Intake)", hoursPerTask: 0.5 },
};
const RATE_PER_HOUR = 2000; // ₹ — used only to express hours saved as a value figure

async function getReportData() {
  try {
    const supabase = await createClient();
    const [leadsRes, projectsRes, runsRes] = await Promise.all([
      supabase.from("leads").select("id, status, budget"),
      supabase.from("projects").select("id, status, budget, spent"),
      supabase.from("ai_task_runs").select("agent, status, created_at"),
    ]);

    if (leadsRes.error || projectsRes.error || runsRes.error) throw new Error("Supabase error");

    return {
      source: "live" as const,
      leads: leadsRes.data || [],
      projects: projectsRes.data || [],
      runs: runsRes.data || [],
    };
  } catch {
    return {
      source: "mock" as const,
      leads: mockLeads,
      projects: mockProjects,
      runs: [] as { agent: string; status: string; created_at: string }[],
    };
  }
}

export default async function ReportsPage() {
  const { source, leads, projects, runs } = await getReportData();

  const wonLeads = leads.filter((l) => l.status === "Won").length;
  const totalLeads = leads.length || 1;
  const conversionRate = Math.round((wonLeads / totalLeads) * 100);

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0) || 1;
  const totalSpent = projects.reduce((s, p) => s + (p.spent || 0), 0);

  const now = new Date();
  const thisMonthRuns = runs.filter((r) => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.status === "completed";
  });

  const byAgent = Object.entries(AGENT_ESTIMATES).map(([agent, { label, hoursPerTask }]) => {
    const tasks = thisMonthRuns.filter((r) => r.agent === agent).length;
    const hours = tasks * hoursPerTask;
    return { name: label, tasks, hours, value: hours * RATE_PER_HOUR };
  });

  const totalTasks = thisMonthRuns.length;
  const totalHours = byAgent.reduce((s, a) => s + a.hours, 0);
  const totalValue = byAgent.reduce((s, a) => s + a.value, 0);

  return (
    <div>
      <Header
        title="Reports"
        description={`Business performance overview${source === "mock" ? " · showing sample data (Supabase unreachable)" : ""}`}
      />

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Lead Conversion */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-900">Lead Conversion</h3>
            </div>
            <div className="space-y-3">
              {["New Lead", "Discovery Scheduled", "Proposal Sent", "Won", "Lost"].map((status) => {
                const count = leads.filter((l) => l.status === status).length;
                const pct = Math.round((count / totalLeads) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-600">{status}</span>
                      <span className="font-medium text-zinc-900">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100">
              <p className="text-xs text-zinc-500">Conversion rate: <span className="font-semibold text-zinc-900">{conversionRate}%</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-900">Budget Overview</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Total Portfolio Value</span>
                  <span className="font-semibold text-zinc-900">₹{(totalBudget / 10000000).toFixed(2)}Cr</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Total Spent</span>
                  <span className="font-semibold text-zinc-900">₹{(totalSpent / 10000000).toFixed(2)}Cr</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Remaining</span>
                  <span className="font-semibold text-zinc-900">₹{((totalBudget - totalSpent) / 10000000).toFixed(2)}Cr</span>
                </div>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full"
                  style={{ width: `${Math.round((totalSpent / totalBudget) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400">{Math.round((totalSpent / totalBudget) * 100)}% of portfolio budget utilised</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Breakdown */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <FolderKanban className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Projects by Status</h3>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {["Discovery", "Design", "Approval", "Execution", "Completed"].map((status) => {
              const count = projects.filter((p) => p.status === status).length;
              const budget = projects.filter((p) => p.status === status).reduce((s, p) => s + (p.budget || 0), 0);
              return (
                <div key={status} className="text-center">
                  <p className="text-2xl font-bold text-zinc-900">{count}</p>
                  <p className="text-xs text-zinc-500 mb-1">{status}</p>
                  {budget > 0 && <p className="text-[10px] text-zinc-400">₹{(budget / 100000).toFixed(0)}L</p>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Impact */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">AI Employee Impact</h3>
            <span className="ml-auto text-[10px] text-zinc-400">This month · hours/value are estimates</span>
          </div>
          {totalTasks === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">No AI agent runs logged yet this month</p>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                {byAgent
                  .filter((a) => a.tasks > 0)
                  .map((emp) => (
                    <div key={emp.name} className="bg-zinc-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-zinc-900 mb-2">{emp.name}</p>
                      <p className="text-xl font-bold text-zinc-900">{emp.tasks}</p>
                      <p className="text-[10px] text-zinc-400">tasks</p>
                      <p className="text-xs font-medium text-zinc-700 mt-1">{emp.hours}h saved</p>
                      <p className="text-[10px] text-zinc-400">≈ ₹{emp.value.toLocaleString("en-IN")} value</p>
                    </div>
                  ))}
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <p className="text-xs text-zinc-500">Total this month</p>
                <div className="flex items-center gap-4 text-xs">
                  <span><span className="font-semibold text-zinc-900">{totalTasks}</span> tasks</span>
                  <span><span className="font-semibold text-zinc-900">{totalHours}h</span> saved</span>
                  <span><span className="font-semibold text-zinc-900">₹{(totalValue / 100000).toFixed(2)}L</span> value</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
