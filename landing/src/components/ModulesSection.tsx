'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Smartphone,
  QrCode,
  CheckCircle2,
  FileSpreadsheet,
  BrainCircuit,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  FileText,
  Search,
} from 'lucide-react';

export const ModulesSection: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<'docente' | 'estudiante' | 'movil'>('docente');

  return (
    <section id="modulos" className="py-20 bg-[#FDF6EC]/60 border-y border-[#E8DCC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E1] text-[#8B5E3C] text-xs font-semibold uppercase tracking-wider border border-[#E8DDD0]">
            Arquitectura del Sistema
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2C1810]">
            Tres Módulos Integrados para el Éxito Educativo
          </h2>
          <p className="font-body text-[#6B5B52] text-base sm:text-lg">
            Una plataforma modular diseñada para docentes exigentes, estudiantes que valoran la
            transparencia y facultades que apuestan por la innovación digital.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#F0E6D6] border border-[#E8DCC8] shadow-inner max-w-2xl w-full">
            <button
              type="button"
              onClick={() => setSelectedModule('docente')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedModule === 'docente'
                  ? 'bg-white text-[#8B5E3C] shadow-md border border-[#E8DCC8]'
                  : 'text-[#6B5B52] hover:text-[#2C1810]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Docentes</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedModule('estudiante')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedModule === 'estudiante'
                  ? 'bg-white text-[#8B5E3C] shadow-md border border-[#E8DCC8]'
                  : 'text-[#6B5B52] hover:text-[#2C1810]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Estudiantes</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedModule('movil')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedModule === 'movil'
                  ? 'bg-white text-[#8B5E3C] shadow-md border border-[#E8DCC8]'
                  : 'text-[#6B5B52] hover:text-[#2C1810]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>App Móvil Flutter</span>
            </button>
          </div>
        </div>

        {/* Module Detail Card */}
        <div className="mt-8 bg-white rounded-3xl border border-[#E8DCC8] p-6 sm:p-10 shadow-[0_12px_32px_rgba(139,94,60,0.08)]">
          {selectedModule === 'docente' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#8B5E3C] bg-[#FAF0E1] px-3 py-1 rounded-md border border-[#E8DDD0]">
                  FLUJO: Mis Materias &rarr; Aulas &rarr; Exámenes con QR
                </div>
                <h3 className="font-headline text-3xl font-bold text-[#2C1810]">
                  Control Pedagógico Completo y Cero Tareas Repetitivas
                </h3>
                <p className="text-[#6B5B52] text-base leading-relaxed">
                  El docente gestiona sus asignaturas universitarias y grupos de aula. Con pocos clics
                  define las preguntas del examen, configura la rúbrica pedagógica ponderada y genera
                  un PDF listo para imprimir con códigos QR únicos por estudiante.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Rúbricas Flexibles</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Define criterios, puntajes parciales y palabras clave para la evaluación IA.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <QrCode className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Generación de Hojas QR</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Cada hoja contiene el identificador criptográfico del estudiante y examen.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <FileSpreadsheet className="w-5 h-5 text-[#C4956A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Actas de Calificaciones</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Exporta planillas oficiales en Excel y CSV con estadísticas consolidadas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Edición y Anulación</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        El docente conserva siempre la última palabra para ajustar notas si lo desea.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FAF0E1] p-6 rounded-2xl border border-[#E8DDD0] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD0]">
                  <span className="font-headline font-bold text-[#2C1810]">Mis Materias Activas</span>
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded text-[#8B5E3C] border border-[#E8DDD0]">
                    Gestión 2026-I
                  </span>
                </div>
                <div className="space-y-3 font-body">
                  <div className="bg-white p-3.5 rounded-xl border border-[#E8DDD0] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#2C1810]">Estructura de Datos II</span>
                      <span className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                        42 Exámenes calificados
                      </span>
                    </div>
                    <p className="text-xs text-[#6B5B52] mt-1">Aula 302 &bull; 45 Estudiantes</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#E8DDD0] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#2C1810]">Inteligencia Artificial</span>
                      <span className="text-xs font-semibold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded">
                        Listo para digitalizar
                      </span>
                    </div>
                    <p className="text-xs text-[#6B5B52] mt-1">Laboratorio 4 &bull; 38 Estudiantes</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#E8DDD0] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#2C1810]">Sistemas Operativos</span>
                      <span className="text-xs font-semibold text-[#8B5E3C] bg-[#FAF0E1] px-2 py-0.5 rounded">
                        Plantilla generada
                      </span>
                    </div>
                    <p className="text-xs text-[#6B5B52] mt-1">Aula 108 &bull; 50 Estudiantes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedModule === 'estudiante' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#8B5E3C] bg-[#FAF0E1] px-3 py-1 rounded-md border border-[#E8DDD0]">
                  PORTAL: Consulta Inmediata y Transparencia Absoluta
                </div>
                <h3 className="font-headline text-3xl font-bold text-[#2C1810]">
                  Retroalimentación Detallada en Lugar de un Número Vacío
                </h3>
                <p className="text-[#6B5B52] text-base leading-relaxed">
                  El estudiante ingresa con su C.I. o correo para consultar sus notas en tiempo real.
                  En lugar de esperar días por una revisión presencial, accede al desglose de cada
                  criterio con observaciones claras de la IA que explican en qué acertó y en qué puede
                  mejorar.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <Search className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Búsqueda por C.I.</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Acceso directo sin claves complejas, auditado por el servidor.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <FileText className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Desglose Ítem por Ítem</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Puntuación exacta por cada ejercicio y criterio de la rúbrica.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <BrainCircuit className="w-5 h-5 text-[#C4956A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Feedback Pedagógico</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Consejos personalizados para preparar la siguiente evaluación.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <TrendingUp className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Histórico de Calificaciones</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Gráfica evolutiva del desempeño en el semestre académico.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FAF0E1] p-6 rounded-2xl border border-[#E8DDD0] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD0]">
                  <span className="font-headline font-bold text-[#2C1810]">Mi Hoja de Examen</span>
                  <span className="text-xs font-mono bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded border border-[#A7F3D0]">
                    Aprobado
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E8DDD0] space-y-3">
                  <div className="flex justify-between items-center text-xs text-[#6B5B52]">
                    <span>Asignatura:</span>
                    <strong className="text-[#2C1810]">Estructura de Datos II</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#6B5B52]">
                    <span>Evaluación:</span>
                    <strong className="text-[#2C1810]">Examen Final</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#6B5B52]">
                    <span>Puntaje Total:</span>
                    <strong className="text-[#059669] text-base font-bold">95 / 100 pts</strong>
                  </div>
                  <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#E8DCC8] text-xs text-[#3E2723]">
                    <span className="font-bold text-[#8B5E3C]">Observación del Docente:</span> &ldquo;Excelente
                    dominio de las complejidades temporales y algoritmos de grafos. ¡Felicitaciones!&rdquo;
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedModule === 'movil' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#8B5E3C] bg-[#FAF0E1] px-3 py-1 rounded-md border border-[#E8DDD0]">
                  MÓVIL: Flutter para Android e iOS
                </div>
                <h3 className="font-headline text-3xl font-bold text-[#2C1810]">
                  Escaneo QR Instantáneo y Captura de Fotos JPG en el Aula
                </h3>
                <p className="text-[#6B5B52] text-base leading-relaxed">
                  Desarrollada con Flutter para máximo rendimiento nativo. Permite al profesor o asistente
                  apuntar la cámara al examen, detectar automáticamente el código QR con los datos del
                  estudiante y capturar las fotos JPG en ráfaga con compresión inteligente y subida
                  segura.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <QrCode className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Lector QR Ultra-Rápido</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Decodificación en menos de 100ms con autoenfoque continuo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <Zap className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Modo Lote (Batch)</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Digitaliza todo un grupo de 40 alumnos en menos de 3 minutos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <Smartphone className="w-5 h-5 text-[#C4956A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Compresión Eficiente</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Optimiza imágenes JPG para subir sin saturar la red del campus.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
                    <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#2C1810]">Cola sin Conexión</h4>
                      <p className="text-xs text-[#6B5B52] mt-0.5">
                        Almacena capturas localmente y sincroniza cuando detecta Wi-Fi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FAF0E1] p-6 rounded-2xl border border-[#E8DDD0] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD0]">
                  <span className="font-headline font-bold text-[#2C1810]">Escáner de Aula Flutter</span>
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded text-[#8B5E3C] border border-[#E8DDD0]">
                    60 FPS
                  </span>
                </div>
                <div className="bg-[#1A1412] text-white p-5 rounded-xl space-y-4 shadow-lg border border-[#3D2D20]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono text-[#D4A373]">ESTADO DE LA CÁMARA</span>
                    <span className="text-xs text-[#34D399] font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span> ACTIVA
                    </span>
                  </div>
                  <div className="h-32 border-2 border-dashed border-[#D4A373]/60 rounded-lg flex flex-col items-center justify-center p-3 text-center space-y-2 bg-[#261A13]/80">
                    <QrCode className="w-8 h-8 text-[#D4A373] animate-bounce" />
                    <span className="text-xs font-mono text-[#FDF6EC]">
                      Apunte el recuadro hacia el código QR impreso
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#D5C9B8]">
                    <span>Exámenes escaneados hoy:</span>
                    <span className="font-mono font-bold text-white">34 / 35</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Differentiators Grid */}
        <div id="diferenciadores" className="mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h3 className="font-headline text-3xl font-normal text-[#2C1810]">
              Diferenciadores Clave de Nuestra Tecnología
            </h3>
            <p className="text-[#6B5B52] text-sm sm:text-base">
              ¿Por qué GestorNotas IA transforma la evaluación presencial tradicional?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF0E1] text-[#8B5E3C] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h4 className="font-headline text-xl font-bold text-[#2C1810]">
                IA Multimodal de Alto Nivel
              </h4>
              <p className="text-xs sm:text-sm text-[#6B5B52] leading-relaxed">
                No nos limitamos a opciones múltiples. Nuestro motor semántico multimodal comprende
                caligrafía manuscrita, esquemas, demostraciones lógicas y pseudocódigo con precisión
                humana.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF0E1] text-[#8B5E3C] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-headline text-xl font-bold text-[#2C1810]">
                Trazabilidad Criptográfica QR
              </h4>
              <p className="text-xs sm:text-sm text-[#6B5B52] leading-relaxed">
                Cada examen posee una firma digital embebida en su código QR. Garantiza que la hoja
                pertenece a ese estudiante específico, previniendo suplantaciones y hojas duplicadas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF0E1] text-[#8B5E3C] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-headline text-xl font-bold text-[#2C1810]">
                Apoyo al trabajo docente
              </h4>
              <p className="text-xs sm:text-sm text-[#6B5B52] leading-relaxed">
                La revisión asistida ayuda a organizar el trabajo de corrección y acompañamiento del aprendizaje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
