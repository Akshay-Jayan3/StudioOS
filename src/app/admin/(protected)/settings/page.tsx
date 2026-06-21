"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({ studio_name: "", location: "", contact_email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(await res.json());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Header title="Settings" description="Studio configuration — changes here update the public site" />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Studio Details</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 mb-1 block">Studio Name</label>
                  <Input
                    value={form.studio_name}
                    onChange={(e) => setForm({ ...form, studio_name: e.target.value })}
                    className="text-sm"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Shown in the navbar, footer, page titles, chatbot, and AI assistant.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 mb-1 block">Location</label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 mb-1 block">Contact Email</label>
                  <Input
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" disabled={saving} onClick={handleSave}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                  </Button>
                  {saved && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">AI Configuration</h3>
            <p className="text-xs text-zinc-500 mb-4">Configure the Gemini API connection for AI employees.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Gemini API Key</label>
                <Input type="password" defaultValue="••••••••••••••••••••••••" className="text-sm font-mono" readOnly />
                <p className="text-[10px] text-zinc-400 mt-1">Set via GEMINI_API_KEY in your .env.local file</p>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Model</label>
                <Input defaultValue={process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.0-flash-lite"} className="text-sm font-mono" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">Future Modules</h3>
            <p className="text-xs text-zinc-500 mb-4">Planned for Phase 2+</p>
            <div className="space-y-2">
              {["Authentication & Multi-User", "Client Portal", "Document Generation", "Email Integration", "WhatsApp Integration", "Multi-Agent Workflows", "Knowledge Base"].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                  {feature}
                  <span className="ml-auto text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-400">Planned</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
