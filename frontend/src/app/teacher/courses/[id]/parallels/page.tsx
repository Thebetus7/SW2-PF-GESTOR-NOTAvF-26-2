'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ParallelModal, ParallelData } from '@/components/ui/ParallelModal';
import { apiClient } from '@/lib/api';
import {
  Users,
  PlusCircle,
  FileText,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Calendar,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface ParallelItem {
  id: string;
  subject: string;
  subject_name?: string;
  group_code: string;
  period: string;
  student_count: number;
}

interface SubjectDetail {
  id: string;
  code: string;
  name: string;
  description?: string;
  parallels?: ParallelItem[];
}

export default function SubjectParallelsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [parallels, setParallels] = useState<ParallelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!subjectId) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token') || '';

      // Cargar materia
      const subData = await apiClient<SubjectDetail>(`/academics/subjects/${subjectId}/`, { token });
      setSubject(subData);

      // Cargar paralelos del docente para esta materia
      const parData = await apiClient<ParallelItem[]>(`/academics/parallels/?subject_id=${subjectId}`, { token });
      setParallels(parData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las aulas de la materia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const handleModalSuccess = (saved: ParallelData) => {
    fetchData();
  };

  const breadcrumbItems = [
    { label: 'Mis Materias', href: '/teacher/courses' },
    {
      label: subject ? `${subject.code} - ${subject.name}` : 'Materia',
      href: `/teacher/courses/${subjectId}/parallels`,
    },
    { label: 'Aulas y Paralelos', active: true },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <Navbar userRole="TEACHER" userName="Profesor Evaluador" />

      <main style={{ maxWidth: '1140px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Barra de Migas de Pan */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Encabezado Contextual de la Materia */}
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link
                href="/teacher/courses"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={16} />
                <span>Volver a Materias</span>
              </Link>
              {subject && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    backgroundColor: 'var(--color-surface-inset)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {subject.code}
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '2rem',
                color: 'var(--color-primary)',
                marginBottom: '0.25rem',
              }}
            >
              {subject ? subject.name : 'Aulas de la Asignatura'}
            </h1>
            {subject?.description && (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', maxWidth: '700px' }}>
                {subject.description}
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <PlusCircle size={18} />
              <span>+ Aperturar Nueva Aula</span>
            </button>
          </div>
        </header>

        {/* Mensaje de Error */}
        {error && (
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
            <span style={{ fontSize: '0.9rem', flex: 1 }}>{error}</span>
            <button
              type="button"
              onClick={fetchData}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Listado de Aulas */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-secondary)' }}>
            <Layers size={36} color="var(--color-primary)" style={{ margin: '0 auto 1rem', animation: 'pulse 1.5s infinite' }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando aulas de la asignatura...</p>
          </div>
        ) : parallels.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <Users
              size={48}
              color="var(--color-primary)"
              style={{ margin: '0 auto 1.25rem', opacity: 0.8 }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.5rem',
                color: 'var(--color-primary)',
                marginBottom: '0.5rem',
              }}
            >
              No hay aulas aperturadas para esta materia
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
                maxWidth: '460px',
                margin: '0 auto 1.5rem',
              }}
            >
              Aperture su primer grupo o paralelo (ej. Grupo A, Turno Mañana) para programar exámenes y calificar pruebas.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
              style={{ margin: '0 auto' }}
            >
              <PlusCircle size={18} />
              <span>+ Aperturar Primera Aula</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {parallels.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        backgroundColor: 'var(--color-surface-inset)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      Aula {p.group_code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Calendar size={13} />
                      <span>{p.period}</span>
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '1.25rem',
                      color: 'var(--color-text)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Paralelo {p.group_code} — {p.period}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '1rem',
                    }}
                  >
                    <Users size={16} color="var(--color-primary)" />
                    <span>
                      <strong>{p.student_count || 0}</strong> estudiantes inscritos
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <Link
                    href={`/teacher/exams/builder?parallel_id=${p.id}`}
                    className="btn-secondary"
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.45rem 0.75rem',
                      textDecoration: 'none',
                    }}
                  >
                    <PlusCircle size={14} />
                    <span>+ Diseñar Examen</span>
                  </Link>

                  <Link
                    href={`/teacher/parallels/${p.id}/exams`}
                    className="btn-primary"
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.45rem 0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Ver Exámenes</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal para Crear Paralelo */}
      <ParallelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        subjectId={subjectId}
        subjectName={subject ? `${subject.code} - ${subject.name}` : undefined}
      />
    </div>
  );
}
