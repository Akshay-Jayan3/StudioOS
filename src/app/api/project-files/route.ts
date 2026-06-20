import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("project_id");
  const supabase = getClient();

  let query = supabase.from("project_files").select("*").order("uploaded_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = getClient();
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const projectId = formData.get("project_id") as string;
  const fileType = formData.get("file_type") as string;

  if (!file || !projectId) {
    return NextResponse.json({ error: "Missing file or project_id" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${projectId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("project-files")
    .upload(fileName, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("project-files").getPublicUrl(fileName);

  const { data, error } = await supabase
    .from("project_files")
    .insert({
      project_id: projectId,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: fileType || "other",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
