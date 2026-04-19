"use client";
import { useEffect } from "react";
import { supabase } from "@/app/libs/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuth = async () => {
            console.log("✅ AuthCallback mounted");

            // Đợi Supabase xử lý hash từ URL
            const { data: { session }, error } = await supabase.auth.getSession();
            console.log("Session:", session, "Error:", error);

            if (!session?.user) {
                router.push("/");
                return;
            }

            const user = session.user;
            console.log("User:", user.id, user.email);
            console.log("Metadata:", user.user_metadata);

            const { error: upsertError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    email: user.email,
                    avatar_url: user.user_metadata?.avatar_url ?? null,
                    first_name: user.user_metadata?.given_name ?? '',
                    last_name: user.user_metadata?.family_name ?? '',
                    role: 'user',
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'id' });

            console.log("Upsert error:", upsertError);

            localStorage.setItem("user_id", user.id);
            router.push("/");
        };

        handleAuth();
    }, [router]);

    return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#b0997e", fontSize: 14 }}>Đang đăng nhập...</p>
        </div>
    );
}