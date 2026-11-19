'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  Shield,
  GraduationCap,
  BookOpen,
  Mail,
  CreditCard,
  X,
  Check,
} from 'lucide-react';
import { UserRole } from '@/types';

interface UserMenuDropdownProps {
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
}

export function UserMenuDropdown({
  userRole: propUserRole,
  userName: propUserName,
  userEmail: propUserEmail,
}: UserMenuDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [role, setRole] = useState<UserRole>(propUserRole || 'TEACHER');
  const [name, setName] = useState<string>(propUserName || 'Usuario');
  const [email, setEmail] = useState<string>(propUserEmail || '');
  const [studentCode, setStudentCode] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar tema y datos del usuario de localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    const storedRole = localStorage.getItem('user_role') as UserRole | null;
    const storedName = localStorage.getItem('user_name');
    const storedUserJson = localStorage.getItem('user');

    if (propUserRole) {
      setRole(propUserRole);
    } else if (storedRole) {
      setRole(storedRole);
    }

    if (propUserName && propUserName !== 'Usuario') {
      setName(propUserName);
    } else if (storedName) {
      setName(storedName);
    }

    if (storedUserJson) {
      try {
        const u = JSON.parse(storedUserJson);
        if (u.email && !propUserEmail) setEmail(u.email);
        if (u.studentIdCode || u.student_id_code) {
          setStudentCode(u.studentIdCode || u.student_id_code);
        }
        if (u.name && (!propUserName || propUserName === 'Usuario')) {
          setName(u.name);
        }
      } catch {
        // Ignorar si el JSON no es válido
      }
    }
  }, [propUserRole, propUserName, propUserEmail]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showProfileModal) {
          setShowProfileModal(false);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showProfileModal, isOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return { label: 'Administrador', icon: <Shield size={14} />, bg: 'var(--color-primary-light)' };
      case 'TEACHER':
        return { label: 'Docente', icon: <BookOpen size={14} />, bg: 'var(--color-primary)' };
      case 'STUDENT':
        return { label: 'Estudiante', icon: <GraduationCap size={14} />, bg: 'var(--color-secondary)' };
      default:
        return { label: r, icon: <User size={14} />, bg: 'var(--color-primary)' };
    }
  };

  const roleInfo = getRoleBadge(role);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Botón Disparador del Menú */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.35rem 0.75rem',
          backgroundColor: isOpen ? 'var(--color-surface-inset)' : 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--color-text)',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow-warm-sm)',
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menú de usuario"
      >
        {/* Avatar */}
        <div
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
          }}
        >
          {initials}
        </div>

        {/* Info usuario visible (oculto en pantallas muy pequeñas) */}
        <div className="hidden sm:flex" style={{ textAlign: 'left', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              lineHeight: 1.2,
              maxWidth: '140px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
            }}
          >
            {roleInfo.label}
          </span>
        </div>

        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--color-text-muted)',
            marginLeft: '0.2rem',
          }}
        />
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 0.5rem)',
            width: '260px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-warm-lg)',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Cabecera del Dropdown */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-surface-inset)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    color: '#FFFFFF',
                    backgroundColor: 'var(--color-primary)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    marginTop: '0.2rem',
                  }}
                >
                  {roleInfo.icon}
                  <span>{roleInfo.label}</span>
                </div>
              </div>
            </div>

            {email && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  margin: '0.25rem 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {email}
              </p>
            )}
            {studentCode && (
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '0.15rem',
                }}
              >
                Matrícula: {studentCode}
              </p>
            )}
          </div>

          {/* Opciones del Menú */}
          <div style={{ padding: '0.5rem' }}>
            {/* Opción: Mi Perfil */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowProfileModal(true);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-inset)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <User size={16} color="var(--color-primary)" />
              <span style={{ fontWeight: 500 }}>Mi Perfil</span>
            </button>

            {/* Opción: Alternar Modo Oscuro / Claro */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-inset)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {theme === 'light' ? (
                  <Moon size={16} color="var(--color-primary)" />
                ) : (
                  <Sun size={16} color="var(--color-primary)" />
                )}
                <span style={{ fontWeight: 500 }}>
                  {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-inset)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                {theme === 'light' ? 'Espresso' : 'Cream'}
              </span>
            </button>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0 0.5rem' }} />

          {/* Opción: Cerrar Sesión */}
          <div style={{ padding: '0.5rem' }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                fontSize: '0.875rem',
                color: 'var(--color-error)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-error-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <LogOut size={16} />
              <span style={{ fontWeight: 600 }}>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Mi Perfil */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-warm-lg)',
              maxWidth: '460px',
              width: '100%',
              overflow: 'hidden',
              animation: 'scaleIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
          >
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-inset)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} color="var(--color-primary)" />
                <h3
                  id="profile-modal-title"
                  style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontFamily: 'var(--font-headline)',
                    color: 'var(--color-primary)',
                  }}
                >
                  Perfil de Usuario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 'var(--radius-sm)',
                }}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    boxShadow: 'var(--shadow-warm-md)',
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', color: 'var(--color-text)' }}>
                    {name}
                  </h4>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.15rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-inset)',
                      color: 'var(--color-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {roleInfo.icon}
                    <span>{roleInfo.label}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-inset)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={16} color="var(--color-primary)" />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                      Correo Electrónico
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                      {email || 'No registrado'}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Shield size={16} color="var(--color-primary)" />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                      Rol en el Sistema
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                      {roleInfo.label}
                    </strong>
                  </div>
                </div>

                {studentCode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard size={16} color="var(--color-primary)" />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                        Código de Matrícula
                      </span>
                      <strong style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                        {studentCode}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                Presione <kbd style={{ padding: '0.1rem 0.35rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>Esc</kbd> o haga clic fuera para cerrar.
              </p>
            </div>

            {/* Footer Modal */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
