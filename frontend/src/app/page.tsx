'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: '999px', marginBottom: '1.25rem' }}>
          <Sparkles size={16} color="var(--color-primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
            Google Gemini API Free Tier v1beta
          </span>
        </div>
        <h1 style={{ fontSize: '2.75rem', lineHeight: 1.2, marginBottom: '1rem' }}>
          Evaluación y Corrección de Exámenes Manuscritos
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          Plataforma académica para digitalización física de pruebas, corrección asistida con inteligencia artificial y auditoría docente transparente.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card">
          <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <ShieldCheck size={24} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Administración</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>
            Gestión centralizada de cuentas de profesores e importación de listas de estudiantes en formato Excel (.xlsx).
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <BookOpen size={24} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Portal Docente</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>
            Diseño modular de exámenes con tolerancia y contexto, visor post-detalle de calificaciones y ajuste manual con observaciones.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <GraduationCap size={24} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Portal Estudiante</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>
            Acceso personal mediante ID de estudiante para revisar desglose de calificaciones y fotografías originales escaneadas.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1.05rem', padding: '0.75rem 2rem' }}>
          Ir a Iniciar Sesión / Demo Users
        </Link>
      </div>
    </div>
  );
}
