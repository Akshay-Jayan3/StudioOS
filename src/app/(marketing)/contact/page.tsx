"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Loader2 } from "lucide-react";
import GoldButton from "@/components/marketing/ui/GoldButton";

export default function ContactPage() {
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

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <p className="text-gold text-xs tracking-[0.35em] uppercase">Get in Touch</p>
      <h1 className="mt-4 font-manrope text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-[0.9] max-w-3xl">
        Let's talk about your space.
      </h1>
      <p className="mt-8 text-white/50 max-w-2xl leading-relaxed">
        Tell us a bit about your project and we'll get back to you within a day to set up a
        discovery call.
      </p>

      <div className="grid md:grid-cols-2 gap-16 mt-16">
        {/* Form */}
        <div>
          {submitted ? (
            <div className="border border-gold/30 rounded-xl p-8 bg-surface text-center">
              <CheckCircle2 className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-manrope text-xl text-white mb-2">Thanks — we've got it.</h3>
              <p className="text-sm text-white/50">Our team will reach out within a day.</p>
            </div>
          ) : (
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
          )}
        </div>

        {/* Studio Info */}
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gold mt-1" />
            <div>
              <p className="text-sm text-white">Studio</p>
              <p className="text-sm text-white/50">Kochi, Kerala, India</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-gold mt-1" />
            <div>
              <p className="text-sm text-white">Phone</p>
              <p className="text-sm text-white/50">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gold mt-1" />
            <div>
              <p className="text-sm text-white">Email</p>
              <p className="text-sm text-white/50">hello@nilayainteriors.in</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-gold mt-1" />
            <div>
              <p className="text-sm text-white">Studio Hours</p>
              <p className="text-sm text-white/50">Mon – Sat, 10am – 7pm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
