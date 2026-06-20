"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contentInputSchema, ContentInput, ContentOutput } from "@/agents/content-agent/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AgentStatusBanner } from "@/components/agents/agent-status-banner";
import { Loader2, Camera, Link2, BookOpen } from "lucide-react";

export function ContentAgent() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<ContentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);

  const { register, handleSubmit } = useForm<ContentInput>({
    resolver: zodResolver(contentInputSchema),
    defaultValues: {
      projectName: "Whitefield Penthouse",
      projectType: "Luxury Penthouse Interior",
      clientProfile: "Senior tech executive and family. Wanted a home that felt nothing like an office.",
      styleDescription: "Modern luxury with warm materials – book-matched marble, smoked oak, bespoke joinery, deep teal accents. Organic forms throughout.",
      keyFeatures: "12-ft double-height living room, home theatre, wine display, master suite with dressing room, outdoor terrace integrated with living space",
      challenges: "Client initially wanted a very generic luxury look from Pinterest. We shifted them toward a more personal, story-driven design. Coordinating 22 vendors across 4 months.",
      outcome: "Client called it the first home that actually felt like them. Project featured in a regional shelter magazine.",
      budget: "₹80 lakhs",
      duration: "4 months",
    },
  });

  const onSubmit = async (data: ContentInput) => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/agents/content", {
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

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* LEFT: Form */}
      <div className="sticky top-6 self-start">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-zinc-900">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Name</label>
                <Input {...register("projectName")} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Type</label>
                <Input {...register("projectType")} className="text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Client Profile</label>
              <Textarea {...register("clientProfile")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Style Description</label>
              <Textarea {...register("styleDescription")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Key Features</label>
              <Textarea {...register("keyFeatures")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Challenges Solved</label>
              <Textarea {...register("challenges")} rows={2} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Outcome</label>
              <Textarea {...register("outcome")} rows={2} className="text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Budget (optional)</label>
                <Input {...register("budget")} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Duration (optional)</label>
                <Input {...register("duration")} className="text-sm" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Content...</> : "Generate Marketing Content"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>

      {/* RIGHT: Results */}
      <div className="space-y-4">
        <AgentStatusBanner status={status} errorMessage={error} agentName="Neha" completedAt={completedAt} />

        {!output && !loading && (
          <div className="flex items-center justify-center h-64 border border-dashed border-zinc-200 rounded-lg">
            <p className="text-xs text-zinc-400">Marketing content will appear here</p>
          </div>
        )}

      {output && (
        <>
          {/* Project Story */}
          <Card className="border-zinc-900 bg-zinc-900 text-white">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">One-liner</p>
              <p className="text-base font-medium leading-relaxed">{output.projectStory.oneLiner}</p>
              <p className="text-xs text-zinc-400 mt-3 leading-relaxed">{output.projectStory.threeLineSummary}</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {output.projectStory.keywords.map((kw, i) => (
                  <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">{kw}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Case Study */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                <h3 className="text-xs font-semibold text-zinc-900">Case Study</h3>
              </div>
              <h2 className="text-sm font-bold text-zinc-900 mb-0.5">{output.caseStudy.title}</h2>
              <p className="text-xs text-zinc-500 mb-4">{output.caseStudy.subtitle}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">The Brief</p>
                  <p className="text-xs text-zinc-700 leading-relaxed">{output.caseStudy.problem}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">The Process</p>
                  <p className="text-xs text-zinc-700 leading-relaxed">{output.caseStudy.process}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">The Outcome</p>
                  <p className="text-xs text-zinc-700 leading-relaxed">{output.caseStudy.outcome}</p>
                </div>
                <blockquote className="border-l-2 border-zinc-300 pl-3 italic text-xs text-zinc-500">
                  "{output.caseStudy.designerQuote}"
                </blockquote>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {output.caseStudy.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* Instagram */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-3.5 h-3.5 text-zinc-500" />
                  <h3 className="text-xs font-semibold text-zinc-900">Instagram Caption</h3>
                </div>
                <div className="bg-zinc-50 rounded-md p-3 text-xs text-zinc-700 leading-relaxed whitespace-pre-line font-mono">
                  {output.instagramCaption.fullCaption}
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-3.5 h-3.5 text-zinc-500" />
                  <h3 className="text-xs font-semibold text-zinc-900">LinkedIn Post</h3>
                </div>
                <div className="bg-zinc-50 rounded-md p-3 text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                  {output.linkedinPost.fullPost}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
