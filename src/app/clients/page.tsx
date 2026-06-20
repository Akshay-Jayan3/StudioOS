import { Header } from "@/components/layout/header";
import { mockClients } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";

export default function ClientsPage() {
  return (
    <div>
      <Header
        title="Clients"
        description="Active client accounts · 4 clients"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Client
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        {mockClients.map((client) => (
          <Card key={client.id} className="hover:border-zinc-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-medium">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{client.name}</p>
                    <p className="text-xs text-zinc-500">Client since {client.since}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400">{client.id}</span>
              </div>

              <div className="space-y-2 mb-4">
                <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-900">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  {client.email}
                </a>
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  {client.phone}
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-3 space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-zinc-400">Project</span>
                  <span className="text-xs font-medium text-zinc-900 text-right max-w-[60%]">{client.project}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-xs text-zinc-400">Budget</span>
                  <span className="text-xs font-medium text-zinc-900">
                    ₹{(client.budget / 100000).toFixed(1)}L
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs text-zinc-400 shrink-0">Style</span>
                  <span className="text-xs text-zinc-600 text-right line-clamp-2">{client.preferences}</span>
                </div>
              </div>

              {client.notes && (
                <div className="mt-3 bg-zinc-50 rounded-md px-3 py-2">
                  <p className="text-xs text-zinc-500 italic">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
