'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { apiClient, API_BASE_URL } from '@/lib/api';
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';

interface ParallelItem {
  id: string;
  subject: string;
  subject_name: string;
  group_code: string;
  period: string;
  student_count: number;
}

interface ImportSummary {
  success: boolean;
  total_rows: number;
  imported_count: number;
  enrolled_count: number;
  skipped_count: number;
  errors?: Array<{ row: number; reason: string }>;
}

export default function AdminImportStudentsPage() {
  const [parallels, setParallels] = useState<ParallelItem[]>([]);
  const [selectedParallelId, setSelectedParallelId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  useEffect(() => {
    const fetchParallels = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || '';
        const data = await apiClient<ParallelItem[]>('/academics/parallels/', { token });
        setParallels(data);
        if (data.length > 0) {
          setSelectedParallelId(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar las aulas disponibles');
      } finally {
        setLoading(false);
      }
    };

    fetchParallels();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.xlsx')) {
        setError('El archivo debe tener extensión Microsoft Excel (.xlsx).');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSummary(null);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParallelId) {
      setError('Seleccione un aula o paralelo de destino.');
      return;
    }
    if (!selectedFile) {
      setError('Seleccione un archivo .xlsx para continuar.');
      return;
    }

    setUploading(true);
    setError(null);
    setSummary(null);

    try {
      const token = localStorage.getItem('access_token') || '';
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/academics/parallels/${selectedParallelId}/import-students/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Fallo en la importación de estudiantes.');
      }

      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Error durante la subida del archivo Excel.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Navbar userRole="ADMIN" userName="Administrador" />

      <main style={{ maxWidth: '960px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
            <FileSpreadsheet size={32} color="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Importador Masivo de Estudiantes</h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Cargue la lista de alumnos desde un archivo Excel (.xlsx) con columnas de Matrícula (ID) y Nombre Completo.
          </p>
        </header>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleImportSubmit} className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              1. Seleccione Materia y Aula Destino
            </label>
            {loading ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Cargando aulas...</p>
            ) : parallels.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No hay aulas registradas aún. Los docentes deben registrar materias y paralelos primero.
              </p>
            ) : (
              <select
                className="input-field"
                value={selectedParallelId}
                onChange={(e) => setSelectedParallelId(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {parallels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.subject_name} — Aula {p.group_code} ({p.period}) — {p.student_count} alumnos actuales
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              2. Seleccione el Archivo Excel (.xlsx)
            </label>
            <div
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface-inset)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('excelFileInput')?.click()}
            >
              <Upload size={36} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 500, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                {selectedFile ? selectedFile.name : 'Haga clic para seleccionar el archivo .xlsx'}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Se admiten alias de columnas como: Matricula, Código, Nombre Completo, Email.
              </p>
              <input
                id="excelFileInput"
                type="file"
                accept=".xlsx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile || !selectedParallelId}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
          >
            {uploading ? 'Procesando e inscribiendo alumnos...' : 'Iniciar Importación de Estudiantes'}
          </button>
        </form>

        {/* Resumen del Resultado */}
        {summary && (
          <section className="card" style={{ borderLeft: '6px solid var(--color-success)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={24} color="var(--color-success)" />
              <h2 style={{ fontSize: '1.4rem' }}>Resumen de Importación</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{summary.total_rows}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Filas Analizadas</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)' }}>{summary.imported_count}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Nuevos Alumnos</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{summary.enrolled_count}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Inscritos en Aula</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-inset)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: summary.skipped_count > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                  {summary.skipped_count}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Filas Omitidas</div>
              </div>
            </div>

            {summary.errors && summary.errors.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-warning)' }}>
                  <AlertTriangle size={18} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Detalle de Advertencias:</span>
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {summary.errors.map((err, i) => (
                    <li key={i}>
                      Fila {err.row}: {err.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
