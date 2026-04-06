import type { Database } from "../../types/supabase";
import { supabase } from "../supabase";
import { ImageUploadService } from "../imageUpload";

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
  trainer: Omit<Trainer, "id" | "created_at">,
): Promise<Trainer | null> {
  const { data, error } = await supabase
    .from("trainers")
    .insert([trainer])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateTrainer(
  id: string,
  updates: Partial<Omit<Trainer, "id" | "created_at">>,
): Promise<Trainer | null> {
  // Get current trainer to check for avatar changes
  const { data: currentTrainer, error: fetchError } = await supabase
    .from("trainers")
    .select("avatar")
    .eq("id", id)
    .single();

  // If avatar is being changed (new URL provided and different from current)
  if (
    !fetchError &&
    currentTrainer?.avatar &&
    updates.avatar &&
    updates.avatar !== currentTrainer.avatar
  ) {
    // Delete old avatar
    await ImageUploadService.deleteImage(currentTrainer.avatar);
  }

  const { data, error } = await supabase
    .from("trainers")
    .update(updates)
    .eq("id", id)
    .select();
  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function deleteTrainer(id: string): Promise<boolean> {
  // Get current trainer to check for avatar
  const { data: trainer, error: fetchError } = await supabase
    .from("trainers")
    .select("avatar")
    .eq("id", id)
    .single();

  if (!fetchError && trainer?.avatar) {
    // Delete avatar from storage
    await ImageUploadService.deleteImage(trainer.avatar);
  }

  const { error } = await supabase.from("trainers").delete().eq("id", id);
  return !error;
}
