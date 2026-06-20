"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Check } from "lucide-react";

export function SaveToProjectPicker({ saveUrl, payloadKey, payload }: { saveUrl: (projectId: string) => string; payloadKey: string; payload: unknown }) {
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedName, setSavedName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
  }, []);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(saveUrl(selectedId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [payloadKey]: payload }),
      });
      if (res.ok) {
        const project = projects.find((p) => p.id === selectedId);
        setSavedName(project?.name || "project");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-zinc-50 border-zinc-200">
      <CardContent className="p-3">
        {savedName ? (
          <div className="flex items-center gap-2 text-xs text-green-700">
            <Check className="w-3.5 h-3.5" /> Saved to {savedName}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 text-xs border border-zinc-200 rounded-md px-2 py-1.5 bg-white"
            >
              <option value="">Attach this to a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 shrink-0" disabled={!selectedId || saving} onClick={handleSave}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
