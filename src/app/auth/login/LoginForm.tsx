"use client";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginData, LoginSchema } from "@/app/api/loginAPI";
import { useAuthStore } from "@/app/store/isLoggedIn";
import { useRouter } from "next/navigation";
import { loginWithGoogle } from "@/app/api/loginAPI";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const inputStyle: React.CSSProperties = {
    height: 42, padding: "0 14px", border: "1px solid #e2d9ce",
    borderRadius: 10, background: "#fffdfb", color: "#3d2b1a",
    fontSize: 14, outline: "none", width: "100%", fontFamily: "inherit",
    boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
    fontSize: 12, color: "#8a7060", fontWeight: 500, letterSpacing: "0.3px",
    display: "block", marginBottom: 6,
};

export default function LoginFormAuth() {
    const { onSubmit } = useAuthStore();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm<LoginData>({
        resolver: yupResolver(LoginSchema),
    });

    const handleLogin = async (data: LoginData) => {
        const success = await onSubmit(data);
        if (success) router.push("/");
    };

    return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", padding: "60px 16px", fontFamily: "var(--font-sans, Lora, serif)" }}>
            <div style={{ background: "#fff", border: "0.5px solid #e8ddd0", borderRadius: 20, padding: "40px 36px", maxWidth: 400, margin: "0 auto" }}>

                <p style={{ fontFamily: "'Lora', serif", fontSize: 22, color: "#3d2b1a", textAlign: "center", margin: "0 0 6px", fontWeight: 500 }}>
                    Chào mừng trở lại
                </p>
                <p style={{ fontSize: 13, color: "#b0997e", textAlign: "center", margin: "0 0 28px" }}>
                    Đăng nhập để tiếp tục mua sắm
                </p>

                <form onSubmit={handleSubmit(handleLogin)}>
                    {/* Email */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Email</label>
                        <Controller name="email" defaultValue="" control={control} render={({ field }) => (
                            <input {...field} type="email" placeholder="ten@email.com" style={{ ...inputStyle, borderColor: errors.email ? "#c07050" : "#e2d9ce" }} />
                        )} />
                        {errors.email && <p style={{ fontSize: 12, color: "#c07050", margin: "4px 0 0" }}>{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Mật khẩu</label>
                        <div style={{ position: "relative" }}>
                            <Controller name="password" defaultValue="" control={control} render={({ field }) => (
                                <input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    style={{ ...inputStyle, borderColor: errors.password ? "#c07050" : "#e2d9ce", paddingRight: 40 }}
                                />
                            )} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                style={{
                                    position: "absolute", right: 10, top: "50%",
                                    transform: "translateY(-50%)", background: "none",
                                    border: "none", cursor: "pointer", color: "#a09080", padding: 0,
                                    display: "flex", alignItems: "center",
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p style={{ fontSize: 12, color: "#c07050", margin: "4px 0 0" }}>{errors.password.message}</p>}
                    </div>
                    {/* Remember + Forgot */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#8a7060", cursor: "pointer" }}>
                            <input type="checkbox" style={{ accentColor: "#8b5e3c", width: 15, height: 15 }} /> Ghi nhớ đăng nhập
                        </label>
                        <a href="/forgotpassword" style={{ fontSize: 13, color: "#a07050", textDecoration: "none" }}>Quên mật khẩu?</a>
                    </div>

                    <button type="submit" style={{ width: "100%", height: 44, borderRadius: 50, background: "#8b5e3c", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                        Đăng nhập
                    </button>
                </form>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
                    <div style={{ flex: 1, height: "0.5px", background: "#e8ddd0" }} />
                    <span style={{ fontSize: 12, color: "#c4a882" }}>hoặc tiếp tục với</span>
                    <div style={{ flex: 1, height: "0.5px", background: "#e8ddd0" }} />
                </div>

                {/* Social icons */}
                {/* <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    {[
                        { title: "Facebook", path: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
                        { title: "Google", path: <path strokeWidth={0} fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" /> },
                        { title: "GitHub", path: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /> },
                    ].map(({ title, path }) => (
                        <a key={title} href="#" title={title} style={{ width: 40, height: 40, borderRadius: "50%", border: "0.5px solid #e8ddd0", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffdfb", color: "#7a6652", textDecoration: "none" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
                        </a>
                    ))}
                </div> */}

                <button
                    type="button"
                    onClick={loginWithGoogle}
                    style={{
                        width: "100%", height: 44, borderRadius: 50,
                        background: "#fff", border: "1px solid #e2d9ce",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 10, cursor: "pointer", fontSize: 14, color: "#3d2b1a",
                        fontFamily: "inherit",
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Đăng nhập với Google
                </button>
                <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#b0997e" }}>
                    Chưa có tài khoản?{" "}
                    <a href="/auth/register" style={{ color: "#8b5e3c", textDecoration: "none", fontWeight: 500 }}>Đăng ký ngay</a>
                </p>
            </div>
        </div>
    );
}