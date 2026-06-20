import { Header } from "@/components/layout/header";
import { mockStats, mockProjects, mockLeads } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FolderKanban,
  FileText,
  CheckCircle2,
  Bot,
  TrendingUp,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getStats() {
  try {
    const supabase = await createClient();
    const [leadsRes, projectsRes, runsRes] = await Promise.all([
      supabase.from("leads").select("id, status, budget"),
      supabase.from("projects").select("id, status, budget, spent, name, designer, clients(name)"),
      supabase.from("ai_task_runs").select("id, agent, status, created_at, trigger_entity").order("created_at", { ascending: false }).limit(5),
    ]);

    if (leadsRes.error || projectsRes.error) throw new Error("Supabase error");

    const leads = leadsRes.data || [];
    const projects = projectsRes.data || [];
    const runs = runsRes.data || [];

    return {
      source: "live" as const,
      totalLeads: leads.length,
      activeProjects: projects.filter((p) => p.status !== "Completed").length,
      pendingProposals: leads.filter((l) => l.status === "Proposal Sent").length,
      completedProjects: projects.filter((p) => p.status === "Completed").length,
      aiTasksCompleted: runs.filter((r) => r.status === "completed").length,
      projects,
      leads,
      recentRuns: runs,
    };
  } catch {
    return {
      source: "mock" as const,
      totalLeads: mockStats.totalLeads,
      activeProjects: mockStats.activeProjects,
      pendingProposals: mockStats.pendingProposals,
      completedProjects: mockStats.completedProjects,
      aiTasksCompleted: mockStats.aiTasksCompleted,
      projects: mockProjects,
      leads: mockLeads,
      recentRuns: [],
    };
  }
}

const statusColor: Record<string, string> = {
  Discovery: "bg-blue-50 text-blue-700",
  Design: "bg-purple-50 text-purple-700",
  Approval: "bg-yellow-50 text-yellow-700",
  Execution: "bg-orange-50 text-orange-700",
  Completed: "bg-green-50 text-green-700",
};

const leadStatusColor: Record<string, string> = {
  "New Lead": "bg-zinc-100 text-zinc-700",
  "Discovery Scheduled": "bg-blue-50 text-blue-700",
  "Proposal Sent": "bg-yellow-50 text-yellow-700",
  Won: "bg-green-50 text-green-700",
  Lost: "bg-red-50 text-red-700",
};

export default async function DashboardPage() {
  const stats = await getStats();
  const activeProjects = stats.projects.filter((p: any) => p.status !== "Completed");
  const recentLeads = stats.leads.slice(0, 4);

  const statCards = [
    { label: "Total Leads", value: stats.totalLeads, icon: Users, sub: "+2 this week", href: "/leads" },
    { label: "Active Projects", value: stats.activeProjects, icon: FolderKanban, sub: "In progress", href: "/projects" },
    { label: "Pending Proposals", value: stats.pendingProposals, icon: FileText, sub: "Awaiting client", href: "/leads" },
    { label: "Completed", value: stats.completedProjects, icon: CheckCircle2, sub: "This quarter", href: "/projects" },
    { label: "AI Tasks Run", value: stats.aiTasksCompleted, icon: Bot, sub: "All agents", href: "/ai-employees" },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        description={`Friday, 20 June 2026 · Studio overview${stats.source === "mock" ? " · Mock data" : " · Live data"}`}
      />

      {stats.source === "mock" && (
        <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
          Showing mock data. Add Supabase credentials to <code className="font-mono">.env.local</code> to enable live data.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, sub, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-zinc-300 transition-colors cursor-pointer">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="p-1.5 bg-zinc-100 rounded-md w-fit mb-3">
                  <Icon className="w-4 h-4 text-zinc-600" />
                </div>
                <p className="text-2xl font-semibold text-zinc-900">{value}</p>
                <p className="text-xs font-medium text-zinc-600 mt-0.5">{label}</p>
                <p className="text-xs text-zinc-400 mt-1">{sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-zinc-900">Active Projects</CardTitle>
                <Link href="/admin/projects" className="text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeProjects.map((project: any) => {
                  const budget = project.budget || 0;
                  const spent = project.spent || 0;
                  const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                  const clientName = project.clients?.name || project.client || "—";
                  return (
                    <div key={project.id} className="flex items-center gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-zinc-900 truncate">{project.name}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColor[project.status]}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{clientName} · {project.designer || "Unassigned"}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-400 shrink-0">{percent}% spent</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-zinc-900">
                          {budget > 0 ? `₹${(budget / 100000).toFixed(1)}L` : "—"}
                        </p>
                        <p className="text-[10px] text-zinc-400">budget</p>
                      </div>
                    </div>
                  );
                })}
                {activeProjects.length === 0 && (
                  <p className="text-xs text-zinc-400 text-center py-6">No active projects yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Activity Feed */}
          {stats.recentRuns.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Recent AI Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recentRuns.map((run: any) => (
                    <div key={run.id} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${run.status === "completed" ? "bg-green-500" : run.status === "failed" ? "bg-red-500" : "bg-yellow-500"}`} />
                        <span className="text-xs text-zinc-700">{run.agent}</span>
                        <span className="text-xs text-zinc-400">on {run.trigger_entity}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">{new Date(run.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-900">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Pipeline
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {["New Lead", "Discovery Scheduled", "Proposal Sent", "Won", "Lost"].map((status) => {
                const count = stats.leads.filter((l: any) => (l.status || l.status) === status).length;
                return (
                  <div key={status} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
                    <span className="text-xs text-zinc-600">{status}</span>
                    <span className="text-xs font-semibold text-zinc-900">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-zinc-900">Recent Leads</CardTitle>
                <Link href="/admin/leads" className="text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{lead.name}</p>
                      <p className="text-xs text-zinc-400">{lead.project_type || lead.projectType || "—"}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${leadStatusColor[lead.status]}`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
