"use client"
import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Lock, Bell, CreditCard, Camera, Check, X, Edit2, ShieldCheck, ChevronRight, Menu } from 'lucide-react';
import { supabase } from '../libs/supabaseClient';
import { DiaGioiHanhChinh2Cap, Commune } from '../api/addressAPI';
import * as yup from "yup";

export default function AccountProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [provinces, setProvinces] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressData, setAddressData] = useState<Commune[]>([]);
  const [wards, setWards] = useState<Commune[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isInitialLoad = useRef(true);
  const validateField = async (field: any, value: any) => {
    try {
      await profileSchema.validateAt(field, {
        ...profileData,
        [field]: value,
      });

      setErrors(prev => ({ ...prev, [field]: "" }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [field]: err.message }));
    }
  };
  const profileSchema = yup.object({
    last_name: yup.string().required("Vui lòng nhập họ"),
    first_name: yup.string().required("Vui lòng nhập tên"),
    email: yup
      .string()
      .required("Email không được để trống")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/,
        "Email không đúng định dạng (ví dụ: abc@gmail.com)"
      ),

    phone: yup
      .string()
      .matches(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),

    dateOfBirth: yup.string().required("Vui lòng chọn ngày sinh"),
  });
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '', email: '', phone: "", address: '',
    totalAmount: 0, city: '', ward: '', note: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [profileData, setProfileData] = useState({
    last_name: '', first_name: '', email: '', phone: "",
    address: '', bio: '', dateOfBirth: '31/01/1990', gender: 'Nam'
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
      if (!isInitialLoad.current) {
        setCustomerInfo(prev => ({ ...prev, ward: '' }));
      }
      isInitialLoad.current = false;
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
        last_name: data?.last_name || "",
        first_name: data?.first_name || "",
        email: data?.email || "",
        phone: data?.phone || 0,
        gender: data?.gender || "Nam",
        dateOfBirth: data?.date_of_birth || "",
      }));

      setCustomerInfo(prev => ({
        ...prev,
        city: data?.city || "",
        ward: data?.ward || "",
      }));
    };
    fetchProfileData();
  }, []);

  // Close sidebar when tab changes on mobile
  useEffect(() => { setSidebarOpen(false); }, [activeTab]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, marketing: false
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await profileSchema.validate(profileData, { abortEarly: false });

      setErrors({}); // clear lỗi

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        last_name: profileData.last_name,
        first_name: profileData.first_name,
        email: profileData.email,
        phone: profileData.phone,
        gender: profileData.gender,
        date_of_birth: profileData.dateOfBirth,
      }, { onConflict: "id" });

      if (error) throw error;

      handleSave();

    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach(e => {
          if (e.path) {
            newErrors[e.path] = e.message;
          }
        });
        setErrors(newErrors);
      } else {
        alert((err as Error).message);
      }
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
    { id: 'addresses', label: 'Địa chỉ đã lưu', icon: MapPin },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'billing', label: 'Thanh toán', icon: CreditCard },

  ];

  const initials = (profileData.first_name || profileData.last_name || 'U').charAt(0).toUpperCase();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const handlePasswordChange = (field: any, value: any) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };
  const handleChangePassword = async () => {
    setPasswordError("");

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return setPasswordError("Vui lòng nhập đầy đủ thông tin");
    }

    if (passwordData.newPassword.length < 6) {
      return setPasswordError("Mật khẩu mới phải >= 6 ký tự");
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError("Xác nhận mật khẩu không khớp");
    }

    try {
      setPasswordLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Không tìm thấy user");

      // 🔥 Bước quan trọng: verify mật khẩu cũ
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        throw new Error("Mật khẩu hiện tại không đúng");
      }

      // 🔥 Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      // 🔥 Logout sau khi đổi mật khẩu
      await supabase.auth.signOut();

      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

      // redirect (nếu dùng Next.js)
      window.location.href = "/auth/login";

      setShowSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      setPasswordError((err as Error).message);
    } finally {
      setPasswordLoading(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };
  const getPasswordStrength = (password: any) => {
    if (!password) return "";

    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Yếu", color: "red" };
    if (score === 2) return { label: "Trung bình", color: "orange" };
    return { label: "Mạnh", color: "green" };
  };
  const SidebarContent = () => (
    <>
      <div className="sidebar-hero">
        <div className="avatar-ring">
          {initials}
          <button className="avatar-cam">
            <Camera size={12} color="#8b5e3c" strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "0 1.5rem 1rem" }}>
        <div className="sidebar-name">{profileData.first_name || profileData.last_name || "Người dùng"}</div>
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
    </>
  );

  // 2. Thêm types:
  type Address = {
    id: string;
    full_name: string;
    phone: string;
    address_line: string;
    ward: string;
    city: string;
    is_default: boolean;
  };

  // 3. Thêm states (cùng chỗ với các state khác):
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '', phone: '', address_line: '', ward: '', city: ''
  });
  const [addressWards, setAddressWards] = useState<Commune[]>([]);

  // 4. Thêm useEffect load addresses:
  useEffect(() => {
    const fetchAddresses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (data) setAddresses(data);
    };
    fetchAddresses();
  }, []);

  // 5. Thêm useEffect cho ward trong form địa chỉ:
  useEffect(() => {
    if (addressForm.city && addressData.length > 0) {
      const filtered = addressData.filter(item => item.provinceCode === addressForm.city);
      setAddressWards(filtered.map(item => ({ code: item.code, name: item.name })));
      if (!editingAddress) {
        setAddressForm(prev => ({ ...prev, ward: '' }));
      }
    }
  }, [addressForm.city, addressData]);

  // 6. Thêm các hàm xử lý:
  const handleSaveAddress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingAddress) {
      const { error } = await supabase
        .from('addresses')
        .update({
          full_name: addressForm.full_name,
          phone: addressForm.phone,
          address_line: addressForm.address_line,
          ward: addressForm.ward,
          city: addressForm.city,
        })
        .eq('id', editingAddress.id);
      if (error) { alert('Lỗi: ' + error.message); return; }
    } else {
      const isFirst = addresses.length === 0;
      const { error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: addressForm.full_name,
          phone: addressForm.phone,
          address_line: addressForm.address_line,
          ward: addressForm.ward,
          city: addressForm.city,
          is_default: isFirst,
        });
      if (error) { alert('Lỗi: ' + error.message); return; }

      // Nếu là địa chỉ đầu tiên → link vào profiles
      if (isFirst) {
        const { data: newAddr } = await supabase
          .from('addresses')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (newAddr) {
          await supabase.from('profiles').update({ address_id: newAddr.id }).eq('id', user.id);
        }
      }
    }

    // Reload
    const { data } = await supabase
      .from('addresses').select('*').eq('user_id', user.id)
      .order('is_default', { ascending: false });
    if (data) setAddresses(data);
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({ full_name: '', phone: '', address_line: '', ward: '', city: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Xóa địa chỉ này?')) return;
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Bỏ default cũ
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    // Set default mới
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    // Update profiles.address_id
    await supabase.from('profiles').update({ address_id: id }).eq('id', user.id);
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line: addr.address_line,
      ward: addr.ward,
      city: addr.city,
    });
    setShowAddressForm(true);
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bd:   #3d2b1a; --bm: #7a5135; --bl: #b08060;
          --bxl:  #d4b090; --bg0: #faf7f4; --bg1: #f5ede3;
          --bg2:  #ede6dc; --white: #ffffff; --soft: #9a8070;
        }

        * { box-sizing: border-box; }

        .ap-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg0); min-height: 100vh;
          padding: 2.5rem 1.25rem;
        }

        /* ── Toast ── */
        .toast {
          position: fixed; top: 20px; right: 20px; z-index: 300;
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
        .ap-grid {
          max-width: 1080px; margin: 0 auto;
          display: grid; grid-template-columns: 260px 1fr;
          gap: 1.5rem; align-items: start;
        }

        /* ── Mobile top bar ── */
        .mobile-topbar {
          display: none;
          align-items: center; gap: 12px;
          margin-bottom: 1rem;
          max-width: 1080px; margin-left: auto; margin-right: auto;
        }
        .mobile-menu-btn {
          width: 40px; height: 40px; border-radius: 12px;
          border: 1px solid var(--bg2); background: var(--white);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--bm); flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(120,80,50,0.06);
        }
        .mobile-tab-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 600; color: var(--bd);
        }

        /* ── Mobile drawer overlay ── */
        .drawer-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 200;
          background: rgba(40,22,10,0.45);
          backdrop-filter: blur(3px);
          animation: fadeIn 0.22s ease;
        }
        .drawer-overlay.open { display: block; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        /* ── Mobile drawer ── */
        .mobile-drawer {
          position: fixed; top: 0; left: -100%; width: min(280px, 82vw);
          height: 100dvh; z-index: 210;
          background: var(--white);
          border-right: 1px solid var(--bg2);
          box-shadow: 8px 0 32px rgba(80,45,20,0.18);
          overflow-y: auto;
          transition: left 0.3s cubic-bezier(0.32,0.72,0,1);
        }
        .mobile-drawer.open { left: 0; }
        .drawer-close-row {
          display: flex; justify-content: flex-end;
          padding: 12px 14px 0;
        }
        .drawer-close {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid var(--bg2); background: var(--white);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--soft);
        }

        /* ── Desktop sidebar ── */
        .sidebar {
          background: var(--white); border-radius: 20px;
          border: 1px solid var(--bg2);
          box-shadow: 0 2px 16px rgba(120,80,50,0.06);
          overflow: hidden; position: sticky; top: 24px;
        }

        .sidebar-hero {
          background: linear-gradient(160deg, #5c3520 0%, #9a6040 55%, #c49070 100%);
          padding: 2rem 1.5rem 1.5rem;
          text-align: center; position: relative;
        }
        .sidebar-hero::after {
          content:''; position:absolute; bottom:-1px; left:0; right:0; height:24px;
          background: var(--white); border-radius: 24px 24px 0 0;
        }

        .avatar-ring {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(255,255,255,0.18);
          border: 2.5px solid rgba(255,255,255,0.5);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto; position: relative;
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
          transition: background 0.18s, border-color 0.18s; white-space: nowrap;
        }
        .btn-edit:hover { background: var(--bg1); border-color: var(--bxl); }

        .btn-save {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 22px; border-radius: 50px; border: none;
          background: linear-gradient(135deg, #a07050, #7a5135);
          color: #fff; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 3px 12px rgba(120,75,45,0.25);
          transition: opacity 0.18s, transform 0.18s; white-space: nowrap;
        }
        .btn-save:hover { opacity: 0.88; transform: translateY(-1px); }

        .btn-cancel {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 50px;
          border: 1.5px solid var(--bg2); background: var(--white);
          color: var(--soft); font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.18s; white-space: nowrap;
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
          transition: background 0.15s; gap: 12px;
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
          background: var(--bg0); flex-wrap: wrap;
        }
        .card-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, #c49070, #8b5e3c);
          display: flex; align-items: center; justify-content: center;
        }
        .tx-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 12px; background: var(--bg0);
          border: 1px solid var(--bg2); gap: 8px;
        }

        .divider { height: 1px; background: var(--bg2); margin: 1.5rem 0; }

        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .field-full { grid-column: 1 / -1; }

        /* ── Section header ── */
        .section-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 1.75rem; gap: 12px; flex-wrap: wrap;
        }
        .section-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        /* ══════════════════════════════
           RESPONSIVE — Tablet (≤ 860px)
        ══════════════════════════════ */
        @media (max-width: 860px) {
          .ap-grid { grid-template-columns: 1fr; }
          .sidebar { display: none; } /* replaced by mobile drawer */
          .mobile-topbar { display: flex; }
          .ap-root { padding: 1.25rem 1rem; }
        }

        /* ══════════════════════════════
           RESPONSIVE — Mobile (≤ 600px)
        ══════════════════════════════ */
        @media (max-width: 600px) {
          .field-grid { grid-template-columns: 1fr; }
          .field-full { grid-column: 1; }
          .main-card { padding: 1.25rem 1rem; border-radius: 16px; }
          .section-title { font-size: 1.35rem; }

          /* Stack action buttons */
          .section-header { flex-direction: column; align-items: flex-start; }
          .section-header-actions { width: 100%; }
          .section-header-actions .btn-cancel,
          .section-header-actions .btn-save { flex: 1; justify-content: center; }
          .btn-edit { width: 100%; justify-content: center; }

          /* Security */
          .security-block { padding: 1rem; }
          .security-flex { flex-direction: column !important; gap: 12px !important; }
          .btn-primary-full { width: 100% !important; }

          /* Billing */
          .card-item { padding: 1rem; }
          .tx-row { flex-direction: column; align-items: flex-start; gap: 4px; }

          /* Notifications */
          .notif-row { padding: 12px 14px; }
        }

        /* ══════════════════════════════
           RESPONSIVE — Very small (≤ 380px)
        ══════════════════════════════ */
        @media (max-width: 380px) {
          .ap-root { padding: 1rem 0.75rem; }
          .avatar-ring { width: 68px; height: 68px; font-size: 1.8rem; }
        }
      `}</style>

      <div className="ap-root">

        {/* Toast */}
        {showSuccess && (
          <div className="toast">
            <Check size={15} strokeWidth={2} /> Cập nhật thành công!
          </div>
        )}

        {/* ── Mobile top bar ── */}
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Mở menu">
            <Menu size={18} strokeWidth={1.8} />
          </button>
          <span className="mobile-tab-label">
            {tabs.find(t => t.id === activeTab)?.label || 'Tài khoản'}
          </span>
        </div>

        {/* ── Mobile drawer overlay ── */}
        <div className={`drawer-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── Mobile drawer ── */}
        <div className={`mobile-drawer${sidebarOpen ? ' open' : ''}`}>
          <div className="drawer-close-row">
            <button className="drawer-close" onClick={() => setSidebarOpen(false)} aria-label="Đóng">
              <X size={15} strokeWidth={2} />
            </button>
          </div>
          <SidebarContent />
        </div>

        <div className="ap-grid">

          {/* ── Desktop Sidebar ── */}
          <aside className="sidebar">
            <SidebarContent />
          </aside>

          {/* ── Main ── */}
          <main className="main-card">

            {/* ───── PROFILE ───── */}
            {activeTab === 'profile' && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">Thông tin cá nhân</h2>
                  {!isEditing ? (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                      <Edit2 size={13} strokeWidth={1.8} /> Chỉnh sửa
                    </button>
                  ) : (
                    <div className="section-header-actions">
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
                  {/* Họ */}
                  <div>
                    <label className="field-label">Họ</label>
                    <input
                      type="text"
                      value={profileData.last_name || ""}
                      placeholder="Nhập họ của bạn"
                      onChange={async (e) => {
                        const val = e.target.value;
                        handleProfileChange("last_name", val);
                        await validateField("last_name", val);
                      }}
                      disabled={!isEditing}
                      className="field-input"
                      style={{
                        borderColor: isEditing
                          ? errors.last_name ? "red" : profileData.last_name ? "green" : undefined
                          : undefined
                      }}
                    />
                    {isEditing && errors.last_name && <p style={{ color: "red", fontSize: 12 }}>❌ {errors.last_name}</p>}
                    {isEditing && !errors.last_name && profileData.last_name && (
                      <p style={{ color: "green", fontSize: 12 }}>✅ Hợp lệ</p>
                    )}
                  </div>

                  {/* Tên */}
                  <div>
                    <label className="field-label">Tên</label>
                    <input
                      type="text"
                      value={profileData.first_name || ""}
                      placeholder="Nhập tên của bạn"
                      onChange={async (e) => {
                        const val = e.target.value;
                        handleProfileChange("first_name", val);
                        await validateField("first_name", val);
                      }}
                      disabled={!isEditing}
                      className="field-input"
                      style={{
                        borderColor: isEditing
                          ? errors.first_name ? "red" : profileData.first_name ? "green" : undefined
                          : undefined
                      }}
                    />
                    {isEditing && errors.first_name && <p style={{ color: "red", fontSize: 12 }}>❌ {errors.first_name}</p>}
                    {isEditing && !errors.first_name && profileData.first_name && (
                      <p style={{ color: "green", fontSize: 12 }}>✅ Hợp lệ</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="field-label">Email</label>
                    <input
                      type="email"
                      value={profileData.email || ""}
                      placeholder="email@example.com"
                      onChange={async (e) => {
                        const val = e.target.value;
                        handleProfileChange("email", val);
                        await validateField("email", val);
                      }}
                      disabled={!isEditing}
                      className="field-input"
                      style={{
                        borderColor: isEditing
                          ? errors.email ? "red" : profileData.email ? "green" : undefined
                          : undefined
                      }}
                    />
                    {isEditing && errors.email && <p style={{ color: "red", fontSize: 12 }}>❌ {errors.email}</p>}
                    {isEditing && !errors.email && profileData.email && (
                      <p style={{ color: "green", fontSize: 12 }}>✅ Hợp lệ</p>
                    )}
                  </div>

                  {/* SĐT */}
                  <div>
                    <label className="field-label">Số điện thoại</label>
                    <input
                      type="tel"
                      value={profileData.phone || ""}
                      placeholder=" Nhập số điện thoại của bạn"
                      onChange={async (e) => {
                        const val = e.target.value;
                        handleProfileChange("phone", val);
                        await validateField("phone", val);
                      }}
                      disabled={!isEditing}
                      className="field-input"
                      style={{
                        borderColor: isEditing
                          ? errors.phone ? "red" : profileData.phone ? "green" : undefined
                          : undefined
                      }}
                    />
                    {isEditing && errors.phone && <p style={{ color: "red", fontSize: 12 }}>❌ {errors.phone}</p>}
                    {isEditing && !errors.phone && profileData.phone && (
                      <p style={{ color: "green", fontSize: 12 }}>✅ Hợp lệ</p>
                    )}
                  </div>

                  {/* Ngày sinh */}
                  <div>
                    <label className="field-label">Ngày sinh</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth || ""}
                      onChange={async (e) => {
                        const val = e.target.value;
                        handleProfileChange("dateOfBirth", val);
                        await validateField("dateOfBirth", val);
                      }}
                      disabled={!isEditing}
                      className="field-input"
                      style={{
                        borderColor: errors.dateOfBirth
                          ? "red"
                          : profileData.dateOfBirth
                            ? "green"
                            : undefined
                      }}
                    />
                    {isEditing && errors.dateOfBirth && (
                      <p style={{ color: "red", fontSize: 12 }}>❌ {errors.dateOfBirth}</p>
                    )}
                    {isEditing && !errors.dateOfBirth && profileData.dateOfBirth && (
                      <p style={{ color: "green", fontSize: 12 }}>✅ Hợp lệ</p>
                    )}
                  </div>

                  {/* Giới tính */}
                  <div>
                    <label className="field-label">Giới tính</label>
                    <select
                      value={profileData.gender}
                      onChange={e => handleProfileChange("gender", e.target.value)}
                      disabled={!isEditing}
                      className="field-input"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="field-full">
                    <label className="field-label">Giới thiệu</label>
                    <textarea
                      value={profileData.bio}
                      rows={3}
                      placeholder="Vài dòng về bạn..."
                      onChange={e => handleProfileChange("bio", e.target.value)}
                      disabled={!isEditing}
                      className="field-input"
                      style={{ resize: "none", lineHeight: 1.6 }}
                    />
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
                    {([
                      ["currentPassword", "Mật khẩu hiện tại", "current"],
                      ["newPassword", "Mật khẩu mới", "new"],
                      ["confirmPassword", "Xác nhận mật khẩu mới", "confirm"]
                    ] as [keyof typeof passwordData, string, keyof typeof showPassword][]).map(([field, label, key]) => (
                      <div key={field} style={{ position: "relative" }}>
                        <label className="field-label">{label}</label>

                        <input
                          type={showPassword[key] ? "text" : "password"}
                          placeholder=""
                          className="field-input"
                          value={passwordData[field]}
                          onChange={e => handlePasswordChange(field, e.target.value)}
                        />

                        {/* icon mắt */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, [key]: !prev[key] }))}
                          style={{
                            position: "absolute",
                            right: 10,
                            top: 30,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#888"
                          }}
                        >
                          {showPassword[key] ? "🙈" : "👁"}
                        </button>

                      </div>
                    ))}
                    {passwordData.newPassword && (
                      <p style={{
                        fontSize: 12,
                        marginTop: 4,
                        color: getPasswordStrength(passwordData.newPassword).color
                      }}>
                        Độ mạnh: {getPasswordStrength(passwordData.newPassword).label}
                      </p>
                    )}
                    <button
                      className="btn-primary btn-primary-full"
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </button>
                  </div>
                </div>

                <div className="divider" />

                <div className="security-block">
                  <div className="security-flex" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <ShieldCheck size={22} color="var(--bl)" strokeWidth={1.6} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontWeight: 600, color: "var(--bd)", fontSize: "0.95rem", marginBottom: 3 }}>Xác thực hai yếu tố</p>
                        <p style={{ fontSize: "13px", color: "var(--soft)" }}>Tăng cường bảo mật cho tài khoản qua SMS</p>
                      </div>
                    </div>
                    <button className="btn-primary btn-primary-full" style={{ flexShrink: 0 }}>Kích hoạt</button>
                  </div>
                </div>
              </div>
            )}
            {passwordError && (
              <p style={{ color: "red", fontSize: 13 }}>{passwordError}</p>
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
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 500, color: "var(--bd)", fontSize: "14px", marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: "12.5px", color: "var(--soft)" }}>{desc}</p>
                      </div>
                      <button className={`toggle-track${notifications[key] ? " on" : ""}`}
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}>
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "var(--bd)", fontSize: "14px" }}>•••• •••• •••• 4242</p>
                    <p style={{ fontSize: "12px", color: "var(--soft)", marginTop: 2 }}>Hết hạn 12/25</p>
                  </div>
                  <span style={{ fontSize: "11px", padding: "3px 12px", borderRadius: 50, background: "#eef5e8", color: "#5a8050", fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Mặc định
                  </span>
                  <button style={{ fontSize: "13px", color: "var(--bm)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, whiteSpace: 'nowrap' }}>
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
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--bd)", wordBreak: 'break-word' }}>{tx.desc}</p>
                        <p style={{ fontSize: "12px", color: "var(--soft)", marginTop: 2 }}>{tx.date}</p>
                      </div>
                      <p style={{ fontWeight: 600, color: "var(--bm)", fontSize: "14px", flexShrink: 0 }}>{tx.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* ───── ADDRESSES ───── */}
            {activeTab === 'addresses' && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">Sổ địa chỉ</h2>
                  {!showAddressForm && (
                    <button className="btn-edit" onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({ full_name: '', phone: '', address_line: '', ward: '', city: '' });
                      setShowAddressForm(true);
                    }}>
                      + Thêm địa chỉ
                    </button>
                  )}
                </div>

                {/* Form thêm / sửa */}
                {showAddressForm && (
                  <div style={{
                    background: 'var(--bg1)', border: '1px solid var(--bg2)',
                    borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem'
                  }}>
                    <p style={{ fontWeight: 500, color: 'var(--bd)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                    </p>
                    <div className="field-grid">
                      <div>
                        <label className="field-label">Họ và tên</label>
                        <input className="field-input" placeholder="Nguyễn Văn A"
                          value={addressForm.full_name}
                          onChange={e => setAddressForm(p => ({ ...p, full_name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="field-label">Số điện thoại</label>
                        <input className="field-input" placeholder="0912 345 678"
                          value={addressForm.phone}
                          onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div className="field-full">
                        <label className="field-label">Địa chỉ cụ thể</label>
                        <input className="field-input" placeholder="Số nhà, tên đường..."
                          value={addressForm.address_line}
                          onChange={e => setAddressForm(p => ({ ...p, address_line: e.target.value }))} />
                      </div>
                      <div>
                        <label className="field-label">Tỉnh / Thành phố</label>
                        <select className="field-input" value={addressForm.city}
                          onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))}>
                          <option value="">Chọn tỉnh / thành</option>
                          {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">Phường / Xã</label>
                        <select className="field-input" value={addressForm.ward}
                          disabled={!addressForm.city}
                          style={{ opacity: !addressForm.city ? 0.5 : 1 }}
                          onChange={e => setAddressForm(p => ({ ...p, ward: e.target.value }))}>
                          <option value="">Chọn phường / xã</option>
                          {addressWards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: '1rem', flexWrap: 'wrap' }}>
                      <button className="btn-save" onClick={handleSaveAddress}>
                        <Check size={13} /> Lưu địa chỉ
                      </button>
                      <button className="btn-cancel" onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}>
                        <X size={13} /> Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Danh sách địa chỉ */}
                {addresses.length === 0 && !showAddressForm ? (
                  <div style={{
                    textAlign: 'center', padding: '2.5rem 1rem',
                    background: 'var(--bg0)', border: '1px dashed var(--bg2)',
                    borderRadius: 14, color: 'var(--soft)', fontSize: 14
                  }}>
                    <MapPin size={28} color="var(--bxl)" strokeWidth={1.4} style={{ marginBottom: 10 }} />
                    <p style={{ margin: 0 }}>Chưa có địa chỉ nào. Thêm địa chỉ để mua hàng nhanh hơn!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {addresses.map(addr => {
                      const cityName = provinces.find(p => p.code === addr.city)?.name || addr.city;
                      const wardName = addressData.find(w => w.code === addr.ward)?.name || addr.ward;
                      return (
                        <div key={addr.id} style={{
                          border: `1.5px solid ${addr.is_default ? 'var(--bm)' : 'var(--bg2)'}`,
                          borderRadius: 14, padding: '1rem 1.25rem',
                          background: addr.is_default ? 'var(--bg1)' : 'var(--bg0)',
                          display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start'
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: addr.is_default ? 'var(--bm)' : 'var(--bg2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <MapPin size={16} color={addr.is_default ? '#fff' : 'var(--soft)'} strokeWidth={1.6} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <span style={{ fontWeight: 500, color: 'var(--bd)', fontSize: 14 }}>{addr.full_name}</span>
                              <span style={{ fontSize: 13, color: 'var(--soft)' }}>{addr.phone}</span>
                              {addr.is_default && (
                                <span style={{
                                  fontSize: 11, padding: '2px 10px', borderRadius: 50,
                                  background: '#eef5e8', color: '#5a8050', fontWeight: 500
                                }}>Mặc định</span>
                              )}
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--soft)', margin: 0 }}>
                              {addr.address_line}{wardName ? `, ${wardName}` : ''}{cityName ? `, ${cityName}` : ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                            {!addr.is_default && (
                              <button onClick={() => handleSetDefault(addr.id)}
                                style={{
                                  fontSize: 12, padding: '5px 12px', borderRadius: 50,
                                  border: '1px solid var(--bg2)', background: 'var(--white)',
                                  color: 'var(--bm)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
                                }}>
                                Đặt mặc định
                              </button>
                            )}
                            <button onClick={() => openEditAddress(addr)}
                              style={{
                                fontSize: 12, padding: '5px 12px', borderRadius: 50,
                                border: '1px solid var(--bg2)', background: 'var(--white)',
                                color: 'var(--soft)', cursor: 'pointer', fontFamily: 'inherit'
                              }}>
                              Sửa
                            </button>
                            <button onClick={() => handleDeleteAddress(addr.id)}
                              style={{
                                fontSize: 12, padding: '5px 12px', borderRadius: 50,
                                border: '1px solid #fdd', background: 'var(--white)',
                                color: '#c07050', cursor: 'pointer', fontFamily: 'inherit'
                              }}>
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}