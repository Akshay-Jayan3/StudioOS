import { ReactNode } from "react";
import AnimateIn from "./AnimateIn";

export default function Section({
  label,
  title,
  children,
}: {
  label?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn>
          {label && (
            <p className="text-gold text-xs tracking-[0.35em] uppercase">
              {label}
            </p>
          )}

          {title && (
            <h2 className="mt-4 font-manrope text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-[0.9]">
              <span className="text-white">
                {title.split(" ")[0]}
              </span>{" "}
              <span className="text-white/30">
                {title.split(" ").slice(1).join(" ")}
              </span>
            </h2>
          )}

        </AnimateIn>

        <AnimateIn delay={0.1}>
          <div className="mt-12">{children}</div>
        </AnimateIn>
      </div>
    </section>
  );
}
