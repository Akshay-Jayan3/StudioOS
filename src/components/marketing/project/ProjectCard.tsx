type Props = {
  project: any;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black">
      {/* Image */}
      <img
        src={project.image}
        alt={project.title}
        className="
          absolute inset-0 w-full h-full object-cover
          transition-transform duration-700 ease-out
          group-hover:scale-[1.05]
        "
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Hover CTA */}
      <div
        className="
          absolute bottom-6 right-6
          text-sm text-gold
          opacity-0 translate-y-2
          transition-all duration-300 ease-out
          group-hover:opacity-100
          group-hover:translate-y-0
        "
      >
        View project →
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          {project.category}
        </p>
        <h3 className="mt-1 font-manrope text-xl">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {project.location}
        </p>
      </div>
    </div>
  );
}
