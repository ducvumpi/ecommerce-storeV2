import Image from "next/image";

export default function AboutPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', Lora, serif", background: "#faf7f4", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --brown-dark:   #3d2b1a;
          --brown-mid:    #7a5135;
          --brown-light:  #b08060;
          --beige-dark:   #e8ddd0;
          --beige-mid:    #f3ede6;
          --beige-light:  #faf7f4;
          --white:        #ffffff;
          --text-soft:    #9a8070;
        }

        .about-heading {
          font-family: 'Cormorant Garamond', serif;
          color: var(--brown-dark);
        }

        .section-label {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--brown-light);
          font-weight: 500;
        }

        .value-card {
          background: var(--white);
          border-radius: 20px;
          border: 1px solid var(--beige-dark);
          padding: 2.5rem 2rem;
          text-align: center;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(120, 80, 50, 0.10);
        }

        .team-card {
          text-align: center;
          transition: transform 0.25s;
        }
        .team-card:hover { transform: translateY(-3px); }

        .team-img-wrap {
          width: 120px; height: 120px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 1.2rem;
          border: 3px solid var(--beige-dark);
          box-shadow: 0 4px 18px rgba(120, 80, 50, 0.12);
        }

        .icon-circle {
          width: 60px; height: 60px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 1.4rem;
        }

        .stat-block {
          text-align: center;
          padding: 2rem 1rem;
        }

        .cta-section {
          background: linear-gradient(135deg, #5c3d22 0%, #8b5e3c 50%, #a07050 100%);
          border-radius: 28px;
          padding: 4rem 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 240px; height: 240px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }
        .cta-section::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -40px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }

        .cta-btn {
          display: inline-block;
          background: var(--white);
          color: var(--brown-dark);
          padding: 14px 40px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.03em;
          text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .cta-btn:hover {
          background: var(--beige-mid);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.2);
        }

        .divider-ornament {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0 auto 3.5rem;
          max-width: 240px;
          justify-content: center;
        }
        .divider-ornament::before,
        .divider-ornament::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--beige-dark);
        }
      `}</style>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* ── Hero Banner ── */}
        <section style={{ position: "relative", borderRadius: 28, overflow: "hidden", marginBottom: "5rem", height: 420 }}>
          <Image
            width={1200} height={630}
            src="http://static.photos/workspace/1200x630/1"
            alt="Our Team"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* warm brown overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(45,25,10,0.82) 0%, rgba(45,25,10,0.25) 55%, transparent 100%)"
          }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2.5rem 3rem" }}>
            <p className="section-label" style={{ color: "#d4b090", marginBottom: "0.6rem" }}>Về chúng tôi</p>
            <h1 className="about-heading" style={{ fontSize: "3.2rem", color: "#fff", margin: 0, fontWeight: 500, lineHeight: 1.15 }}>
              Câu chuyện của<br /><em>Tiệm mùa chậm</em>
            </h1>
          </div>
        </section>

        {/* ── Who We Are ── */}
        <section style={{ maxWidth: 900, margin: "0 auto 5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <p className="section-label" style={{ marginBottom: "0.8rem" }}>Câu chuyện</p>
              <h2 className="about-heading" style={{ fontSize: "2.4rem", marginBottom: "1.25rem", fontWeight: 500 }}>Chúng tôi là ai</h2>
              <p style={{ fontSize: "1rem", color: "#7a6555", lineHeight: 1.8, marginBottom: "1.1rem" }}>
                Được thành lập vào năm 2025, Tiệm mùa chậm khởi đầu là một cửa hàng thời trang nhỏ với tầm nhìn lớn — mang thời trang cao cấp đến với tất cả mọi người mà không ảnh hưởng đến chất lượng hay phong cách.
              </p>
              <p style={{ fontSize: "1rem", color: "#7a6555", lineHeight: 1.8 }}>
                Ngày nay, chúng tôi tự hào là một trong những điểm đến thời trang trực tuyến phát triển nhanh nhất, phục vụ khách hàng tại hơn 50 quốc gia với các bộ sưu tập được tuyển chọn kỹ lưỡng từ các nhà thiết kế nổi tiếng và các tài năng mới nổi.
              </p>
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(100,65,35,0.13)", border: "1px solid #e8ddd0" }}>
              <Image
                width={640} height={480}
                src="http://static.photos/workspace/640x360/2"
                alt="Our Store"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        </section>

        {/* ── Stats row ── */}
        <section style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #e8ddd0",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          marginBottom: "5rem",
          overflow: "hidden"
        }}>
          {[
            { num: "2025", label: "Năm thành lập" },
            { num: "50+", label: "Quốc gia phục vụ" },
            { num: "10K+", label: "Khách hàng tin tưởng" },
          ].map((s, i) => (
            <div key={s.label} className="stat-block" style={{
              borderRight: i < 2 ? "1px solid #e8ddd0" : "none",
              padding: "2.5rem 1rem"
            }}>
              <div className="about-heading" style={{ fontSize: "2.8rem", color: "#8b5e3c", fontWeight: 500, marginBottom: "0.3rem" }}>{s.num}</div>
              <div style={{ fontSize: "0.82rem", color: "#a08870", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── Values ── */}
        <section style={{ marginBottom: "5rem" }}>
          <div className="divider-ornament">
            <span style={{ fontSize: "1rem", color: "#c4a484" }}>✦</span>
          </div>
          <p className="section-label" style={{ textAlign: "center", marginBottom: "0.6rem" }}>Triết lý</p>
          <h2 className="about-heading" style={{ fontSize: "2.4rem", textAlign: "center", marginBottom: "3rem", fontWeight: 500 }}>Giá trị của chúng tôi</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              { icon: "🌿", bg: "#f5efe8", label: "Niềm đam mê thời trang", desc: "Chúng tôi sống và hít thở cùng thời trang, liên tục tìm kiếm xu hướng lớn tiếp theo để mang đến cho tủ đồ của bạn." },
              { icon: "✦", bg: "#eef0e8", label: "Đảm bảo chất lượng", desc: "Mỗi sản phẩm đều được tuyển chọn kỹ lưỡng và kiểm tra chất lượng để đảm bảo đáp ứng các tiêu chuẩn cao của chúng tôi." },
              { icon: "◎", bg: "#ece8f0", label: "Khách hàng là trên hết", desc: "Sự hài lòng của bạn là ưu tiên hàng đầu, từ trải nghiệm mua sắm liền mạch đến dịch vụ khách hàng xuất sắc." },
            ].map(v => (
              <div key={v.label} className="value-card">
                <div className="icon-circle" style={{ background: v.bg }}>
                  <span style={{ fontSize: "1.5rem" }}>{v.icon}</span>
                </div>
                <h3 className="about-heading" style={{ fontSize: "1.25rem", marginBottom: "0.75rem", fontWeight: 600 }}>{v.label}</h3>
                <p style={{ color: "#9a8070", fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Team ── */}
        <section style={{ marginBottom: "5rem" }}>
          <div className="divider-ornament">
            <span style={{ fontSize: "1rem", color: "#c4a484" }}>✦</span>
          </div>
          <p className="section-label" style={{ textAlign: "center", marginBottom: "0.6rem" }}>Con người</p>
          <h2 className="about-heading" style={{ fontSize: "2.4rem", textAlign: "center", marginBottom: "3rem", fontWeight: 500 }}>Nhóm của chúng tôi</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
            {[
              { src: "http://static.photos/people/400x400/1", name: "Sarah Johnson", role: "Founder & CEO" },
              { src: "http://static.photos/people/400x400/2", name: "Michael Chen", role: "Giám đốc sáng tạo" },
              { src: "http://static.photos/people/400x400/3", name: "Emma Rodriguez", role: "Trưởng phòng tạo mẫu" },
              { src: "http://static.photos/people/400x400/4", name: "David Wilson", role: "Trải nghiệm khách hàng" },
            ].map(m => (
              <div key={m.name} className="team-card">
                <div className="team-img-wrap">
                  <Image width={400} height={400} src={m.src} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <h3 className="about-heading" style={{ fontSize: "1.15rem", marginBottom: "0.25rem", fontWeight: 600 }}>{m.name}</h3>
                <p style={{ color: "#b08060", fontSize: "0.82rem", margin: 0, letterSpacing: "0.04em" }}>{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <p className="section-label" style={{ color: "#d4b090", marginBottom: "0.8rem" }}>Bắt đầu ngay</p>
          <h2 className="about-heading" style={{ fontSize: "2.4rem", color: "#fff", marginBottom: "1rem", fontWeight: 500, maxWidth: 560, margin: "0 auto 1rem" }}>
            Sẵn sàng tham gia hành trình thời trang cùng chúng tôi?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "2.5rem", maxWidth: 480, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Đăng ký ngay hôm nay để được giảm giá 15% cho đơn hàng đầu tiên cùng quyền truy cập độc quyền vào các bộ sưu tập mới.
          </p>
          <a href="/signup" className="cta-btn">Tham gia ngay</a>
        </section>

      </main>
    </div>
  );
}