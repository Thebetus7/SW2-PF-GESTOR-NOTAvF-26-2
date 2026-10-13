'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { apiClient } from '@/lib/api';
import { UserPlus, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface TeacherItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulario nuevo docente
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      const data = await apiClient<TeacherItem[]>('/academics/teachers/', { token });
      setTeachers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token') || '';
      await apiClient('/academics/teachers/', {
        method: 'POST',
        token,
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });

      setSuccessMsg(`Profesor ${firstName} ${lastName} creado exitosamente.`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      fetchTeachers();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el profesor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar userRole="ADMIN" userName="Administrador" />

      <main style={{ maxWidth: '1100px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Gestión de Profesores</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Como Administrador institucional, usted es el único usuario facultado para dar de alta docentes en la plataforma.
          </p>
        </header>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <UserCheck size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2rem' }}>
          {/* Formulario de Alta */}
          <section className="card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <UserPlus size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.35rem' }}>Nuevo Profesor</h2>
            </div>

            <form onSubmit={handleCreateTeacher}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Nombres
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Roberto Carlos"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Apellidos
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Morales Vargas"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Correo Institucional
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="profesor@universidad.edu.bo"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Contraseña Temporal
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isSubmitting ? 'Registrando...' : 'Dar de Alta Docente'}
              </button>
            </form>
          </section>

          {/* Listado de Docentes */}
          <section className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>Profesores Registrados</h2>
              <button
                onClick={fetchTeachers}
                className="btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                type="button"
              >
                <RefreshCw size={14} />
                <span>Actualizar</span>
              </button>
            </div>

            {loading ? (
              <p style={{ color: 'var(--color-text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
                Cargando nómina docente...
              </p>
            ) : teachers.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
                No hay profesores registrados en el sistema. Utilice el formulario lateral para agregar el primero.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {teachers.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--color-surface-inset)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{t.full_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{t.email}</div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        backgroundColor: t.is_active ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                        color: t.is_active ? 'var(--color-success)' : 'var(--color-error)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {t.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
