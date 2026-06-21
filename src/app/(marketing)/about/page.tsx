import Section from "@/components/marketing/ui/Section";
import AboutImage from "@/components/marketing/about/AboutImage";
import StatCard from "@/components/marketing/ui/StatCard";
import GoldButton from "@/components/marketing/ui/GoldButton";
import Link from "next/link";

export const metadata = {
  title: "About — Nilaya Interiors",
  description: "Kerala-based interior design studio creating refined residential and commercial spaces.",
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-gold text-xs tracking-[0.35em] uppercase">About Us</p>
        <h1 className="mt-4 font-manrope text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-[0.9] max-w-3xl">
          Designing spaces that feel like they were always meant to be.
        </h1>
        <p className="mt-8 text-white/50 max-w-2xl leading-relaxed">
          Nilaya is a Kerala-based interior design studio working across residential and commercial
          projects. We believe good design isn't about following trends — it's about understanding
          how a space will actually be lived in, then building every decision around that.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        <AboutImage />
      </div>

      <Section label="Our Story" title="Where it began">
        <div className="grid md:grid-cols-2 gap-12">
          <p className="text-white/50 leading-relaxed">
            Nilaya started with a simple frustration: too many interior projects in Kerala were
            either generic catalogue work or wildly over-designed showpieces that didn't suit how
            families actually live. We set out to build something in between — design that's
            considered, warm, and built around real life.
          </p>
          <p className="text-white/50 leading-relaxed">
            Today we work with homeowners, hospitality brands, and businesses across Kochi,
            Kottayam, and Trivandrum — handling everything from first concept sketches to the final
            day of handover, with the same studio team end to end.
          </p>
        </div>
      </Section>

      <Section label="By the Numbers" title="Studio at a glance">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard number="40+" label="Projects completed across Kerala" />
          <StatCard number="8" label="Years in practice" highlight />
          <StatCard number="3" label="Cities — Kochi, Kottayam, Trivandrum" />
          <StatCard number="92%" label="Clients who refer us to someone else" highlight />
        </div>
      </Section>

      <Section label="How We Work" title="Our approach">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Listen first",
              detail: "Every project starts with understanding how you actually live or work — not a moodboard.",
            },
            {
              title: "Design with intent",
              detail: "Every material, layout, and lighting decision has a reason behind it.",
            },
            {
              title: "See it through",
              detail: "We manage vendors and execution ourselves, so nothing gets lost between concept and reality.",
            },
          ].map((item) => (
            <div key={item.title} className="border border-white/10 rounded-xl p-6 bg-surface">
              <h3 className="font-manrope text-xl text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-white/50 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="font-manrope text-3xl md:text-4xl text-white mb-6">
          Have a space in mind?
        </h2>
        <Link href="/contact">
          <GoldButton>Start a Conversation</GoldButton>
        </Link>
      </div>
    </div>
  );
}
