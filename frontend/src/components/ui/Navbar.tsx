'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
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
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 2rem',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-warm-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Lado Izquierdo: Marca y Enlaces de Navegación */}
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
            paddingRight: '0.5rem',
          }}
        >
          <GraduationCap size={28} />
          <span>GestorNotas IA</span>
        </Link>

        {/* Enlaces de Administrador */}
        {currentRole === 'ADMIN' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              href="/admin/teachers"
              style={getLinkStyle('/admin/teachers')}
            >
              Profesores
            </Link>
            <Link
              href="/admin/students/import"
              style={getLinkStyle('/admin/students/import')}
            >
              Importar Estudiantes (Excel)
            </Link>
          </div>
        )}

        {/* Enlaces de Docente */}
        {currentRole === 'TEACHER' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              href="/teacher/courses"
              style={getLinkStyle('/teacher/courses')}
              title="Mis Materias y Aulas"
            >
              Mis Materias
            </Link>
            <Link
              href="/teacher/exams/builder"
              style={getLinkStyle('/teacher/exams/builder')}
              title="Constructor y Editor de Exámenes"
            >
              Constructor de Exámenes
            </Link>
          </div>
        )}

        {/* Enlace de Estudiante */}
        {currentRole === 'STUDENT' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              href="/student/portal"
              style={getLinkStyle('/student/portal')}
            >
              Mis Calificaciones
            </Link>
          </div>
        )}
      </div>

      {/* Lado Derecho: Menú Dropdown de Usuario Unificado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <UserMenuDropdown
          userRole={currentRole}
          userName={currentName}
          userEmail={currentEmail}
        />
      </div>
    </nav>
  );
}
