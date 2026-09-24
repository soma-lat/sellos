import { signIn, signUp } from "./actions";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  return <main><div className="card narrow-card"><h1 className="page-title">Bienvenido</h1>
    <p>Entra o crea tu cuenta. Usarás la misma cuenta como cliente o personal de negocio.</p>
    {params.error && <p className="error">{params.error}</p>}{params.message && <p className="notice">{params.message}</p>}
    <form className="form"><label>Correo<input name="email" type="email" required placeholder="tu@correo.com" /></label><label>Contraseña<input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" /></label><div className="actions"><button formAction={signIn}>Iniciar sesión</button><button className="secondary" formAction={signUp}>Crear cuenta</button></div></form>
  </div></main>;
}
