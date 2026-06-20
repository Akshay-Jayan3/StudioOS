import { NextRequest, NextResponse } from "next/server";
import { client } from "@/trigger";
import "@/jobs/lead-qualification";
import "@/jobs/project-kickoff";
import "@/jobs/weekly-status";

// Supabase fires this webhook on table changes
// Set up in Supabase: Database → Webhooks → New webhook
// URL: https://your-domain.com/api/webhooks/supabase
// Events: INSERT on leads table

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, table, record } = body;

  try {
    // New lead created → run qualification agent
    if (table === "leads" && type === "INSERT") {
      await client.sendEvent({
        name: "lead.created",
        payload: { leadId: record.id },
      });
      return NextResponse.json({ triggered: "lead.qualification", leadId: record.id });
    }

    // Lead marked Won → run kickoff agent
    if (table === "leads" && type === "UPDATE" && record.status === "Won") {
      await client.sendEvent({
        name: "lead.won",
        payload: {
          leadId: record.id,
          clientName: record.name,
          clientEmail: record.email,
          projectType: record.project_type || "Interior Design",
          budget: record.budget,
        },
      });
      return NextResponse.json({ triggered: "project.kickoff", leadId: record.id });
    }

    return NextResponse.json({ message: "No action taken", type, table });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
