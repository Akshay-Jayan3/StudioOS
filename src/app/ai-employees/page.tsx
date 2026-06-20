"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscoveryAgent } from "@/components/agents/discovery-agent";
import { ProposalAgent } from "@/components/agents/proposal-agent";
import { ContentAgent } from "@/components/agents/content-agent";
import { UpdateAgent } from "@/components/agents/update-agent";
import { TestimonialAgent } from "@/components/agents/testimonial-agent";
import { Bot, Zap, Search, FileText, Megaphone, MessageSquare, Star, Loader2 } from "lucide-react";

// hoursSavedPerTask is an estimate (manual task time this replaces), not measured.
// tasksCompleted and timeSaved below are computed from real ai_task_runs data.
const employees = [
  {
    id: "discovery",
    agentKey: "Discovery Agent",
    name: "Priya",
    role: "Client Discovery Specialist",
    icon: Search,
    description: "Analyzes client questionnaires and produces structured project briefs. Replaces 2 hours of manual note-taking with a 30-second structured output.",
    input: "Client questionnaire responses",
    output: "Project brief, goals, budget analysis, risks, next questions",
    hoursSavedPerTask: 2,
  },
  {
    id: "proposal",
    agentKey: "Proposal Agent",
    name: "Ravi",
    role: "Proposal Specialist",
    icon: FileText,
    description: "Generates complete proposal drafts from project briefs. Reduces proposal creation from 4 hours to 15 minutes of editing.",
    input: "Project brief and scope details",
    output: "Full proposal with scope, timeline, deliverables, pricing",
    hoursSavedPerTask: 4,
  },
  {
    id: "content",
    agentKey: "Content Agent",
    name: "Neha",
    role: "Marketing Content Specialist",
    icon: Megaphone,
    description: "Turns completed projects into marketing assets. Creates case studies, Instagram captions, and LinkedIn posts from project notes.",
    input: "Project photos description and notes",
    output: "Case study, Instagram caption, LinkedIn post, project story",
    hoursSavedPerTask: 2,
  },
  {
    id: "update",
    agentKey: "Update Agent",
    name: "Aryan",
    role: "Client Communication Specialist",
    icon: MessageSquare,
    description: "Writes weekly project update emails and WhatsApp messages. Ensures clients are informed without consuming designer time.",
    input: "Project status, milestones, issues",
    output: "Email update, WhatsApp version, internal risk notes",
    hoursSavedPerTask: 1,
  },
  {
    id: "testimonial",
    agentKey: "Testimonial Agent",
    name: "Vikram",
    role: "Customer Success Specialist",
    icon: Star,
    description: "Writes testimonial and referral request messages after project completion. Turns happy clients into reviews and referrals without awkward asks.",
    input: "Completed project details, client relationship notes",
    output: "Testimonial request email, WhatsApp version, referral follow-up",
    hoursSavedPerTask: 0.5,
  },
];

type AIRun = { agent: string; status: string; created_at: string };

export default function AIEmployeesPage() {
  const [runs, setRuns] = useState<AIRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discovery");

  useEffect(() => {
    fetch("/api/ai-runs")
      .then((r) => r.json())
      .then((data) => setRuns(Array.isArray(data) ? data : []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  const statsFor = (agentKey: string) => {
    const completed = runs.filter((r) => r.agent === agentKey && r.status === "completed");
    return completed.length;
  };

  const employeesWithStats = employees.map((emp) => {
    const tasksCompleted = statsFor(emp.agentKey);
    const hoursSaved = tasksCompleted * emp.hoursSavedPerTask;
    return { ...emp, tasksCompleted, timeSaved: `${hoursSaved} hrs` };
  });

  const totalTasks = employeesWithStats.reduce((sum, e) => sum + e.tasksCompleted, 0);
  const totalHours = employeesWithStats.reduce((sum, e) => sum + e.tasksCompleted * e.hoursSavedPerTask, 0);
  const totalValue = totalHours * 600; // rough designer hourly rate estimate, India context

  return (
    <div>
      <Header
        title="AI Employees"
        description={
          loading
            ? "Loading real usage data..."
            : `5 AI employees · ${totalTasks} tasks completed · ${totalHours.toFixed(1)} hours saved (estimated)`
        }
      />

      {/* Team Overview */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {employeesWithStats.map((emp) => {
          const Icon = emp.icon;
          return (
            <Card key={emp.id} className="hover:border-zinc-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-zinc-100 rounded-lg">
                    <Icon className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-zinc-400">Active</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-zinc-900">{emp.name}</p>
                <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{emp.role}</p>
                <div className="border-t border-zinc-100 pt-2 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-zinc-900">
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : emp.tasksCompleted}
                    </p>
                    <p className="text-[10px] text-zinc-400">tasks done</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-zinc-900">{loading ? "—" : emp.timeSaved}</p>
                    <p className="text-[10px] text-zinc-400">saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total impact bar */}
      <div className="bg-zinc-900 text-white rounded-xl px-6 py-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-zinc-400" />
          <div>
            <p className="text-sm font-medium">Team Impact — All Time</p>
            <p className="text-xs text-zinc-400">Real task counts from agent runs · time/value are estimates</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-xl font-semibold">{loading ? "—" : totalTasks}</p>
            <p className="text-xs text-zinc-400">tasks completed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{loading ? "—" : `${totalHours.toFixed(1)}h`}</p>
            <p className="text-xs text-zinc-400">hours saved (est.)</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{loading ? "—" : `₹${(totalValue / 1000).toFixed(0)}K`}</p>
            <p className="text-xs text-zinc-400">time value (est.)</p>
          </div>
        </div>
      </div>

      {/* Agent Workspace */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {employeesWithStats.map((emp) => (
            <TabsTrigger key={emp.id} value={emp.id} className="gap-2">
              <emp.icon className="w-3.5 h-3.5" />
              {emp.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="discovery">
          <AgentWrapper employee={employeesWithStats[0]}>
            <DiscoveryAgent onGenerateProposal={() => setActiveTab("proposal")} />
          </AgentWrapper>
        </TabsContent>

        <TabsContent value="proposal">
          <AgentWrapper employee={employeesWithStats[1]}>
            <ProposalAgent />
          </AgentWrapper>
        </TabsContent>

        <TabsContent value="content">
          <AgentWrapper employee={employeesWithStats[2]}>
            <ContentAgent />
          </AgentWrapper>
        </TabsContent>

        <TabsContent value="update">
          <AgentWrapper employee={employeesWithStats[3]}>
            <UpdateAgent />
          </AgentWrapper>
        </TabsContent>

        <TabsContent value="testimonial">
          <AgentWrapper employee={employeesWithStats[4]}>
            <TestimonialAgent />
          </AgentWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AgentWrapper({ employee, children }: { employee: typeof employees[0] & { tasksCompleted: number; timeSaved: string }; children: React.ReactNode }) {
  const Icon = employee.icon;
  return (
    <div>
      {/* Compact employee strip */}
      <div className="flex items-center gap-4 mb-5 px-4 py-3 bg-white border border-zinc-200 rounded-lg">
        <div className="p-2 bg-zinc-100 rounded-lg shrink-0">
          <Icon className="w-4 h-4 text-zinc-700" />
        </div>
        <div className="shrink-0">
          <p className="text-sm font-semibold text-zinc-900">{employee.name}</p>
          <p className="text-xs text-zinc-500">{employee.role}</p>
        </div>
        <div className="h-8 w-px bg-zinc-200 shrink-0" />
        <p className="text-xs text-zinc-500 flex-1 leading-relaxed">{employee.description}</p>
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-zinc-500">
          <Zap className="w-3.5 h-3.5 text-zinc-400" />
          {employee.tasksCompleted} tasks · {employee.timeSaved} saved
        </div>
      </div>

      {/* Agent form + output, side by side */}
      {children}
    </div>
  );
}
