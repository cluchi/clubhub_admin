import type { Parent, ParentClub, Club } from "../../types";
import { supabase } from "../supabase";

export async function getParents(): Promise<Parent[]> {
  const { data, error } = await supabase.from("parents").select("*");
  if (error) throw error;
  return data || [];
}

export async function getParentById(id: string): Promise<Parent | null> {
  const { data, error } = await supabase
    .from("parents")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getParentsByClub(clubId: string): Promise<Parent[]> {
  const { data: parentClubs, error: pcError } = await supabase
    .from("parent_clubs")
    .select("parent_id")
    .eq("club_id", clubId);
  if (pcError) throw pcError;

  if (parentClubs.length === 0) return [];

  const parentIds = parentClubs.map((pc) => pc.parent_id);
  const { data, error } = await supabase
    .from("parents")
    .select("*")
    .in("id", parentIds);
  if (error) throw error;
  return data || [];
}

export async function getParentsWithClubs(): Promise<
  (Parent & { clubs: Club[] })[]
> {
  const { data: parents, error: parentsError } = await supabase
    .from("parents")
    .select("*");
  if (parentsError) throw parentsError;

  const { data: parentClubs, error: parentClubsError } = await supabase
    .from("parent_clubs")
    .select("parent_id, club_id");
  if (parentClubsError) throw parentClubsError;

  const { data: clubs, error: clubsError } = await supabase
    .from("clubs")
    .select("*");
  if (clubsError) throw clubsError;

  const clubMap = new Map(clubs.map((club) => [club.id, club]));
  const parentClubMap = new Map<string, string[]>();

  parentClubs.forEach(({ parent_id, club_id }) => {
    if (!parentClubMap.has(parent_id)) {
      parentClubMap.set(parent_id, []);
    }
    parentClubMap.get(parent_id)!.push(club_id);
  });

  return parents.map((parent) => ({
    ...parent,
    clubs: (parentClubMap.get(parent.id) || []).map(
      (clubId) => clubMap.get(clubId)!,
    ),
  }));
}

export async function createParentWithClubs(
  parentData: Omit<Parent, "id" | "created_at">,
  clubIds: string[],
): Promise<Parent | null> {
  const { data: parent, error: parentError } = await supabase
    .from("parents")
    .insert([parentData])
    .select()
    .single();
  if (parentError) return null;

  if (clubIds.length > 0) {
    const parentClubsData = clubIds.map((clubId) => ({
      parent_id: parent.id,
      club_id: clubId,
    }));
    const { error: parentClubsError } = await supabase
      .from("parent_clubs")
      .insert(parentClubsData);
    if (parentClubsError) {
      // Rollback parent creation if club association fails
      await supabase.from("parents").delete().eq("id", parent.id);
      return null;
    }
  }

  return parent;
}

export async function updateParent(
  id: string,
  updates: Partial<Parent>,
): Promise<Parent | null> {
  const { data, error } = await supabase
    .from("parents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteParent(id: string): Promise<boolean> {
  const { error } = await supabase.from("parents").delete().eq("id", id);
  return !error;
}

export async function addParentToClub(
  parentId: string,
  clubId: string,
): Promise<ParentClub | null> {
  const { data, error } = await supabase
    .from("parent_clubs")
    .insert([{ parent_id: parentId, club_id: clubId }])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function removeParentFromClub(
  parentId: string,
  clubId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("parent_clubs")
    .delete()
    .eq("parent_id", parentId)
    .eq("club_id", clubId);
  return !error;
}

export async function getParentClubs(parentId: string): Promise<Club[]> {
  const { data: parentClubs, error: parentClubsError } = await supabase
    .from("parent_clubs")
    .select("club_id")
    .eq("parent_id", parentId);
  if (parentClubsError) throw parentClubsError;

  const clubIds = parentClubs.map((pc) => pc.club_id);
  if (clubIds.length === 0) return [];

  const { data: clubs, error: clubsError } = await supabase
    .from("clubs")
    .select("*")
    .in("id", clubIds);
  if (clubsError) throw clubsError;

  return clubs || [];
}
