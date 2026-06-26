import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON!
);

export async function uploadFile(file: File) {
  const { data, error } = await supabase.storage
    .from("image")
    .upload("123", file);

  return { data, error };
}