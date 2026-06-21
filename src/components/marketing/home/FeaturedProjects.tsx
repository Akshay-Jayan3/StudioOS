import Section from "../ui/Section";
import { projects as fallbackProjects } from "@/lib/marketing-data/projects";
import ProjectCard from "../project/ProjectCard";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

async function getFeaturedProjects() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) throw new Error("no data");

    return data
      .filter((p: any) => p.featured)
      .concat(data.filter((p: any) => !p.featured))
      .slice(0, 4)
      .map((p: any) => ({
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

export default async function FeaturedProjects() {
  const projects = await getFeaturedProjects();
  const [first, second, third, fourth] = projects;

  return (
    <Section label="Portfolio" title="Selected Works">
      <div className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[420px]">
          {first && (
            <div className="lg:col-span-2 h-full">
              <ProjectCard project={first} />
            </div>
          )}

          {second && (
            <div className="lg:col-span-1 h-full">
              <ProjectCard project={second} />
            </div>
          )}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[420px]">
          {third && (
            <div className="lg:col-span-1 h-full">
              <ProjectCard project={third} />
            </div>
          )}

          {fourth && (
            <div className="lg:col-span-2 h-full">
              <ProjectCard project={fourth} />
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 text-center">
        <Link
          href="/projects"
          className="
            inline-flex items-center gap-2
            text-gold
            hover:text-gold-muted
            transition
          "
        >
          View All Projects →
        </Link>
      </div>
    </Section>
  );
}
