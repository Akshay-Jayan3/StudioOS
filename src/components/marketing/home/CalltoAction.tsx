import Image from "next/image";
import Link from "next/link";
import GoldButton from "../ui/GoldButton";

export default function CalltoAction() {
  return (
    <section className="relative py-40 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/cta-bg.png" // replace with a dramatic interior image
          alt="Luxury interior background"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-manrope text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-[0.9]">
          Let’s create something
          <br /> extraordinary
        </h2>

        <p className="mt-6 text-muted text-lg">
          Book your free 30-minute consultation
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
          <GoldButton
          >
            Schedule Consultation
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
