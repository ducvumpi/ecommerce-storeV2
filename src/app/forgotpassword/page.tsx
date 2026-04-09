"use client";
import { useState } from "react";
import { supabase } from "@/app/libs/supabaseClient";
import toast from "react-hot-toast";

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  height: 42, padding: "0 14px 0 40px",
  border: `1px solid ${hasError ? "#c07050" : "#e2d9ce"}`,
  borderRadius: 10, background: "#fffdfb", color: "#3d2b1a",
  fontSize: 14, outline: "none", width: "100%",
  boxSizing: "border-box", fontFamily: "inherit",
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) { setError("Vui lòng nhập email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không đúng định dạng"); return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/resetpassword`,
    });
    setLoading(false);

    if (err) {
      toast.error(err.message);
      return;
    }

    setSent(true);
    toast.success("Email đặt lại mật khẩu đã được gửi!");
  };

  return (
    <div style={{ background: "#faf8f5", minHeight: "100vh", padding: "60px 16px", fontFamily: "var(--font-sans, Lora, serif)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", border: "0.5px solid #e8ddd0", borderRadius: 20, padding: "40px 36px", maxWidth: 420, width: "100%" }}>

        {/* Icon */}
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f3ede6", border: "1px solid #e2d9ce", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5e3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <p style={{ fontFamily: "'Lora', serif", fontSize: 22, color: "#3d2b1a", textAlign: "center", margin: "0 0 6px", fontWeight: 500 }}>
          Đặt lại mật khẩu
        </p>
        <p style={{ fontSize: 13, color: "#b0997e", textAlign: "center", margin: "0 0 28px", lineHeight: 1.6 }}>
          {sent
            ? "Kiểm tra hộp thư của bạn và làm theo hướng dẫn trong email."
            : "Nhập email đăng ký để nhận link đặt lại mật khẩu."
          }
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "#8a7060", fontWeight: 500, letterSpacing: "0.3px", display: "block", marginBottom: 5 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4956a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="ten@email.com"
                  style={inputStyle(!!error)}
                  autoComplete="email"
                />
              </div>
              {error && <p style={{ fontSize: 11, color: "#c07050", margin: "4px 0 0" }}>{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", height: 44, borderRadius: 50,
                background: loading ? "#c4a882" : "#8b5e3c",
                color: "#fff", border: "none", fontSize: 14,
                fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "background .2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {loading ? "Đang gửi..." : "Gửi link đặt lại"}
            </button>

            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          </form>
        ) : (
          /* Trạng thái đã gửi */
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0f7ec", border: "1px solid #c8dfc0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(90, 138, 80)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{ fontSize: 14, color: "#6a8a60", marginBottom: 20 }}>
              Email đã được gửi tới <strong style={{ color: "#3d2b1a" }}>{email}</strong>
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              style={{ fontSize: 13, color: "#8b5e3c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}
            >
              Gửi lại với email khác
            </button>
          </div>
        )}

        <div style={{ borderTop: "0.5px solid #e8ddd0", marginTop: 24, paddingTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#b0997e", margin: 0 }}>
            Nhớ mật khẩu rồi?{" "}
            <a href="/auth/login" style={{ color: "#8b5e3c", textDecoration: "none", fontWeight: 500 }}>
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}