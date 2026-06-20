import { CheckCircle2, XCircle, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentStatusBannerProps {
  status: "idle" | "loading" | "success" | "error";
  errorMessage?: string | null;
  agentName: string;
  completedAt?: Date | null;
  onEditInputs?: () => void;
}

export function AgentStatusBanner({ status, errorMessage, agentName, completedAt, onEditInputs }: AgentStatusBannerProps) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-md bg-zinc-50 border border-zinc-200">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
        <p className="text-sm text-zinc-600">{agentName} is working on it...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-md bg-red-50 border border-red-200">
        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700">Something went wrong</p>
          <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2.5 px-4 py-3 rounded-md bg-green-50 border border-green-200">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">{agentName} generated this successfully</p>
          {completedAt && (
            <p className="text-xs text-green-600 mt-0.5">
              {completedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>
      {onEditInputs && (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 bg-white" onClick={onEditInputs}>
          <Pencil className="w-3 h-3" /> Edit & Re-run
        </Button>
      )}
    </div>
  );
}
