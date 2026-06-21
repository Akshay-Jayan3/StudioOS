import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET(req: NextRequest) {
  const publishedOnly = req.nextUrl.searchParams.get("published") === "true";
  const supabase = getClient();

  let query = supabase
    .from("portfolio_projects")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (publishedOnly) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = getClient();

  const slug = (body.slug || body.title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert({
      title: body.title,
      slug: slug || `project-${Date.now()}`,
      location: body.location || null,
      category: body.category || null,
      description: body.description || null,
      image_url: body.image_url || null,
      featured: body.featured || false,
      published: body.published !== false,
      display_order: body.display_order || 0,
      problem: body.problem || null,
      process_text: body.process_text || null,
      outcome: body.outcome || null,
      designer_quote: body.designer_quote || null,
      client_name: body.client_name || null,
      year: body.year || null,
      gallery: body.gallery || [],
      tags: body.tags || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
