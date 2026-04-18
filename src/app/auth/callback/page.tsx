"use client";
import { useEffect } from "react";
import { supabase } from "@/app/libs/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
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

                    localStorage.setItem("user_id", user.id);
                    router.push("/");
                }
            }
        });

    }, []);

    return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
            <p style={{ color: "#b0997e", fontSize: 14 }}>Đang đăng nhập...</p>
        </div>
    );
}