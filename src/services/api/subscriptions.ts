import type { Subscription } from "../../types";
import { supabase } from "../supabase";

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase.from("subscriptions").select("*");
  if (error) throw error;
  return data || [];
}

export async function getSubscriptionById(
  id: string
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
  subscription: Partial<Subscription>
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
  updates: Partial<Subscription>
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
