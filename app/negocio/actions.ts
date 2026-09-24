"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: string };

async function runRpc(name: "award_stamp" | "redeem_reward", formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const businessId = String(formData.get("businessId") || "");
  if (!email || !businessId) return { error: "Completa el correo del cliente." };
  const { error } = await supabase.rpc(name, { p_business_id: businessId, p_customer_email: email });
  if (error) return { error: error.message };
  revalidatePath("/cliente"); revalidatePath("/negocio");
  return { success: name === "award_stamp" ? "Sello registrado correctamente." : "Recompensa canjeada correctamente." };
}
export async function awardStamp(_: ActionState, formData: FormData) { return runRpc("award_stamp", formData); }
export async function redeemReward(_: ActionState, formData: FormData) { return runRpc("redeem_reward", formData); }
