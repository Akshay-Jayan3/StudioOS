import Image from "next/image";
import Section from "../ui/Section";

export default function Team() {
  return (
    <Section
      label="Meet the Team"
      title="Passion meets precision"
    >
      <div className="grid md:grid-cols-2 gap-20 items-start">
        
        {/* Founder */}
        <div className="flex gap-8 items-start">
          <div className="relative w-32 h-40 rounded-xl overflow-hidden bg-surface border border-border flex-shrink-0">
            <Image
              src="/images/team/founder.png"
              alt="Founder & Principal Designer"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="font-manrope text-xl">
              Aneesh Vijayan
            </h3>
            <p className="mt-1 text-sm text-gold">
              Founder & Principal Designer
            </p>

            <p className="mt-4 text-muted leading-relaxed">
              With over 6 years of experience in residential and commercial
              interiors, Aneesh leads the studio with a focus on thoughtful
              design, material integrity, and execution excellence.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
