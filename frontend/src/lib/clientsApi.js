import { supabase } from "./supabaseClient";

export async function getClients(userId) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addClient({ userId, name, email, company }) {
  const { error } = await supabase.from("clients").insert({
    user_id: userId,
    name,
    email,
    company,
  });

  if (error) throw error;
}

export async function deleteClient(id) {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}
