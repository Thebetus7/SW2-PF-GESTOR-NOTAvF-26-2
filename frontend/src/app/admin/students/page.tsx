'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { apiClient } from '@/lib/api';
import {
  UserPlus,
  UserCheck,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  FileSpreadsheet,
  BookOpen,
  Search,
  KeyRound,
  Mail,
  Hash,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface ParallelItem {
  id: string;
  subject: string;
  subject_name: string;
  group_code: string;
  period: string;
  student_count: number;
}

interface StudentItem {
  id: string;
  student_id_code: string;
  full_name: string;
  email: string;
  parallel_name: string;
  parallel_id_display: string | null;
  created_at: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [parallels, setParallels] = useState<ParallelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulario de inserción rápida
  const [fullName, setFullName] = useState('');
  const [studentIdCode, setStudentIdCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [selectedParallelId, setSelectedParallelId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParallelId, setFilterParallelId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token') || '';
      const [parallelsData, studentsData] = await Promise.all([
        apiClient<ParallelItem[]>('/academics/parallels/', { token }).catch(() => []),
        apiClient<StudentItem[]>('/academics/students/', { token }).catch(() => []),
      ]);

      setParallels(parallelsData);
      setStudents(studentsData);

      if (parallelsData.length > 0 && !selectedParallelId) {
        setSelectedParallelId(parallelsData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('El nombre del estudiante es obligatorio.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token') || '';
      const payload: any = {
        full_name: fullName.trim(),
        password: password.trim() || '123456',
      };

      if (studentIdCode.trim()) {
        payload.student_id_code = studentIdCode.trim();
      }
      if (email.trim()) {
        payload.email = email.trim();
      }
      if (selectedParallelId) {
        payload.parallel_id = selectedParallelId;
      }

      const res = await apiClient<StudentItem>('/academics/students/', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      setSuccessMsg(`¡Estudiante ${res.full_name} (${res.student_id_code}) registrado correctamente! Puede iniciar sesión con sus credenciales.`);
      
      // Limpiar campos para rápida inserción del siguiente
      setFullName('');
      setStudentIdCode('');
      setEmail('');
      setPassword('123456');

      // Actualizar listado de estudiantes y aulas
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el estudiante');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesParallel =
      !filterParallelId || s.parallel_id_display === filterParallelId;

    return matchesSearch && matchesParallel;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      <Navbar userRole="ADMIN" userName="Administrador" />

      <main style={{ maxWidth: '1200px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        {/* Encabezado con acciones */}
        <header style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-primary">Panel de Administración</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Evaluación Rápida</span>
              </div>
              <h1 style={{ fontSize: '2.25rem', marginBottom: '0.35rem', fontFamily: 'var(--font-headline)' }}>
                Gestión e Inserción de Estudiantes
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '720px' }}>
                Registre estudiantes a mano de forma ágil para evaluar en el examen parcial o inscripciones directas a materias y aulas. Las cuentas quedan habilitadas de inmediato para iniciar sesión.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href="/admin/students/import"
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <FileSpreadsheet size={16} />
                <span>Importar con Excel</span>
              </Link>
              <button
                onClick={fetchInitialData}
                className="btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
                type="button"
                title="Actualizar datos"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Mensajes de Alerta */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-error)',
            }}
          >
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-success)',
            }}
          >
            <CheckCircle2 size={20} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Grid de 2 Columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.5fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Columna Izquierda: Formulario de Inserción Manual */}
          <section className="card" style={{ position: 'sticky', top: '5.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-inset)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-border)',
                }}
              >
                <UserPlus size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Nuevo Estudiante</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Ingreso manual de cuenta y aula
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Nombre Completo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Nombre Completo <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Carlos Vargas Morales"
                />
              </div>

              {/* Matrícula o Carnet */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Matrícula / Carnet (ID)
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                    Opcional (se autogenera si está vacío)
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem' }}
                    value={studentIdCode}
                    onChange={(e) => setStudentIdCode(e.target.value)}
                    placeholder="Ej. EST-2026-002 o CI: 8934521"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Correo Electrónico
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                    Opcional (se autocompleta con matrícula)
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@estudiante.edu.bo"
                  />
                </div>
              </div>

              {/* Contraseña para el Login */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Contraseña de Acceso <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                    }}
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Asignación de Aula / Materia */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Aula / Materia de Destino <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                  <select
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', appearance: 'auto' }}
                    value={selectedParallelId}
                    onChange={(e) => setSelectedParallelId(e.target.value)}
                  >
                    <option value="">-- Seleccionar Aula / Paralelo --</option>
                    {parallels.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.subject_name} — Aula {p.group_code} ({p.period})
                      </option>
                    ))}
                  </select>
                </div>
                {parallels.length === 0 && !loading && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.35rem' }}>
                    No hay aulas registradas en el sistema. Primero cree materias y aulas en el módulo de Docente.
                  </p>
                )}
              </div>

              {/* Resumen explicativo de acceso */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-inset)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.4',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                  🔑 Acceso al Login Garantizado:
                </div>
                El estudiante podrá iniciar sesión con su <strong>Correo</strong> (o Matrícula) y la contraseña ingresada, o directamente con su <strong>Matrícula / ID</strong> en la pestaña rápida de alumnos.
              </div>

              <button
                type="submit"
                disabled={isSubmitting || parallels.length === 0}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                {isSubmitting ? 'Registrando...' : 'Insertar Estudiante'}
              </button>
            </form>
          </section>

          {/* Columna Derecha: Nómina y Buscador de Estudiantes */}
          <section className="card">
            {/* Cabecera del Listado con Buscador y Filtro */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={22} color="var(--color-primary)" />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                    Estudiantes Registrados ({filteredStudents.length})
                  </h2>
                </div>
              </div>

              {/* Barra de Filtros */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, matrícula o correo..."
                  />
                </div>

                <select
                  className="input-field"
                  style={{ fontSize: '0.85rem', appearance: 'auto' }}
                  value={filterParallelId}
                  onChange={(e) => setFilterParallelId(e.target.value)}
                >
                  <option value="">Todas las Aulas / Materias</option>
                  {parallels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.subject_name} (Aula {p.group_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listado de Estudiantes */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
                <p>Cargando lista de estudiantes...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  backgroundColor: 'var(--color-surface-inset)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <GraduationCap size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--color-text-secondary)', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {searchQuery || filterParallelId ? 'No se encontraron resultados' : 'Sin estudiantes registrados'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                  {searchQuery || filterParallelId
                    ? 'Intente modificar los términos de búsqueda o el filtro de aula.'
                    : 'Utilice el formulario lateral para ingresar su primer estudiante o importe una lista desde Microsoft Excel.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredStudents.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: 'var(--color-surface-inset)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Datos del estudiante */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '240px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-primary)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          flexShrink: 0,
                        }}
                      >
                        {st.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{st.full_name}</span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-primary)',
                            }}
                          >
                            {st.student_id_code}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                          {st.email || 'Sin correo registrado'}
                        </div>
                      </div>
                    </div>

                    {/* Aula asignada y Botón de Copiar Matrícula */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      >
                        {st.parallel_name}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopy(st.student_id_code, st.id)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        title="Copiar código de matrícula"
                      >
                        {copiedId === st.id ? (
                          <>
                            <Check size={13} style={{ color: 'var(--color-success)' }} />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Matrícula</span>
                          </>
                        )}
                      </button>
                    </div>
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
