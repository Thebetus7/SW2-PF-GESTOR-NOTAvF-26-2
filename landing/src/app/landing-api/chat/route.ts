import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
}

const BASE_SYSTEM_PROMPT = `
Eres el Asistente Virtual Inteligente de "GestorNotas IA", la plataforma universitaria integral para evaluación, escaneo QR y corrección asistida con Inteligencia Artificial Multimodal.

TUS CAPACIDADES Y CONOCIMIENTOS CLAVE:
1. ARQUITECTURA Y MÓDULOS:
   - Módulo Docente: Gestión de asignaturas (Mis Materias -> Aulas -> Exámenes), diseño modular de rúbricas (preguntas abiertas con contexto y tolerancia pedagógica, opción múltiple, V/F), generación masiva de exámenes membretados con códigos QR criptográficos y consolidado de actas en Excel.
   - App Móvil Flutter: Escaneo de ultra alta velocidad (<100ms) de códigos QR impresos en las hojas, digitalización por fotos JPG nítidas en ráfaga (hasta 40 pruebas en 3 min) y envío directo al backend Django.
   - Portal Estudiantes: Consulta transparente con carnet de identidad (C.I.) o matrícula, con desglose ítem por ítem, puntajes y retroalimentación constructiva de la IA.
   - Motor IA Multimodal: Calificación objetiva comparando respuestas manuscritas físicas contra rúbricas docentes, con supervisión docente.

2. CANALES OFICIALES:
   - Planes de demostración: Básico $3 USD/mes (1 docente, 50 estudiantes, 3 materias, 50 evaluaciones con IA al mes) e Institucional $5 USD/mes (5 docentes, 200 estudiantes, 10 materias, 200 evaluaciones con IA al mes). Son ejemplos ficticios; no se realizan cobros.
   - Correo Institucional: oficina@edugrade.com
   - WhatsApp Oficial: +591 77389330 (https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA)
   - Repositorio GitHub: https://github.com/Thebetus7/SW2-PF-GESTOR-NOTAvF-26-2
   - Acceso al Software: /app/login

DIRECTRICES:
- Sé empático, profesional, claro y pedagógico.
- Utiliza formato Markdown con negritas y viñetas para que la lectura sea atractiva.
- Responde siempre en español.
- Si te preguntan sobre materias, aulas o exámenes reales registrados en el sistema, utiliza la INFORMACIÓN ACTUALIZADA DE LA BASE DE DATOS proporcionada abajo.
`.trim();

// Función para obtener información en tiempo real de la base de datos (RAG ligero)
async function fetchSystemKnowledge(): Promise<string> {
  const backendBase =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
    'http://127.0.0.1:8000';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(`${backendBase}/api/v1/system-knowledge/`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!res.ok) return '';

    const data = await res.json();
    if (data.status !== 'success') return '';

    const parts: string[] = ['\n\n--- INFORMACIÓN EN TIEMPO REAL DE LA BASE DE DATOS ACADÉMICA ---'];

    if (data.summary) {
      parts.push(
        `• Métricas Globales: ${data.summary.total_subjects} materias activas, ${data.summary.total_parallels} aulas, ${data.summary.total_exams} exámenes configurados, ${data.summary.total_teachers} docentes y ${data.summary.total_students} estudiantes inscritos.`
      );
    }

    if (Array.isArray(data.subjects) && data.subjects.length > 0) {
      const subjList = data.subjects.map((s: any) => `${s.name} (${s.code})`).join(', ');
      parts.push(`• Asignaturas registradas: ${subjList}.`);
    }

    if (Array.isArray(data.parallels) && data.parallels.length > 0) {
      const parList = data.parallels.map((p: any) => `${p.subject} (Aula ${p.group}, ${p.period})`).join('; ');
      parts.push(`• Aulas / Paralelos habilitados: ${parList}.`);
    }

    if (Array.isArray(data.exams) && data.exams.length > 0) {
      const examList = data.exams.map((e: any) => `"${e.title}" en ${e.subject} (${e.total_score} pts, ${e.components_count} ítems evaluativos)`).join('; ');
      parts.push(`• Exámenes diseñados con rúbrica IA: ${examList}.`);
    }

    return parts.join('\n');
  } catch {
    // Si el backend no responde a tiempo, continuar con la base de conocimientos fija
    return '\n\n• Base de Datos: Materias iniciales Cálculo I (Aula A) y Álgebra Lineal (Aula B) con exámenes parciales de 100 puntos y rúbricas activas.';
  }
}

// Inferencia con Google Gemini API
async function callGemini(
  systemPrompt: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<string | null> {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  const contents = messages.slice(-6).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content.slice(0, 600) }],
  }));

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        }),
      });

      if (!res.ok) {
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch {
      continue;
    }
  }

  return null;
}

// Fallback contextual cuando no hay APIs o se agota cuota
function getFallbackResponse(query: string, knowledge: string): string {
  const q = query.toLowerCase();

  if (
    q.includes('hola') ||
    q.includes('buenos') ||
    q.includes('buenas') ||
    q.includes('saludos') ||
    q.includes('inicio')
  ) {
    return `¡Hola! 👋 Bienvenido al asistente inteligente de **GestorNotas IA**.

Puedo ayudarte a resolver cualquier consulta sobre la plataforma:
- 📚 **Materias y Aulas:** Cómo se organizan y qué asignaturas están registradas.
- 📝 **Constructor de Exámenes:** Diseño de preguntas con rúbricas y tolerancias pedagógicas.
- 📱 **App Móvil Flutter:** Escaneo ultrarrápido con códigos QR criptográficos.
- 🤖 **Calificación con IA:** Corrección automática de respuestas manuscritas con Google Gemini.
- 💬 **WhatsApp Oficial:** [+591 77389330](https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA)

¿Sobre qué módulo o tema te gustaría conocer más detalles?`;
  }

  if (
    q.includes('materia') ||
    q.includes('curso') ||
    q.includes('aula') ||
    q.includes('paralelo') ||
    q.includes('examen') ||
    q.includes('base de datos') ||
    q.includes('datos')
  ) {
    return `**Estado Actual de la Base de Datos Académica:**

${knowledge.trim() || '• Materias activas: Cálculo I (Aula A) y Álgebra Lineal (Aula B).\n• Exámenes configurados: Primer Examen Parcial y Examen Diagnóstico.'}

Los docentes pueden crear nuevas materias y generar los exámenes en PDF con códigos QR únicos para sus estudiantes.`;
  }

  if (
    q.includes('whatsapp') ||
    q.includes('contacto') ||
    q.includes('telefono') ||
    q.includes('demo') ||
    q.includes('precio')
  ) {
    return `¡Con gusto te orientamos! Puedes comunicarte directamente con nuestro equipo técnico y comercial:

📱 **WhatsApp:** [+591 77389330](https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA)

Ofrecemos asesoría para la integración del software en facultades universitarias y colegios.`;
  }

  return `**GestorNotas IA — Información del Sistema:**

- 🎯 **Propósito:** Digitalización y calificación con IA de exámenes físicos manuscritos.
- 🚀 **Acceso al Software:** Puedes ingresar directamente en [/app/login](/app/login) para probar con el profesor demo.
- 📱 **Soporte Directo:** [+591 77389330](https://wa.me/59177389330)

¿Deseas conocer más sobre el escáner móvil o la creación de rúbricas?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'El campo "messages" es obligatorio y debe ser un arreglo no vacío.' },
        { status: 400 }
      );
    }

    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== 'string') {
      return NextResponse.json(
        { error: 'El último mensaje debe contener texto válido.' },
        { status: 400 }
      );
    }

    const sanitizedQuery = lastMessage.content.trim().slice(0, 500);

    // 1. Obtener contexto en tiempo real de la base de datos (RAG)
    const liveKnowledge = await fetchSystemKnowledge();
    const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}\n${liveKnowledge}`;

    // 2. Intentar con Google Gemini API (clave configurada en el sistema)
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiApiKey) {
      const geminiReply = await callGemini(fullSystemPrompt, body.messages, geminiApiKey);
      if (geminiReply) {
        return NextResponse.json({
          response: geminiReply,
          source: 'gemini',
        });
      }
    }

    // 3. Intentar con GroqCloud Llama-3 si está disponible
    const groqApiKey = process.env.GROQ_API_KEY?.trim();
    if (groqApiKey) {
      try {
        const groq = new Groq({ apiKey: groqApiKey });
        const history = body.messages.slice(-6).map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content.slice(0, 500),
        }));

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'system', content: fullSystemPrompt }, ...history],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.5,
          max_tokens: 800,
        });

        const reply = chatCompletion.choices[0]?.message?.content;
        if (reply) {
          return NextResponse.json({
            response: reply,
            source: 'groq',
          });
        }
      } catch (e) {
        console.warn('[Chatbot API] Error con Groq:', e);
      }
    }

    // 4. Contingencia context-aware con conocimiento de la base de datos
    return NextResponse.json({
      response: getFallbackResponse(sanitizedQuery, liveKnowledge),
      source: 'fallback',
    });
  } catch (err) {
    console.error('[Chatbot API] Error general:', err);
    return NextResponse.json(
      {
        response:
          'Ocurrió una pausa de conexión. Puedes escribirnos directamente a nuestro **[WhatsApp Oficial (+591 77389330)](https://wa.me/59177389330)**.',
        source: 'fallback',
      },
      { status: 200 }
    );
  }
}
