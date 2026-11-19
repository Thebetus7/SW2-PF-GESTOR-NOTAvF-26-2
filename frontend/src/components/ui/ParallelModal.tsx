'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, X, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export interface ParallelData {
  id?: string;
  subject: string;
  group_code: string;
  period: string;
  student_count?: number;
}

interface ParallelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedParallel: ParallelData) => void;
  subjectId: string;
  subjectName?: string;
}

export function ParallelModal({
  isOpen,
  onClose,
  onSuccess,
  subjectId,
  subjectName,
}: ParallelModalProps) {
  const [groupCode, setGroupCode] = useState('');
  const [period, setPeriod] = useState('1-2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setGroupCode('');
      setPeriod('1-2026');
      setError(null);
      setTimeout(() => {
        groupInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupCode.trim()) {
      setError('El código de grupo o aula es obligatorio.');
      return;
    }
    if (!subjectId) {
      setError('Identificador de materia no válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token') || '';
      const savedData = await apiClient<ParallelData>('/academics/parallels/', {
        method: 'POST',
        token,
        body: JSON.stringify({
          subject: subjectId,
          group_code: groupCode.trim().toUpperCase(),
          period: period.trim(),
        }),
      });

      onSuccess(savedData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al aperturar el aula/paralelo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-warm-lg)',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="parallel-modal-title"
      >
        {/* Cabecera del Modal */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={20} color="var(--color-primary)" />
            <div>
              <h3
                id="parallel-modal-title"
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-headline)',
                  color: 'var(--color-primary)',
                }}
              >
                Aperturar Nueva Aula / Paralelo
              </h3>
              {subjectName && (
                <p
                  style={{
                    margin: '0.15rem 0 0',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Asignatura: <strong>{subjectName}</strong>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-error)',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                  color: 'var(--color-text)',
                }}
              >
                Identificador de Aula / Grupo *
              </label>
              <input
                ref={groupInputRef}
                type="text"
                required
                placeholder="Ej. A, B, C, Grupo 1"
                className="input-field"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                style={{ textTransform: 'uppercase' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Código visible para identificar el curso en listas y actas.
              </span>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                  color: 'var(--color-text)',
                }}
              >
                Periodo Lectivo / Semestre *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 1-2026, 2-2026, Anual-2026"
                className="input-field"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>

          {/* Pie de Acciones */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              backgroundColor: 'var(--color-surface-inset)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              {loading ? 'Aperturando...' : 'Aperturar Aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
