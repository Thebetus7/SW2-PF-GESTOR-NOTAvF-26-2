'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, GraduationCap, BookOpen, KeyRound, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'CREDENTIALS' | 'STUDENT_ID'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentIdCode, setStudentIdCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDemoLogin = async (role: 'admin' | 'teacher' | 'student') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/demo-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al iniciar sesión de prueba');
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_name', data.user.name);

      if (data.user.role === 'ADMIN') {
        router.push('/admin/teachers');
      } else if (data.user.role === 'TEACHER') {
        router.push('/teacher/courses');
      } else {
        router.push('/student/portal');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor ingrese su correo y contraseña');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.error || 'Credenciales inválidas');
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_name', data.user.name);

      if (data.user.role === 'ADMIN') {
        router.push('/admin/teachers');
      } else if (data.user.role === 'TEACHER') {
        router.push('/teacher/courses');
      } else {
        router.push('/student/portal');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdCode.trim()) {
      setErrorMessage('Por favor ingrese su código de matrícula');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/student-id-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id_code: studentIdCode.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Estudiante no registrado con esa matrícula');
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_role', 'STUDENT');
      localStorage.setItem('user_name', data.user.name);

      router.push('/student/portal');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de acceso por ID');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        position: 'relative',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* Botón de Modo Claro / Modo Oscuro CafeBlend */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Cabecera CafeBlend */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: 'var(--color-surface-inset)',
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <Sparkles size={14} />
            <span>Plataforma de Evaluación con IA</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '2.25rem',
              color: 'var(--color-primary)',
              marginBottom: '0.35rem',
            }}
          >
            Iniciar Sesión
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Gestión y calificación de exámenes físicos asistida por Google Gemini
          </p>
        </div>

        {/* Sección de Acceso Rápido 1-Click Demo */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-inset)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-warm-sm)',
          }}
        >
          <span
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-primary)',
              marginBottom: '0.75rem',
            }}
          >
            ⚡ Acceso Rápido de Prueba (1-Click)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Shield size={20} color="var(--color-primary)" style={{ marginBottom: '0.25rem' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Admin</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Importador</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('teacher')}
              disabled={isLoading}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <BookOpen size={20} color="var(--color-primary)" style={{ marginBottom: '0.25rem' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Docente</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Exámenes</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              disabled={isLoading}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <GraduationCap size={20} color="var(--color-primary)" style={{ marginBottom: '0.25rem' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Alumno</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Ver Notas</span>
            </button>
          </div>
        </div>

        {/* Tarjeta Principal de Formulario */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-warm-lg)',
            padding: '2rem',
          }}
        >
          {/* Selector de Pestañas */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => { setActiveTab('CREDENTIALS'); setErrorMessage(null); }}
              style={{
                flex: 1,
                paddingBottom: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                textAlign: 'center',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'CREDENTIALS' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'CREDENTIALS' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Correo / Docente
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('STUDENT_ID'); setErrorMessage(null); }}
              style={{
                flex: 1,
                paddingBottom: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                textAlign: 'center',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'STUDENT_ID' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'STUDENT_ID' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Solo Matrícula / ID
            </button>
          </div>

          {errorMessage && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {errorMessage}
            </div>
          )}

          {activeTab === 'CREDENTIALS' ? (
            <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                    color: 'var(--color-text)',
                  }}
                >
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@evaluacion.edu.bo"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                    color: 'var(--color-text)',
                  }}
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                }}
              >
                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentIdLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                    color: 'var(--color-text)',
                  }}
                >
                  Código de Estudiante / Matrícula
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound
                    size={18}
                    color="var(--color-text-muted)"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={studentIdCode}
                    onChange={(e) => setStudentIdCode(e.target.value)}
                    placeholder="Ej. EST-2026-001"
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '2.5rem', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem' }}>
                  Los estudiantes acceden exclusivamente con el identificador asignado por la institución.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                }}
              >
                {isLoading ? 'Consultando...' : 'Ingresar al Portal'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
