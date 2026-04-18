"use client";
import { useEffect } from "react";
import { supabase } from "@/app/libs/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                localStorage.setItem("user_id", session.user.id);
                router.push("/");
                subscription.unsubscribe(); // ✅ cleanup sau khi xong
            }
        });

        return () => subscription.unsubscribe(); // ✅ cleanup khi unmount
    }, [router]);

    return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
            <p style={{ color: "#b0997e", fontSize: 14 }}>Đang đăng nhập...</p>
        </div>
    );
}