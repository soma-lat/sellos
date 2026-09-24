import "./globals.css";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Club Sellos", description: "Programa de lealtad simple" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <html lang="es"><body>
    <nav><Link className="brand" href="/">CLUB SELLOS</Link><div className="navlinks">
      {user ? <><Link href="/cliente">Mi tarjeta</Link><Link href="/negocio">Negocio</Link></> : <Link className="button" href="/auth">Entrar</Link>}
    </div></nav>{children}
  </body></html>;
}
