import Section from "../ui/Section";
import { steps } from "@/lib/marketing-data/process";

export default function Process() {
  return (
    <Section label="Process" title="How we work">
      {/* Subheadline */}
      <p className="text-muted max-w-xl text-lg mb-20">
        Simple. Transparent. Exceptional.
      </p>

      {/* Process Strip */}
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border border-white/10
          bg-black/60
          backdrop-blur-md
        "
      >
        {/* Grid wrapper for hover-dimming */}
        <div className="group grid grid-cols-1 md:grid-cols-4">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className={`
                group relative
                px-8 py-10
                transition-all duration-300 ease-out

                ${index !== 0 ? "border-t md:border-t-0 md:border-l" : ""}
                border-white/10

                group-hover:opacity-50
                hover:opacity-100

                hover:bg-white/[0.03]
                md:hover:-translate-y-[2px]
              `}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <span className="text-xs text-white/40 tracking-widest">
                  {item.step}
                </span>

                {item.icon && <item.icon size={20} className="text-gold" />}

              </div>

              {/* Title */}
              <h3 className="mt-12 font-manrope text-xl transition-colors group-hover:text-white/90">
                {item.title}
              </h3>

              {/* Duration */}
              <p className="mt-2 text-sm text-white/40">
                {item.duration}
              </p>

              {/* Description */}
              <p className="mt-4 text-sm text-white/50 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
