import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("studio_name, location, contact_email")
    .eq("id", "default")
    .single();

  if (error || !data) {
    return NextResponse.json({
      studio_name: "Datrium",
      location: "Kerala, India",
      contact_email: "hello@datrium.in",
    });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const supabase = getClient();

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      studio_name: body.studio_name,
      location: body.location,
      contact_email: body.contact_email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default")
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // The public site reads settings through a cached fetcher tagged "site-settings" —
  // bust it so the rename shows up immediately instead of after the next deploy.
  revalidateTag("site-settings", { expire: 0 });

  return NextResponse.json(data);
}
