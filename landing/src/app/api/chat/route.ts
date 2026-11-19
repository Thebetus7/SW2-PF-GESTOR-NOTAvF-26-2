import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
}

const SYSTEM_PROMPT = `
Eres el Asistente Virtual Oficial de "GestorNotas IA", una plataforma universitaria líder en digitalización, escaneo QR y calificación automatizada de exámenes físicos manuscritos mediante Visión Artificial IA Multimodal.

Tus conocimientos clave son:
1. MÓDULOS DEL SISTEMA:
   - Módulo Docente: Gestión integral de asignaturas (Mis Materias -> Aulas -> Exámenes), configuración de rúbricas pedagógicas ponderadas, generación masiva de hojas membretadas con códigos QR criptográficos individuales por estudiante, y consolidado de actas en Excel/CSV.
   - Módulo Estudiante: Portal de consulta rápida mediante C.I. o correo institucional, visualización desglosada ítem por ítem con puntajes parciales y retroalimentación pedagógica explicativa.
   - App Móvil Flutter: Escáner de ultra alta velocidad que decodifica el QR del estudiante en <100ms, captura fotos JPG en ráfaga (hasta 40 exámenes en 3 minutos) y las sube de manera segura al servidor Django.

2. DIFERENCIADORES Y BENEFICIOS:
   - Ahorro de más del 85% del tiempo de corrección manual para docentes.
   - Evaluación objetiva y transparente basada en rúbricas oficiales.
   - Detección de caligrafía y razonamiento semántico (no solo opción múltiple, también desarrollo, matemáticas y diagramas).
   - Prevención de suplantaciones y hojas duplicadas gracias a la firma digital QR.

3. CANALES DE CONTACTO Y ACCESOS:
   - WhatsApp Oficial: +591 77389330 (enlace directo: https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA)
   - Repositorio GitHub: https://github.com/edberto/gestor-notas-ia
   - Software en Producción: /app (o /login)

DIRECTRICES:
- Sé conciso, profesional, cordial y pedagógico.
- Usa formato Markdown con negritas y viñetas para mayor claridad.
- Si preguntan por cotizaciones, demostraciones o soporte comercial, orienta siempre al WhatsApp oficial (+591 77389330).
- Responde siempre en español.
`.trim();

function getFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  // WhatsApp / Contacto
  if (
    q.includes('whatsapp') ||
    q.includes('contacto') ||
    q.includes('telefono') ||
    q.includes('asesor') ||
    q.includes('demo') ||
    q.includes('precio') ||
    q.includes('costo') ||
    q.includes('cotiz')
  ) {
    return `¡Con gusto te ayudamos! Puedes comunicarte directamente con nuestro equipo técnico y comercial a través de **WhatsApp oficial**:

📱 **WhatsApp:** [+591 77389330](https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA)

Nuestro equipo puede brindarte una demostración personalizada y resolver dudas de implementación para tu facultad o colegio.`;
  }

  // GitHub / Código fuente
  if (
    q.includes('github') ||
    q.includes('codigo') ||
    q.includes('repositorio') ||
    q.includes('repo') ||
    q.includes('git')
  ) {
    return `El código fuente y la arquitectura de **GestorNotas IA** se encuentran en nuestro repositorio oficial:

🐙 **GitHub:** [https://github.com/edberto/gestor-notas-ia](https://github.com/edberto/gestor-notas-ia)

Incluye la arquitectura SDD completa, backend Django REST, frontend Next.js y la app móvil Flutter.`;
  }

  // Módulo Móvil / QR / Escaneo
  if (
    q.includes('qr') ||
    q.includes('escan') ||
    q.includes('flutter') ||
    q.includes('movil') ||
    q.includes('celular') ||
    q.includes('camara') ||
    q.includes('foto')
  ) {
    return `**App Móvil Flutter — Escaneo QR y Captura de Fotos JPG:**

1. **Lectura instantánea de QR:** Al apuntar la cámara al examen, decodifica el código QR del estudiante en menos de 100 ms.
2. **Modo Ráfaga:** Permite al docente digitalizar 40 exámenes en menos de 3 minutos.
3. **Optimización de Imagen:** Aplica corrección de perspectiva y compresión JPG para subidas ligeras al servidor Django.
4. **Sincronización:** Si no hay internet en el aula, almacena en cola local y sube al conectarse a Wi-Fi.`;
  }

  // Módulo Docentes / Materias / Rúbricas
  if (
    q.includes('docente') ||
    q.includes('profesor') ||
    q.includes('materia') ||
    q.includes('aula') ||
    q.includes('rubrica') ||
    q.includes('acta') ||
    q.includes('plantilla')
  ) {
    return `**Módulo para Docentes — Flujo: Mis Materias &rarr; Aulas &rarr; Exámenes:**

- **Gestión Curricular:** Organiza materias, grupos y nóminas de alumnos.
- **Rúbricas Pedagógicas:** Define criterios cualitativos y cuantitativos que la IA tomará como referencia estricta.
- **Generación de Hojas QR:** Emite PDFs membretados donde cada hoja lleva un código QR único ligado al estudiante y al examen.
- **Consolidado Oficial:** Exporta actas de calificaciones con estadísticas y promedios directamente a Excel o CSV.`;
  }

  // Módulo Estudiantes / Notas / Desglose
  if (
    q.includes('estudiante') ||
    q.includes('alumno') ||
    q.includes('nota') ||
    q.includes('portal') ||
    q.includes('consulta') ||
    q.includes('desglose') ||
    q.includes('ci')
  ) {
    return `**Módulo para Estudiantes — Portal de Consulta y Desglose:**

- **Acceso Rápido:** Consulta tus calificaciones ingresando tu número de carnet (C.I.) o correo institucional.
- **Transparencia Total:** No solo ves la nota final; accedes al puntaje obtenido por cada ejercicio y criterio.
- **Feedback Constructivo:** La IA redacta sugerencias pedagógicas para entender las fortalezas y áreas de mejora.`;
  }

  // Calificación IA / Visión Multimodal
  if (
    q.includes('ia') ||
    q.includes('inteligencia artificial') ||
    q.includes('calific') ||
    q.includes('multimodal') ||
    q.includes('vision') ||
    q.includes('manuscrit') ||
    q.includes('tiempo') ||
    q.includes('85')
  ) {
    return `**Calificación Inteligente con IA Multimodal:**

- **Visión Artificial:** Interpreta caligrafía manuscrita, esquemas técnicos, operaciones matemáticas y pseudocódigo.
- **Cotejo con Rúbricas:** Compara la respuesta manuscrita contra la solución y rúbrica configurada por el profesor.
- **Ahorro del 85%:** Reduce horas de corrección repetitiva a menos de 3 segundos por examen.
- **Control Humano:** El docente siempre tiene la potestad de revisar, auditar o modificar la nota asignada antes de publicarla.`;
  }

  // Acceso al software
  if (
    q.includes('software') ||
    q.includes('plataforma') ||
    q.includes('entrar') ||
    q.includes('ingresar') ||
    q.includes('login') ||
    q.includes('app')
  ) {
    return `Puedes ingresar a la plataforma web de **GestorNotas IA** en cualquier momento:

🚀 **Plataforma Web:** [Ingresar a GestorNotas](/app)

Allí podrás iniciar sesión como docente o consultar el portal de estudiantes.`;
  }

  // Respuesta por defecto
  return `¡Hola! Soy el asistente virtual de **GestorNotas IA**.

Puedo ayudarte con información sobre:
- 👨‍🏫 **Módulo Docentes:** Creación de rúbricas y generación de hojas de examen con QR.
- 📱 **App Móvil Flutter:** Escaneo QR y captura de fotos JPG a alta velocidad.
- 🎓 **Portal Estudiantes:** Consulta y desglose pedagógico de calificaciones.
- 🤖 **Calificación con IA:** Cómo funciona la visión artificial multimodal y el ahorro del 85% de tiempo.
- 💬 **WhatsApp Oficial:** [+591 77389330](https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20GestorNotas%20IA)
- 🐙 **GitHub:** [Ver código fuente](https://github.com/edberto/gestor-notas-ia)

¿Sobre qué módulo o funcionalidad te gustaría profundizar?`;
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

    // Mitigación de inyecciones y control de tamaño (máx 500 caracteres)
    const sanitizedQuery = lastMessage.content.trim().slice(0, 500);

    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    // Modo 1: Si hay API Key de Groq configurada, realizar inferencia con llama-3.3-70b-versatile
    if (groqApiKey) {
      try {
        const groq = new Groq({ apiKey: groqApiKey });

        const history = body.messages
          .slice(-6)
          .map((m) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content.slice(0, 500),
          }));

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.5,
          max_tokens: 800,
        });

        const reply =
          chatCompletion.choices[0]?.message?.content ||
          getFallbackResponse(sanitizedQuery);

        return NextResponse.json({
          response: reply,
          source: 'groq',
        });
      } catch (groqErr) {
        console.warn(
          '[Chatbot API] Error consultando GroqCloud, conmutando a fallback local:',
          groqErr
        );
        // Tolerancia a fallos: respuesta de contingencia inmediata
        return NextResponse.json({
          response: getFallbackResponse(sanitizedQuery),
          source: 'fallback',
        });
      }
    }

    // Modo 2: Fallback automático cuando no hay GROQ_API_KEY
    return NextResponse.json({
      response: getFallbackResponse(sanitizedQuery),
      source: 'fallback',
    });
  } catch (err) {
    console.error('[Chatbot API] Error procesando solicitud:', err);
    return NextResponse.json(
      {
        response:
          'Ocurrió un error inesperado al procesar tu consulta. Si necesitas asistencia inmediata, escríbenos a nuestro [WhatsApp Oficial (+591 77389330)](https://wa.me/59177389330).',
        source: 'fallback',
      },
      { status: 200 }
    );
  }
}
