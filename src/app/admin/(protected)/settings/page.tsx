import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" description="Studio configuration" />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Studio Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Studio Name</label>
                <Input defaultValue="Aura Interiors" className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Location</label>
                <Input defaultValue="Hyderabad, India" className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Contact Email</label>
                <Input defaultValue="hello@aurainteriors.in" className="text-sm" />
              </div>
              <Button size="sm">Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">AI Configuration</h3>
            <p className="text-xs text-zinc-500 mb-4">Configure the Gemini API connection for AI employees.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 mb-1 block">Gemini API Key</label>
                <Input type="password" defaultValue="••••••••••••••••••••••••" className="text-sm font-mono" />
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
              {["Authentication & Multi-User", "Database (Supabase)", "Client Portal", "Document Generation", "Email Integration", "WhatsApp Integration", "Multi-Agent Workflows", "Knowledge Base"].map((feature) => (
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
