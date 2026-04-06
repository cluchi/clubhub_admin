import type { Subscription } from "../../types";
import { supabase } from "../supabase";

export async function getSubscriptions(
  profileId?: string,
): Promise<Subscription[]> {
  if (!profileId) return [];

  // Join with club_members to only get subscriptions for clubs the user manages
  // Step 1: Get club_ids for this profile
  const { data: clubMembers, error: clubError } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("profile_id", profileId);
  if (clubError) throw clubError;
  const clubIds = clubMembers?.map((cm) => cm.club_id) || [];
  if (clubIds.length === 0) return [];

  // Step 2: Get course_ids for those clubs
  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .in("club_id", clubIds);
  if (courseError) throw courseError;
  const courseIds = courses?.map((c) => c.id) || [];
  if (courseIds.length === 0) return [];

  // Step 3: Get subscriptions for those courses
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .in("course_id", courseIds);
  if (error) throw error;
  return data || [];
}

export async function getSubscriptionById(
  id: string,
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createSubscription(
  subscription: Partial<Subscription>,
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert([subscription])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateSubscription(
  id: string,
  updates: Partial<Subscription>,
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteSubscription(id: string): Promise<boolean> {
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);
  return !error;
}
