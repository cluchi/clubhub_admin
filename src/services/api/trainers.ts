export async function updateTrainer(
  id: string,
  updates: Partial<Omit<Trainer, "id" | "created_at">>
): Promise<Trainer | null> {
  const { data, error } = await supabase
    .from("trainers")
    .update(updates)
    .eq("id", id)
    .select();
  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function deleteTrainer(id: string): Promise<boolean> {
  const { error } = await supabase.from("trainers").delete().eq("id", id);
  return !error;
}
import type { Database } from "../../types/supabase";
import { supabase } from "../supabase";

export type Trainer = Database["public"]["Tables"]["trainers"]["Row"];

export async function getTrainersByClub(clubId: string): Promise<Trainer[]> {
  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("club_id", clubId);
  if (error) throw error;
  return data || [];
}

export async function createTrainer(
  trainer: Omit<Trainer, "id" | "created_at">
): Promise<Trainer | null> {
  const { data, error } = await supabase
    .from("trainers")
    .insert([trainer])
    .select()
    .single();
  if (error) return null;
  return data;
}
