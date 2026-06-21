import { createClient } from "@supabase/supabase-js";
import { projects as fallbackProjects } from "@/lib/marketing-data/projects";
import ProjectCard from "@/components/marketing/project/ProjectCard";

export const revalidate = 60; // refresh portfolio data every 60s without a redeploy

async function getAllProjects() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) throw new Error("no data");

    return data.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      location: p.location,
      category: p.category,
      image: p.image_url,
    }));
  } catch {
    return fallbackProjects;
  }
}

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <p className="text-xs uppercase tracking-widest text-gold mb-3">Portfolio</p>
      <h1 className="font-manrope text-4xl md:text-5xl mb-16">Our Work</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[360px]">
        {projects.map((project, i) => (
          <ProjectCard key={`${project.slug}-${i}`} project={project} />
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-muted text-sm">No projects published yet.</p>
      )}
    </div>
  );
}
