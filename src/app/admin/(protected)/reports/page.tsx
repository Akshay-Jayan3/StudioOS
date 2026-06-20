import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { mockProjects, mockLeads } from "@/lib/mock-data";
import { TrendingUp, Users, FolderKanban, Bot } from "lucide-react";

export default function ReportsPage() {
  const wonLeads = mockLeads.filter((l) => l.status === "Won").length;
  const totalLeads = mockLeads.length;
  const conversionRate = Math.round((wonLeads / totalLeads) * 100);

  const totalBudget = mockProjects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = mockProjects.reduce((s, p) => s + p.spent, 0);

  const completedProjects = mockProjects.filter((p) => p.status === "Completed");

  return (
    <div>
      <Header title="Reports" description="Business performance overview · Q2 2026" />

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
                const count = mockLeads.filter((l) => l.status === status).length;
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
              const count = mockProjects.filter((p) => p.status === status).length;
              const budget = mockProjects.filter((p) => p.status === status).reduce((s, p) => s + p.budget, 0);
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
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: "Priya (Discovery)", tasks: 18, hours: 36, value: "₹72,000" },
              { name: "Ravi (Proposals)", tasks: 12, hours: 48, value: "₹96,000" },
              { name: "Neha (Content)", tasks: 9, hours: 18, value: "₹36,000" },
              { name: "Aryan (Updates)", tasks: 8, hours: 16, value: "₹32,000" },
            ].map((emp) => (
              <div key={emp.name} className="bg-zinc-50 rounded-lg p-3">
                <p className="text-xs font-medium text-zinc-900 mb-2">{emp.name}</p>
                <p className="text-xl font-bold text-zinc-900">{emp.tasks}</p>
                <p className="text-[10px] text-zinc-400">tasks</p>
                <p className="text-xs font-medium text-zinc-700 mt-1">{emp.hours}h saved</p>
                <p className="text-[10px] text-zinc-400">≈ {emp.value} value</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs text-zinc-500">Total this month</p>
            <div className="flex items-center gap-4 text-xs">
              <span><span className="font-semibold text-zinc-900">47</span> tasks</span>
              <span><span className="font-semibold text-zinc-900">118h</span> saved</span>
              <span><span className="font-semibold text-zinc-900">₹2.36L</span> value</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
