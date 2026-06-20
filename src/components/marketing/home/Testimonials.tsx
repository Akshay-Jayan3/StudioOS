import { testimonials } from "@/lib/marketing-data/testimonials";
import TestimonialCard from "../testimonials/TestimonialCard";
import Section from "../ui/Section";

export default function TestimonialsMarquee() {
  return (
    <Section label="In Their Words" title="What Our Clients Say">
      <div className="relative overflow-hidden">
        {/* Gradient fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />

        <div className="marquee group my-10">
          <div className="marquee-track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>
      </div>
    </Section>

  );
}
