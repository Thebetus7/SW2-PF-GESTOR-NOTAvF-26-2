'use client';

import React, { useState } from 'react';
import { StudentEvaluation, GradeDetail } from '@/types';

interface Props {
  evaluation: StudentEvaluation;
  isOpen: boolean;
  onClose: () => void;
  onGradeUpdated: (updatedEval: StudentEvaluation) => void;
}

export const EvaluationDetailModal: React.FC<Props> = ({
  evaluation,
  isOpen,
  onClose,
  onGradeUpdated,
}) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<string>('');
  const [tempComment, setTempComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const pages = evaluation.pages || [];
  const grades = evaluation.grades || [];
  const currentPage = pages[selectedPageIndex];

  const handleStartEdit = (grade: GradeDetail) => {
    setEditingGradeId(grade.id);
    setTempScore(String(grade.final_score));
    setTempComment(grade.teacher_comment || '');
    setErrorMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingGradeId(null);
    setTempScore('');
    setTempComment('');
    setErrorMessage(null);
  };

  const handleSaveGrade = async (gradeId: string, maxScore: number) => {
    const numScore = parseFloat(tempScore);
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      setErrorMessage(`El puntaje debe ser un número entre 0 y ${maxScore}.`);
      return;
    }
    if (!tempComment.trim() || tempComment.trim().length < 5) {
      setErrorMessage('Debe ingresar un comentario justificativo de al menos 5 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/api/v1/evaluations/${evaluation.id}/grades/${gradeId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          final_score: numScore,
          teacher_comment: tempComment.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al guardar el ajuste de calificación');
      }

      const updatedData: StudentEvaluation = await res.json();
      onGradeUpdated(updatedData);
      setEditingGradeId(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al comunicar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] text-[var(--foreground)] w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--primary)]/20 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-[var(--primary)]/15 flex items-center justify-between bg-[var(--surface-inset)]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-serif text-[var(--primary)]">
                {evaluation.student_name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 font-mono text-[var(--primary)] font-semibold">
                Matrícula: {evaluation.student_identifier}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                evaluation.status === 'PUBLICADO'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                  : evaluation.status === 'REVISION_DOCENTE'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
              }`}>
                {evaluation.status}
              </span>
            </div>
            <p className="text-xs text-[var(--foreground)]/70 mt-1">
              Nota IA: <span className="font-semibold">{evaluation.ai_total_score} pts</span> | Nota Final: <span className="font-bold text-[var(--primary)]">{evaluation.final_score} pts</span> {evaluation.is_score_overridden && '(Ajustada por docente)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--primary)]/10 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo Dividido (50% Visor Foto JPG - 50% Rúbrica y Transcripción) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Lado Izquierdo: Visor de Hoja Digitalizada JPG */}
          <div className="md:w-1/2 p-4 bg-black/5 dark:bg-black/30 border-r border-[var(--primary)]/15 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--foreground)]/80">
                Hojas Físicas Digitalizadas ({pages.length})
              </span>
              {pages.length > 1 && (
                <div className="flex items-center gap-1">
                  {pages.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPageIndex(idx)}
                      className={`px-2 py-0.5 text-xs rounded font-medium transition-all ${
                        selectedPageIndex === idx
                          ? 'bg-[var(--primary)] text-white shadow'
                          : 'bg-[var(--surface)] text-[var(--foreground)]/70 hover:bg-[var(--primary)]/10'
                      }`}
                    >
                      Pág {p.page_number}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 rounded-xl border border-[var(--primary)]/20 overflow-auto bg-black/40 flex items-center justify-center p-2 relative group">
              {currentPage ? (
                <img
                  src={currentPage.image_url || currentPage.image || '/placeholder-exam.jpg'}
                  alt={`Página ${currentPage.page_number}`}
                  className="max-h-full max-w-full object-contain rounded shadow-lg transition-transform"
                />
              ) : (
                <div className="text-center text-white/50 text-sm">
                  No hay imagen de página digitalizada disponible.
                </div>
              )}
            </div>
            {currentPage?.qr_data && (
              <p className="text-[10px] text-[var(--foreground)]/60 mt-2 font-mono truncate">
                QR Calibración: {currentPage.qr_data}
              </p>
            )}
          </div>

          {/* Lado Derecho: Transcripción OCR, Feedback IA y Ajuste Manual */}
          <div className="md:w-1/2 p-6 overflow-y-auto space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--primary)] border-b border-[var(--primary)]/15 pb-2">
              Detalle y Auditoría de Componentes
            </h3>

            {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 rounded-lg text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {grades.length === 0 ? (
              <p className="text-sm text-[var(--foreground)]/60">
                No se encontraron componentes evaluados para este examen.
              </p>
            ) : (
              grades.map((grade, index) => {
                const isEditing = editingGradeId === grade.id;

                return (
                  <div
                    key={grade.id}
                    className={`p-4 rounded-xl border transition-all ${
                      grade.is_overridden
                        ? 'border-amber-400 bg-amber-500/5'
                        : 'border-[var(--primary)]/20 bg-[var(--surface-inset)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-[var(--foreground)]">
                        {grade.order || index + 1}. {grade.component_prompt}
                      </h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] whitespace-nowrap">
                        {grade.final_score} / {grade.max_score} pts
                      </span>
                    </div>

                    {/* Transcripción manuscrita */}
                    <div className="mb-2">
                      <span className="text-[11px] font-semibold text-[var(--foreground)]/70 uppercase">
                        Respuesta Manuscrita Detectada (OCR):
                      </span>
                      <p className="text-xs bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--primary)]/15 font-mono text-[var(--foreground)]/90 mt-1 whitespace-pre-wrap">
                        {grade.transcribed_answer || 'Sin respuesta manuscrita legible.'}
                      </p>
                    </div>

                    {/* Feedback generado por IA */}
                    <div className="mb-3">
                      <span className="text-[11px] font-semibold text-[var(--foreground)]/70 uppercase">
                        Criterio y Feedback de IA:
                      </span>
                      <p className="text-xs text-[var(--foreground)]/80 mt-0.5">
                        {grade.ai_feedback || 'Calificado automáticamente.'}
                      </p>
                    </div>

                    {/* Observación del docente si hubo ajuste */}
                    {grade.is_overridden && !isEditing && (
                      <div className="mb-3 p-2 bg-amber-100 dark:bg-amber-950/40 rounded border border-amber-300 dark:border-amber-800 text-xs">
                        <span className="font-semibold text-amber-900 dark:text-amber-200">
                          Ajuste Docente Registrado:
                        </span>
                        <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                          {grade.teacher_comment}
                        </p>
                      </div>
                    )}

                    {/* Formulario de Edición Manual */}
                    {isEditing ? (
                      <div className="mt-3 p-3 bg-[var(--surface)] rounded-xl border border-[var(--primary)]/30 space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-semibold text-[var(--foreground)]">
                            Nueva Nota (máx {grade.max_score}):
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={grade.max_score}
                            value={tempScore}
                            onChange={(e) => setTempScore(e.target.value)}
                            className="w-24 px-2 py-1 text-sm border rounded bg-[var(--surface-inset)] border-[var(--primary)]/30 text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[var(--foreground)] block mb-1">
                            Observación / Justificación (Visible para el estudiante):
                          </label>
                          <textarea
                            rows={2}
                            value={tempComment}
                            onChange={(e) => setTempComment(e.target.value)}
                            placeholder="Explique el motivo del cambio de calificación..."
                            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-[var(--surface-inset)] border-[var(--primary)]/30 text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="px-3 py-1 text-xs text-[var(--foreground)]/70 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveGrade(grade.id, grade.max_score)}
                            disabled={isSubmitting}
                            className="px-3 py-1 text-xs font-bold text-white bg-[var(--primary)] hover:opacity-90 rounded shadow"
                          >
                            {isSubmitting ? 'Guardando...' : 'Aplicar Ajuste'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(grade)}
                          className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                        >
                          ✎ Ajustar Calificación Manualmente
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
