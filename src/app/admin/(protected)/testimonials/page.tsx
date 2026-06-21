"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, Pencil, Star } from "lucide-react";

type Testimonial = {
  id: string;
  project_id: string | null;
  client_name: string;
  status: "Requested" | "Received" | "Published" | "Declined";
  request_message: string | null;
  testimonial_text: string | null;
  rating: number | null;
  requested_at: string;
  received_at: string | null;
};

const STATUSES: Testimonial["status"][] = ["Requested", "Received", "Published", "Declined"];

const STATUS_STYLE: Record<Testimonial["status"], string> = {
  Requested: "bg-zinc-100 text-zinc-600",
  Received: "bg-blue-100 text-blue-700",
  Published: "bg-green-100 text-green-700",
  Declined: "bg-red-100 text-red-700",
};

const emptyForm = {
  client_name: "",
  testimonial_text: "",
  rating: "" as string,
  status: "Published" as Testimonial["status"],
};

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"All" | Testimonial["status"]>("All");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Testimonial) {
    setEditingId(item.id);
    setForm({
      client_name: item.client_name,
      testimonial_text: item.testimonial_text || "",
      rating: item.rating ? String(item.rating) : "",
      status: item.status,
    });
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        client_name: form.client_name,
        testimonial_text: form.testimonial_text || null,
        rating: form.rating ? parseInt(form.rating, 10) : null,
        status: form.status,
        ...(form.status === "Received" || form.status === "Published"
          ? { received_at: new Date().toISOString() }
          : {}),
      };

      if (editingId) {
        const res = await fetch(`/api/testimonials/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
          setOpen(false);
        }
      } else {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          // POST only sets Requested fields — patch the rest in immediately
          const patched = await fetch(`/api/testimonials/${created.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const final = patched.ok ? await patched.json() : created;
          setItems((prev) => [final, ...prev]);
          setOpen(false);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function setStatus(item: Testimonial, status: Testimonial["status"]) {
    const res = await fetch(`/api/testimonials/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        ...(status === "Received" || status === "Published"
          ? { received_at: item.received_at || new Date().toISOString() }
          : {}),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    }
  }

  const filtered = filter === "All" ? items : items.filter((i) => i.status === filter);

  return (
    <div>
      <Header
        title="Testimonials"
        description={`${items.filter((i) => i.status === "Published").length} published on the public site · ${items.length} total`}
        action={
          <Button size="sm" className="gap-1.5" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5" /> Add Testimonial
          </Button>
        }
      />

      <div className="flex items-center gap-1.5 mb-4">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              filter === s
                ? "bg-zinc-900 text-white border-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{item.client_name}</p>
                    {item.rating && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < item.rating! ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[item.status]}`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                  {item.testimonial_text || <span className="text-zinc-300 italic">No testimonial text yet</span>}
                </p>

                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-zinc-100">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 flex-1" onClick={() => openEdit(item)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  {item.status !== "Published" && item.testimonial_text && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs flex-1"
                      onClick={() => setStatus(item, "Published")}
                    >
                      Publish
                    </Button>
                  )}
                  {item.status === "Published" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs flex-1"
                      onClick={() => setStatus(item, "Received")}
                    >
                      Unpublish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-zinc-400 col-span-2 text-center py-12">
              No testimonials{filter !== "All" ? ` with status "${filter}"` : ""} yet
            </p>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {editingId ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Client Name *</label>
              <Input
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="text-sm"
                placeholder="Rohit Verma"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Testimonial Text</label>
              <Textarea
                value={form.testimonial_text}
                onChange={(e) => setForm({ ...form, testimonial_text: e.target.value })}
                rows={4}
                className="text-sm resize-none"
                placeholder="What the client said"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Rating (1–5)</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Testimonial["status"] })}
                  className="w-full h-9 text-sm border border-zinc-200 rounded-md px-2"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              Only testimonials marked <strong>Published</strong> with text appear on the public site.
            </p>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1"
                disabled={saving || !form.client_name}
                onClick={handleSave}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingId ? "Save Changes" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
