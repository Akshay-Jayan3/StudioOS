"use client";

import Section from "../ui/Section";
import ServiceItem from "../ui/ServicesItem";

export default function ServicesSection() {
  return (
    <Section  title="">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-20 items-start">

        {/* LEFT INTRO */}
        <div className="md:sticky top-32 h-fit">
          <h2 className="font-manrope text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-[0.9]">Services</h2>
          <p className="mt-6 text-white/60 max-w-sm">
            Comprehensive interior design solutions — from concept to
            completion — crafted with precision and material sensitivity.
          </p>
        </div>

        {/* RIGHT SERVICE LIST */}
        <div className="space-y-6">
          <ServiceItem
            number="01"
            title="Full-Service Interior Design"
            detail="Concept development, spatial planning, materials, lighting, and complete project execution."
          />
          <ServiceItem
            number="02"
            title="Design Consultation"
            detail="Expert guidance on layouts, finishes, furnishings, and design direction."
          />
          <ServiceItem
            number="03"
            title="Turnkey Execution"
            detail="Vendor coordination, site supervision, quality control, and seamless delivery."
          />
          <ServiceItem
            number="04"
            title="Styling & Space Enhancement"
            detail="Furniture, decor, art selection, and final styling to elevate the space."
          />
        </div>

      </div>
    </Section>
  );
}
