import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GestorNotas IA — Digitalización, Escaneo QR y Calificación Multimodal',
  description:
    'Plataforma integral de gestión académica con evaluación automatizada de exámenes manuscritos mediante Visión Artificial IA, códigos QR y rúbricas pedagógicas precisas.',
  keywords: [
    'Gestor de Notas',
    'Inteligencia Artificial',
    'Calificación de exámenes',
    'Escaneo QR',
    'GroqCloud',
    'Docentes',
    'Universidad',
  ],
  authors: [{ name: 'GestorNotas IA Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col selection:bg-[#C4956A]/30 selection:text-[#3E2723]">
        {children}
      </body>
    </html>
  );
}
