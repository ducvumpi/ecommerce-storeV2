"use client";
import { useEffect } from "react";
import { supabase } from "@/app/libs/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
                // Tạo profile nếu chưa có
                const user = session.user;
                const { data: existing } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("id", user.id)
                    .maybeSingle();

                if (!existing) {
                    await supabase.from("profiles").insert({
                        id: user.id,
                        email: user.email,
                        first_name: user.user_metadata?.full_name?.split(" ")[0] ?? "",
                        last_name: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ?? "",
                        avatar: user.user_metadata?.avatar_url ?? "",
                    });
                }

                localStorage.setItem("user_id", user.id);
                router.push("/");
            }
        });
    }, []);

    return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
            <p style={{ color: "#b0997e", fontSize: 14 }}>Đang đăng nhập...</p>
        </div>
    );
}