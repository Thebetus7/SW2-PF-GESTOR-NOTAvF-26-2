'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, GraduationCap } from 'lucide-react';

interface NavbarProps {
  userRole?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  userName?: string;
}

export function Navbar({ userRole = 'ADMIN', userName = 'Usuario' }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 2rem',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-warm-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '1.25rem',
          }}
        >
          <GraduationCap size={28} />
          <span>GestorNotas IA</span>
        </Link>

        {userRole === 'ADMIN' && (
          <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
            <Link
              href="/admin/teachers"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Profesores
            </Link>
            <Link
              href="/admin/students/import"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Importar Estudiantes (Excel)
            </Link>
          </div>
        )}

        {userRole === 'TEACHER' && (
          <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
            <Link
              href="/teacher/courses"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Mis Materias
            </Link>
            <Link
              href="/teacher/exams/builder"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Constructor de Exámenes
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span
          style={{
            fontSize: '0.85rem',
            padding: '0.25rem 0.65rem',
            backgroundColor: 'var(--color-surface-inset)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-primary)',
            fontWeight: 600,
          }}
        >
          {userName} ({userRole})
        </span>

        <ThemeToggle />

        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--color-error)' }}
          title="Cerrar Sesión"
          type="button"
        >
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
}
