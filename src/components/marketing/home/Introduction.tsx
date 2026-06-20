"use client";

import Section from "../ui/Section";
import GoldButton from "../ui/GoldButton";
import StatCard from "../ui/StatCard"

export default function AboutSection() {
  return (
    <Section label="Who we are" title="We create spaces">
      <div className="space-y-40">
        {/* Text + Credibility Grid */}
        <div className="grid lg:grid-cols-2 gap-20 items-start">

          {/* LEFT — Manifesto */}
          <div>
            <p className="mt-8 text-white/70 text-lg leading-relaxed max-w-lg">
              Based in Kerala, we shape residential and commercial interiors
              where material honesty, proportion, and light define the
              experience of living.
            </p>

            <p className="mt-5 my-16 text-white/50 leading-relaxed max-w-lg">
              Every project is approached with clarity, restraint, and
              precision — refined spaces built to endure.
            </p>
            <GoldButton>More About</GoldButton>
          </div>

          {/* RIGHT — Studio Credentials */}
          <div className="grid grid-cols-2 gap-10">

            <StatCard number="24" label="Years of experience in interior design" highlight/>
            <StatCard number="140+" label="Successfully completed projects" highlight />
            <StatCard number="100+" label="Interior design and architecture experts" highlight/>
            <StatCard number="12" label="Awards for excellence in interior design" highlight/>

          </div>
        </div>

      </div>
    </Section>
  );
}
