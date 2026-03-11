import type { Booking } from "../../types";
import { supabase } from "../supabase";

export async function getBookings(profileId?: string): Promise<Booking[]> {
  if (!profileId) return [];

  // Join with club_members to only get bookings for clubs the user manages
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

  // Step 3: Get subscription_ids for those courses
  const { data: subscriptions, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("id")
    .in("course_id", courseIds);
  if (subscriptionError) throw subscriptionError;
  const subscriptionIds = subscriptions?.map((s) => s.id) || [];
  if (subscriptionIds.length === 0) return [];

  // Step 4: Get bookings for those subscriptions
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .in("subscription_id", subscriptionIds);
  if (error) throw error;
  return data || [];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createBooking(
  booking: Partial<Booking>,
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .insert([booking])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateBooking(
  id: string,
  updates: Partial<Booking>,
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  return !error;
}
