import { createClient } from "@/lib/supabase/server";
import { StampForm, RedeemForm } from "@/components/business-form";

type Program = {
  id: string;
  stamps_needed: number;
  reward_name: string;
  business: { id: string; name: string } | null;
};

export default async function NegocioPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loyalty_programs")
    .select("id, stamps_needed, reward_name, business:businesses(id, name)")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  const program = data as unknown as Program | null;
  if (!program?.business) {
    return <main><div className="card narrow-card"><h1 className="page-title">No hay un programa activo</h1><p>Crea primero un negocio y su programa de sellos desde Supabase.</p></div></main>;
  }

  return <main>
    <p className="brand">{program.business.name.toUpperCase()}</p>
    <h1 className="page-title">Panel de caja</h1>
    <p>Prueba temporal sin login. Programa: <strong>{program.stamps_needed} sellos = {program.reward_name}</strong>.</p>
    <div className="grid">
      <section className="card"><h2>Registrar compra</h2><p>Escribe el correo con el que creaste al cliente en Supabase.</p><StampForm businessId={program.business.id} /></section>
      <section className="card"><h2>Canjear recompensa</h2><p>Solo se podrá canjear si el cliente ya alcanzó la meta.</p><RedeemForm businessId={program.business.id} /></section>
    </div>
  </main>;
}
