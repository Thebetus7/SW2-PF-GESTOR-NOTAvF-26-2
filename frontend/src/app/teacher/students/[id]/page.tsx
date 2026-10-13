'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { apiClient } from '@/lib/api';
import { GraduationCap, ArrowLeft, BookOpen, Calendar, Mail, Hash, AlertCircle } from 'lucide-react';

interface StudentCourseItem {
  parallelId: string;
  subjectName: string;
  subjectCode: string;
  groupCode: string;
  period: string;
  enrolledAt: string;
}

interface StudentDetailData {
  id: string;
  student_id_code: string;
  full_name: string;
  email: string | null;
  created_at: string;
  courses: StudentCourseItem[];
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token') || '';
        const data = await apiClient<StudentDetailData>(`/academics/students/${studentId}/`, { token });
        setStudent(data);
      } catch (err: any) {
        setError(err.message || 'Error al obtener la ficha del estudiante');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  return (
    <div>
      <Navbar userRole="TEACHER" userName="Profesor Evaluador" />

      <main style={{ maxWidth: '860px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <button
          onClick={() => router.back()}
          className="btn-secondary"
          style={{ marginBottom: '1.5rem', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
          type="button"
        >
          <ArrowLeft size={16} />
          <span>Volver al Listado</span>
        </button>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '3rem 0' }}>
            Cargando ficha del alumno...
          </p>
        ) : !student ? (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '3rem 0' }}>
            No se encontró el estudiante especificado.
          </p>
        ) : (
          <div>
            {/* Cabecera del Perfil */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-xl)' }}>
                  <GraduationCap size={40} color="var(--color-primary)" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>{student.full_name}</h1>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'var(--color-surface-inset)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    MATRÍCULA: {student.student_id_code}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  <Mail size={16} />
                  <span>{student.email || 'Sin correo registrado'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  <Calendar size={16} />
                  <span>Registrado: {new Date(student.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Materias Cursadas / Inscripciones */}
            <section className="card">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="var(--color-primary)" />
                <span>Asignaturas y Aulas Inscritas</span>
              </h2>

              {student.courses.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  El estudiante no cuenta con inscripciones activas en ningún aula.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {student.courses.map((c) => (
                    <div
                      key={c.parallelId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: 'var(--color-surface-inset)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {c.subjectName} ({c.subjectCode})
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          Aula {c.groupCode} — Gestión {c.period}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Inscrito: {new Date(c.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
