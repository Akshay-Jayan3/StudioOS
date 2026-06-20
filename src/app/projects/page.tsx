import { Header } from "@/components/layout/header";
import { mockProjects } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const statusColor: Record<string, string> = {
  Discovery: "bg-blue-50 text-blue-700",
  Design: "bg-purple-50 text-purple-700",
  Approval: "bg-yellow-50 text-yellow-700",
  Execution: "bg-orange-50 text-orange-700",
  Completed: "bg-green-50 text-green-700",
};

const statusOrder = ["Discovery", "Design", "Approval", "Execution", "Completed"];

export default function ProjectsPage() {
  return (
    <div>
      <Header
        title="Projects"
        description="All projects · 6 total"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Project
          </Button>
        }
      />

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {statusOrder.map((status) => {
          const count = mockProjects.filter((p) => p.status === status).length;
          return (
            <div key={status} className={`rounded-lg px-4 py-3 border ${count > 0 ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50 opacity-50"}`}>
              <p className="text-xs text-zinc-500 mb-1">{status}</p>
              <p className="text-lg font-semibold text-zinc-900">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-2 gap-4">
        {mockProjects.map((project) => {
          const percent = Math.round((project.spent / project.budget) * 100);
          const remaining = project.budget - project.spent;
          return (
            <Card key={project.id} className="hover:border-zinc-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{project.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{project.client}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${statusColor[project.status]}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 mb-3 line-clamp-1">{project.description}</p>

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

                <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-3">
                  <div>
                    <p className="text-[10px] text-zinc-400 mb-0.5">Budget</p>
                    <p className="text-xs font-medium text-zinc-900">₹{(project.budget / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 mb-0.5">Spent</p>
                    <p className="text-xs font-medium text-zinc-900">₹{(project.spent / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 mb-0.5">Remaining</p>
                    <p className="text-xs font-medium text-zinc-900">₹{(remaining / 100000).toFixed(1)}L</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-medium text-zinc-600">
                      {project.designer.charAt(0)}
                    </div>
                    <span className="text-xs text-zinc-500">{project.designer}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <span>{project.startDate}</span>
                    <span>→</span>
                    <span>{project.endDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
