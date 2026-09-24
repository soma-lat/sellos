import Link from "next/link";

export default function Home() {
  return <main><section className="hero">
    <p className="brand">LEALTAD, SIN COMPLICACIONES</p>
    <h1>Cada compra acerca una recompensa.</h1>
    <p>Prueba una tarjeta digital de sellos. Registra compras y consulta el avance del cliente sin necesidad de crear cuentas todavía.</p>
    <div className="actions">
      <Link className="button" href="/negocio">Abrir panel de negocio</Link>
      <Link className="button secondary" href="/cliente?email=cliente@prueba.com">Ver tarjeta de prueba</Link>
    </div>
  </section><section className="grid">
    <article className="card"><h3>1. Registra</h3><p>El negocio agrega un sello por cada compra confirmada.</p></article>
    <article className="card"><h3>2. Consulta</h3><p>Abre la tarjeta del cliente usando su correo electrónico.</p></article>
    <article className="card"><h3>3. Canjea</h3><p>Al completar la meta, la recompensa se puede canjear.</p></article>
  </section></main>;
}
