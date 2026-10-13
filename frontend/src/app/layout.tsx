import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gestor de Exámenes y Notas IA',
  description: 'Sistema integral de evaluación física manuscrita asistida con IA Multimodal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="light">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
