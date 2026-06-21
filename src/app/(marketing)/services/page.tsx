import Section from "@/components/marketing/ui/Section";
import ServiceItem from "@/components/marketing/ui/ServicesItem";
import GoldButton from "@/components/marketing/ui/GoldButton";
import { services } from "@/lib/marketing-data/services";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Services — ${settings.studio_name}`,
    description: "Full-service interior design, turnkey execution, design consultation, and styling.",
  };
}

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-gold text-xs tracking-[0.35em] uppercase">What We Do</p>
        <h1 className="mt-4 font-manrope text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-[0.9] max-w-3xl">
          Services built around how you'll actually use the space.
        </h1>
        <p className="mt-8 text-white/50 max-w-2xl leading-relaxed">
          Whether you need the full journey from concept to handover, or just a second opinion on
          a layout, we scope every engagement around what the project actually needs.
        </p>
      </div>

      <Section label="Capabilities" title="Our Services">
        <div className="space-y-3">
          {services.map((service, i) => (
            <ServiceItem
              key={service.title}
              number={String(i + 1).padStart(2, "0")}
              title={service.title}
              detail={service.description}
            />
          ))}
        </div>
      </Section>

      <Section label="Process" title="How an engagement runs">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Discovery", detail: "We understand your space, budget, and how you live or work." },
            { step: "02", title: "Concept", detail: "Layouts, materials, and a moodboard you can react to." },
            { step: "03", title: "Execution", detail: "We manage vendors and site work so you don't have to." },
            { step: "04", title: "Handover", detail: "Final walkthrough, styling, and a space that's ready to live in." },
          ].map((item) => (
            <div key={item.step} className="border border-white/10 rounded-xl p-6 bg-surface">
              <span className="text-xs font-mono text-white/30">{item.step}</span>
              <h3 className="mt-3 font-manrope text-lg text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="font-manrope text-3xl md:text-4xl text-white mb-6">
          Tell us what you're working on.
        </h2>
        <Link href="/contact">
          <GoldButton>Get in Touch</GoldButton>
        </Link>
      </div>
    </div>
  );
}
