"use client"
import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Bell, CreditCard, Camera, Check, X, Edit2, ShieldCheck, ChevronRight } from 'lucide-react';
import { supabase } from '../libs/supabaseClient';
import { DiaGioiHanhChinh2Cap, Commune } from '../api/addressAPI';
export default function AccountProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [provinces, setProvinces] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressData, setAddressData] = useState<Commune[]>([]);
  const [wards, setWards] = useState<Commune[]>([]);

  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    totalAmount: 0,
    city: '',
    ward: '',
    note: ''
  });
  const [profileData, setProfileData] = useState({
    last_name: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    dateOfBirth: '',
    gender: 'Nam'
  });
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setLoading(true);
        const data = await DiaGioiHanhChinh2Cap();
        setAddressData(data.communes || []);
        setProvinces(data.provinces as Commune[]);
      } catch (error) {
        console.error('Error fetching address data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddressData();
  }, []);
  useEffect(() => {
    if (customerInfo.city && addressData.length > 0) {
      const filtered = addressData.filter((item) => item.provinceCode === customerInfo.city);
      setWards(filtered.map(item => ({ code: item.code, name: item.name })));
      setCustomerInfo(prev => ({ ...prev, ward: '' }));
    }
  }, [customerInfo.city, addressData]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const profile = await supabase.auth.getUser();
      if (!profile.data.user) return;
      const { data, error } = await supabase
        .from("profiles").select("*")
        .eq("id", profile.data.user.id).single();
      if (error) { console.error("Error fetching profile:", error); return; }
      setProfileData(prev => ({
        ...prev,
        fullName: data?.last_name || prev.last_name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        dateOfBirth: data.date_of_birth || prev.dateOfBirth,
      }));
    };
    fetchProfileData();
  }, []);

  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, marketing: false
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };
  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        last_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        city: customerInfo.city,
        ward: customerInfo.ward,
        date_of_birth: profileData.dateOfBirth,
      }, { onConflict: "id" });

    if (error) {
      console.error("Error saving profile:", error);
      alert("Lưu thất bại: " + error.message);
      return;
    }
  };
  const handleSave = () => {
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Cá nhân', icon: User },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'billing', label: 'Thanh toán', icon: CreditCard },
  ];

  const initials = (profileData.fullName || profileData.last_name || 'U').charAt(0).toUpperCase();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bd:     #3d2b1a;
          --bm:     #7a5135;
          --bl:     #b08060;
          --bxl:    #d4b090;
          --bg0:    #faf7f4;
          --bg1:    #f5ede3;
          --bg2:    #ede6dc;
          --white:  #ffffff;
          --soft:   #9a8070;
        }

        .ap-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg0);
          min-height: 100vh;
          padding: 2.5rem 1.25rem;
        }

        /* ── Toast ── */
        .toast {
          position: fixed; top: 20px; right: 20px; z-index: 200;
          background: #4a7a50; color: #fff;
          padding: 12px 22px; border-radius: 50px;
          display: flex; align-items: center; gap: 9px;
          font-size: 13.5px; font-weight: 500;
          box-shadow: 0 6px 24px rgba(40,80,50,0.22);
          animation: toastIn 0.3s cubic-bezier(0.34,1.4,0.64,1);
        }
        @keyframes toastIn {
          from { opacity:0; transform: translateY(-12px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* ── Layout ── */
        .ap-grid { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; align-items: start; }

        /* ── Sidebar ── */
        .sidebar {
          background: var(--white); border-radius: 20px;
          border: 1px solid var(--bg2);
          box-shadow: 0 2px 16px rgba(120,80,50,0.06);
          overflow: hidden;
          position: sticky; top: 24px;
        }

        .sidebar-hero {
          background: linear-gradient(160deg, #5c3520 0%, #9a6040 55%, #c49070 100%);
          padding: 2rem 1.5rem 1.5rem;
          text-align: center;
          position: relative;
        }
        .sidebar-hero::after {
          content:''; position:absolute; bottom:-1px; left:0; right:0; height:24px;
          background: var(--white);
          border-radius: 24px 24px 0 0;
        }

        .avatar-ring {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(255,255,255,0.18);
          border: 2.5px solid rgba(255,255,255,0.5);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 0;
          position: relative;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem; font-weight: 600; color: #fff;
        }
        .avatar-cam {
          position: absolute; bottom: -2px; right: -2px;
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--white); border: 2px solid var(--bg2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.18s;
        }
        .avatar-cam:hover { background: var(--bg1); }

        .sidebar-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem; font-weight: 600; color: var(--bd);
          margin: 1.2rem 0 3px;
        }
        .sidebar-email { font-size: 12px; color: var(--soft); }

        .sidebar-nav { padding: 1rem; display: flex; flex-direction: column; gap: 3px; }
        .tab-btn {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 14px; border-radius: 12px;
          border: none; background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          color: var(--soft); font-weight: 400;
          transition: background 0.18s, color 0.18s;
          text-align: left; width: 100%;
        }
        .tab-btn:hover { background: var(--bg1); color: var(--bd); }
        .tab-btn.active { background: var(--bg1); color: var(--bm); font-weight: 500; }
        .tab-btn.active .tab-icon { color: var(--bm); }
        .tab-icon { color: var(--bxl); transition: color 0.18s; flex-shrink:0; }
        .tab-chevron { margin-left: auto; color: var(--bg2); }
        .tab-btn.active .tab-chevron { color: var(--bxl); }

        /* ── Main card ── */
        .main-card {
          background: var(--white); border-radius: 20px;
          border: 1px solid var(--bg2);
          box-shadow: 0 2px 16px rgba(120,80,50,0.06);
          padding: 2rem 2.25rem;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 600; color: var(--bd);
        }

        /* ── Inputs ── */
        .field-label {
          display: block; font-size: 11.5px; font-weight: 500;
          color: var(--soft); letter-spacing: 0.05em;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .field-input {
          width: 100%; padding: 10px 14px;
          border: 1.5px solid var(--bg2); border-radius: 10px;
          background: var(--bg0); color: var(--bd);
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }
        .field-input:focus { border-color: var(--bl); background: var(--white); box-shadow: 0 0 0 3px rgba(176,128,96,0.13); }
        .field-input:disabled { background: var(--bg0); color: var(--soft); cursor: default; }

        /* ── Buttons ── */
        .btn-edit {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 50px;
          border: 1.5px solid var(--bg2); background: var(--white);
          color: var(--bm); font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.18s, border-color 0.18s;
        }
        .btn-edit:hover { background: var(--bg1); border-color: var(--bxl); }

        .btn-save {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 22px; border-radius: 50px; border: none;
          background: linear-gradient(135deg, #a07050, #7a5135);
          color: #fff; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 3px 12px rgba(120,75,45,0.25);
          transition: opacity 0.18s, transform 0.18s;
        }
        .btn-save:hover { opacity: 0.88; transform: translateY(-1px); }

        .btn-cancel {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 50px;
          border: 1.5px solid var(--bg2); background: var(--white);
          color: var(--soft); font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.18s;
        }
        .btn-cancel:hover { background: var(--bg1); }

        .btn-primary {
          padding: 10px 22px; border-radius: 50px; border: none;
          background: linear-gradient(135deg, #a07050, #7a5135);
          color: #fff; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 3px 12px rgba(120,75,45,0.25);
          transition: opacity 0.18s, transform 0.18s;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Notification toggle ── */
        .notif-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-radius: 14px;
          background: var(--bg0); border: 1px solid var(--bg2);
          transition: background 0.15s;
        }
        .notif-row:hover { background: var(--bg1); }
        .toggle-track {
          width: 42px; height: 24px; border-radius: 50px;
          background: var(--bg2); position: relative; cursor: pointer;
          transition: background 0.25s; flex-shrink: 0; border: none; padding: 0;
        }
        .toggle-track.on { background: var(--bm); }
        .toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--white);
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1);
        }
        .toggle-track.on .toggle-thumb { transform: translateX(18px); }

        /* ── Security ── */
        .security-block {
          background: var(--bg0); border: 1px solid var(--bg2);
          border-radius: 14px; padding: 1.5rem;
        }

        /* ── Billing ── */
        .card-item {
          border: 1.5px solid var(--bg2); border-radius: 14px; padding: 1.25rem 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          background: var(--bg0);
        }
        .card-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, #c49070, #8b5e3c);
          display: flex; align-items: center; justify-content: center;
        }
        .tx-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 12px; background: var(--bg0);
          border: 1px solid var(--bg2);
        }

        .divider { height: 1px; background: var(--bg2); margin: 1.5rem 0; }

        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .field-full { grid-column: 1 / -1; }
      `}</style>

      <div className="ap-root">

        {/* Toast */}
        {showSuccess && (
          <div className="toast">
            <Check size={15} strokeWidth={2} />
            Cập nhật thành công!
          </div>
        )}

        <div className="ap-grid">

          {/* ── Sidebar ── */}
          <aside className="sidebar">
            <div className="sidebar-hero">
              <div className="avatar-ring">
                {initials}
                <button className="avatar-cam">
                  <Camera size={12} color="#8b5e3c" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center", padding: "0 1.5rem 1rem" }}>
              <div className="sidebar-name">{profileData.fullName || profileData.last_name || "Người dùng"}</div>
              <div className="sidebar-email">{profileData.email}</div>
            </div>

            <nav className="sidebar-nav">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}>
                    <Icon size={15} strokeWidth={1.6} className="tab-icon" />
                    {tab.label}
                    <ChevronRight size={13} strokeWidth={1.8} className="tab-chevron" />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Main ── */}
          <main className="main-card">

            {/* ───── PROFILE ───── */}
            {activeTab === 'profile' && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
                  <h2 className="section-title">Thông tin cá nhân</h2>
                  {!isEditing ? (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                      <Edit2 size={13} strokeWidth={1.8} /> Chỉnh sửa
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                        <X size={13} /> Hủy
                      </button>
                      <button className="btn-save" onClick={async () => { await handleSaveProfile(); handleSave(); }}>
                        <Check size={13} /> Lưu thay đổi
                      </button>
                    </div>
                  )}
                </div>

                <div className="field-grid">
                  {[
                    { label: "Họ và tên", field: "fullName", type: "text", placeholder: "Nguyễn Văn A" },
                    { label: "Email", field: "email", type: "email", placeholder: "email@example.com" },
                    { label: "Số điện thoại", field: "phone", type: "tel", placeholder: "0912 345 678" },
                    { label: "Ngày sinh", field: "dateOfBirth", type: "date", placeholder: "" },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="field-label">{f.label}</label>
                      <input type={f.type} value={(profileData as any)[f.field] || ""} placeholder={f.placeholder}
                        onChange={e => handleProfileChange(f.field, e.target.value)}
                        disabled={!isEditing} className="field-input" />
                    </div>
                  ))}

                  <div>
                    <label className="field-label">Giới tính</label>
                    <select value={profileData.gender} onChange={e => handleProfileChange('gender', e.target.value)}
                      disabled={!isEditing} className="field-input">
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Địa chỉ</label>
                    <input type="text" value={profileData.address} placeholder="Số nhà, tên đường..."
                      onChange={e => handleProfileChange('address', e.target.value)}
                      disabled={!isEditing} className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Tỉnh / Thành phố <span style={{ color: '#c07050' }}>*</span></label>
                    <select name="city" value={customerInfo.city} onChange={handleInputChange} className="field-input">
                      <option className="field-input" value="">Chọn tỉnh / thành</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Phường / Xã</label>
                    <select name="ward" value={customerInfo.ward} onChange={handleInputChange} disabled={!customerInfo.city} className="field-input" style={{ opacity: !customerInfo.city ? 0.5 : 1 }}>
                      <option className="field-input" value="">Chọn phường / xã</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                    </select>
                  </div>

                  <div className="field-full">
                    <label className="field-label">Giới thiệu</label>
                    <textarea value={profileData.bio} rows={3} placeholder="Vài dòng về bạn..."
                      onChange={e => handleProfileChange('bio', e.target.value)}
                      disabled={!isEditing}
                      className="field-input" style={{ resize: "none", lineHeight: 1.6 }} />
                  </div>
                </div>
              </div>
            )}

            {/* ───── SECURITY ───── */}
            {activeTab === 'security' && (
              <div>
                <h2 className="section-title" style={{ marginBottom: "1.75rem" }}>Bảo mật</h2>

                <div className="security-block" style={{ marginBottom: "1.25rem" }}>
                  <p style={{ fontWeight: 600, color: "var(--bd)", marginBottom: "1.25rem", fontSize: "0.95rem" }}>Đổi mật khẩu</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 420 }}>
                    {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map(label => (
                      <div key={label}>
                        <label className="field-label">{label}</label>
                        <input type="password" placeholder="••••••••" className="field-input" />
                      </div>
                    ))}
                    <button className="btn-primary" style={{ marginTop: 4, alignSelf: "flex-start" }}>
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </div>

                <div className="divider" />

                <div className="security-block">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <ShieldCheck size={22} color="var(--bl)" strokeWidth={1.6} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontWeight: 600, color: "var(--bd)", fontSize: "0.95rem", marginBottom: 3 }}>Xác thực hai yếu tố</p>
                        <p style={{ fontSize: "13px", color: "var(--soft)" }}>Tăng cường bảo mật cho tài khoản qua SMS</p>
                      </div>
                    </div>
                    <button className="btn-primary">Kích hoạt</button>
                  </div>
                </div>
              </div>
            )}

            {/* ───── NOTIFICATIONS ───── */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="section-title" style={{ marginBottom: "1.75rem" }}>Cài đặt thông báo</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {([
                    ["email", "Thông báo qua Email", "Nhận thông báo về hoạt động tài khoản"],
                    ["sms", "Thông báo qua SMS", "Nhận mã OTP và cảnh báo bảo mật"],
                    ["push", "Thông báo đẩy", "Thông báo trực tiếp trên thiết bị"],
                    ["marketing", "Tin khuyến mãi", "Nhận ưu đãi và chương trình đặc biệt"],
                  ] as [keyof typeof notifications, string, string][]).map(([key, label, desc]) => (
                    <div key={key} className="notif-row">
                      <div>
                        <p style={{ fontWeight: 500, color: "var(--bd)", fontSize: "14px", marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: "12.5px", color: "var(--soft)" }}>{desc}</p>
                      </div>
                      <button
                        className={`toggle-track${notifications[key] ? " on" : ""}`}
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                      >
                        <div className="toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ───── BILLING ───── */}
            {activeTab === 'billing' && (
              <div>
                <h2 className="section-title" style={{ marginBottom: "1.75rem" }}>Phương thức thanh toán</h2>

                <div className="card-item" style={{ marginBottom: "0.75rem" }}>
                  <div className="card-icon-wrap">
                    <CreditCard size={20} color="#fff" strokeWidth={1.6} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "var(--bd)", fontSize: "14px" }}>•••• •••• •••• 4242</p>
                    <p style={{ fontSize: "12px", color: "var(--soft)", marginTop: 2 }}>Hết hạn 12/25</p>
                  </div>
                  <span style={{ fontSize: "11px", padding: "3px 12px", borderRadius: 50, background: "#eef5e8", color: "#5a8050", fontWeight: 500 }}>
                    Mặc định
                  </span>
                  <button style={{ fontSize: "13px", color: "var(--bm)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                    Sửa
                  </button>
                </div>

                <button style={{
                  width: "100%", padding: "12px", borderRadius: 14,
                  border: "1.5px dashed var(--bg2)", background: "transparent",
                  color: "var(--soft)", fontSize: "13.5px", cursor: "pointer",
                  fontFamily: "inherit", transition: "border-color 0.18s, color 0.18s",
                  marginBottom: "1.75rem"
                }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "var(--bl)"; (e.target as HTMLButtonElement).style.color = "var(--bm)"; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "var(--bg2)"; (e.target as HTMLButtonElement).style.color = "var(--soft)"; }}
                >
                  + Thêm phương thức thanh toán
                </button>

                <div className="divider" />

                <p style={{ fontWeight: 600, color: "var(--bd)", marginBottom: "1rem", fontSize: "0.95rem" }}>Lịch sử giao dịch</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {[
                    { date: "15/12/2024", desc: "Nâng cấp gói Premium", amount: "299.000đ" },
                    { date: "15/11/2024", desc: "Thanh toán tháng 11", amount: "99.000đ" },
                    { date: "15/10/2024", desc: "Thanh toán tháng 10", amount: "99.000đ" },
                  ].map((tx, i) => (
                    <div key={i} className="tx-row">
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--bd)" }}>{tx.desc}</p>
                        <p style={{ fontSize: "12px", color: "var(--soft)", marginTop: 2 }}>{tx.date}</p>
                      </div>
                      <p style={{ fontWeight: 600, color: "var(--bm)", fontSize: "14px" }}>{tx.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}