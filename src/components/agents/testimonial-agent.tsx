"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testimonialInputSchema, TestimonialInput, TestimonialOutput } from "@/agents/testimonial-agent/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AgentStatusBanner } from "@/components/agents/agent-status-banner";
import { Loader2, MessageSquare, Mail, Users, HelpCircle } from "lucide-react";

export function TestimonialAgent() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<TestimonialOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);

  const { register, handleSubmit } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialInputSchema),
    defaultValues: {
      clientName: "Suresh Bajaj",
      projectName: "Whitefield Penthouse",
      projectHighlights: "Transformed a bare-shell penthouse into a warm family home in 4 months. Client was especially happy with the custom wine display and how we handled vendor coordination across 22 vendors without him having to manage anything.",
      relationshipNotes: "Client was initially skeptical about timeline but we delivered on schedule. He mentioned to the designer that he'd recommend us to his business contacts.",
    },
  });

  const onSubmit = async (data: TestimonialInput) => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/agents/testimonial", {
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
          <CardTitle className="text-sm font-semibold text-zinc-900">Completed Project Details</CardTitle>
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
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Project Highlights</label>
              <Textarea {...register("projectHighlights")} rows={3} className="text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Relationship Notes (optional)</label>
              <Textarea {...register("relationshipNotes")} rows={2} className="text-sm resize-none" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : "Generate Testimonial Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>

      {/* RIGHT: Results */}
      <div className="space-y-4">
        <AgentStatusBanner status={status} errorMessage={error} agentName="Vikram" completedAt={completedAt} />

        {!output && !loading && (
          <div className="flex items-center justify-center h-64 border border-dashed border-zinc-200 rounded-lg">
            <p className="text-xs text-zinc-400">Testimonial request will appear here</p>
          </div>
        )}

      {output && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <h3 className="text-xs font-semibold text-zinc-900">Testimonial Request Email</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-2">{output.testimonialRequest.subject}</p>
              <div className="bg-zinc-50 rounded-md p-3 text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                {output.testimonialRequest.message}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                <h3 className="text-xs font-semibold text-zinc-900">WhatsApp Version</h3>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-zinc-700 whitespace-pre-line">
                {output.whatsappVersion}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                <h3 className="text-xs font-semibold text-zinc-900">Questions to Help Client Write a Specific Testimonial</h3>
              </div>
              <ul className="space-y-1.5">
                {output.suggestedQuestions.map((q, i) => (
                  <li key={i} className="text-xs text-zinc-700 flex items-start gap-2">
                    <span className="text-zinc-400 font-medium shrink-0">{i + 1}.</span> {q}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-zinc-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <h3 className="text-xs font-semibold text-zinc-700">Referral Follow-up (send later)</h3>
              </div>
              <p className="text-[10px] text-zinc-400 mb-2 uppercase tracking-wide">{output.referralFollowUp.whenToSend}</p>
              <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">{output.referralFollowUp.message}</p>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </div>
  );
}
