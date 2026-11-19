import { POST } from '../src/app/api/chat/route.ts';

async function runTests() {
  console.log('--- Probando Endpoint /api/chat ---');

  // Test 1: Fallback general sin GROQ_API_KEY
  {
    const req = new Request('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '¿Qué módulos ofrece el sistema?' }],
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    console.log('Test 1 (General Fallback):', res.status, data.source);
    if (res.status !== 200 || data.source !== 'fallback' || !data.response.includes('Docentes')) {
      throw new Error('Test 1 falló');
    }
  }

  // Test 2: Consulta sobre WhatsApp
  {
    const req = new Request('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '¿Cuál es el número de WhatsApp oficial para contacto?' }],
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    console.log('Test 2 (WhatsApp Info):', res.status, data.source);
    if (!data.response.includes('+591 77389330') || !data.response.includes('https://wa.me/59177389330')) {
      throw new Error('Test 2 falló');
    }
  }

  // Test 3: Consulta sobre escaneo QR y Flutter móvil
  {
    const req = new Request('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '¿Cómo funciona la app móvil Flutter con el escaneo QR?' }],
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    console.log('Test 3 (Mobile QR):', res.status, data.source);
    if (!data.response.includes('Flutter') || !data.response.includes('QR')) {
      throw new Error('Test 3 falló');
    }
  }

  // Test 4: Validación de mensajes inválidos
  {
    const req = new Request('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });

    const res = await POST(req);
    console.log('Test 4 (Empty messages):', res.status);
    if (res.status !== 400) {
      throw new Error('Test 4 falló');
    }
  }

  console.log('✅ Todos los tests unitarios del endpoint /api/chat pasaron con éxito.');
}

runTests().catch((err) => {
  console.error('❌ Error en tests:', err);
  process.exit(1);
});
