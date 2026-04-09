"use client";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { SignupForm, SignUpSchema } from "../../api/loginAPI";
import { useAuthStore } from "@/app/store/isLoggedIn";
import { useRouter } from "next/navigation";
import { useCaptcha } from "@/app/hooks/useCaptcha";
import { useState } from "react";

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    height: 42, padding: "0 14px",
    border: `1px solid ${hasError ? "#c07050" : "#e2d9ce"}`,
    borderRadius: 10, background: "#fffdfb", color: "#3d2b1a",
    fontSize: 14, outline: "none", width: "100%",
    boxSizing: "border-box", fontFamily: "inherit",
});
const labelStyle: React.CSSProperties = {
    fontSize: 12, color: "#8a7060", fontWeight: 500,
    letterSpacing: "0.3px", display: "block", marginBottom: 5,
};
const errStyle: React.CSSProperties = { fontSize: 11, color: "#c07050", margin: "4px 0 0" };

export default function RegisterForm() {
    const router = useRouter();
    const { canvasRef, captchaInput, setCaptchaInput, captchaError, refresh, validate } = useCaptcha();
    const [loading, setLoading] = useState(false);
    const handleSignUp = async (data: SignupForm) => {
        if (!validate()) return;
        setLoading(true);
        await onSignUp(data);
        setLoading(false);
        router.push("/auth/login");
    };
    const { onSignUp } = useAuthStore();

    const { control, handleSubmit, formState: { errors } } = useForm<SignupForm>({
        resolver: yupResolver(SignUpSchema),
    });


    return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", padding: "60px 16px", fontFamily: "var(--font-sans, Lora, serif)" }}>
            <div style={{ background: "#fff", border: "0.5px solid #e8ddd0", borderRadius: 20, padding: "40px 36px", maxWidth: 420, margin: "0 auto" }}>

                <p style={{ fontFamily: "'Lora', serif", fontSize: 22, color: "#3d2b1a", textAlign: "center", margin: "0 0 6px", fontWeight: 500 }}>
                    Tạo tài khoản mới
                </p>
                <p style={{ fontSize: 13, color: "#b0997e", textAlign: "center", margin: "0 0 26px" }}>
                    Tham gia Tiệm Mùa Chậm ngay hôm nay
                </p>

                <form onSubmit={handleSubmit(handleSignUp)}>
                    {/* Họ + Tên */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                        {(["firstName", "lastName"] as const).map((name, i) => (
                            <div key={name}>
                                <label style={labelStyle}>{i === 0 ? "Họ" : "Tên"}</label>
                                <Controller name={name} defaultValue="" control={control} render={({ field }) => (
                                    <input {...field} placeholder={i === 0 ? "Nguyễn" : "Văn A"} style={inputStyle(!!errors[name])} />
                                )} />
                                {errors[name] && <p style={errStyle}>{errors[name]?.message}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Email</label>
                        <Controller name="email" defaultValue="" control={control} render={({ field }) => (
                            <input {...field} type="email" placeholder="ten@email.com" style={inputStyle(!!errors.email)} />
                        )} />
                        {errors.email && <p style={errStyle}>{errors.email.message}</p>}
                    </div>

                    {/* Mật khẩu */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Mật khẩu</label>
                        <Controller name="password" defaultValue="" control={control} render={({ field }) => (
                            <input {...field} type="password" placeholder="••••••••" style={inputStyle(!!errors.password)} />
                        )} />
                        {errors.password && <p style={errStyle}>{errors.password.message}</p>}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Xác nhận mật khẩu</label>
                        <Controller name="confirmPassword" defaultValue="" control={control} render={({ field }) => (
                            <input {...field} type="password" placeholder="••••••••" style={inputStyle(!!errors.confirmPassword)} />
                        )} />
                        {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword.message}</p>}
                    </div>

                    {/* Terms */}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "4px 0 20px", fontSize: 13, color: "#8a7060", lineHeight: 1.5, cursor: "pointer" }}>
                        <input type="checkbox" style={{ width: 15, height: 15, accentColor: "#8b5e3c", marginTop: 1, flexShrink: 0 }} />
                        <span>
                            Tôi đồng ý với{" "}
                            <a href="/terms" style={{ color: "#a07050", textDecoration: "none" }}>Điều khoản dịch vụ</a>
                            {" "}và{" "}
                            <a href="/privacy" style={{ color: "#a07050", textDecoration: "none" }}>Chính sách bảo mật</a>
                        </span>
                    </label>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Xác minh bảo mật</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <canvas
                                ref={canvasRef}
                                width={160}
                                height={50}
                                onClick={refresh}
                                title="Click để làm mới"
                                style={{ border: "1px solid #e2d9ce", borderRadius: 10, cursor: "pointer", flexShrink: 0 }}
                            />
                            <button type="button" onClick={refresh}
                                style={{ background: "none", border: "1px solid #e2d9ce", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#8a7060" }}>
                                ↻ Làm mới
                            </button>
                        </div>
                        <input
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            placeholder="Nhập ký tự ở trên"
                            maxLength={6}
                            autoComplete="off"
                            style={inputStyle(!!captchaError)}
                        />
                        {captchaError && <p style={errStyle}>{captchaError}</p>}
                        {!captchaError && <p style={{ ...errStyle, color: "#b0997e" }}>Không phân biệt hoa thường</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%", height: 44, borderRadius: 50,
                            background: loading ? "#c4a882" : "#8b5e3c",
                            color: "#fff", border: "none", fontSize: 14, fontWeight: 500,
                            cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            transition: "background .2s",
                        }}
                    >
                        {loading && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                        )}
                        {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
                    </button>

                    {/* Thêm keyframe spin */}
                    <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
                </form>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                    <div style={{ flex: 1, height: "0.5px", background: "#e8ddd0" }} />
                    <span style={{ fontSize: 12, color: "#c4a882" }}>hoặc đăng ký với</span>
                    <div style={{ flex: 1, height: "0.5px", background: "#e8ddd0" }} />
                </div>

                {/* Social */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    {[
                        { title: "Facebook", path: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
                        { title: "Google", path: <path strokeWidth={0} fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" /> },
                        { title: "GitHub", path: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /> },
                    ].map(({ title, path }) => (
                        <a key={title} href="#" title={title} style={{ width: 40, height: 40, borderRadius: "50%", border: "0.5px solid #e8ddd0", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffdfb", color: "#7a6652", textDecoration: "none" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
                        </a>
                    ))}
                </div>

                <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#b0997e" }}>
                    Đã có tài khoản?{" "}
                    <a href="/auth/login" style={{ color: "#8b5e3c", textDecoration: "none", fontWeight: 500 }}>Đăng nhập</a>
                </p>
            </div>
        </div>
    );
}