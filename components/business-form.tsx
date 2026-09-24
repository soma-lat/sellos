"use client";
import { useActionState } from "react";
import { awardStamp, redeemReward, type ActionState } from "@/app/negocio/actions";

const initial: ActionState = {};
function Status({ state }: { state: ActionState }) { return <>{state.error && <p className="error">{state.error}</p>}{state.success && <p className="notice">{state.success}</p>}</>; }
export function StampForm({ businessId }: { businessId: string }) {
  const [state, action, pending] = useActionState(awardStamp, initial);
  return <form action={action} className="form"><input type="hidden" name="businessId" value={businessId} /><label>Correo del cliente<input type="email" name="email" required placeholder="cliente@correo.com" /></label><button disabled={pending}>{pending ? "Guardando…" : "Sumar 1 sello"}</button><Status state={state} /></form>;
}
export function RedeemForm({ businessId }: { businessId: string }) {
  const [state, action, pending] = useActionState(redeemReward, initial);
  return <form action={action} className="form"><input type="hidden" name="businessId" value={businessId} /><label>Correo del cliente<input type="email" name="email" required placeholder="cliente@correo.com" /></label><button disabled={pending} className="secondary">{pending ? "Validando…" : "Canjear recompensa"}</button><Status state={state} /></form>;
}
