import { testimonials as fallbackTestimonials } from "@/lib/marketing-data/testimonials";
import TestimonialCard from "../testimonials/TestimonialCard";
import Section from "../ui/Section";
import { createClient } from "@supabase/supabase-js";

const PALETTE = ["#14b8a6", "#ef4444", "#22c55e", "#d4af37", "#6366f1", "#ec4899", "#f97316", "#0ea5e9"];

function colorFor(name: string) {
  const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function handleFor(name: string) {
  return `@${name.toLowerCase().split(" ")[0]}`;
}

async function getTestimonials() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    const { data, error } = await supabase
      .from("testimonials")
      .select("client_name, testimonial_text")
      .eq("status", "Published")
      .order("received_at", { ascending: false });

    if (error || !data || data.length === 0) throw new Error("no data");

    return data
      .filter((t) => t.testimonial_text)
      .map((t) => ({
        quote: t.testimonial_text as string,
        name: t.client_name as string,
        handle: handleFor(t.client_name as string),
        color: colorFor(t.client_name as string),
      }));
  } catch {
    return fallbackTestimonials;
  }
}

// Different durations per column so they drift out of sync — avoids the
// "all moving together" look and feels more organic/alive.
const DURATIONS = [32, 26, 38];
const COLUMN_COUNT = 3;

export default async function Testimonials() {
  const testimonials = await getTestimonials();

  // Split into 3 columns round-robin so each column has a different mix/length of cards.
  const columns = Array.from({ length: COLUMN_COUNT }, (_, col) =>
    testimonials.filter((_, i) => i % COLUMN_COUNT === col)
  );

  return (
    <Section label="In Their Words" title="What Clients Say">
      <div className="relative h-[640px] overflow-hidden">
        {/* Gradient fade top/bottom */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent z-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {columns.map((col, colIndex) => (
            <div
              key={colIndex}
              className={`vertical-marquee relative overflow-hidden h-full ${colIndex === 0 ? "block" : "hidden md:block"}`}
            >
              <div
                className="animate-marqueeVertical flex flex-col gap-6"
                style={{ animationDuration: `${DURATIONS[colIndex]}s` }}
              >
                {[...col, ...col].map((t, i) => (
                  <TestimonialCard key={i} {...t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
