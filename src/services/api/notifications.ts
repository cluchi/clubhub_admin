import type { Notification } from "../../types";
import { supabase } from "../supabase";

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase.from("notifications").select("*");
  if (error) throw error;
  return data || [];
}

export async function getNotificationById(
  id: string
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createNotification(
  notification: Partial<Notification>
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .insert([notification])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateNotification(
  id: string,
  updates: Partial<Notification>
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteNotification(id: string): Promise<boolean> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  return !error;
}
