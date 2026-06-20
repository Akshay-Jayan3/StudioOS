import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  Link2,
  Bookmark,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-glass-bg border-t border-border backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid gap-16 md:grid-cols-5">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="uppercase font-bold tracking-widest text-lg text-gold">
                Nilo Interiors
              </span>
            </Link>

            <p className="mt-4 text-muted max-w-sm">
              Full-service interior design studio based in Kerala, delivering
              residential and commercial projects from concept to completion.
            </p>

            <div className="mt-6 flex gap-6 text-muted">
              <a href="#" className="hover:text-gold transition"><Camera size={18} /></a>
              <a href="#" className="hover:text-gold transition"><Link2 size={18} /></a>
              <a href="#" className="hover:text-gold transition"><Bookmark size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-sm font-medium text-foreground">Quick Links</p>
            <ul className="mt-6 space-y-4 text-sm text-muted">
              <li><Link href="/projects" className="hover:text-gold">Portfolio</Link></li>
              <li><Link href="/services" className="hover:text-gold">Services</Link></li>
              <li><Link href="/process" className="hover:text-gold">Process</Link></li>
              <li><Link href="/about" className="hover:text-gold">About</Link></li>
              <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-sm font-medium text-foreground">Services</p>
            <ul className="mt-6 space-y-4 text-sm text-muted">
              <li>Full-Service Design</li>
              <li>Turnkey Execution</li>
              <li>Design Consultation</li>
              <li>Styling & Staging</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-medium text-foreground">Contact</p>
            <ul className="mt-6 space-y-4 text-sm text-muted">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 text-gold" />
                Kochi, Kerala
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-1 text-gold" />
                <a href="tel:+919876543210" className="hover:text-gold">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-1 text-gold" />
                <a href="mailto:studio@email.com" className="hover:text-gold">
                  studio@email.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-1 text-gold" />
                Mon–Sat · 10:00–18:00
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} Nilaya. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gold">Privacy</Link>
            <Link href="/terms" className="hover:text-gold">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
