import type { Club } from "../../types";
import { supabase } from "../supabase";

export async function getClubs(profileId?: string): Promise<Club[]> {
  if (!profileId) return [];

  // Join with club_members to only get clubs the user manages
  // Step 1: Get club_ids for this profile where role is 'admin'
  const { data: clubMembers, error: clubError } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("profile_id", profileId)
    .eq("role", "admin");

  if (clubError) throw clubError;

  const clubIds = clubMembers?.map((cm) => cm.club_id).filter(Boolean) || [];

  if (clubIds.length === 0) return [];

  // Step 2: Get clubs for those club_ids
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .in("id", clubIds);

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
  updates: Partial<Club>,
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
