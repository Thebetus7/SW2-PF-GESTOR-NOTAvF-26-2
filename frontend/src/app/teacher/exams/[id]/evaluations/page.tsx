'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { StudentEvaluation } from '@/types';
import { Navbar } from '@/components/ui/Navbar';
import { EvaluationDetailModal } from '@/components/evaluations/EvaluationDetailModal';
import { apiClient } from '@/lib/api';

interface Exam {
  title: string;
  parallel: string;
}

interface EnrolledStudent {
  id: string;
  full_name: string;
  student_id_code: string;
}

interface ExamRoster {
  exam: Exam;
  students: EnrolledStudent[];
  evaluations: StudentEvaluation[];
}

const detailClass = 'btn-secondary text-xs';

export default function TeacherExamEvaluationsPage() {
  const { id } = useParams<{ id: string }>();
  return <ExamRosterPage key={id} examId={id} />;
}

function ExamRosterPage({ examId }: { examId: string }) {
  const [roster, setRoster] = useState<ExamRoster | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<StudentEvaluation | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<EnrolledStudent | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const unscannedDialog = useRef<HTMLDialogElement>(null);

  const loadRoster = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      const options = { token, signal };
      const exam = await apiClient<Exam>(`/exams/exams/${examId}/`, options);
      const [students, evaluationData] = await Promise.all([
        apiClient<EnrolledStudent[]>(`/academics/parallels/${exam.parallel}/students/`, options),
        apiClient<StudentEvaluation[] | { results: StudentEvaluation[] }>(
          `/evaluations/?exam_id=${examId}`, options
        ),
      ]);
      if (signal?.aborted) return;

      setRoster({
        exam,
        students: [...students].sort((a, b) => a.full_name.localeCompare(b.full_name, 'es')),
        evaluations: Array.isArray(evaluationData) ? evaluationData : evaluationData.results,
      });
    } catch (error) {
      if (!signal?.aborted) {
        setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el listado.');
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadRoster(controller.signal);
    return () => controller.abort();
  }, [loadRoster]);

  useEffect(() => {
    if (selectedStudent) unscannedDialog.current?.showModal();
  }, [selectedStudent]);

  const handleOpenDetail = async (evaluation: StudentEvaluation) => {
    setActionError(null);
    setLoadingDetailId(evaluation.id);
    try {
      const token = localStorage.getItem('access_token') || '';
      const detail = await apiClient<StudentEvaluation>(`/evaluations/${evaluation.id}/`, { token });
      setSelectedEvaluation(detail);
    } catch {
      setActionError('No se pudieron cargar los detalles de la entrega. Vuelve a intentarlo.');
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleGradeUpdated = (updated: StudentEvaluation) => {
    setSelectedEvaluation(updated);
    setRoster((current) => current && ({
      ...current,
      evaluations: current.evaluations.map((evaluation) =>
        evaluation.id === updated.id ? { ...evaluation, ...updated } : evaluation
      ),
    }));
  };

  const handlePublishAll = async () => {
    if (!confirm('¿Deseas publicar las calificaciones? Quedarán visibles para los estudiantes.')) {
      return;
    }

    setIsPublishing(true);
    setFeedback(null);
    setActionError(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      const data = await apiClient<{ message?: string }>(`/evaluations/exams/${examId}/publish/`, {
        method: 'POST',
        token,
      });
      setFeedback(data.message || 'Calificaciones publicadas.');
      await loadRoster();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudieron publicar las calificaciones.');
    } finally {
      setIsPublishing(false);
    }
  };

  const evaluationsByStudent = new Map<string, StudentEvaluation[]>(
    roster?.students.map((student) => [student.id, []])
  );
  const otherEvaluations: StudentEvaluation[] = [];
  for (const evaluation of roster?.evaluations ?? []) {
    const entries = evaluationsByStudent.get(evaluation.student ?? '');
    if (entries) entries.push(evaluation);
    else otherEvaluations.push(evaluation);
  }

  const students = (roster?.students ?? []).map((student) => {
    const entries = evaluationsByStudent.get(student.id) ?? [];
    return {
      ...student,
      entries,
      scanned: entries.some((evaluation) => (evaluation.pages_count ?? 0) > 0),
    };
  });
  const scannedCount = students.filter((student) => student.scanned).length;

  const evaluationButton = (evaluation: StudentEvaluation, label = 'Detalles') => (
    <button
      key={evaluation.id}
      type="button"
      className={detailClass}
      disabled={loadingDetailId !== null}
      onClick={() => void handleOpenDetail(evaluation)}
    >
      {loadingDetailId === evaluation.id ? 'Cargando…' : label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar userRole="TEACHER" userName="Profesor Evaluador" />

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            {roster && (
              <Link
                href={`/teacher/parallels/${roster.exam.parallel}/exams`}
                className="mb-2 inline-block text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                ← Volver a los parciales
              </Link>
            )}
            <h1 className="font-serif text-3xl font-bold text-[var(--primary)]">
              {roster?.exam.title ?? 'Estudiantes del parcial'}
            </h1>
          </div>
          <button
            type="button"
            className="btn-primary disabled:opacity-50"
            disabled={isLoading || isPublishing || !roster?.evaluations.length}
            onClick={() => void handlePublishAll()}
          >
            {isPublishing ? 'Publicando…' : 'Publicar calificaciones'}
          </button>
        </header>

        {feedback && <p role="status" className="mb-4 text-sm">{feedback}</p>}
        {actionError && (
          <p role="alert" className="mb-4 text-sm text-[var(--color-error)]">{actionError}</p>
        )}
        {loadError && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p role="alert" className="text-sm text-[var(--color-error)]">
              No se pudo actualizar el listado. {loadError}
            </p>
            <button type="button" className="btn-secondary" onClick={() => void loadRoster()}>
              Reintentar
            </button>
          </div>
        )}

        {isLoading && <p role="status" className="mb-4 text-sm">Cargando estudiantes y escaneos…</p>}
        {roster && (
          <>
            <section aria-labelledby="roster-heading" className="card overflow-hidden !p-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-4">
                <h2 id="roster-heading" className="font-serif text-xl font-bold">Estudiantes inscritos</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {scannedCount} de {students.length} con escaneo
                </p>
              </div>
              {students.length === 0 ? (
                <p className="px-4 pb-5 text-sm">Este paralelo todavía no tiene estudiantes inscritos.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-y border-[var(--color-border)] bg-[var(--color-surface-inset)]">
                      <tr>
                        <th scope="col" className="px-4 py-3">Estudiante</th>
                        <th scope="col" className="px-4 py-3">Matrícula</th>
                        <th scope="col" className="px-4 py-3">Escaneo</th>
                        <th scope="col" className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <th scope="row" className="px-4 py-3 font-semibold">{student.full_name}</th>
                          <td className="px-4 py-3 font-mono text-xs">{student.student_id_code}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                              student.scanned
                                ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                                : 'bg-[var(--color-surface-inset)] text-[var(--color-text-secondary)]'
                            }`}>
                              {student.scanned ? 'Escaneado' : 'Sin escaneo'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {student.entries.length ? student.entries.map((evaluation, index) =>
                                evaluationButton(evaluation, student.entries.length > 1 ? `Detalles ${index + 1}` : 'Detalles')
                              ) : (
                                <button
                                  type="button"
                                  className={detailClass}
                                  disabled={loadingDetailId !== null}
                                  onClick={() => setSelectedStudent(student)}
                                >
                                  Detalles
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {otherEvaluations.length > 0 && (
              <section aria-labelledby="other-evaluations-heading" className="card mt-6">
                <h2 id="other-evaluations-heading" className="mb-2 font-serif text-xl font-bold">
                  Entregas sin vínculo con la lista del paralelo
                </h2>
                <ul className="divide-y divide-[var(--color-border)]">
                  {otherEvaluations.map((evaluation) => (
                    <li key={evaluation.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <span>{evaluation.student_name} · {evaluation.student_identifier}</span>
                      {evaluationButton(evaluation)}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>

      <dialog
        ref={unscannedDialog}
        aria-labelledby="student-detail-heading"
        onClose={() => setSelectedStudent(null)}
        className="card m-auto w-[calc(100%-2rem)] max-w-md text-[var(--color-text)] backdrop:bg-black/60"
      >
        {selectedStudent && (
          <>
            <h2 id="student-detail-heading" className="font-serif text-xl font-bold">{selectedStudent.full_name}</h2>
            <p className="mt-1 text-sm">Matrícula {selectedStudent.student_id_code}</p>
            <p className="my-4 text-sm">Este estudiante todavía no tiene un escaneo registrado para este parcial.</p>
            <form method="dialog">
              <button className="btn-secondary">Cerrar</button>
            </form>
          </>
        )}
      </dialog>

      {selectedEvaluation && (
        <EvaluationDetailModal
          evaluation={selectedEvaluation}
          isOpen
          onClose={() => setSelectedEvaluation(null)}
          onGradeUpdated={handleGradeUpdated}
        />
      )}
    </div>
  );
}
