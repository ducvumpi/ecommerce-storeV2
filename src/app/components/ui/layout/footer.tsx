"use client";
export default function Footer() {
  return (
    <footer style={{ background: "#2c1f14", color: "#e8ddd0", padding: "48px", fontFamily: "var(--font-sans, Lora, serif)" }}>
      <div className="footer-container">        <style>{`
/* ===== Footer Layout ===== */

.footer-container {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 40px;
  max-width: 960px;
  margin: 0 auto;
  padding-bottom: 40px;
  border-bottom: 0.5px solid rgba(255,255,255,0.1);
}

.footer-brand-title {
  font-size: 20px;
  font-weight: 500;
  color: #f5ede0;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  font-family: 'Lora', serif;
}

.footer-text {
  font-size: 13px;
  color: #b0997e;
  line-height: 1.7;
  margin-bottom: 20px;
}

.footer-social {
  display: flex;
  gap: 10px;
}

.footer-social a {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 0.5px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c4a882;
  text-decoration: none;
}

.footer-col h4 {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #c4a882;
  margin-bottom: 16px;
}

.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col a {
  font-size: 13px;
  color: #b0997e;
  text-decoration: none;
}

/* ===== Bottom ===== */
.footer-bottom {
  max-width: 960px;
  margin: 0 auto;
  padding: 18px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-payments {
  display: flex;
  gap: 8px;
}

.footer-payments span {
  font-size: 10px;
  font-weight: 500;
  color: #7a6652;
  border: 0.5px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 3px 8px;
  letter-spacing: 0.5px;
}


/* ════════════════════════════
   RESPONSIVE
════════════════════════════ */

/* ── Tablet (≤ 900px) ── */
@media (max-width: 900px) {

  .footer-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }

}

/* ── Mobile (≤ 600px) ── */
@media (max-width: 600px) {

  .footer-container {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

}

/* ── Very small (≤ 380px) ── */
@media (max-width: 380px) {

  .footer-container {
    gap: 20px;
  }

  .footer-brand-title {
    font-size: 18px;
  }

}
`}</style>
        {/* Brand */}
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#f5ede0", letterSpacing: 0.5, marginBottom: 12, fontFamily: "'Lora', serif" }}>
            Tiệm Mùa Chậm
          </div>
          <p style={{ fontSize: 13, color: "#b0997e", lineHeight: 1.7, margin: "0 0 20px" }}>
            Điểm đến của bạn cho những xu hướng và phong cách thời trang mới nhất.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { title: "Facebook", path: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
              { title: "Instagram", path: <><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></> },
              { title: "Twitter", path: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /> },
              { title: "YouTube", path: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></> },
            ].map(({ title, path }) => (
              <a key={title} href="#" title={title} style={{ width: 34, height: 34, borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c4a882", textDecoration: "none" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
              </a>
            ))}
          </div>
        </div>

        {/* Columns */}
        {[
          { heading: "Shop", links: [["Thời trang nam", "/men"], ["Thời trang nữ", "/women"], ["Phụ kiện", "/accessories"], ["Giày dép", "/footwear"]] },
          { heading: "Hỗ trợ", links: [["FAQ", "/faq"], ["Vận chuyển & trả hàng", "/shipping"], ["Hướng dẫn chọn size", "/size-guide"], ["Liên hệ", "/contact"]] },
          { heading: "Công ty", links: [["Về chúng tôi", "/about"], ["Blog", "/blog"], ["Tuyển dụng", "/careers"], ["Chính sách bảo mật", "/privacy"]] },
        ].map(col => (
          <div key={col.heading}>
            <h4 style={{ fontSize: 12, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: "#c4a882", margin: "0 0 16px" }}>{col.heading}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(([label, href]) => (
                <li key={label}><a href={href} style={{ fontSize: 13, color: "#b0997e", textDecoration: "none" }}>{label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#7a6652" }}>© {new Date().getFullYear()} Tiệm Mùa Chậm. Bản quyền thuộc về Tiệm Mùa Chậm.</span>
        <div style={{ display: "flex", gap: 8 }}>
          {["VISA", "MOMO", "COD"].map(b => (
            <span key={b} style={{ fontSize: 10, fontWeight: 500, color: "#7a6652", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "3px 8px", letterSpacing: "0.5px" }}>{b}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}