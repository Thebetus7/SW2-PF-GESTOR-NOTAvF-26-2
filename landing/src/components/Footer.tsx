'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MessageSquare, Github, ArrowUpRight, Heart, Shield, Mail } from 'lucide-react';

interface FooterProps {
  appUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ appUrl = '/app' }) => {
  return (
    <footer className="bg-[#1A1412] text-[#FDF6EC] border-t border-[#3D2D20] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#38281E]">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5E3C] to-[#6B4226] text-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-[#FDF6EC]" />
              </div>
              <span className="font-headline text-2xl font-bold tracking-tight text-[#FDF6EC]">
                EduGrade<span className="text-[#D4A373]">IA</span>
              </span>
            </div>
            <p className="text-[#D5C9B8] text-sm max-w-sm leading-relaxed">
              Solución integral de evaluación inteligente con Inteligencia Artificial Multimodal,
              digitalización por QR y rúbricas pedagógicas para instituciones de educación superior.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#261A13] border border-[#38281E] text-xs font-mono text-[#D4A373]">
                <Shield className="w-3.5 h-3.5 text-[#34D399]" />
                Cumplimiento Académico &bull; CafeBlend Design
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-headline text-lg font-bold text-[#FDF6EC]">Navegación</h4>
            <ul className="space-y-2 text-sm text-[#D5C9B8]">
              <li><a href="/#quienes-somos" className="hover:text-[#D4A373]">Quiénes somos</a></li>
              <li><a href="/#planes" className="hover:text-[#D4A373]">Planes</a></li>
              <li><Link href="/terminos" className="hover:text-[#D4A373]">Términos y condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-[#D4A373]">Política de privacidad</Link></li>
              <li>
                <a href="#hero" className="hover:text-[#D4A373] transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#modulos" className="hover:text-[#D4A373] transition-colors">
                  Módulos del Sistema
                </a>
              </li>
              <li>
                <a href="#diferenciadores" className="hover:text-[#D4A373] transition-colors">
                  Diferenciadores Técnicos
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-[#D4A373] transition-colors">
                  Contáctanos
                </a>
              </li>
              <li>
                <a href={appUrl} className="hover:text-[#D4A373] transition-colors flex items-center gap-1">
                  <span>Acceso a la Plataforma</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Channels */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-headline text-lg font-bold text-[#FDF6EC]">Contacto y Código</h4>
            <div className="space-y-2.5">
              {/* Email Button */}
              <a
                href="mailto:oficina@edugrade.com"
                className="flex items-center justify-between p-3 rounded-xl bg-[#261A13] hover:bg-[#32231A] border border-[#38281E] text-sm text-[#FDF6EC] hover:border-[#D4A373] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5E3C]/20 text-[#D4A373] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium block text-xs text-[#D5C9B8]">Correo Electrónico</span>
                    <span className="font-bold text-sm text-[#FDF6EC] group-hover:text-[#D4A373]">
                      oficina@edugrade.com
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#A89886] group-hover:text-[#D4A373]" />
              </a>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-[#261A13] hover:bg-[#32231A] border border-[#38281E] text-sm text-[#FDF6EC] hover:border-[#D4A373] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#059669]/20 text-[#34D399] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium block text-xs text-[#D5C9B8]">WhatsApp Oficial</span>
                    <span className="font-bold text-sm text-[#FDF6EC] group-hover:text-[#D4A373]">
                      +591 77389330
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#A89886] group-hover:text-[#D4A373]" />
              </a>

              {/* GitHub Button */}
              <a
                href="https://github.com/edberto/gestor-notas-ia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-[#261A13] hover:bg-[#32231A] border border-[#38281E] text-sm text-[#FDF6EC] hover:border-[#D4A373] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium block text-xs text-[#D5C9B8]">Repositorio</span>
                    <span className="font-bold text-sm text-[#FDF6EC] group-hover:text-[#D4A373]">
                      GitHub / gestor-notas-ia
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#A89886] group-hover:text-[#D4A373]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A89886] gap-4">
          <p>&copy; {new Date().getFullYear()} EduGradeIA. Proyecto académico.</p>
          <p className="flex items-center gap-1.5">
            Desarrollado con arquitectura <span className="text-[#D4A373] font-mono">SDD</span> y{' '}
            <Heart className="w-3.5 h-3.5 text-[#F87171] inline" /> para docentes innovadores.
          </p>
        </div>
      </div>
    </footer>
  );
};
