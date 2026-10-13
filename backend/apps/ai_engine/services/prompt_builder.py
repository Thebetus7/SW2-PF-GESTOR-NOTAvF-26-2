from typing import Any, Dict, List
from apps.exams.models import Exam

def build_exam_evaluation_prompt(exam: Exam, enrolled_students: List[Dict[str, str]]) -> str:
    """
    Construye el prompt de evaluación multimodal para Gemini, incorporando contexto extendido,
    tolerancias semánticas (estricta/moderada/flexible) y lista de alumnos del aula para emparejamiento.
    """
    students_list_str = "\n".join([
        f"- ID: {s.get('student_identifier', 'N/A')}, Nombre: {s.get('full_name', '')}"
        for s in enrolled_students
    ]) or "No se proporcionó lista de estudiantes previa."

    components_str = ""
    for comp in exam.components.all().order_by("order"):
        rubric = comp.options_or_rubric or {}
        tolerance = rubric.get("semantic_tolerance", "MODERADA")
        context = rubric.get("extended_context", "Sin contexto adicional")
        keywords = ", ".join(rubric.get("keywords", [])) or "Ninguna específica"
        expected = rubric.get("expected_answer") or rubric.get("correct_answer") or "N/A"

        components_str += f"""
---
Componente #{comp.order} (ID: {comp.id})
Tipo: {comp.type}
Puntaje Máximo: {comp.max_score} puntos
Enunciado: {comp.prompt}
Respuesta Correcta/Modelo: {expected}
Contexto Pedagógico / Explicación: {context}
Nivel de Tolerancia Semántica: {tolerance}
Palabras Clave Críticas: {keywords}
"""

    subject_name = exam.parallel.subject.name if (exam.parallel and exam.parallel.subject) else "Sin Asignatura"
    prompt = f"""
Eres un asistente pedagógico de alta precisión especializado en la evaluación de exámenes manuscritos físicos digitalizados.
Debes analizar visualmente las páginas del examen adjuntas (en formato JPG), transcribir las respuestas del alumno y asignar puntaje justificativo según las reglas y tolerancias provistas.

### DATOS DEL EXAMEN:
- Título: {exam.title}
- Materia: {subject_name}
- Puntaje Total: {exam.total_score}

### LISTA OFICIAL DE ESTUDIANTES DEL AULA (Para OCR y emparejamiento):
{students_list_str}

### COMPONENTES A EVALUAR:
{components_str}

### INSTRUCCIONES CRÍTICAS DE EVALUACIÓN:
1. Extrae el nombre manuscrito del alumno y/o su matrícula o ID en la cabecera de la hoja.
2. Compara el nombre/ID detectado con la lista oficial. Si hay coincidencia exacta o similitud fonética/ortográfica evidente, asócialo. Si no es legible o no coincide, indícalo.
3. Para cada componente:
   - Transcribe fielmente lo que el estudiante escribió a mano (`transcribed_answer`).
   - Evalúa según la tolerancia semántica especificada:
     * ESTRICTA: La respuesta debe coincidir exactamente en significado técnico y terminología clave.
     * MODERADA: Acepta variaciones de redacción, sinónimos y explicaciones equivalentes siempre que la idea central sea correcta.
     * FLEXIBLE: Prioriza la demostración de comprensión general del concepto sobre el rigor formal.
   - Asigna un puntaje (`score_assigned`) entre 0 y el puntaje máximo del componente.
   - Proporciona una justificación breve, constructiva y clara (`feedback`).
4. Retorna EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura exacta:

{{
  "student_identifier_detected": "matrícula o null",
  "student_name_detected": "nombre detectado o null",
  "ocr_confidence": 0.95,
  "components_evaluation": [
    {{
      "component_id": "uuid del componente",
      "score_assigned": 10.0,
      "max_score": 10.0,
      "is_correct": true,
      "transcribed_answer": "transcripción de lo escrito por el alumno",
      "feedback": "justificación del puntaje asignado"
    }}
  ],
  "total_score": 10.0,
  "overall_feedback": "resumen general del desempeño del alumno"
}}
"""
    return prompt.strip()
