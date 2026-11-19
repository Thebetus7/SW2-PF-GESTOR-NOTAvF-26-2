'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentEvaluation, GradeDetail } from '@/types';
import { Navbar } from '@/components/ui/Navbar';
import { apiClient, API_BASE_URL } from '@/lib/api';
import {
  GraduationCap,
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  X,
  FileCheck2,
  Calendar,
} from 'lucide-react';

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
    // Asegurar rol estudiante para aislamiento estricto
    localStorage.setItem('user_role', 'STUDENT');
    const storedName = localStorage.getItem('user_name');
    if (storedName) setStudentName(storedName);

    fetchStudentEvaluations();
  }, []);

  const fetchStudentEvaluations = async (customId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      const endpoint = customId
        ? `/evaluations/?student_identifier=${encodeURIComponent(customId)}`
        : `/evaluations/`;

      const data = await apiClient<any>(endpoint, { token });
      const list: StudentEvaluation[] = data.results || data || [];

      // Aislamiento estricto: solo evaluaciones oficialmente publicadas
      const published = list.filter(
        (e) => e.is_published === true || e.status === 'PUBLICADO'
      );
      setEvaluations(published);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Intentar login por ID de estudiante
      const authData = await apiClient<any>('/auth/student-id-login/', {
        method: 'POST',
        body: JSON.stringify({ student_id_code: studentIdInput.trim() }),
      });

      localStorage.setItem('access_token', authData.access);
      if (authData.refresh) localStorage.setItem('refresh_token', authData.refresh);
      localStorage.setItem('user_role', 'STUDENT');
      localStorage.setItem('user_name', authData.user.name);
      localStorage.setItem('user', JSON.stringify(authData.user));
      setStudentName(authData.user.name);

      await fetchStudentEvaluations(studentIdInput.trim());
    } catch (err: any) {
      setErrorMessage(err.message || 'Estudiante no registrado con esa matrícula');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (item: StudentEvaluation) => {
    // Guardia de seguridad: no abrir borradores
    if (!item.is_published && item.status !== 'PUBLICADO') {
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || '';
      const full = await apiClient<StudentEvaluation>(`/evaluations/${item.id}/`, { token });
      setSelectedEvaluation(full);
    } catch {
      setSelectedEvaluation(item);
    }
    setSelectedPageIndex(0);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      {/* Navbar aislado con rol explícito STUDENT */}
      <Navbar userRole="STUDENT" userName={studentName || 'Estudiante'} />

      <main style={{ maxWidth: '1140px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Cabecera del Portal del Estudiante */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-inset)', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <GraduationCap size={15} />
              <span>Portal de Calificaciones Oficiales</span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '2.25rem',
                color: 'var(--color-primary)',
                marginBottom: '0.25rem',
              }}
            >
              {studentName ? `Bienvenido/a, ${studentName}` : 'Portal del Estudiante'}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>
              Consulte sus exámenes calificados, puntajes oficiales, transcripción OCR y retroalimentación pedagógica.
            </p>
          </div>

          {/* Formulario de consulta rápida por ID / Matrícula */}
          <form
            onSubmit={handleConsultById}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-surface)',
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-warm-sm)',
            }}
          >
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Matrícula (ej. EST-2026-001)"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text)',
                width: '180px',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              Consultar
            </button>
          </form>
        </div>

        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-error)',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{errorMessage}</span>
          </div>
        )}

        {/* Listado de Exámenes Oficialmente Publicados */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.4rem',
                color: 'var(--color-text)',
              }}
            >
              Mis Evaluaciones Publicadas
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Total: <strong>{evaluations.length}</strong> {evaluations.length === 1 ? 'examen' : 'exámenes'}
            </span>
          </div>

          {isLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                Cargando sus exámenes evaluados...
              </p>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <FileText size={44} color="var(--color-primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.35rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                No tiene exámenes publicados en este momento
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto' }}>
                Una vez que su docente finalice la revisión y publique las calificaciones oficiales, podrá consultar aquí su examen digitalizado con retroalimentación.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {evaluations.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 'var(--radius-xl)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                        }}
                      >
                        <CheckCircle size={12} />
                        <span>PUBLICADO</span>
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Reciente'}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                      {item.student_name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
                      Matrícula: {item.student_identifier}
                    </p>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block' }}>
                        Nota Final
                      </span>
                      <strong style={{ fontSize: '1.5rem', fontFamily: 'var(--font-headline)', color: 'var(--color-primary)' }}>
                        {item.final_score} pts
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDetail(item)}
                      className="btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Eye size={14} />
                      <span>Ver Respuestas</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de Detalle Estudiantil Accesible */}
      {selectedEvaluation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedEvaluation(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-warm-lg)',
              maxWidth: '960px',
              width: '100%',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'scaleIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-inset)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-headline)', color: 'var(--color-primary)' }}>
                  Evaluación Calificada — {selectedEvaluation.student_name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Puntaje obtenido:{' '}
                  <strong style={{ color: 'var(--color-primary)' }}>{selectedEvaluation.final_score} pts</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvaluation(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido dividido en 2 columnas */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
              {/* Hoja Escaneada */}
              <div
                style={{
                  width: '50%',
                  padding: '1rem',
                  borderRight: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-inset)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    Hoja Escaneada ({selectedEvaluation.pages?.length || 0})
                  </span>
                  {(selectedEvaluation.pages?.length || 0) > 1 && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {selectedEvaluation.pages?.map((p, idx) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPageIndex(idx)}
                          className={selectedPageIndex === idx ? 'btn-primary' : 'btn-secondary'}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                        >
                          Pág {p.page_number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    overflow: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                  }}
                >
                  {selectedEvaluation.pages && selectedEvaluation.pages[selectedPageIndex] ? (
                    <img
                      src={
                        selectedEvaluation.pages[selectedPageIndex].image_url ||
                        selectedEvaluation.pages[selectedPageIndex].image ||
                        '/placeholder-exam.jpg'
                      }
                      alt="Hoja de examen del alumno"
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
                    />
                  ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      Fotografía digitalizada no disponible
                    </p>
                  )}
                </div>
              </div>

              {/* Rúbricas y Retroalimentación */}
              <div style={{ width: '50%', padding: '1.25rem', overflowY: 'auto' }}>
                <h4
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-primary)',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  Desglose de Preguntas y Respuestas
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(selectedEvaluation.grades || []).map((grade, idx) => (
                    <div
                      key={grade.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface-inset)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
                          P{grade.order || idx + 1}: {grade.component_prompt}
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-primary)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {grade.final_score} / {grade.max_score} pts
                        </span>
                      </div>

                      <div style={{ backgroundColor: 'var(--color-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block' }}>
                          Lo que respondiste (Transcripción OCR):
                        </span>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                          {grade.transcribed_answer || 'Sin respuesta registrada.'}
                        </p>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        <strong style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                          Retroalimentación Pedagógica:
                        </strong>
                        <p style={{ margin: '0.2rem 0 0' }}>{grade.ai_feedback}</p>
                      </div>

                      {grade.teacher_comment && (
                        <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-warning-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-warning)', fontSize: '0.8rem' }}>
                          <strong style={{ color: 'var(--color-warning)', display: 'block', fontSize: '0.72rem' }}>
                            Nota del Docente:
                          </strong>
                          <p style={{ margin: '0.15rem 0 0' }}>{grade.teacher_comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
