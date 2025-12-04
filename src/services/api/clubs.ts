import { Club } from "../../types";
import { supabase } from "../supabase";

export async function getClubs(): Promise<Club[]> {
  const { data, error } = await supabase.from("clubs").select("*");
  if (error) throw error;
  return data || [];
}

export async function getClubById(id: string): Promise<Club | null> {
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createClub(club: Partial<Club>): Promise<Club | null> {
  const { data, error } = await supabase
    .from("clubs")
    .insert([club])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateClub(
  id: string,
  updates: Partial<Club>
): Promise<Club | null> {
  const { data, error } = await supabase
    .from("clubs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteClub(id: string): Promise<boolean> {
  const { error } = await supabase.from("clubs").delete().eq("id", id);
  return !error;
}
