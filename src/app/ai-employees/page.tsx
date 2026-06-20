"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscoveryAgent } from "@/components/agents/discovery-agent";
import { ProposalAgent } from "@/components/agents/proposal-agent";
import { ContentAgent } from "@/components/agents/content-agent";
import { UpdateAgent } from "@/components/agents/update-agent";
import { Bot, Zap, Search, FileText, Megaphone, MessageSquare } from "lucide-react";

const employees = [
  {
    id: "discovery",
    name: "Priya",
    role: "Client Discovery Specialist",
    icon: Search,
    description: "Analyzes client questionnaires and produces structured project briefs. Replaces 2 hours of manual note-taking with a 30-second structured output.",
    input: "Client questionnaire responses",
    output: "Project brief, goals, budget analysis, risks, next questions",
    tasksCompleted: 18,
    timeSaved: "36 hrs",
  },
  {
    id: "proposal",
    name: "Ravi",
    role: "Proposal Specialist",
    icon: FileText,
    description: "Generates complete proposal drafts from project briefs. Reduces proposal creation from 4 hours to 15 minutes of editing.",
    input: "Project brief and scope details",
    output: "Full proposal with scope, timeline, deliverables, pricing",
    tasksCompleted: 12,
    timeSaved: "48 hrs",
  },
  {
    id: "content",
    name: "Neha",
    role: "Marketing Content Specialist",
    icon: Megaphone,
    description: "Turns completed projects into marketing assets. Creates case studies, Instagram captions, and LinkedIn posts from project notes.",
    input: "Project photos description and notes",
    output: "Case study, Instagram caption, LinkedIn post, project story",
    tasksCompleted: 9,
    timeSaved: "18 hrs",
  },
  {
    id: "update",
    name: "Aryan",
    role: "Client Communication Specialist",
    icon: MessageSquare,
    description: "Writes weekly project update emails and WhatsApp messages. Ensures clients are informed without consuming designer time.",
    input: "Project status, milestones, issues",
    output: "Email update, WhatsApp version, internal risk notes",
    tasksCompleted: 8,
    timeSaved: "16 hrs",
  },
];

export default function AIEmployeesPage() {
  const [activeEmployee, setActiveEmployee] = useState<string | null>(null);
  const totalTimeSaved = 118;

  return (
    <div>
      <Header
        title="AI Employees"
        description="4 AI employees · 47 tasks completed · 118 hours saved"
      />

      {/* Team Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {employees.map((emp) => {
          const Icon = emp.icon;
          const isActive = activeEmployee === emp.id;
          return (
            <Card
              key={emp.id}
              className={`cursor-pointer transition-all ${isActive ? "border-zinc-900 shadow-sm" : "hover:border-zinc-300"}`}
              onClick={() => setActiveEmployee(isActive ? null : emp.id)}
            >
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
                    <p className="text-base font-semibold text-zinc-900">{emp.tasksCompleted}</p>
                    <p className="text-[10px] text-zinc-400">tasks done</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-zinc-900">{emp.timeSaved}</p>
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
            <p className="text-sm font-medium">Team Impact This Month</p>
            <p className="text-xs text-zinc-400">All AI employees combined</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-xl font-semibold">47</p>
            <p className="text-xs text-zinc-400">tasks completed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{totalTimeSaved}h</p>
            <p className="text-xs text-zinc-400">hours saved</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">₹2.9L</p>
            <p className="text-xs text-zinc-400">time value</p>
          </div>
        </div>
      </div>

      {/* Agent Workspace */}
      <Tabs defaultValue="discovery">
        <TabsList className="mb-6">
          {employees.map((emp) => (
            <TabsTrigger key={emp.id} value={emp.id} className="gap-2">
              <emp.icon className="w-3.5 h-3.5" />
              {emp.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="discovery">
          <AgentWrapper employee={employees[0]}>
            <DiscoveryAgent />
          </AgentWrapper>
        </TabsContent>

        <TabsContent value="proposal">
          <AgentWrapper employee={employees[1]}>
            <ProposalAgent />
          </AgentWrapper>
        </TabsContent>

        <TabsContent value="content">
          <AgentWrapper employee={employees[2]}>
            <ContentAgent />
          </AgentWrapper>
        </TabsContent>

        <TabsContent value="update">
          <AgentWrapper employee={employees[3]}>
            <UpdateAgent />
          </AgentWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AgentWrapper({ employee, children }: { employee: typeof employees[0]; children: React.ReactNode }) {
  const Icon = employee.icon;
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Agent info panel */}
      <div>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-zinc-100 rounded-xl">
                <Icon className="w-5 h-5 text-zinc-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{employee.name}</p>
                <p className="text-xs text-zinc-500">{employee.role}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed mb-4">{employee.description}</p>
            <div className="space-y-3">
              <div className="bg-zinc-50 rounded-md p-3">
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Input</p>
                <p className="text-xs text-zinc-700">{employee.input}</p>
              </div>
              <div className="bg-zinc-50 rounded-md p-3">
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Output</p>
                <p className="text-xs text-zinc-700">{employee.output}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-zinc-400" />
              <p className="text-xs text-zinc-500">{employee.tasksCompleted} tasks · {employee.timeSaved} saved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent form + output */}
      <div className="col-span-2">
        {children}
      </div>
    </div>
  );
}
