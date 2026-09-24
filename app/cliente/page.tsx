import { createClient } from "@/lib/supabase/server";

type LoyaltyCard = {
  stamps: number;
  program: {
    stamps_needed: number;
    reward_name: string;
    business: { name: string } | null;
  } | null;
};

export default async function ClientePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "cliente@prueba.com" } = await searchParams;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, full_name, email")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!customer) {
    return <main><div className="card narrow-card"><h1 className="page-title">Cliente no encontrado</h1><p>No existe una tarjeta asociada a <strong>{email}</strong>.</p></div></main>;
  }

  const { data } = await supabase
    .from("loyalty_cards")
    .select("stamps, program:loyalty_programs(stamps_needed, reward_name, business:businesses(name))")
    .eq("customer_id", customer.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const card = data as unknown as LoyaltyCard | null;
  if (!card?.program) {
    return <main><div className="card narrow-card"><h1 className="page-title">Aún no tienes tarjeta</h1><p>{customer.full_name ?? customer.email} todavía no participa en un programa de sellos.</p></div></main>;
  }

  const { stamps_needed, reward_name, business } = card.program;
  const stamps = card.stamps;
  const available = stamps >= stamps_needed;

  return <main>
    <p className="brand">{business?.name?.toUpperCase() ?? "CLUB DE LEALTAD"}</p>
    <h1 className="page-title">Hola, {customer.full_name ?? "cliente"}</h1>
    <div className="card narrow-card">
      <h2>{available ? "¡Tu recompensa está lista!" : `Llevas ${stamps} de ${stamps_needed} sellos`}</h2>
      <div className="progress"><span style={{ width: `${Math.min(100, (stamps / stamps_needed) * 100)}%` }} /></div>
      <div className="stamps">{Array.from({ length: stamps_needed }, (_, index) => <span className={`stamp ${index < stamps ? "on" : ""}`} key={index}>{index < stamps ? "✓" : index + 1}</span>)}</div>
      <p>{available ? <>Puedes canjear: <strong>{reward_name}</strong>.</> : <>Te faltan <strong>{stamps_needed - stamps}</strong> sellos para obtener: <strong>{reward_name}</strong>.</>}</p>
      <p className="muted">Prueba temporal: <code>/cliente?email=cliente@prueba.com</code></p>
    </div>
  </main>;
}
