'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Cpu,
  FileCheck,
  ShieldCheck,
  Eye,
  MessageSquare,
  Clock,
  Layers,
} from 'lucide-react';

interface HeroSectionProps {
  appUrl?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ appUrl = '/app/login' }) => {
  const [activeTab, setActiveTab] = useState<'rubrica' | 'ia' | 'caligrafia'>('ia');

  return (
    <section id="hero" className="relative pt-12 pb-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#FAF0E1] via-[#FDF6EC]/40 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0E6D6] border border-[#E8DCC8] text-xs font-semibold text-[#8B5E3C] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#C4956A]" />
            <span>Nueva Generación en Evaluación Académica Universitaria</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#2C1810] leading-[1.15]">
            Digitalización, Escaneo QR y Calificación de Exámenes con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5E3C] via-[#C4956A] to-[#6B4226] font-bold">
              IA Multimodal
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-lg sm:text-xl text-[#6B5B52] max-w-3xl mx-auto leading-relaxed">
            Ahorra más del <strong className="text-[#2C1810] font-semibold">85% del tiempo docente</strong>.
            Captura exámenes manuscritos desde la app móvil Flutter, identifica al estudiante mediante{' '}
            <strong className="text-[#2C1810] font-semibold">código QR</strong> y evalúa respuestas con{' '}
            visión artificial y rúbricas pedagógicas exactas.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={appUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-base font-semibold px-8 py-3.5 rounded-xl shadow-[0_8px_20px_rgba(139,94,60,0.35)] hover:shadow-[0_12px_28px_rgba(139,94,60,0.45)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#FAF0E1] text-[#3E2723] border border-[#E8DDD0] text-base font-medium px-6 py-3.5 rounded-xl shadow-sm hover:border-[#8B5E3C] transition-all"
            >
              <MessageSquare className="w-5 h-5 text-[#8B5E3C]" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>

          {/* Quick Stats Pill */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/80 backdrop-blur border border-[#E8DCC8] p-3.5 rounded-xl">
              <div className="text-2xl font-bold text-[#8B5E3C] font-headline">85%</div>
              <div className="text-xs text-[#6B5B52]">Ahorro en tiempo docente</div>
            </div>
            <div className="bg-white/80 backdrop-blur border border-[#E8DCC8] p-3.5 rounded-xl">
              <div className="text-2xl font-bold text-[#8B5E3C] font-headline">&lt; 3 seg</div>
              <div className="text-xs text-[#6B5B52]">Por examen calificado</div>
            </div>
            <div className="bg-white/80 backdrop-blur border border-[#E8DCC8] p-3.5 rounded-xl">
              <div className="text-2xl font-bold text-[#8B5E3C] font-headline">100%</div>
              <div className="text-xs text-[#6B5B52]">Trazabilidad QR criptográfica</div>
            </div>
            <div className="bg-white/80 backdrop-blur border border-[#E8DCC8] p-3.5 rounded-xl">
              <div className="text-2xl font-bold text-[#8B5E3C] font-headline">0%</div>
              <div className="text-xs text-[#6B5B52]">Sesgo subjetivo en rúbricas</div>
            </div>
          </div>
        </div>

        {/* Interactive Mockup Preview Card */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#FFFFFF] to-[#FDF6EC] border border-[#E8DCC8] p-4 sm:p-8 shadow-[0_20px_50px_rgba(139,94,60,0.12)]">
            {/* Mockup Header Bar */}
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-[#E8DDD0] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FAF0E1] border border-[#E8DDD0] flex items-center justify-center text-[#8B5E3C]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#2C1810] font-body flex items-center gap-2">
                    Examen Parcial: Estructura de Datos y Algoritmos II
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                      Calificado por IA
                    </span>
                  </h2>
                  <p className="text-xs text-[#6B5B52]">
                    Estudiante: <span className="font-semibold text-[#2C1810]">Carlos Mendoza Rivera</span> (C.I. 8392102) &bull; Grupo: SIS-204
                  </p>
                </div>
              </div>

              {/* QR Verification badge */}
              <div className="flex items-center gap-2 bg-[#F0E6D6] px-3 py-1.5 rounded-lg border border-[#E8DCC8]">
                <QrCode className="w-4 h-4 text-[#8B5E3C]" />
                <span className="font-mono text-xs text-[#3E2723] font-medium">QR: EX-2026-F9812A</span>
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
              </div>
            </div>

            {/* Mockup Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 pb-2 border-b border-[#E8DDD0]">
              <button
                type="button"
                onClick={() => setActiveTab('ia')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'ia'
                    ? 'bg-[#8B5E3C] text-white shadow-sm'
                    : 'text-[#6B5B52] hover:bg-[#F0E6D6]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Desglose de IA y Rúbricas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('caligrafia')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'caligrafia'
                    ? 'bg-[#8B5E3C] text-white shadow-sm'
                    : 'text-[#6B5B52] hover:bg-[#F0E6D6]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Texto Manuscrito Detectado</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rubrica')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'rubrica'
                    ? 'bg-[#8B5E3C] text-white shadow-sm'
                    : 'text-[#6B5B52] hover:bg-[#F0E6D6]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Rúbrica Pedagógica Oficial</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-6">
              {activeTab === 'ia' && (
                <div className="space-y-4">
                  {/* Question 1 */}
                  <div className="bg-white rounded-xl p-4 border border-[#E8DDD0] shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FAF0E1] text-[#8B5E3C] font-mono text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <h3 className="text-sm font-semibold text-[#2C1810]">
                          Implementación de Balanceo en Árboles AVL (Rotaciones Simple y Doble)
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-md">
                        10.0 / 10 pts
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#6B5B52] bg-[#FDFBF7] p-2.5 rounded-lg border border-[#F0E6D6]">
                      <strong className="text-[#3E2723]">Evaluación IA:</strong> El alumno formula
                      correctamente el cálculo del factor de equilibrio (`fe = altura(der) -
                      altura(izq)`). Las rotaciones a la izquierda y derecha preservan la propiedad
                      binaria. No se observan punteros nulos sin control.
                    </p>
                  </div>

                  {/* Question 2 */}
                  <div className="bg-white rounded-xl p-4 border border-[#E8DDD0] shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FAF0E1] text-[#8B5E3C] font-mono text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        <h3 className="text-sm font-semibold text-[#2C1810]">
                          Análisis Asintótico y Demostración de Complejidad Temporal O(V + E)
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-md">
                        8.5 / 10 pts
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#6B5B52] bg-[#FDFBF7] p-2.5 rounded-lg border border-[#F0E6D6]">
                      <strong className="text-[#3E2723]">Evaluación IA:</strong> Demostración adecuada
                      del recorrido por lista de adyacencia. Deducción de -1.5 pts por no explicitar
                      la cota de memoria para la cola de prioridad en grafos densos.
                    </p>
                  </div>

                  {/* Question 3 */}
                  <div className="bg-white rounded-xl p-4 border border-[#E8DDD0] shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FAF0E1] text-[#8B5E3C] font-mono text-xs font-bold flex items-center justify-center">
                          3
                        </span>
                        <h3 className="text-sm font-semibold text-[#2C1810]">
                          Diseño de Algoritmo de Dijkstra con Min-Heap
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-md">
                        9.5 / 10 pts
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#6B5B52] bg-[#FDFBF7] p-2.5 rounded-lg border border-[#F0E6D6]">
                      <strong className="text-[#3E2723]">Evaluación IA:</strong> Código pseudocódigo
                      sintácticamente claro. Manejo correcto de distancias relajadas e índices de
                      nodos visitados.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'caligrafia' && (
                <div className="bg-white rounded-xl p-5 border border-[#E8DDD0] space-y-3 font-mono text-xs text-[#3E2723]">
                  <div className="text-[#8B5E3C] font-bold pb-2 border-b border-[#F0E6D6] flex items-center justify-between">
                    <span>Transcripción OCR Multimodal — Tasa de confianza: 99.4%</span>
                    <span className="text-xs bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded">
                      Caligrafía Clara
                    </span>
                  </div>
                  <div className="bg-[#FDFBF7] p-3 rounded-lg border border-[#E8DDD0] space-y-1">
                    <p className="text-[#9C8E85]">// Segmento capturado de la imagen JPG física</p>
                    <p>&quot;Para balancear el árbol AVL se calcula fe(nodo) = alt(der) - alt(izq).&quot;</p>
                    <p>&quot;Si fe &gt; 1 y fe(hijo_der) &gt;= 0 =&gt; RotacionSimpleIzquierda(nodo).&quot;</p>
                    <p>&quot;Si fe &lt; -1 y fe(hijo_izq) &gt; 0 =&gt; RotacionDobleDerecha(nodo).&quot;</p>
                  </div>
                </div>
              )}

              {activeTab === 'rubrica' && (
                <div className="bg-white rounded-xl p-5 border border-[#E8DDD0] space-y-3 text-xs text-[#3E2723]">
                  <div className="text-[#8B5E3C] font-bold pb-2 border-b border-[#F0E6D6] flex items-center justify-between">
                    <span>Rúbrica Pedagógica Registrada por el Docente</span>
                    <span className="font-mono text-xs text-[#6B5B52]">3 Criterios de Evaluación</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                      <span><strong>Criterio 1 (35%):</strong> Corrección sintáctica y lógica de rotaciones de árboles binarios.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                      <span><strong>Criterio 2 (35%):</strong> Demostración rigurosa de cotas Big-O y análisis asintótico.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                      <span><strong>Criterio 3 (30%):</strong> Estructuración modular, pseudocódigo o código de producción legible.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mockup Footer Score Summary */}
            <div className="mt-6 pt-5 border-t border-[#E8DDD0] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-extrabold text-[#2C1810] font-headline">
                  28.0 <span className="text-base font-normal text-[#6B5B52]">/ 30 pts</span>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  Calificación: 93.3% &bull; Sobresaliente
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B5B52] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Procesado en 1.84 segundos
                </span>
                <a
                  href={appUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5E3C] hover:text-[#6B4226] bg-[#FAF0E1] px-3.5 py-1.5 rounded-lg border border-[#E8DCC8] hover:border-[#8B5E3C] transition-colors"
                >
                  <span>Ver en Plataforma</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
