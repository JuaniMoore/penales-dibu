import './globals.css';

export const metadata = {
  title: 'Mirá que te como - Dibu Martínez',
  description: 'Simulador de atajar penales en primera persona.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
