"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import GoldButton from "@/components/marketing/ui/GoldButton";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", project_type: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "Contact Form" }),
      });
      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-gold/30 rounded-xl p-8 bg-surface text-center">
        <CheckCircle2 className="w-8 h-8 text-gold mx-auto mb-4" />
        <h3 className="font-manrope text-xl text-white mb-2">Thanks — we've got it.</h3>
        <p className="text-sm text-white/50">Our team will reach out within a day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-wide text-white/40 mb-1.5 block">Name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-surface border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-gold/40"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-white/40 mb-1.5 block">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-surface border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-gold/40"
          placeholder="you@email.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-white/40 mb-1.5 block">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-surface border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-gold/40"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-white/40 mb-1.5 block">Project Type</label>
          <input
            value={form.project_type}
            onChange={(e) => setForm({ ...form, project_type: e.target.value })}
            className="w-full bg-surface border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-gold/40"
            placeholder="Home, office..."
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-white/40 mb-1.5 block">Tell us about it</label>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full bg-surface border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-gold/40 resize-none"
          placeholder="Size, budget, timeline — whatever you have in mind"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <GoldButton type="submit" disabled={submitting}>
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Message"}
      </GoldButton>
    </form>
  );
}
