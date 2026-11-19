'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { SubjectModal, SubjectData } from '@/components/ui/SubjectModal';
import { apiClient } from '@/lib/api';
import {
  BookOpen,
  PlusCircle,
  AlertCircle,
  Users,
  ChevronRight,
  Edit2,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface ParallelItem {
  id: string;
  group_code: string;
  period: string;
  student_count: number;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  description: string;
  parallels?: ParallelItem[];
}

export default function TeacherCoursesPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del modal de materias
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<SubjectItem | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      const data = await apiClient<SubjectItem[]>('/academics/subjects/', { token });
      setSubjects(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las materias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCreateModal = () => {
    setSubjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: SubjectItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubjectToEdit(subject);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedSubject: SubjectData) => {
    fetchCourses();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <Navbar userRole="TEACHER" userName="Profesor Evaluador" />

      <main className="max-w-6xl mx-auto my-4 sm:my-8 px-3 sm:px-6">
        {/* Cabecera con Título y Acción Primaria Modal */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-headline text-2xl sm:text-3xl text-[var(--color-primary)] mb-1">
              Mis Materias
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Catálogo de asignaturas asignadas. Seleccione una materia para administrar sus aulas y exámenes.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={fetchCourses}
              className="btn-secondary p-2.5"
              title="Refrescar catálogo"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="btn-primary flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <PlusCircle size={18} />
              <span>+ Nueva Materia</span>
            </button>
          </div>
        </header>

        {/* Alerta de Error si ocurre */}
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
              onClick={fetchCourses}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grilla Limpia de Catálogo de Materias */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Layers size={36} color="var(--color-primary)" style={{ margin: '0 auto 1rem', animation: 'pulse 1.5s infinite' }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>Cargando catálogo de asignaturas...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <BookOpen
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
              Aún no tiene materias registradas
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
                maxWidth: '480px',
                margin: '0 auto 1.5rem',
              }}
            >
              Comience creando su primera materia académica mediante el botón superior para habilitar aulas y evaluaciones.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="btn-primary"
              style={{ margin: '0 auto' }}
            >
              <PlusCircle size={18} />
              <span>+ Registrar Primera Materia</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map((sub) => {
              const parallelCount = sub.parallels?.length || 0;
              const totalStudents = (sub.parallels || []).reduce(
                (sum, p) => sum + (p.student_count || 0),
                0
              );

              return (
                <div
                  key={sub.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 'var(--radius-xl)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.6rem',
                          backgroundColor: 'var(--color-surface-inset)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-primary)',
                          fontFamily: 'var(--font-mono)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {sub.code}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(sub, e)}
                        className="btn-secondary"
                        style={{
                          padding: '0.3rem 0.55rem',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-secondary)',
                        }}
                        title="Editar materia"
                      >
                        <Edit2 size={13} />
                        <span>Editar</span>
                      </button>
                    </div>

                    <h2
                      style={{
                        fontFamily: 'var(--font-headline)',
                        fontSize: '1.35rem',
                        color: 'var(--color-text)',
                        marginBottom: '0.5rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {sub.name}
                    </h2>

                    {sub.description && (
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-text-secondary)',
                          marginBottom: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {sub.description}
                      </p>
                    )}
                  </div>

                  {/* Resumen de Aulas y Botón de Acción */}
                  <div
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '1rem',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.825rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <Users size={16} color="var(--color-primary)" />
                      <span>
                        <strong>{parallelCount}</strong> {parallelCount === 1 ? 'aula' : 'aulas'} ({totalStudents} estudiantes)
                      </span>
                    </div>

                    <Link
                      href={`/teacher/courses/${sub.id}/parallels`}
                      className="btn-primary"
                      style={{
                        fontSize: '0.85rem',
                        padding: '0.5rem 0.9rem',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Gestionar Aulas</span>
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Universal de Asignatura */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        subjectToEdit={subjectToEdit}
      />
    </div>
  );
}
