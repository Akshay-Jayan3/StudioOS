"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, Pencil, Upload, Eye, EyeOff, Star, X } from "lucide-react";
import Image from "next/image";

type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  problem: string | null;
  process_text: string | null;
  outcome: string | null;
  designer_quote: string | null;
  client_name: string | null;
  year: string | null;
  gallery: string[] | null;
  tags: string[] | null;
};

const emptyForm = {
  title: "",
  location: "",
  category: "",
  description: "",
  image_url: "",
  featured: false,
  published: true,
  problem: "",
  process_text: "",
  outcome: "",
  designer_quote: "",
  client_name: "",
  year: "",
  gallery: [] as string[],
  tags: "" as string,
};

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
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

  function openEdit(item: PortfolioProject) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      location: item.location || "",
      category: item.category || "",
      description: item.description || "",
      image_url: item.image_url || "",
      featured: item.featured,
      published: item.published,
      problem: item.problem || "",
      process_text: item.process_text || "",
      outcome: item.outcome || "",
      designer_quote: item.designer_quote || "",
      client_name: item.client_name || "",
      year: item.year || "",
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    });
    setOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/portfolio/upload-image", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setForm((prev) => ({ ...prev, image_url: url }));
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/portfolio/upload-image", { method: "POST", body: formData });
        if (res.ok) {
          const { url } = await res.json();
          uploaded.push(url);
        }
      }
      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...uploaded] }));
    } finally {
      setUploading(false);
    }
  }

  function removeGalleryImage(url: string) {
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((g) => g !== url) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingId) {
        const res = await fetch(`/api/portfolio/${editingId}`, {
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
        const res = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setItems((prev) => [created, ...prev]);
          setOpen(false);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project from the public site?")) return;
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function togglePublished(item: PortfolioProject) {
    const res = await fetch(`/api/portfolio/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    }
  }

  return (
    <div>
      <Header
        title="Portfolio"
        description={`Public site projects · ${items.length} total — changes here update the live website`}
        action={
          <Button size="sm" className="gap-1.5" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5" /> Add Project
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative h-40 bg-zinc-100">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-zinc-400">No image</div>
                )}
                {!item.published && (
                  <div className="absolute top-2 left-2 bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded">Hidden</div>
                )}
                {item.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" /> Featured
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.category} · {item.location}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 flex-1" onClick={() => openEdit(item)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => togglePublished(item)}>
                    {item.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-zinc-400 col-span-3 text-center py-12">No portfolio projects yet</p>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">{editingId ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Image</label>
              {form.image_url && (
                <div className="relative h-32 w-full mb-2 rounded-md overflow-hidden bg-zinc-100">
                  <Image src={form.image_url} alt="" fill className="object-cover" />
                </div>
              )}
              <label className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {form.image_url ? "Replace Image" : "Upload Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="text-sm" placeholder="The Villa Project" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Category</label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="text-sm" placeholder="Residential" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Location</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="text-sm" placeholder="Kochi" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="text-sm resize-none" placeholder="Brief project description for the portfolio page" />
            </div>

            <div className="border-t border-zinc-100 pt-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Case Study (optional)</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 mb-1 block">Client Name</label>
                  <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="text-sm" placeholder="Rohit Verma" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 mb-1 block">Year</label>
                  <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="text-sm" placeholder="2024" />
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs font-medium text-zinc-700 mb-1 block">The Brief</label>
                <Textarea value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} rows={2} className="text-sm resize-none" placeholder="What the client needed" />
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-zinc-700 mb-1 block">The Process</label>
                <Textarea value={form.process_text} onChange={(e) => setForm({ ...form, process_text: e.target.value })} rows={2} className="text-sm resize-none" placeholder="How the studio approached it" />
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-zinc-700 mb-1 block">The Outcome</label>
                <Textarea value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} rows={2} className="text-sm resize-none" placeholder="The result" />
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Designer Quote</label>
                <Textarea value={form.designer_quote} onChange={(e) => setForm({ ...form, designer_quote: e.target.value })} rows={2} className="text-sm resize-none" placeholder="A quote about the project" />
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Tags (comma separated)</label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="text-sm" placeholder="Modern, Residential, Kerala" />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Gallery Images</label>
                {form.gallery.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {form.gallery.map((url) => (
                      <div key={url} className="relative h-16 rounded-md overflow-hidden bg-zinc-100 group">
                        <Image src={url} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(url)}
                          className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Add Gallery Images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-zinc-100 pt-3">
              <label className="flex items-center gap-2 text-xs text-zinc-700">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured on homepage
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-700">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                Published (visible on site)
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" className="flex-1" disabled={saving || !form.title} onClick={handleSave}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingId ? "Save Changes" : "Add Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
