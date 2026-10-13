'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StudentEvaluation } from '@/types';
import { Navbar } from '@/components/ui/Navbar';
import { EvaluationDetailModal } from '@/components/evaluations/EvaluationDetailModal';

export default function TeacherExamEvaluationsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<StudentEvaluation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEvaluations();
  }, [examId]);

  const fetchEvaluations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/api/v1/evaluations/?exam_id=${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('No se pudieron obtener las evaluaciones del examen');
      }

      const data = await res.json();
      setEvaluations(data.results || data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (evalItem: StudentEvaluation) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/api/v1/evaluations/${evalItem.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const fullDetail = await res.json();
        setSelectedEvaluation(fullDetail);
      } else {
        setSelectedEvaluation(evalItem);
      }
    } catch {
      setSelectedEvaluation(evalItem);
    }
  };

  const handleGradeUpdated = (updated: StudentEvaluation) => {
    setSelectedEvaluation(updated);
    setEvaluations((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
  };

  const handlePublishAll = async () => {
    if (!confirm('¿Confirma que desea publicar todas las calificaciones? Quedarán inmediatamente visibles para los alumnos.')) {
      return;
    }

    setIsPublishing(true);
    setPublishFeedback(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/api/v1/evaluations/exams/${examId}/publish/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al publicar calificaciones');
      }

      const data = await res.json();
      setPublishFeedback(data.message || 'Calificaciones publicadas con éxito.');
      fetchEvaluations();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Métricas
  const totalCount = evaluations.length;
  const publishedCount = evaluations.filter((e) => e.is_published).length;
  const reviewNeededCount = evaluations.filter((e) => e.status === 'REVISION_DOCENTE').length;
  const averageScore = totalCount > 0
    ? (evaluations.reduce((acc, curr) => acc + Number(curr.final_score || 0), 0) / totalCount).toFixed(1)
    : '0.0';

  const filteredEvaluations = evaluations.filter((item) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PUBLISHED') return item.is_published;
    if (filterStatus === 'REVISION_DOCENTE') return item.status === 'REVISION_DOCENTE';
    if (filterStatus === 'EN_REVISION') return item.status === 'EN_REVISION';
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* Cabecera y Botón de Publicación */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-xs text-[var(--primary)] font-semibold hover:underline mb-2 inline-flex items-center gap-1"
            >
              ← Volver al Listado de Exámenes
            </button>
            <h1 className="text-3xl font-bold font-serif text-[var(--primary)]">
              Auditoría y Post-Detalle de Examen
            </h1>
            <p className="text-sm text-[var(--foreground)]/70 mt-1">
              Revise las respuestas digitalizadas, ajuste calificaciones puntuales y publique los resultados oficiales.
            </p>
          </div>

          <button
            onClick={handlePublishAll}
            disabled={isPublishing || totalCount === 0}
            className="px-5 py-3 rounded-xl font-bold text-white bg-[var(--primary)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? (
              <span>Publicando...</span>
            ) : (
              <>
                <span>📢 Publicar Calificaciones del Aula</span>
              </>
            )}
          </button>
        </div>

        {publishFeedback && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300 rounded-xl text-sm font-semibold flex items-center justify-between">
            <span>✓ {publishFeedback}</span>
            <button onClick={() => setPublishFeedback(null)} className="text-xs underline ml-4">
              Cerrar
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 rounded-xl text-sm">
            {errorMessage}
          </div>
        )}

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--primary)]/15 shadow-sm">
            <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase">Total Entregas</span>
            <p className="text-2xl font-bold font-serif text-[var(--primary)] mt-1">{totalCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--primary)]/15 shadow-sm">
            <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase">Publicados</span>
            <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">{publishedCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--primary)]/15 shadow-sm">
            <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase">Requieren Revisión</span>
            <p className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-1">{reviewNeededCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--primary)]/15 shadow-sm">
            <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase">Promedio General</span>
            <p className="text-2xl font-bold font-serif text-[var(--primary)] mt-1">{averageScore} pts</p>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-xs font-semibold text-[var(--foreground)]/60 mr-2">Filtrar por:</span>
          {['ALL', 'EN_REVISION', 'REVISION_DOCENTE', 'PUBLISHED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-[var(--primary)] text-white shadow'
                  : 'bg-[var(--surface)] text-[var(--foreground)]/70 hover:bg-[var(--primary)]/10 border border-[var(--primary)]/15'
              }`}
            >
              {st === 'ALL' && 'Todos los Alumnos'}
              {st === 'EN_REVISION' && 'En Revisión (IA Exitosa)'}
              {st === 'REVISION_DOCENTE' && 'Requiere Revisión Manual'}
              {st === 'PUBLISHED' && 'Publicados'}
            </button>
          ))}
        </div>

        {/* Tabla de Evaluaciones */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--primary)]/15 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[var(--foreground)]/60">
              Cargando evaluaciones del examen...
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--foreground)]/60">
              No hay evaluaciones registradas con el filtro seleccionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--primary)]/15 bg-[var(--surface-inset)]/60 text-xs uppercase font-bold text-[var(--foreground)]/70">
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Matrícula</th>
                    <th className="py-3 px-4 text-center">Hojas JPG</th>
                    <th className="py-3 px-4 text-right">Nota IA</th>
                    <th className="py-3 px-4 text-right">Nota Final</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--primary)]/10">
                  {filteredEvaluations.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--primary)]/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--foreground)]">
                        {item.student_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--foreground)]/80">
                        {item.student_identifier}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--primary)]/10 font-semibold text-[var(--primary)]">
                          {item.pages_count ?? 1} pág.
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--foreground)]/70">
                        {item.ai_total_score} pts
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[var(--primary)]">
                        {item.final_score} pts
                        {item.is_score_overridden && (
                          <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                            (Ajustada)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          item.status === 'PUBLICADO'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : item.status === 'REVISION_DOCENTE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
                        >
                          Auditar / Ajustar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Modal de Detalle con Visor Dividido */}
      {selectedEvaluation && (
        <EvaluationDetailModal
          evaluation={selectedEvaluation}
          isOpen={!!selectedEvaluation}
          onClose={() => setSelectedEvaluation(null)}
          onGradeUpdated={handleGradeUpdated}
        />
      )}
    </div>
  );
}
