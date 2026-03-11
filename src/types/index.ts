import type { Database } from "./supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Club = Database["public"]["Tables"]["clubs"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Child = Database["public"]["Tables"]["children"]["Row"];
export type Parent = Database["public"]["Tables"]["parents"]["Row"];
export type ParentClub = Database["public"]["Tables"]["parent_clubs"]["Row"];
export type ClubMember = Database["public"]["Tables"]["club_members"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type PaymentMethod =
  Database["public"]["Tables"]["payment_methods"]["Row"];
