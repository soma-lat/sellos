"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  redirect("/cliente");
}
export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  redirect("/auth?message=Revisa%20tu%20correo%20para%20confirmar%20tu%20cuenta.");
}
export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/"); }
