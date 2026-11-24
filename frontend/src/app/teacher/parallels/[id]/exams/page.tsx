'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { apiClient, API_BASE_URL } from '@/lib/api';
import {
  FileText,
  PlusCircle,
  Calendar,
  Award,
  QrCode,
  Download,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Layers,
  Edit3,
} from 'lucide-react';

interface ExamItem {
  id: string;
  parallel: string;
  parallel_name?: string;
  title: string;
  description?: string;
  application_date: string;
  total_score: number;
  has_qr_code: boolean;
  components?: any[];
  components_sum?: number;
  created_at: string;
}

interface ParallelDetail {
  id: string;
  subject: string;
  subject_name?: string;
  subject_code?: string;
  group_code: string;
  period: string;
  student_count?: number;
}

export default function ParallelExamsPage() {
  const params = useParams();
  const router = useRouter();
  const parallelId = params.id as string;

  const [parallel, setParallel] = useState<ParallelDetail | null>(null);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!parallelId) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token') || '';

      // 1. Obtener datos del aula / paralelo
      const parData = await apiClient<ParallelDetail>(`/academics/parallels/${parallelId}/`, { token });
      setParallel(parData);

      // 2. Obtener lista de exámenes para este paralelo
      const examsData = await apiClient<ExamItem[]>(`/exams/exams/?parallel_id=${parallelId}`, { token });
      setExams(examsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los exámenes del aula.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [parallelId]);

  const downloadPdf = (examId: string, mode: 'with_qr' | 'without_qr') => {
    const url = `${API_BASE_URL}/exams/exams/${examId}/export-pdf/?mode=${mode}`;
    window.open(url, '_blank');
  };

  const subjectUrl = parallel?.subject
    ? `/teacher/courses/${parallel.subject}/parallels`
    : '/teacher/courses';

  const breadcrumbItems = [
    { label: 'Mis Materias', href: '/teacher/courses' },
    {
      label: parallel?.subject_name || 'Aulas',
      href: subjectUrl,
    },
    {
      label: parallel ? `Aula ${parallel.group_code} (${parallel.period})` : 'Aula',
      href: `/teacher/parallels/${parallelId}/exams`,
    },
    { label: 'Exámenes Parciales', active: true },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <Navbar userRole="TEACHER" userName="Profesor Evaluador" />

      <main style={{ maxWidth: '1140px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Migas de Pan */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Encabezado Contextual */}
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
                href={subjectUrl}
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
                <span>Volver a Aulas</span>
              </Link>
              {parallel && (
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
                  Aula {parallel.group_code} ({parallel.period})
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
              Exámenes y Evaluaciones
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              {parallel?.subject_name
                ? `Materia: ${parallel.subject_name}. `
                : ''}
              Gestione las pruebas físicas, imprima hojas con QR y califique exámenes con IA.
            </p>
          </div>

          <div>
            <Link
              href={`/teacher/exams/builder?parallel_id=${parallelId}`}
              className="btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <PlusCircle size={18} />
              <span>+ Nuevo Examen</span>
            </Link>
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

        {/* Listado de Exámenes */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-secondary)' }}>
            <Layers size={36} color="var(--color-primary)" style={{ margin: '0 auto 1rem', animation: 'pulse 1.5s infinite' }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando evaluaciones del aula...</p>
          </div>
        ) : exams.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <FileText
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
              No hay exámenes registrados para esta aula
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
                maxWidth: '480px',
                margin: '0 auto 1.5rem',
              }}
            >
              Diseñe su primera prueba en el Constructor Modular de Exámenes definiendo preguntas abiertas, selección múltiple y calibración con QR.
            </p>
            <Link
              href={`/teacher/exams/builder?parallel_id=${parallelId}`}
              className="btn-primary"
              style={{ margin: '0 auto', textDecoration: 'none' }}
            >
              <PlusCircle size={18} />
              <span>+ Crear Primer Examen</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem 2rem',
                }}
              >
                {/* Datos del Examen */}
                <div style={{ flex: '1 1 360px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-inset)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      Puntaje: {exam.total_score} pts
                    </span>
                    {exam.has_qr_code && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                        }}
                      >
                        <QrCode size={12} />
                        <span>Calibrado QR</span>
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '1.35rem',
                      color: 'var(--color-text)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {exam.title}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      fontSize: '0.825rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="var(--color-primary)" />
                      <span>Fecha: {exam.application_date}</span>
                    </span>
                    {exam.components && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Award size={14} color="var(--color-primary)" />
                        <span>{exam.components.length} preguntas / rúbricas</span>
                      </span>
                    )}
                  </div>

                  {exam.description && (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '0.5rem',
                      }}
                    >
                      {exam.description}
                    </p>
                  )}
                </div>

                {/* Botones de Acción */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
                  {/* Descarga de PDF */}
                  <button
                    type="button"
                    onClick={() => downloadPdf(exam.id, 'with_qr')}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
                    title="Descargar PDF imprimible con QR calibrado"
                  >
                    <Download size={14} />
                    <span>PDF QR</span>
                  </button>

                  {/* Constructor */}
                  <Link
                    href={`/teacher/exams/builder?parallel_id=${parallelId}&exam_id=${exam.id}`}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem', textDecoration: 'none' }}
                    title="Editar rúbricas en el constructor"
                  >
                    <Edit3 size={14} />
                    <span>Constructor</span>
                  </Link>

                  {/* Revisar Calificaciones */}
                  <Link
                    href={`/teacher/exams/${exam.id}/evaluations`}
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
                  >
                    <span>Ver estudiantes</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
