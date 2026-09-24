import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Card = { stamps: number; program: { business: { name: string } | null; stamps_needed: number; reward_name: string } | null };

export default async function ClientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const { data } = await supabase.from("loyalty_cards").select("stamps, program:loyalty_programs(business:businesses(name), stamps_needed, reward_name)").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const card = data as unknown as Card | null;
  if (!card?.program) return <main><div className="card"><h1 style={{ fontSize: "2.5rem" }}>Tu tarjeta está lista</h1><p>Aún no participas en un programa. Pide al negocio que registre tu primera compra usando <strong>{user.email}</strong>.</p><Link className="button" href="/negocio">Ir al panel de negocio</Link></div></main>;
  const { stamps_needed, reward_name, business } = card.program;
  const stamps = card.stamps;
  const available = stamps >= stamps_needed;
  return <main><p className="brand">{business?.name ?? "CLUB DE LEALTAD"}</p><h1 style={{ fontSize: "3.2rem" }}>Mi tarjeta</h1><div className="card" style={{ maxWidth: "620px" }}>
    <h2>{available ? "¡Tu recompensa está lista!" : `Llevas ${stamps} de ${stamps_needed} sellos`}</h2>
    <div className="progress"><span style={{ width: `${Math.min(100, (stamps / stamps_needed) * 100)}%` }} /></div>
    <div className="stamps">{Array.from({ length: stamps_needed }, (_, i) => <span className={`stamp ${i < stamps ? "on" : ""}`} key={i}>{i < stamps ? "✓" : i + 1}</span>)}</div>
    <p>{available ? <>Presenta tu correo al personal para canjear: <strong>{reward_name}</strong>.</> : <>Te faltan <strong>{stamps_needed - stamps}</strong> compras para obtener: <strong>{reward_name}</strong>.</>}</p>
  </div></main>;
}
