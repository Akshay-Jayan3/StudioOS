"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="backdrop-blur-sm border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 py-5 relative flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gold font-bold text-lg uppercase"
          >
            Nilo Interiors
          </Link>


          {/* RIGHT LINKS (desktop) */}
          <div className="hidden md:flex gap-16 text-sm uppercase">
            <Link href="/projects" className="hover:text-gold transition">
              Projects
            </Link>
            <Link href="/services" className="hover:text-gold transition">
              Services
            </Link>
            <Link href="/about" className="hover:text-gold transition">
              About
            </Link>
            <Link href="/contact" className="text-gold hover:text-gold-muted transition">
              Contact
            </Link>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>

        </nav>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div
          className="
      md:hidden
      fixed inset-0
      z-40
      bg-black/95
      backdrop-blur-xl
      flex flex-col
      justify-center
      items-center
      gap-8
      text-lg
      uppercase
    "
        >
          <Link href="/projects" onClick={() => setOpen(false)}>Projects</Link>
          <Link href="/services" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        </div>
      )}

    </header>
  );
}
