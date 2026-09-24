import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StampForm, RedeemForm } from "@/components/business-form";
import { signOut } from "@/app/auth/actions";

export default async function NegocioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const { data: memberships } = await supabase.from("business_memberships").select("business:businesses(id, name)").eq("user_id", user.id).in("role", ["owner", "staff"]);
  const business = memberships?.[0]?.business as unknown as { id: string; name: string } | null;
  if (!business) return <main><div className="card"><h1 style={{ fontSize: "2.5rem" }}>Panel de negocio</h1><p>Tu cuenta aún no tiene acceso de personal. Sigue el apartado <strong>Primer negocio</strong> del README para añadirla con SQL.</p><form action={signOut}><button className="secondary">Cerrar sesión</button></form></div></main>;
  return <main><p className="brand">{business.name.toUpperCase()}</p><h1 style={{ fontSize: "3.2rem" }}>Panel de caja</h1><p>Solo usa el correo con el que el cliente se registró.</p><div className="grid"><section className="card"><h2>Registrar compra</h2><p>Agrega un sello por una compra confirmada.</p><StampForm businessId={business.id} /></section><section className="card"><h2>Canjear recompensa</h2><p>Verifica que el cliente tenga sellos suficientes antes de entregar el premio.</p><RedeemForm businessId={business.id} /></section></div></main>;
}
