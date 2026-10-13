'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentEvaluation, GradeDetail } from '@/types';
import { Navbar } from '@/components/ui/Navbar';

export default function StudentPortalPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<StudentEvaluation | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const storedName = localStorage.getItem('user_name');
    if (storedName) setStudentName(storedName);

    fetchStudentEvaluations();
  }, []);

  const fetchStudentEvaluations = async (customId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('access_token');
      const url = customId
        ? `http://localhost:8000/api/v1/evaluations/?student_identifier=${customId}`
        : `http://localhost:8000/api/v1/evaluations/`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('No se pudieron obtener las evaluaciones');
      }

      const data = await res.json();
      const list: StudentEvaluation[] = data.results || data;
      // Solo mostrar evaluaciones publicadas
      const published = list.filter((e) => e.is_published || e.status === 'PUBLICADO');
      setEvaluations(published);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim()) return;

    try {
      // Intentar login por ID de estudiante
      const res = await fetch('http://localhost:8000/api/v1/auth/student-id-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id_code: studentIdInput.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Estudiante no encontrado');
      }

      const authData = await res.json();
      localStorage.setItem('access_token', authData.access);
      localStorage.setItem('user_role', 'STUDENT');
      localStorage.setItem('user_name', authData.user.name);
      setStudentName(authData.user.name);

      await fetchStudentEvaluations();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleOpenDetail = async (item: StudentEvaluation) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/api/v1/evaluations/${item.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const full = await res.json();
        setSelectedEvaluation(full);
      } else {
        setSelectedEvaluation(item);
      }
    } catch {
      setSelectedEvaluation(item);
    }
    setSelectedPageIndex(0);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Cabecera del Portal del Estudiante */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[var(--primary)]">
              Portal del Estudiante
            </h1>
            <p className="text-sm text-[var(--foreground)]/70 mt-1">
              {studentName ? `Bienvenido/a, ${studentName}. ` : ''}
              Consulta tus exámenes evaluados, notas oficiales, transcripción y retroalimentación pedagógica.
            </p>
          </div>

          {/* Formulario de consulta rápida por ID */}
          <form onSubmit={handleConsultById} className="flex items-center gap-2 bg-[var(--surface)] p-2 rounded-xl border border-[var(--primary)]/20 shadow-sm">
            <input
              type="text"
              placeholder="Matrícula / ID (ej. EST-2026-001)"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              className="px-3 py-1.5 text-xs border rounded-lg bg-[var(--surface-inset)] border-[var(--primary)]/20 text-[var(--foreground)] font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-bold text-white bg-[var(--primary)] hover:opacity-90 rounded-lg shadow transition-all"
            >
              Consultar
            </button>
          </form>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 rounded-xl text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Lista de Exámenes Publicados */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-serif text-[var(--primary)]">
            Mis Exámenes Calificados y Publicados
          </h2>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-[var(--foreground)]/60 bg-[var(--surface)] rounded-2xl border border-[var(--primary)]/15">
              Cargando tus exámenes evaluados...
            </div>
          ) : evaluations.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--foreground)]/60 bg-[var(--surface)] rounded-2xl border border-[var(--primary)]/15">
              No tienes exámenes publicados por tus docentes en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluations.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--primary)]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                        PUBLICADO
                      </span>
                      <span className="text-xs text-[var(--foreground)]/60">
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Reciente'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
                      {item.student_name}
                    </h3>
                    <p className="text-xs text-[var(--foreground)]/70 font-mono mb-4">
                      Matrícula: {item.student_identifier}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--primary)]/15 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[var(--foreground)]/60 uppercase block">Nota Obtenida</span>
                      <span className="text-2xl font-bold font-serif text-[var(--primary)]">
                        {item.final_score} pts
                      </span>
                      {item.is_score_overridden && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block">
                          (Revisión docente incluida)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenDetail(item)}
                      className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-[var(--primary)] hover:opacity-90 shadow transition-all"
                    >
                      Ver Respuestas y Fotos JPG
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Modal de Consulta Estudiantil con Fotos JPG y Feedback */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface)] text-[var(--foreground)] w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--primary)]/20 animate-in fade-in zoom-in-95">
            
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-[var(--primary)]/15 flex items-center justify-between bg-[var(--surface-inset)]">
              <div>
                <h3 className="text-lg font-bold font-serif text-[var(--primary)]">
                  Mi Examen Calificado - {selectedEvaluation.student_name}
                </h3>
                <p className="text-xs text-[var(--foreground)]/70">
                  Calificación Final: <span className="font-bold text-[var(--primary)]">{selectedEvaluation.final_score} pts</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--primary)]/10 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Contenido Dividido */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Fotos JPG Escaneadas */}
              <div className="md:w-1/2 p-4 bg-black/5 dark:bg-black/30 border-r border-[var(--primary)]/15 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--foreground)]/80">
                    Tu Hoja Escaneada ({selectedEvaluation.pages?.length || 0})
                  </span>
                  {(selectedEvaluation.pages?.length || 0) > 1 && (
                    <div className="flex items-center gap-1">
                      {selectedEvaluation.pages?.map((p, idx) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPageIndex(idx)}
                          className={`px-2 py-0.5 text-xs rounded font-medium ${
                            selectedPageIndex === idx
                              ? 'bg-[var(--primary)] text-white shadow'
                              : 'bg-[var(--surface)] text-[var(--foreground)]/70'
                          }`}
                        >
                          Pág {p.page_number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 rounded-xl border border-[var(--primary)]/20 overflow-auto bg-black/40 flex items-center justify-center p-2">
                  {selectedEvaluation.pages && selectedEvaluation.pages[selectedPageIndex] ? (
                    <img
                      src={
                        selectedEvaluation.pages[selectedPageIndex].image_url ||
                        selectedEvaluation.pages[selectedPageIndex].image ||
                        '/placeholder-exam.jpg'
                      }
                      alt="Hoja de Examen"
                      className="max-h-full max-w-full object-contain rounded shadow"
                    />
                  ) : (
                    <div className="text-center text-white/50 text-sm">
                      Fotografía digitalizada no disponible.
                    </div>
                  )}
                </div>
              </div>

              {/* Rúbrica, Transcripción y Retroalimentación */}
              <div className="md:w-1/2 p-6 overflow-y-auto space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--primary)] border-b border-[var(--primary)]/15 pb-2">
                  Desglose de Preguntas y Respuestas
                </h4>

                {(selectedEvaluation.grades || []).map((grade, idx) => (
                  <div
                    key={grade.id}
                    className="p-4 rounded-xl border border-[var(--primary)]/15 bg-[var(--surface-inset)]/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-[var(--foreground)]">
                        Pregunta #{grade.order || idx + 1}: {grade.component_prompt}
                      </h5>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] whitespace-nowrap">
                        {grade.final_score} / {grade.max_score} pts
                      </span>
                    </div>

                    <div className="text-xs bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--primary)]/10">
                      <span className="font-semibold block text-[10px] text-[var(--foreground)]/60 uppercase">
                        Lo que respondiste (Transcripción OCR):
                      </span>
                      <p className="mt-1 font-mono text-[var(--foreground)]/90 whitespace-pre-wrap">
                        {grade.transcribed_answer || 'Sin transcripción registrada.'}
                      </p>
                    </div>

                    <div className="text-xs text-[var(--foreground)]/80">
                      <span className="font-semibold block text-[10px] text-[var(--foreground)]/60 uppercase">
                        Retroalimentación Pedagógica:
                      </span>
                      <p className="mt-0.5">{grade.ai_feedback}</p>
                    </div>

                    {grade.teacher_comment && (
                      <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded border border-amber-300 dark:border-amber-800 text-xs">
                        <span className="font-bold text-amber-900 dark:text-amber-200">
                          Comentario del Docente:
                        </span>
                        <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                          {grade.teacher_comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
