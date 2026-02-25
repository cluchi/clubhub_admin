import type { Child } from "../../types";
import { supabase } from "../supabase";

export async function getChildren(): Promise<Child[]> {
  const { data, error } = await supabase.from("children").select("*");
  if (error) throw error;
  return data || [];
}

export async function getChildById(id: string): Promise<Child | null> {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createChild(
  child: Partial<Child>
): Promise<Child | null> {
  const { data, error } = await supabase
    .from("children")
    .insert([child])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateChild(
  id: string,
  updates: Partial<Child>
): Promise<Child | null> {
  const { data, error } = await supabase
    .from("children")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteChild(id: string): Promise<boolean> {
  const { error } = await supabase.from("children").delete().eq("id", id);
  return !error;
}
