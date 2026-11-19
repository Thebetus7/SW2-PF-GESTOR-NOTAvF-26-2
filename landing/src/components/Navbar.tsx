'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ArrowRight, ExternalLink } from 'lucide-react';

interface NavbarProps {
  appUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ appUrl = '/app/login' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FDFBF7]/90 border-b border-[#E8DCC8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5E3C] to-[#6B4226] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(139,94,60,0.25)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-[#FDF6EC]" />
          </div>
          <div>
            <span className="font-headline text-2xl font-bold tracking-tight text-[#2C1810] block leading-none">
              GestorNotas <span className="text-[#8B5E3C]">IA</span>
            </span>
            <span className="font-mono text-[10px] text-[#9C8E85] uppercase tracking-wider">
              Plataforma Evaluativa
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#hero"
            className="text-sm font-medium text-[#6B5B52] hover:text-[#8B5E3C] transition-colors"
          >
            Inicio
          </a>
          <a
            href="#modulos"
            className="text-sm font-medium text-[#6B5B52] hover:text-[#8B5E3C] transition-colors"
          >
            Módulos
          </a>
          <a
            href="#diferenciadores"
            className="text-sm font-medium text-[#6B5B52] hover:text-[#8B5E3C] transition-colors"
          >
            Innovación IA
          </a>
          <a
            href="https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#6B5B52] hover:text-[#8B5E3C] transition-colors flex items-center gap-1.5"
          >
            WhatsApp
            <ExternalLink className="w-3.5 h-3.5 text-[#9C8E85]" />
          </a>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href={appUrl}
            className="inline-flex items-center gap-2 bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(139,94,60,0.3)] hover:shadow-[0_6px_18px_rgba(139,94,60,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Ingresar a la Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#6B5B52] hover:text-[#2C1810] hover:bg-[#F0E6D6]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8DCC8] bg-[#FDFBF7] px-4 pt-2 pb-6 space-y-3">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#6B5B52] hover:bg-[#F0E6D6]"
          >
            Inicio
          </a>
          <a
            href="#modulos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#6B5B52] hover:bg-[#F0E6D6]"
          >
            Módulos
          </a>
          <a
            href="#diferenciadores"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#6B5B52] hover:bg-[#F0E6D6]"
          >
            Innovación IA
          </a>
          <a
            href="https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#8B5E3C] hover:bg-[#F0E6D6]"
          >
            WhatsApp (+591 77389330)
          </a>
          <div className="pt-2">
            <Link
              href={appUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-base font-semibold px-4 py-3 rounded-xl shadow-md"
            >
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
