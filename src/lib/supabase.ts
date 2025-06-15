import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});

// Helper function to safely stringify objects for storage
export const safeJsonStringify = (obj: any) => {
  try {
    return JSON.stringify(obj, (key, value) => {
      // Handle circular references
      if (typeof value === "object" && value !== null) {
        if (key === "file" && value instanceof File) {
          return undefined; // Skip File objects
        }
      }
      return value;
    });
  } catch (error) {
    console.error("Error stringifying object:", error);
    return JSON.stringify({});
  }
};
