'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Menu, X, BookOpen, Layers, Users, FileSpreadsheet, Award } from 'lucide-react';
import { UserMenuDropdown } from './UserMenuDropdown';
import { UserRole } from '@/types';

interface NavbarProps {
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
}

export function Navbar({ userRole: propRole, userName: propName, userEmail: propEmail }: NavbarProps) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<UserRole>(propRole || 'TEACHER');
  const [currentName, setCurrentName] = useState<string>(propName || 'Usuario');
  const [currentEmail, setCurrentEmail] = useState<string>(propEmail || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as UserRole | null;
    const storedName = localStorage.getItem('user_name');
    const storedUserJson = localStorage.getItem('user');

    if (propRole) {
      setCurrentRole(propRole);
    } else if (storedRole) {
      setCurrentRole(storedRole);
    }

    if (propName && propName !== 'Usuario') {
      setCurrentName(propName);
    } else if (storedName) {
      setCurrentName(storedName);
    }

    if (storedUserJson) {
      try {
        const u = JSON.parse(storedUserJson);
        if (u.email && !propEmail) setCurrentEmail(u.email);
        if (u.name && (!propName || propName === 'Usuario')) setCurrentName(u.name);
      } catch {
        // Ignorar
      }
    }
  }, [propRole, propName, propEmail]);

  // Función auxiliar para determinar si la ruta actual coincide con el módulo
  const isLinkActive = (path: string, exact: boolean = false) => {
    if (!pathname) return false;
    if (exact) return pathname === path;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const getLinkStyle = (path: string, exact: boolean = false): React.CSSProperties => {
    const active = isLinkActive(path, exact);
    return {
      display: 'inline-flex',
      alignItems: 'center',
      textDecoration: 'none',
      fontSize: '0.92rem',
      fontWeight: active ? 700 : 500,
      color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
      backgroundColor: active ? 'var(--color-surface-inset)' : 'transparent',
      borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
      padding: '0.45rem 0.85rem',
      transition: 'all 0.15s ease-in-out',
    };
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-[var(--shadow-warm-sm)]">
      <nav className="flex items-center justify-between px-3 sm:px-6 py-2.5 max-w-7xl mx-auto">
        {/* Lado Izquierdo: Marca y Enlaces de Escritorio */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-lg sm:text-xl no-underline"
          >
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)] shrink-0" />
            <span className="font-headline tracking-tight">GestorNotas <span className="text-[var(--color-secondary)]">IA</span></span>
          </Link>

          {/* Enlaces de Escritorio (ocultos en móvil) */}
          <div className="hidden md:flex items-center gap-2">
            {currentRole === 'ADMIN' && (
              <>
                <Link href="/admin/teachers" style={getLinkStyle('/admin/teachers')}>
                  Profesores
                </Link>
                <Link href="/admin/students/import" style={getLinkStyle('/admin/students/import')}>
                  Importar Estudiantes (Excel)
                </Link>
              </>
            )}

            {currentRole === 'TEACHER' && (
              <>
                <Link href="/teacher/courses" style={getLinkStyle('/teacher/courses')} title="Mis Materias y Aulas">
                  Mis Materias
                </Link>
                <Link href="/teacher/exams/builder" style={getLinkStyle('/teacher/exams/builder')} title="Constructor de Exámenes">
                  Constructor de Exámenes
                </Link>
              </>
            )}

            {currentRole === 'STUDENT' && (
              <Link href="/student/portal" style={getLinkStyle('/student/portal')}>
                Mis Calificaciones
              </Link>
            )}
          </div>
        </div>

        {/* Lado Derecho: Menú de Usuario + Botón Móvil */}
        <div className="flex items-center gap-2 sm:gap-3">
          <UserMenuDropdown
            userRole={currentRole}
            userName={currentName}
            userEmail={currentEmail}
          />

          {/* Botón Hamburguesa para Móvil */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-surface-inset)] transition-colors border border-[var(--color-border)]"
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Menú Desplegable Móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {currentRole === 'ADMIN' && (
            <>
              <Link
                href="/admin/teachers"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isLinkActive('/admin/teachers')
                    ? 'bg-[var(--color-surface-inset)] text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-inset)]'
                }`}
              >
                <Users size={18} />
                <span>Gestión de Profesores</span>
              </Link>
              <Link
                href="/admin/students/import"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isLinkActive('/admin/students/import')
                    ? 'bg-[var(--color-surface-inset)] text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-inset)]'
                }`}
              >
                <FileSpreadsheet size={18} />
                <span>Importar Estudiantes (Excel)</span>
              </Link>
            </>
          )}

          {currentRole === 'TEACHER' && (
            <>
              <Link
                href="/teacher/courses"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isLinkActive('/teacher/courses')
                    ? 'bg-[var(--color-surface-inset)] text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-inset)]'
                }`}
              >
                <BookOpen size={18} />
                <span>Mis Materias y Aulas</span>
              </Link>
              <Link
                href="/teacher/exams/builder"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isLinkActive('/teacher/exams/builder')
                    ? 'bg-[var(--color-surface-inset)] text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-inset)]'
                }`}
              >
                <Layers size={18} />
                <span>Constructor de Exámenes</span>
              </Link>
            </>
          )}

          {currentRole === 'STUDENT' && (
            <Link
              href="/student/portal"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isLinkActive('/student/portal')
                  ? 'bg-[var(--color-surface-inset)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-inset)]'
              }`}
            >
              <Award size={18} />
              <span>Mis Calificaciones</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
