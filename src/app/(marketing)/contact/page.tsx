import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactForm from "@/components/marketing/contact/ContactForm";
import { getSiteSettings } from "@/lib/site-settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Contact — ${settings.studio_name}`,
    description: "Get in touch to start a discovery call about your space.",
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <p className="text-gold text-xs tracking-[0.35em] uppercase">Get in Touch</p>
      <h1 className="mt-4 font-manrope text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-[0.9] max-w-3xl">
        Let's talk about your space.
      </h1>
      <p className="mt-8 text-white/50 max-w-2xl leading-relaxed">
        Tell us a bit about your project and we'll get back to you within a day to set up a
        discovery call.
      </p>

      <div className="grid md:grid-cols-2 gap-16 mt-16">
        {/* Form */}
        <div>
          <ContactForm />
        </div>

        {/* Studio Info */}
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gold mt-1" />
            <div>
              <p className="text-sm text-white">Studio</p>
              <p className="text-sm text-white/50">{settings.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-gold mt-1" />
            <div>
              <p className="text-sm text-white">Phone</p>
              <p className="text-sm text-white/50">{settings.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gold mt-1" />
            <div>
              <p className="text-sm text-white">Email</p>
              <p className="text-sm text-white/50">{settings.contact_email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-gold mt-1" />
            <div>
              <p className="text-sm text-white">Studio Hours</p>
              <p className="text-sm text-white/50">Mon – Sat, 10am – 7pm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
