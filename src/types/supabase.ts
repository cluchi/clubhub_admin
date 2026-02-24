// This file should be generated from your Supabase project. Replace this with the actual types from your Supabase instance.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trainers: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          bio: string | null;
          avatar: string | null;
          experience: string | null;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          spots_available: number;
          total_spots: number;
          category: string;
          // ...add other columns as needed
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;

          contact_person: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      courses: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          description: string;
          trainer_id: string;
          schedule: string;
          pricing: {
            drop_in: number;
            monthly: number;
            quarterly: number;
          };
          age_range: string;
          skill_level: string;
          spots_available: number;
          total_spots: number;
          category: string;
          // ...add other columns as needed
        };
      };
      subscriptions: {
        Row: {
          id: string;
          child_id: string;
          course_id: string;
          status: string;
          // ...add other columns as needed
        };
      };
      bookings: {
        Row: {
          id: string;
          subscription_id: string;
          date: string;
          // ...add other columns as needed
        };
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          // ...add other columns as needed
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          // ...add other columns as needed
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          // ...add other columns as needed
        };
      };
    };
  };
}
