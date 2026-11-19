'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, X, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export interface SubjectData {
  id?: string;
  code: string;
  name: string;
  description?: string;
}

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedSubject: SubjectData) => void;
  subjectToEdit?: SubjectData | null;
}

export function SubjectModal({
  isOpen,
  onClose,
  onSuccess,
  subjectToEdit,
}: SubjectModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (subjectToEdit) {
        setCode(subjectToEdit.code);
        setName(subjectToEdit.name);
        setDescription(subjectToEdit.description || '');
      } else {
        setCode('');
        setName('');
        setDescription('');
      }
      setError(null);
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, subjectToEdit]);

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
    if (!code.trim() || !name.trim()) {
      setError('El código y el nombre de la materia son obligatorios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token') || '';
      const method = subjectToEdit?.id ? 'PATCH' : 'POST';
      const endpoint = subjectToEdit?.id
        ? `/academics/subjects/${subjectToEdit.id}/`
        : '/academics/subjects/';

      const savedData = await apiClient<SubjectData>(endpoint, {
        method,
        token,
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
        }),
      });

      onSuccess(savedData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la materia');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(subjectToEdit?.id);

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
          maxWidth: '500px',
          width: '100%',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
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
            <BookOpen size={20} color="var(--color-primary)" />
            <h3
              id="subject-modal-title"
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontFamily: 'var(--font-headline)',
                color: 'var(--color-primary)',
              }}
            >
              {isEditing ? 'Editar Asignatura' : 'Nueva Asignatura'}
            </h3>
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
                Código de la Materia *
              </label>
              <input
                ref={codeInputRef}
                type="text"
                required
                placeholder="Ej. SW2-2026, MAT-101"
                className="input-field"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ textTransform: 'uppercase' }}
              />
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
                Nombre de la Asignatura *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Ingeniería de Software 2"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
                Descripción / Temario (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Temario u observaciones sobre la asignatura..."
                className="input-field"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Pie del Modal con Acciones */}
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
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
