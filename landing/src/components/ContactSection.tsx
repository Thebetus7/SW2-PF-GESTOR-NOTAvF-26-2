'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !senderEmail || !message) return;

    // Crear enlace mailto estructurado con destino a edybanera@gmail.com
    const emailSubject = encodeURIComponent(subject ? `[GestorNotas IA] ${subject}` : `[GestorNotas IA] Consulta de ${name}`);
    const emailBody = encodeURIComponent(
      `Nombre: ${name}\nCorreo de contacto: ${senderEmail}\n\nMensaje:\n${message}\n\n---\nEnviado desde el formulario de contacto institucional (oficina@edugrade.com)`
    );

    const mailtoUrl = `mailto:edybanera@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    
    // Intentar abrir cliente de correo
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="py-20 bg-gradient-to-b from-[#FDFBF7] to-[#F5ECE0] border-t border-[#E8DCC8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Encabezado de la Sección */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0E1] border border-[#E8DDD0] text-xs font-semibold text-[#8B5E3C] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C4956A]" />
            <span>Atención Personalizada y Demostraciones</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2C1810]">
            Contáctanos
          </h2>
          <p className="text-[#6B5B52] text-base sm:text-lg leading-relaxed">
            ¿Deseas implementar GestorNotas IA en tu facultad, agendar una demostración en vivo o realizar una consulta académica? Escríbenos directamente por correo institucional o WhatsApp.
          </p>
        </div>

        {/* Contenido en 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Columna Izquierda: Tarjetas de Información Oficial */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DCC8] shadow-[0_8px_30px_rgba(139,94,60,0.06)] space-y-6">
              <h3 className="font-headline text-xl font-bold text-[#2C1810]">
                Canales de Atención Directa
              </h3>
              <p className="text-sm text-[#6B5B52] leading-relaxed">
                Nuestros canales oficiales están habilitados para docentes, coordinadores de carrera y autoridades universitarias.
              </p>

              {/* Canal de Correo Institucional */}
              <div className="p-4 rounded-xl bg-[#FAF0E1]/60 border border-[#E8DCC8] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B5E3C] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Mail className="w-5 h-5 text-[#FDF6EC]" />
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#8B5E3C]">
                    Correo Institucional
                  </span>
                  <a
                    href="mailto:edybanera@gmail.com"
                    className="font-bold text-base text-[#2C1810] hover:text-[#8B5E3C] transition-colors break-all"
                  >
                    oficina@edugrade.com
                  </a>
                  <span className="block text-xs text-[#6B5B52] mt-0.5">
                    Respuesta en menos de 24 horas hábiles
                  </span>
                </div>
              </div>

              {/* Canal de WhatsApp */}
              <div className="p-4 rounded-xl bg-[#059669]/10 border border-[#059669]/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#059669]">
                    WhatsApp Oficial
                  </span>
                  <a
                    href="https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-base text-[#2C1810] hover:text-[#059669] transition-colors flex items-center gap-1.5"
                  >
                    <span>+591 77389330</span>
                    <ArrowUpRight className="w-4 h-4 text-[#059669]" />
                  </a>
                  <span className="block text-xs text-[#6B5B52] mt-0.5">
                    Coordinación de demos y asistencia inmediata
                  </span>
                </div>
              </div>

              {/* Botón Acción Rápida WhatsApp */}
              <a
                href="https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold shadow-md transition-all group"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conversar por WhatsApp</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Columna Derecha: Formulario Típico de Escribir y Enviar Correo */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DCC8] shadow-[0_8px_30px_rgba(139,94,60,0.06)]">
              <div className="mb-6">
                <h3 className="font-headline text-xl font-bold text-[#2C1810] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#8B5E3C]" />
                  <span>Envíanos un Correo Electrónico</span>
                </h3>
                <p className="text-sm text-[#6B5B52] mt-1">
                  Escribe tu mensaje a <strong className="text-[#8B5E3C]">oficina@edugrade.com</strong> directamente desde este formulario.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-xl bg-[#FAF0E1] border border-[#E8DDD0] text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto" />
                  <h4 className="font-headline text-lg font-bold text-[#2C1810]">
                    ¡Mensaje preparado para envío!
                  </h4>
                  <p className="text-sm text-[#6B5B52] max-w-md mx-auto">
                    Se ha abierto tu cliente de correo para despachar el mensaje a <strong>oficina@edugrade.com</strong> (edybanera@gmail.com). Si no se abrió automáticamente, puedes hacer clic abajo.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 rounded-xl border border-[#C4956A] text-xs font-semibold text-[#8B5E3C] hover:bg-white transition-colors"
                    >
                      Escribir otro mensaje
                    </button>
                    <a
                      href={`mailto:edybanera@gmail.com?subject=${encodeURIComponent(subject ? `[GestorNotas IA] ${subject}` : `[GestorNotas IA] Consulta de ${name}`)}&body=${encodeURIComponent(`Nombre: ${name}\nCorreo: ${senderEmail}\n\n${message}`)}`}
                      className="px-4 py-2 rounded-xl bg-[#8B5E3C] text-xs font-semibold text-white hover:bg-[#724A2D] transition-colors"
                    >
                      Abrir correo nuevamente
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-xs font-semibold text-[#3E2723] uppercase tracking-wider mb-1.5">
                        Tu Nombre o Institución <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Ing. Juan Pérez - UAGRM"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] bg-[#FDFBF7] text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Correo remitente */}
                    <div>
                      <label className="block text-xs font-semibold text-[#3E2723] uppercase tracking-wider mb-1.5">
                        Tu Correo de Contacto <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="juan.perez@universidad.edu.bo"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] bg-[#FDFBF7] text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Asunto */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2723] uppercase tracking-wider mb-1.5">
                      Asunto de la Consulta
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ej. Demostración para la Carrera de Ingeniería de Sistemas"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] bg-[#FDFBF7] text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2723] uppercase tracking-wider mb-1.5">
                      Mensaje <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe tus requerimientos o preguntas sobre la plataforma..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] bg-[#FDFBF7] text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Botón de Enviar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-[#6B5B52]">
                      Destino: <strong className="text-[#8B5E3C]">oficina@edugrade.com</strong>
                    </span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Correo</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
