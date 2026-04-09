"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/libs/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    // Supabase tự parse token từ URL hash → tạo session
    useEffect(() => {
        // Kiểm tra session hiện tại trước
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setReady(true);
                return;
            }
        });

        // Lắng nghe event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
                setReady(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Mật khẩu tối thiểu 6 ký tự"); return;
        }
        if (password !== confirmPassword) {
            toast.error("Mật khẩu không khớp"); return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (error) {
            toast.error(error.message); return;
        }

        toast.success("Đổi mật khẩu thành công!");
        setTimeout(() => router.push("/auth/login"), 1500);
    };

    if (!ready) return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#b0997e", fontSize: 14 }}>Đang xác thực...</p>
        </div>
    );

    return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", padding: "60px 16px", fontFamily: "var(--font-sans, Lora, serif)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", border: "0.5px solid #e8ddd0", borderRadius: 20, padding: "40px 36px", maxWidth: 420, width: "100%" }}>

                <p style={{ fontFamily: "'Lora', serif", fontSize: 22, color: "#3d2b1a", textAlign: "center", margin: "0 0 6px", fontWeight: 500 }}>
                    Tạo mật khẩu mới
                </p>
                <p style={{ fontSize: 13, color: "#b0997e", textAlign: "center", margin: "0 0 28px" }}>
                    Nhập mật khẩu mới cho tài khoản của bạn
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Mật khẩu mới */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12, color: "#8a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ height: 42, padding: "0 14px", border: "1px solid #e2d9ce", borderRadius: 10, background: "#fffdfb", color: "#3d2b1a", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
                        />
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: 12, color: "#8a7060", fontWeight: 500, display: "block", marginBottom: 5 }}>
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder="••••••••"
                            style={{ height: 42, padding: "0 14px", border: "1px solid #e2d9ce", borderRadius: 10, background: "#fffdfb", color: "#3d2b1a", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: "100%", height: 44, borderRadius: 50, background: loading ? "#c4a882" : "#8b5e3c", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                    >
                        {loading ? "Đang lưu..." : "Xác nhận đổi mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
}