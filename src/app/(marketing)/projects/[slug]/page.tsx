import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GoldButton from "@/components/marketing/ui/GoldButton";
import { ArrowLeft } from "lucide-react";
import { projects as fallbackProjects } from "@/lib/marketing-data/projects";

export const revalidate = 60;

async function getProject(slug: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (!error && data) return data;
  } catch {
    // fall through to static fallback below
  }

  const fallback = fallbackProjects.find((p) => p.slug === slug);
  if (!fallback) return null;
  return { ...fallback, image_url: fallback.image };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const gallery: string[] = Array.isArray(project.gallery) ? project.gallery : [];
  const tags: string[] = Array.isArray(project.tags) ? project.tags : [];

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-gold transition mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> All Projects
        </Link>

        <p className="text-gold text-xs tracking-[0.35em] uppercase">{project.category}</p>
        <h1 className="mt-4 font-manrope text-4xl md:text-6xl text-white tracking-tight leading-[0.95] max-w-3xl">
          {project.title}
        </h1>

        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 text-sm text-white/50">
          {project.location && <span>📍 {project.location}</span>}
          {project.client_name && <span>Client: {project.client_name}</span>}
          {project.year && <span>{project.year}</span>}
        </div>
      </div>

      {/* Hero image */}
      {project.image_url && (
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <div className="relative h-[60vh] rounded-2xl overflow-hidden border border-white/10">
            <Image src={project.image_url} alt={project.title} fill className="object-cover" />
          </div>
        </div>
      )}

      {/* Case study */}
      <div className="max-w-4xl mx-auto px-6 mt-20 space-y-16">
        {project.description && (
          <p className="text-lg text-white/60 leading-relaxed">{project.description}</p>
        )}

        {project.problem && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gold mb-3">The Brief</p>
            <p className="text-white/60 leading-relaxed">{project.problem}</p>
          </div>
        )}

        {project.process_text && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gold mb-3">The Process</p>
            <p className="text-white/60 leading-relaxed">{project.process_text}</p>
          </div>
        )}

        {project.outcome && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gold mb-3">The Outcome</p>
            <p className="text-white/60 leading-relaxed">{project.outcome}</p>
          </div>
        )}

        {project.designer_quote && (
          <blockquote className="border-l-2 border-gold pl-6 italic text-white/70 text-lg">
            "{project.designer_quote}"
          </blockquote>
        )}

        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <span key={tag} className="text-xs border border-white/10 text-white/50 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <p className="text-xs uppercase tracking-widest text-gold mb-6">Gallery</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((url, i) => (
              <div key={i} className="relative h-64 rounded-xl overflow-hidden border border-white/10">
                <Image src={url} alt={`${project.title} ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-6 mt-24 text-center">
        <h2 className="font-manrope text-3xl md:text-4xl text-white mb-6">
          Have something similar in mind?
        </h2>
        <Link href="/contact">
          <GoldButton>Start a Conversation</GoldButton>
        </Link>
      </div>
    </div>
  );
}
