import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aikfndscooomjeyewhpl.supabase.co"; //import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa2ZuZHNjb29vbWpleWV3aHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjE3ODUsImV4cCI6MjA2NDYzNzc4NX0.xurqToLG6T46c0W4LGFnLWwzeBmJCOWC8J77OLuqe3Y";
//import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
