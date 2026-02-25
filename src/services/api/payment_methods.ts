import type { PaymentMethod } from "../../types";
import { supabase } from "../supabase";

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase.from("payment_methods").select("*");
  if (error) throw error;
  return data || [];
}

export async function getPaymentMethodById(
  id: string
): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createPaymentMethod(
  paymentMethod: Partial<PaymentMethod>
): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from("payment_methods")
    .insert([paymentMethod])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updatePaymentMethod(
  id: string,
  updates: Partial<PaymentMethod>
): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from("payment_methods")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deletePaymentMethod(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", id);
  return !error;
}
