import type { Booking } from "../../types";
import { supabase } from "../supabase";

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase.from("bookings").select("*");
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
  booking: Partial<Booking>
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
  updates: Partial<Booking>
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
