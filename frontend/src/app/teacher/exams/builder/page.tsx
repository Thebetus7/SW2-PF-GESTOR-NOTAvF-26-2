'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { apiClient, API_BASE_URL } from '@/lib/api';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  QrCode,
} from 'lucide-react';

interface ParallelItem {
  id: string;
  subject_name: string;
  group_code: string;
  period: string;
}

type ComponentType = 'OPEN' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

interface BuilderComponent {
  id: string;
  type: ComponentType;
  prompt: string;
  max_score: number;
  // Campos para OPEN
  context?: string;
  tolerance?: 'STRICT' | 'MODERATE' | 'FLEXIBLE';
  tolerance_keywords?: string;
  // Campos para MULTIPLE_CHOICE
  options?: string[];
  correct_choice?: string;
  // Campos para TRUE_FALSE
  correct_bool?: boolean;
}

export default function ExamBuilderPage() {
  const searchParams = useSearchParams();
  const initialParallelId = searchParams.get('parallel_id') || '';

  const [parallels, setParallels] = useState<ParallelItem[]>([]);
  const [parallelId, setParallelId] = useState(initialParallelId);
  const [title, setTitle] = useState('Primer Examen Parcial');
  const [description, setDescription] = useState('Lea atentamente cada pregunta y responda en los recuadros correspondientes.');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalScore, setTotalScore] = useState<number>(100);
  const [hasQrCode, setHasQrCode] = useState(true);

  const [components, setComponents] = useState<BuilderComponent[]>([
    {
      id: 'c-1',
      type: 'OPEN',
      prompt: 'Explique con sus propias palabras el principio de responsabilidad única (SRP).',
      max_score: 50,
      context: 'Una clase o módulo debe tener una y solo una razón para cambiar.',
      tolerance: 'MODERATE',
      tolerance_keywords: 'razón para cambiar, cohesión, modularidad',
    },
    {
      id: 'c-2',
      type: 'MULTIPLE_CHOICE',
      prompt: '¿Cuál de los siguientes no es un patrón de diseño creacional?',
      max_score: 30,
      options: ['Singleton', 'Factory Method', 'Adapter', 'Abstract Factory'],
      correct_choice: 'Adapter',
    },
    {
      id: 'c-3',
      type: 'TRUE_FALSE',
      prompt: 'En la arquitectura hexagonal, la lógica de dominio depende de la base de datos.',
      max_score: 20,
      correct_bool: false,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [savedExamId, setSavedExamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchParallels = async () => {
      try {
        const token = localStorage.getItem('access_token') || '';
        const data = await apiClient<ParallelItem[]>('/academics/parallels/', { token });
        setParallels(data);
        if (data.length > 0 && !parallelId) {
          setParallelId(data[0].id);
        }
      } catch (err: any) {
        console.error('Error al cargar aulas:', err);
      }
    };
    fetchParallels();
  }, [parallelId]);

  const currentSum = components.reduce((sum, c) => sum + (Number(c.max_score) || 0), 0);
  const isBalanced = Math.abs(currentSum - totalScore) < 0.01;

  const addComponent = (type: ComponentType) => {
    const newComp: BuilderComponent = {
      id: `c-${Date.now()}`,
      type,
      prompt: '',
      max_score: 10,
    };
    if (type === 'OPEN') {
      newComp.context = '';
      newComp.tolerance = 'MODERATE';
      newComp.tolerance_keywords = '';
    } else if (type === 'MULTIPLE_CHOICE') {
      newComp.options = ['Opción A', 'Opción B', 'Opción C', 'Opción D'];
      newComp.correct_choice = 'Opción A';
    } else if (type === 'TRUE_FALSE') {
      newComp.correct_bool = true;
    }
    setComponents([...components, newComp]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
  };

  const updateComponent = (id: string, updates: Partial<BuilderComponent>) => {
    setComponents(
      components.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleSaveExam = async () => {
    if (!parallelId) {
      setError('Debe seleccionar un aula o paralelo.');
      return;
    }
    if (!isBalanced) {
      setError(`La suma de los componentes (${currentSum} pts) no coincide con el total nominal (${totalScore} pts).`);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('access_token') || '';

      const payloadComponents = components.map((c, idx) => {
        const rubric: Record<string, any> = {};
        if (c.type === 'OPEN') {
          rubric.context = c.context || '';
          rubric.tolerance = c.tolerance || 'MODERATE';
          rubric.tolerance_keywords = (c.tolerance_keywords || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (c.type === 'MULTIPLE_CHOICE') {
          rubric.options = c.options || [];
          rubric.correct_answer = c.correct_choice || '';
        } else if (c.type === 'TRUE_FALSE') {
          rubric.correct_answer = c.correct_bool ?? true;
        }

        return {
          type: c.type,
          prompt: c.prompt,
          options_or_rubric: rubric,
          max_score: Number(c.max_score),
          order: idx + 1,
        };
      });

      const responseData: any = await apiClient('/exams/exams/', {
        method: 'POST',
        token,
        body: JSON.stringify({
          parallel: parallelId,
          title,
          description,
          application_date: applicationDate,
          total_score: totalScore,
          has_qr_code: hasQrCode,
          components: payloadComponents,
        }),
      });

      setSavedExamId(responseData.id);
      setSuccessMsg('Examen guardado exitosamente. Ya puede descargar el PDF para imprimir.');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el examen');
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = (mode: 'with_qr' | 'without_qr') => {
    if (!savedExamId) return;
    const url = `${API_BASE_URL}/exams/exams/${savedExamId}/export-pdf/?mode=${mode}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <Navbar userRole="TEACHER" userName="Profesor Evaluador" />

      <main style={{ maxWidth: '1080px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Constructor Modular de Exámenes</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Diseñe evaluaciones físicas asistidas con IA definiendo rúbricas, contexto y tolerancias semánticas.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleSaveExam}
              disabled={saving}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              <span>{saving ? 'Guardando...' : 'Guardar Examen'}</span>
            </button>
          </div>
        </header>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              <CheckCircle2 size={20} />
              <span>{successMsg}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => downloadPdf('with_qr')} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                <QrCode size={16} />
                <span>Descargar PDF con QR</span>
              </button>
              <button onClick={() => downloadPdf('without_qr')} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                <Download size={16} />
                <span>Descargar PDF sin QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Datos Generales del Examen */}
        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>1. Parámetros del Examen</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Aula / Paralelo</label>
              <select className="input-field" value={parallelId} onChange={(e) => setParallelId(e.target.value)}>
                {parallels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.subject_name} — Aula {p.group_code} ({p.period})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Título de la Evaluación</label>
              <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Instrucciones en Hoja</label>
              <input type="text" className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Fecha de Aplicación</label>
              <input type="date" className="input-field" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Puntaje Nominal Total</label>
              <input type="number" className="input-field" value={totalScore} onChange={(e) => setTotalScore(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" id="qrCheck" checked={hasQrCode} onChange={(e) => setHasQrCode(e.target.checked)} />
            <label htmlFor="qrCheck" style={{ fontSize: '0.9rem', color: 'var(--color-text)', cursor: 'pointer' }}>
              Incluir código QR identificador de calibración en la esquina superior del PDF
            </label>
          </div>
        </section>

        {/* Barra de Balanceo de Puntaje */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            backgroundColor: isBalanced ? 'var(--color-surface)' : 'var(--color-warning-bg)',
            border: `1px solid ${isBalanced ? 'var(--color-border)' : 'var(--color-warning)'}`,
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '1.05rem', color: isBalanced ? 'var(--color-primary)' : 'var(--color-warning)' }}>
              Balance de Calificación: {currentSum} / {totalScore} pts
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              {isBalanced ? '✓ La suma de los componentes coincide con el total nominal.' : '⚠ Ajuste los puntajes de los componentes para igualar el total.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => addComponent('OPEN')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <Plus size={15} /> + Pregunta Abierta
            </button>
            <button onClick={() => addComponent('MULTIPLE_CHOICE')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <Plus size={15} /> + Opción Múltiple
            </button>
            <button onClick={() => addComponent('TRUE_FALSE')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <Plus size={15} /> + V / F
            </button>
          </div>
        </div>

        {/* Lista de Componentes */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          {components.map((comp, idx) => (
            <div key={comp.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, backgroundColor: 'var(--color-surface-inset)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)' }}>
                    P{idx + 1}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {comp.type === 'OPEN' && 'Pregunta Abierta / Desarrollo'}
                    {comp.type === 'MULTIPLE_CHOICE' && 'Opción Múltiple'}
                    {comp.type === 'TRUE_FALSE' && 'Verdadero o Falso'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pts:</label>
                    <input
                      type="number"
                      style={{ width: '70px', padding: '0.35rem' }}
                      className="input-field"
                      value={comp.max_score}
                      onChange={(e) => updateComponent(comp.id, { max_score: Number(e.target.value) })}
                    />
                  </div>
                  <button
                    onClick={() => removeComponent(comp.id)}
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.5rem', color: 'var(--color-error)' }}
                    title="Eliminar pregunta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Enunciado */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Enunciado de la Pregunta</label>
                <textarea
                  rows={2}
                  className="input-field"
                  value={comp.prompt}
                  onChange={(e) => updateComponent(comp.id, { prompt: e.target.value })}
                  placeholder="Redacte la consigna o interrogante para el estudiante..."
                />
              </div>

              {/* Configuración específica según tipo */}
              {comp.type === 'OPEN' && (
                <div style={{ backgroundColor: 'var(--color-surface-inset)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                      Contexto Pedagógico de Referencia (Para la IA)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ backgroundColor: 'var(--color-surface)' }}
                      value={comp.context || ''}
                      onChange={(e) => updateComponent(comp.id, { context: e.target.value })}
                      placeholder="Respuesta ideal esperada o criterios clave para guiar a Gemini..."
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                        Nivel de Tolerancia Semántica
                      </label>
                      <select
                        className="input-field"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                        value={comp.tolerance || 'MODERATE'}
                        onChange={(e) => updateComponent(comp.id, { tolerance: e.target.value as any })}
                      >
                        <option value="STRICT">Estricta (Cálculos exactos / terminología formal)</option>
                        <option value="MODERATE">Moderada (Admite paráfrasis y sinónimos equivalentes)</option>
                        <option value="FLEXIBLE">Flexible (Enfocada en ideas clave y razonamiento general)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                        Palabras Clave de Respaldo (separadas por coma)
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                        value={comp.tolerance_keywords || ''}
                        onChange={(e) => updateComponent(comp.id, { tolerance_keywords: e.target.value })}
                        placeholder="ej. cohesión, desacoplamiento, módulos"
                      />
                    </div>
                  </div>
                </div>
              )}

              {comp.type === 'MULTIPLE_CHOICE' && (
                <div style={{ backgroundColor: 'var(--color-surface-inset)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Opciones y Respuesta Correcta
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {(comp.options || []).map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="radio"
                          name={`correct-${comp.id}`}
                          checked={comp.correct_choice === opt}
                          onChange={() => updateComponent(comp.id, { correct_choice: opt })}
                        />
                        <input
                          type="text"
                          className="input-field"
                          style={{ backgroundColor: 'var(--color-surface)', padding: '0.4rem 0.6rem' }}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(comp.options || [])];
                            newOpts[optIdx] = e.target.value;
                            updateComponent(comp.id, { options: newOpts });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {comp.type === 'TRUE_FALSE' && (
                <div style={{ backgroundColor: 'var(--color-surface-inset)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Respuesta Correcta
                  </label>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`tf-${comp.id}`}
                        checked={comp.correct_bool === true}
                        onChange={() => updateComponent(comp.id, { correct_bool: true })}
                      />
                      <span>Verdadero</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`tf-${comp.id}`}
                        checked={comp.correct_bool === false}
                        onChange={() => updateComponent(comp.id, { correct_bool: false })}
                      />
                      <span>Falso</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
