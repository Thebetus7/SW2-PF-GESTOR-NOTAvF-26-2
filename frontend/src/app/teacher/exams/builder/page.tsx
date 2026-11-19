'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
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

function ExamBuilderContent() {
  const searchParams = useSearchParams();
  const initialParallelId = searchParams.get('parallel_id') || '';
  const examIdParam = searchParams.get('exam_id') || '';

  const [parallels, setParallels] = useState<ParallelItem[]>([]);
  const [parallelId, setParallelId] = useState(initialParallelId);
  const [editingExamId, setEditingExamId] = useState<string | null>(examIdParam || null);
  const [loadingExam, setLoadingExam] = useState<boolean>(!!examIdParam);
  const [title, setTitle] = useState(examIdParam ? '' : 'Primer Examen Parcial');
  const [description, setDescription] = useState(examIdParam ? '' : 'Lea atentamente cada pregunta y responda en los recuadros correspondientes.');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalScore, setTotalScore] = useState<number>(100);
  const [hasQrCode, setHasQrCode] = useState(true);

  const [components, setComponents] = useState<BuilderComponent[]>(
    examIdParam
      ? []
      : [
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
        ]
  );

  const [saving, setSaving] = useState(false);
  const [savedExamId, setSavedExamId] = useState<string | null>(examIdParam || null);
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

  useEffect(() => {
    if (!examIdParam) return;

    const fetchExistingExam = async () => {
      setLoadingExam(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token') || '';
        const examData: any = await apiClient(`/exams/exams/${examIdParam}/`, { token });

        if (examData) {
          setTitle(examData.title || '');
          setDescription(examData.description || '');
          if (examData.application_date) setApplicationDate(examData.application_date);
          if (examData.total_score) setTotalScore(Number(examData.total_score) || 100);
          if (examData.has_qr_code !== undefined) setHasQrCode(examData.has_qr_code);
          if (examData.parallel) setParallelId(examData.parallel);
          setSavedExamId(examData.id);

          if (Array.isArray(examData.components) && examData.components.length > 0) {
            const mapped = examData.components.map((c: any, idx: number) => {
              const rubric = c.options_or_rubric || {};
              const keywords = Array.isArray(rubric.tolerance_keywords)
                ? rubric.tolerance_keywords.join(', ')
                : (rubric.tolerance_keywords || '');

              let correctBool = true;
              if (c.type === 'TRUE_FALSE') {
                const ans = rubric.correct_answer ?? rubric.correcta;
                correctBool = ans === true || ans === 'Verdadero' || ans === 'V' || ans === 'true';
              }

              return {
                id: c.id ? String(c.id) : `c-${idx + 1}-${Date.now()}`,
                type: c.type as ComponentType,
                prompt: c.prompt || '',
                max_score: Number(c.max_score) || 0,
                context: rubric.context || rubric.criterio || '',
                tolerance: rubric.tolerance || 'MODERATE',
                tolerance_keywords: keywords,
                options: Array.isArray(rubric.options) && rubric.options.length > 0
                  ? rubric.options
                  : ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
                correct_choice: rubric.correct_answer || rubric.correcta || '',
                correct_bool: correctBool,
              };
            });
            setComponents(mapped);
          }
        }
      } catch (err: any) {
        console.error('Error al cargar examen a editar:', err);
        setError('No se pudo cargar la información del examen para editar.');
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExistingExam();
  }, [examIdParam]);

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

      const targetExamId = editingExamId || savedExamId;
      const url = targetExamId ? `/exams/exams/${targetExamId}/` : '/exams/exams/';
      const method = targetExamId ? 'PUT' : 'POST';

      const responseData: any = await apiClient(url, {
        method,
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

      setEditingExamId(responseData.id);
      setSavedExamId(responseData.id);
      setSuccessMsg(targetExamId ? 'Examen actualizado exitosamente. Los cambios ya se reflejan en el aula.' : 'Examen guardado exitosamente. Ya puede descargar el PDF para imprimir.');
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

  const currentParallel = parallels.find((p) => p.id === parallelId);
  const breadcrumbItems = [
    { label: 'Mis Materias', href: '/teacher/courses' },
    {
      label: currentParallel?.subject_name || 'Materia',
      href: '/teacher/courses',
    },
    {
      label: currentParallel ? `Aula ${currentParallel.group_code} (${currentParallel.period})` : 'Aula',
      href: parallelId ? `/teacher/parallels/${parallelId}/exams` : '/teacher/courses',
    },
    {
      label: 'Constructor de Exámenes',
      active: true,
    },
  ];

  return (
    <div>
      <Navbar userRole="TEACHER" userName="Profesor Evaluador" />

      <main className="max-w-5xl mx-auto my-4 sm:my-8 px-3 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-[var(--color-primary)] mb-1">
              {editingExamId ? 'Editar Examen y Rúbricas' : 'Constructor Modular de Exámenes'}
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">
              {editingExamId
                ? 'Modifique las preguntas, opciones y contexto pedagógico de este examen. Los cambios actualizarán la evaluación existente.'
                : 'Configure la rúbrica, preguntas y tolerancias pedagógicas para este examen. Las asignaturas y aulas se gestionan en Mis Materias.'}
            </p>
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <button
              onClick={handleSaveExam}
              disabled={saving || loadingExam}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5"
            >
              <Save size={18} />
              <span>{saving ? 'Guardando...' : editingExamId ? 'Actualizar Examen' : 'Guardar Examen'}</span>
            </button>
          </div>
        </header>

        {loadingExam && (
          <div className="p-6 text-center text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] mb-6">
            <p className="text-sm">Cargando preguntas y rúbricas del examen desde el servidor...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-[var(--color-error-bg)] text-[var(--color-error)] rounded-xl border border-[var(--color-error)] mb-6">
            <AlertCircle size={20} className="shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 sm:p-5 bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-xl border border-[var(--color-success)] mb-6">
            <div className="flex items-center gap-3 mb-3 font-semibold">
              <CheckCircle2 size={20} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => downloadPdf('with_qr')} className="btn-primary text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-2">
                <QrCode size={16} />
                <span>Descargar PDF con QR</span>
              </button>
              <button onClick={() => downloadPdf('without_qr')} className="btn-secondary text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-2">
                <Download size={16} />
                <span>Descargar PDF sin QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Datos Generales del Examen */}
        <section className="card mb-6">
          <h2 className="text-lg font-bold mb-4 font-headline">1. Parámetros del Examen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">Aula / Paralelo</label>
              <select className="input-field w-full" value={parallelId} onChange={(e) => setParallelId(e.target.value)}>
                {parallels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.subject_name} — Aula {p.group_code} ({p.period})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">Título de la Evaluación</label>
              <input type="text" className="input-field w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-1">
              <label className="block text-xs sm:text-sm font-semibold mb-1">Instrucciones en Hoja</label>
              <input type="text" className="input-field w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">Fecha de Aplicación</label>
              <input type="date" className="input-field w-full" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1">Puntaje Nominal Total</label>
              <input type="number" className="input-field w-full" value={totalScore} onChange={(e) => setTotalScore(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2.5 mt-2">
            <input type="checkbox" id="qrCheck" className="mt-1 sm:mt-0" checked={hasQrCode} onChange={(e) => setHasQrCode(e.target.checked)} />
            <label htmlFor="qrCheck" className="text-xs sm:text-sm text-[var(--color-text)] cursor-pointer">
              Incluir código QR identificador de calibración en la esquina superior del PDF
            </label>
          </div>
        </section>

        {/* Barra de Balanceo de Puntaje */}
        <div
          className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl mb-6 border ${
            isBalanced
              ? 'bg-[var(--color-surface)] border-[var(--color-border)]'
              : 'bg-[var(--color-warning-bg)] border-[var(--color-warning)]'
          }`}
        >
          <div>
            <strong className={`text-sm sm:text-base ${isBalanced ? 'text-[var(--color-primary)]' : 'text-[var(--color-warning)]'}`}>
              Balance de Calificación: {currentSum} / {totalScore} pts
            </strong>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
              {isBalanced ? '✓ La suma de los componentes coincide con el total nominal.' : '⚠ Ajuste los puntajes de los componentes para igualar el total.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button onClick={() => addComponent('OPEN')} className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm py-1.5 px-3">
              <Plus size={15} /> + Pregunta Abierta
            </button>
            <button onClick={() => addComponent('MULTIPLE_CHOICE')} className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm py-1.5 px-3">
              <Plus size={15} /> + Opción Múltiple
            </button>
            <button onClick={() => addComponent('TRUE_FALSE')} className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm py-1.5 px-3">
              <Plus size={15} /> + V / F
            </button>
          </div>
        </div>

        {/* Lista de Componentes */}
        <section className="flex flex-col gap-4 sm:gap-6 mb-12">
          {components.map((comp, idx) => (
            <div key={comp.id} className="card relative p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-bold bg-[var(--color-surface-inset)] px-2.5 py-1 rounded text-[var(--color-primary)]">
                    P{idx + 1}
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[var(--color-text)]">
                    {comp.type === 'OPEN' && 'Pregunta Abierta / Desarrollo'}
                    {comp.type === 'MULTIPLE_CHOICE' && 'Opción Múltiple'}
                    {comp.type === 'TRUE_FALSE' && 'Verdadero o Falso'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold">Pts:</label>
                    <input
                      type="number"
                      className="input-field w-16 sm:w-20 text-center py-1 px-2"
                      value={comp.max_score}
                      onChange={(e) => updateComponent(comp.id, { max_score: Number(e.target.value) })}
                    />
                  </div>
                  <button
                    onClick={() => removeComponent(comp.id)}
                    className="btn-secondary p-1.5 text-[var(--color-error)]"
                    title="Eliminar pregunta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Enunciado */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-semibold mb-1">Enunciado de la Pregunta</label>
                <textarea
                  rows={2}
                  className="input-field w-full"
                  value={comp.prompt}
                  onChange={(e) => updateComponent(comp.id, { prompt: e.target.value })}
                  placeholder="Redacte la consigna o interrogante para el estudiante..."
                />
              </div>

              {/* Configuración específica según tipo */}
              {comp.type === 'OPEN' && (
                <div className="bg-[var(--color-surface-inset)] p-3 sm:p-4 rounded-xl border border-[var(--color-border)] space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Contexto Pedagógico de Referencia (Para la IA)
                    </label>
                    <input
                      type="text"
                      className="input-field w-full bg-[var(--color-surface)]"
                      value={comp.context || ''}
                      onChange={(e) => updateComponent(comp.id, { context: e.target.value })}
                      placeholder="Respuesta ideal esperada o criterios clave para guiar a Gemini..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Nivel de Tolerancia Semántica
                      </label>
                      <select
                        className="input-field w-full bg-[var(--color-surface)]"
                        value={comp.tolerance || 'MODERATE'}
                        onChange={(e) => updateComponent(comp.id, { tolerance: e.target.value as any })}
                      >
                        <option value="STRICT">Estricta (Cálculos exactos / terminología formal)</option>
                        <option value="MODERATE">Moderada (Admite paráfrasis y sinónimos equivalentes)</option>
                        <option value="FLEXIBLE">Flexible (Enfocada en ideas clave y razonamiento general)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Palabras Clave de Respaldo (separadas por coma)
                      </label>
                      <input
                        type="text"
                        className="input-field w-full bg-[var(--color-surface)]"
                        value={comp.tolerance_keywords || ''}
                        onChange={(e) => updateComponent(comp.id, { tolerance_keywords: e.target.value })}
                        placeholder="ej. cohesión, desacoplamiento, módulos"
                      />
                    </div>
                  </div>
                </div>
              )}

              {comp.type === 'MULTIPLE_CHOICE' && (
                <div className="bg-[var(--color-surface-inset)] p-3 sm:p-4 rounded-xl border border-[var(--color-border)]">
                  <label className="block text-xs font-semibold mb-2">
                    Opciones y Respuesta Correcta
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                    {(comp.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${comp.id}`}
                          className="shrink-0"
                          checked={comp.correct_choice === opt}
                          onChange={() => updateComponent(comp.id, { correct_choice: opt })}
                        />
                        <input
                          type="text"
                          className="input-field w-full bg-[var(--color-surface)] py-1.5 px-3 text-xs sm:text-sm"
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
                <div className="bg-[var(--color-surface-inset)] p-3 sm:p-4 rounded-xl border border-[var(--color-border)]">
                  <label className="block text-xs font-semibold mb-2">
                    Respuesta Correcta
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`tf-${comp.id}`}
                        checked={comp.correct_bool === true}
                        onChange={() => updateComponent(comp.id, { correct_bool: true })}
                      />
                      <span>Verdadero</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
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

export default function ExamBuilderPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-secondary)' }}>
          Cargando constructor de exámenes...
        </div>
      }
    >
      <ExamBuilderContent />
    </Suspense>
  );
}
