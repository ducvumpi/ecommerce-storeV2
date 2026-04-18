import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON!;
export async function uploadFile(file: any) {
    const { data, error } = await supabase.storage.from('image').upload('123', file)
    if (error) {
        // Handle error
    } else {
        // Handle success
    }
}
export const supabase = createClient(supabaseUrl, supabaseKey);
