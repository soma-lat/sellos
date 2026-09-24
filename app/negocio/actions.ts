"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: string };

async function findCustomerAndProgram(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const businessId = String(formData.get("businessId") || "");

  if (!email || !businessId) return { error: "Completa el correo del cliente." as const };

  const [{ data: customer }, { data: program }] = await Promise.all([
    supabase.from("customers").select("id").eq("email", email).maybeSingle(),
    supabase.from("loyalty_programs").select("id, stamps_needed, reward_name").eq("business_id", businessId).eq("active", true).maybeSingle(),
  ]);

  if (!customer) return { error: "No existe un cliente con ese correo." as const };
  if (!program) return { error: "No existe un programa activo para este negocio." as const };
  return { supabase, customer, program };
}

export async function awardStamp(_: ActionState, formData: FormData): Promise<ActionState> {
  const result = await findCustomerAndProgram(formData);
  if ("error" in result) return result;
  const { supabase, customer, program } = result;

  const { data: existingCard } = await supabase
    .from("loyalty_cards")
    .select("id, stamps")
    .eq("customer_id", customer.id)
    .eq("program_id", program.id)
    .maybeSingle();

  let cardId: string | undefined;
  if (existingCard) {
    const { data, error } = await supabase.from("loyalty_cards")
      .update({ stamps: existingCard.stamps + 1, updated_at: new Date().toISOString() })
      .eq("id", existingCard.id).select("id").single();
    if (error) return { error: error.message };
    cardId = data.id;
  } else {
    const { data, error } = await supabase.from("loyalty_cards")
      .insert({ customer_id: customer.id, program_id: program.id, stamps: 1 })
      .select("id").single();
    if (error) return { error: error.message };
    cardId = data.id;
  }

  const { error } = await supabase.from("loyalty_events")
    .insert({ card_id: cardId, type: "stamp_awarded", notes: "Compra registrada desde el panel" });
  if (error) return { error: error.message };

  revalidatePath("/cliente");
  revalidatePath("/negocio");
  return { success: "Sello registrado correctamente." };
}

export async function redeemReward(_: ActionState, formData: FormData): Promise<ActionState> {
  const result = await findCustomerAndProgram(formData);
  if ("error" in result) return result;
  const { supabase, customer, program } = result;

  const { data: card } = await supabase.from("loyalty_cards")
    .select("id, stamps")
    .eq("customer_id", customer.id)
    .eq("program_id", program.id)
    .maybeSingle();

  if (!card || card.stamps < program.stamps_needed) {
    return { error: "El cliente aún no tiene sellos suficientes." };
  }

  const { error: updateError } = await supabase.from("loyalty_cards")
    .update({ stamps: card.stamps - program.stamps_needed, updated_at: new Date().toISOString() })
    .eq("id", card.id);
  if (updateError) return { error: updateError.message };

  const { error: eventError } = await supabase.from("loyalty_events")
    .insert({ card_id: card.id, type: "reward_redeemed", notes: `Canje: ${program.reward_name}` });
  if (eventError) return { error: eventError.message };

  revalidatePath("/cliente");
  revalidatePath("/negocio");
  return { success: "Recompensa canjeada correctamente." };
}
