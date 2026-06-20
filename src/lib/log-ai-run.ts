import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function logAIRun(params: {
  agent: string;
  input: unknown;
  output?: unknown;
  status: "completed" | "failed";
  error?: string;
  durationMs: number;
}) {
  try {
    const supabase = getServiceClient();
    await supabase.from("ai_task_runs").insert({
      agent: params.agent,
      trigger_type: "manual",
      status: params.status,
      input: params.input as any,
      output: params.output as any,
      error: params.error || null,
      duration_ms: params.durationMs,
      completed_at: new Date().toISOString(),
    });
  } catch (e) {
    // Logging must never break the agent response
    console.error("Failed to log AI run:", e);
  }
}
