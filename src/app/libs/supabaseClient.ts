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
supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;

        // Kiểm tra profile đã tồn tại chưa
        const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

        if (!existing) {
            // Lần đầu đăng nhập → insert
            const fullName = user.user_metadata?.full_name ?? "";
            const nameParts = fullName.trim().split(" ");
            const firstName = nameParts.pop() ?? "";
            const lastName = nameParts.join(" ");

            await supabase.from("profiles").insert({
                id: user.id,
                email: user.email,
                first_name: firstName,
                last_name: lastName,
                avatar_url: user.user_metadata?.avatar_url ?? null,
                phone: user.phone ?? null,
            });
        }
    }
});