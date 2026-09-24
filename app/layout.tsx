import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Club Sellos",
  description: "Programa de lealtad simple",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <nav>
          <Link className="brand" href="/">CLUB SELLOS</Link>
          <div className="navlinks">
            <Link href="/cliente?email=cliente@prueba.com">
              Tarjeta de prueba
            </Link>
            <Link className="button" href="/negocio">
              Panel de negocio
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
