import type { Course } from "../../types";
import { supabase } from "../supabase";

export async function getCourses(profileId?: string): Promise<Course[]> {
  if (!profileId) return [];
  // Join with club_members to only get courses for clubs the user manages
  // Step 1: Get club_ids for this profile
  const { data: clubMembers, error: clubError } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("profile_id", profileId);
  if (clubError) throw clubError;
  const clubIds = clubMembers?.map((cm) => cm.club_id) || [];
  if (clubIds.length === 0) return [];
  // Step 2: Get courses for those clubs, including trainer details
  const { data, error } = await supabase
    .from("courses")
    .select("*, trainer:trainer_id(*)")
    .in("club_id", clubIds);
  if (error) throw error;
  return data || [];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createCourse(
  course: Partial<Course>
): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .insert([course])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateCourse(
  id: string,
  updates: Partial<Course>
): Promise<Course | null> {
  console.log("Updating course with ID:", id, "with updates:", updates);
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  return !error;
}
