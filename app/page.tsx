import Link from "next/link";

export default function Home() {
  return <main><section className="hero">
    <p className="brand">LEALTAD, SIN COMPLICACIONES</p>
    <h1>Cada compra acerca una recompensa.</h1>
    <p>Una tarjeta digital de sellos para que tus clientes regresen. Registra compras en segundos y premia su fidelidad.</p>
    <div className="actions"><Link className="button" href="/auth">Crear mi cuenta</Link><Link className="button secondary" href="/cliente">Ver mi tarjeta</Link></div>
  </section><section className="grid">
    <article className="card"><h3>1. Acumula</h3><p>El negocio registra cada compra como un sello.</p></article>
    <article className="card"><h3>2. Avanza</h3><p>El cliente consulta su progreso desde cualquier dispositivo.</p></article>
    <article className="card"><h3>3. Canjea</h3><p>Al completar la meta, la recompensa se activa.</p></article>
  </section></main>;
}
