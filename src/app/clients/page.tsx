"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Mail, Phone, Loader2, Trash2 } from "lucide-react";
import { mockClients } from "@/lib/mock-data";

const addClientSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
});

type AddClientForm = z.infer<typeof addClientSchema>;

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddClientForm>({
    resolver: zodResolver(addClientSchema),
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
        setUsingMock(false);
      } else {
        throw new Error("API failed");
      }
    } catch {
      setClients(mockClients);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: AddClientForm) {
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newClient = await res.json();
        setClients((prev) => [newClient, ...prev]);
        setOpen(false);
        reset();
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteClient(id: string) {
    if (usingMock) return;
    if (!confirm("Delete this client?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <Header
        title="Clients"
        description={`Active client accounts · ${clients.length} clients${usingMock ? " (mock data)" : ""}`}
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Client
          </Button>
        }
      />

      {usingMock && (
        <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
          Showing mock data. Supabase connection not available.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="hover:border-zinc-300 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-medium">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{client.name}</p>
                      <p className="text-xs text-zinc-500">
                        Client since {(client.since || client.created_at)?.split("T")[0] || client.since}
                      </p>
                    </div>
                  </div>
                  {!usingMock && (
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-900">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      {client.email}
                    </a>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {client.phone}
                    </div>
                  )}
                </div>

                {(client.project || client.budget) && (
                  <div className="border-t border-zinc-100 pt-3 space-y-2">
                    {client.project && (
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-zinc-400">Project</span>
                        <span className="text-xs font-medium text-zinc-900 text-right max-w-[60%]">{client.project}</span>
                      </div>
                    )}
                    {client.budget && (
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-zinc-400">Budget</span>
                        <span className="text-xs font-medium text-zinc-900">
                          ₹{(client.budget / 100000).toFixed(1)}L
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {client.preferences && (
                  <div className="flex items-start justify-between gap-3 mt-2">
                    <span className="text-xs text-zinc-400 shrink-0">Style</span>
                    <span className="text-xs text-zinc-600 text-right line-clamp-2">{client.preferences}</span>
                  </div>
                )}

                {client.notes && (
                  <div className="mt-3 bg-zinc-50 rounded-md px-3 py-2">
                    <p className="text-xs text-zinc-500 italic">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {clients.length === 0 && (
            <p className="text-xs text-zinc-400 col-span-2 text-center py-12">No clients yet</p>
          )}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Name *</label>
              <Input {...register("name")} className="text-sm" placeholder="Rohit Verma" />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Email</label>
                <Input {...register("email")} className="text-sm" placeholder="rohit@email.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Phone</label>
                <Input {...register("phone")} className="text-sm" placeholder="+91 90009 11223" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Style Preferences</label>
              <Textarea {...register("preferences")} rows={2} className="text-sm resize-none" placeholder="Modern minimalist, neutral tones..." />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 mb-1 block">Notes</label>
              <Textarea {...register("notes")} rows={2} className="text-sm resize-none" placeholder="Any context worth remembering..." />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1" disabled={saving}>
                {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</> : "Add Client"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
