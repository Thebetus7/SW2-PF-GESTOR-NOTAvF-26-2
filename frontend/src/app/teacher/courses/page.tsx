'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { apiClient } from '@/lib/api';
import { BookOpen, Users, PlusCircle, AlertCircle, Eye, GraduationCap } from 'lucide-react';

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
  parallels: ParallelItem[];
}

export default function TeacherCoursesPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario nueva materia
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);

  // Formulario nuevo paralelo
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [groupCode, setGroupCode] = useState('');
  const [period, setPeriod] = useState('1-2026');
  const [isCreatingParallel, setIsCreatingParallel] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      const data = await apiClient<SubjectItem[]>('/academics/subjects/', { token });
      setSubjects(data);
      if (data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar materias y aulas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingSubject(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      await apiClient('/academics/subjects/', {
        method: 'POST',
        token,
        body: JSON.stringify({ code, name, description }),
      });
      setCode('');
      setName('');
      setDescription('');
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'Error al crear la materia');
    } finally {
      setIsCreatingSubject(false);
    }
  };

  const handleCreateParallel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    setIsCreatingParallel(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      await apiClient('/academics/parallels/', {
        method: 'POST',
        token,
        body: JSON.stringify({
          subject: selectedSubjectId,
          group_code: groupCode,
          period,
        }),
      });
      setGroupCode('');
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'Error al crear el aula / paralelo');
    } finally {
      setIsCreatingParallel(false);
    }
  };

  return (
    <div>
      <Navbar userRole="TEACHER" userName="Profesor Evaluador" />

      <main style={{ maxWidth: '1140px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Mis Materias y Aulas</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Administre las asignaturas que dicta, aperture aulas/paralelos y consulte la ficha individual de sus estudiantes.
          </p>
        </header>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Formulario Crear Materia */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} color="var(--color-primary)" />
              <span>Registrar Nueva Materia</span>
            </h2>
            <form onSubmit={handleCreateSubject}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Código</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. SW2-2026"
                  className="input-field"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombre de Asignatura</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ingeniería de Software 2"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Descripción</label>
                <input
                  type="text"
                  placeholder="Temario u observaciones"
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button type="submit" disabled={isCreatingSubject} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {isCreatingSubject ? 'Guardando...' : 'Crear Materia'}
              </button>
            </form>
          </div>

          {/* Formulario Crear Aula / Paralelo */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--color-primary)" />
              <span>Aperturar Aula / Paralelo</span>
            </h2>
            <form onSubmit={handleCreateParallel}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Materia</label>
                <select
                  className="input-field"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Grupo / Aula</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. A, B, C..."
                  className="input-field"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Periodo / Semestre</label>
                <input
                  type="text"
                  required
                  placeholder="1-2026"
                  className="input-field"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
              <button type="submit" disabled={isCreatingParallel || subjects.length === 0} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {isCreatingParallel ? 'Aperturando...' : 'Aperturar Paralelo'}
              </button>
            </form>
          </div>
        </div>

        {/* Listado de Materias y Aulas */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Mis Materias Activas</h2>
          {loading ? (
            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Cargando asignaturas...</p>
          ) : subjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <BookOpen size={40} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>Aún no ha creado ninguna materia. Use el formulario superior para comenzar.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {subjects.map((sub) => (
                <div key={sub.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', marginRight: '0.5rem' }}>
                        {sub.code}
                      </span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--color-text)' }}>{sub.name}</strong>
                    </div>
                  </div>
                  {sub.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                      {sub.description}
                    </p>
                  )}

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      Paralelos / Aulas Habilitadas:
                    </div>
                    {sub.parallels && sub.parallels.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {sub.parallels.map((p) => (
                          <div
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.5rem 0.85rem',
                              backgroundColor: 'var(--color-surface-inset)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>Aula {p.group_code} ({p.period})</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              {p.student_count} alumnos
                            </span>
                            <Link
                              href={`/teacher/exams/builder?parallel_id=${p.id}`}
                              style={{ textDecoration: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, marginLeft: '0.5rem' }}
                            >
                              + Crear Examen
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        No hay aulas aperturadas para esta materia aún.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
