"use client";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, LogOut, Settings, ShoppingCart, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/app/libs/supabaseClient";
import { useAuth } from "@/app/AuthProvider";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  ["Trang chủ", "/"],
  ["Bộ sưu tập", "/collections"],
  ["Thời trang nam", "/men"],
  ["Thời trang nữ", "/women"],
  ["Giới thiệu", "/about"],
] as const;

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.push("/collections");
  };

  // Lấy thông tin từ user metadata — thay bằng state profile thật nếu có
  const firstName = user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Người dùng";
  const lastName = user?.user_metadata?.last_name || "";
  const role = user?.user_metadata?.role || "Thành viên";
  const avatar = user?.user_metadata?.avatar_url || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .navbar-root {
          background: rgba(255, 253, 251, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #ede6dc;
          position: sticky; top: 0; z-index: 100;
          font-family: 'DM Sans', Lora, serif;
        }
        .navbar-root::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent 0%, #d4b090 30%, #c4956a 60%, transparent 100%);
          opacity: 0.5;
        }
        .navbar-inner {
          max-width: 1160px; margin: 0 auto; padding: 0 28px;
          height: 68px; display: flex; align-items: center;
        }
        .navbar-logo { flex-shrink: 0; margin-right: 40px; opacity: 1; transition: opacity 0.2s; }
        .navbar-logo:hover { opacity: 0.75; }

        .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .nav-link {
          position: relative; font-size: 13px; font-weight: 400;
          color: #9a8070; text-decoration: none;
          padding: 7px 13px; border-radius: 8px; white-space: nowrap;
          transition: color 0.18s, background 0.18s; letter-spacing: 0.01em;
        }
        .nav-link:hover, .nav-link.active { color: #4a3020; background: #f5ede3; }
        .nav-link.active { font-weight: 500; }
        .nav-link.active::after {
          content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 3px; height: 3px; border-radius: 50%; background: #b08060;
        }

        .nav-sep { width: 1px; height: 22px; background: #e8ddd0; margin: 0 16px; flex-shrink: 0; }

        .icon-btn {
          width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
          border-radius: 10px; color: #9a8070; text-decoration: none;
          transition: background 0.18s, color 0.18s;
        }
        .icon-btn:hover { background: #f5ede3; color: #5c3d22; }

        .btn-login {
          font-family: 'DM Sans', Lora, serif; font-size: 12.5px; font-weight: 500;
          padding: 8px 18px; border-radius: 50px; color: #7a5135;
          border: 1px solid #d4b090; background: transparent;
          text-decoration: none; white-space: nowrap; cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
        }
        .btn-login:hover { background: #fdf6ef; border-color: #b8926a; color: #5c3520; }

        .btn-register {
          font-family: 'DM Sans', Lora, serif; font-size: 12.5px; font-weight: 500;
          padding: 8px 18px; border-radius: 50px; color: #fff;
          background: linear-gradient(135deg, #a07050 0%, #7a5135 100%);
          border: none; text-decoration: none; white-space: nowrap; cursor: pointer;
          transition: opacity 0.18s, transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 2px 10px rgba(120,75,45,0.22);
        }
        .btn-register:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(120,75,45,0.3); }

        /* ── User trigger ── */
        .user-trigger {
          display: flex; align-items: center; gap: 9px;
          padding: 5px 12px 5px 6px; border-radius: 50px;
          border: 1px solid #e4d5c4; background: #fffdfb;
          cursor: pointer; transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
        }
        .user-trigger:hover, .user-trigger.open {
          background: #f8f0e8; border-color: #c8a888;
          box-shadow: 0 2px 12px rgba(160,100,60,0.12);
        }
        .user-avatar-wrap {
          width: 30px; height: 30px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
          background: linear-gradient(135deg, #f3ede6, #e8d8c8);
          border: 1.5px solid #d4b898;
          display: flex; align-items: center; justify-content: center;
        }
        .user-name { font-size: 13px; font-weight: 500; color: #5c3d22; white-space: nowrap; max-width: 110px; overflow: hidden; text-overflow: ellipsis; }
        .chevron { color: #b08060; transition: transform 0.22s; flex-shrink: 0; }
        .chevron.open { transform: rotate(180deg); }

        /* ── Dropdown panel ── */
        .dropdown-panel {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 236px;
          background: #fffdfb;
          border: 1px solid #e8ddd0; border-radius: 18px;
          box-shadow: 0 12px 48px rgba(100,65,35,0.15), 0 2px 8px rgba(100,65,35,0.06);
          overflow: hidden;
          animation: dropIn 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
          transform-origin: top right;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.93) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        /* Profile header */
        .dd-header {
          padding: 16px 18px 14px;
          border-bottom: 1px solid #f0e8de;
          background: linear-gradient(135deg, #fdf8f3 0%, #f6ede0 100%);
          display: flex; align-items: center; gap: 12px;
        }
        .dd-header-avatar {
          width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
          background: linear-gradient(135deg, #f3ede6, #e8d8c8);
          border: 2px solid #d4b898;
          display: flex; align-items: center; justify-content: center;
        }
        .dd-header-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem; font-weight: 600; color: #3d2b1a; line-height: 1.3;
        }
        .dd-header-role {
          font-size: 10.5px; color: #b08060;
          letter-spacing: 0.07em; text-transform: uppercase; margin-top: 1px;
        }

        /* Items */
        .dd-body { padding: 6px 0; }
        .dd-item {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 18px; font-size: 13px; font-weight: 400;
          color: #6a5040; text-decoration: none;
          cursor: pointer; border: none; background: transparent;
          width: 100%; text-align: left; font-family: 'DM Sans', Lora, serif;
          transition: background 0.15s, color 0.15s;
        }
        .dd-item:hover { background: #f8f0e8; color: #3d2b1a; }
        .dd-icon { color: #c4a484; flex-shrink: 0; transition: color 0.15s; }
        .dd-item:hover .dd-icon { color: #a07050; }

        .dd-sep { height: 1px; background: #f0e8de; margin: 4px 8px; border-radius: 1px; }

        .dd-item.danger { color: #c05040; }
        .dd-item.danger:hover { background: #fff3f0; color: #a03020; }
        .dd-item.danger .dd-icon { color: #e0a090; }
        .dd-item.danger:hover .dd-icon { color: #c05040; }
      `}</style>

      <nav className="navbar-root">
        <div className="navbar-inner">

          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <Image src="/logo.png" alt="Tiệm Mùa Chậm" width={110} height={38}
              style={{ objectFit: "contain", display: "block" }} priority />
          </Link>

          {/* Nav links */}
          <div className="nav-links">
            {NAV_LINKS.map(([label, href]) => (
              <Link key={href} href={href}
                className={`nav-link${pathname === href ? " active" : ""}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link href="/search" className="icon-btn" title="Tìm kiếm">
              <Search size={17} strokeWidth={1.6} />
            </Link>
            <Link href="/cart" className="icon-btn" title="Giỏ hàng">
              <ShoppingBag size={17} strokeWidth={1.6} />
            </Link>
          </div>

          <div className="nav-sep" />

          {/* Auth */}
          {!user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link href="/auth/login" className="btn-login">Đăng nhập</Link>
              <Link href="/auth/register" className="btn-register">Đăng ký</Link>
            </div>
          ) : (
            <div ref={dropdownRef} style={{ position: "relative" }}>

              {/* Trigger */}
              <button
                className={`user-trigger${dropdownOpen ? " open" : ""}`}
                onClick={() => setDropdownOpen(v => !v)}
              >
                <div className="user-avatar-wrap">
                  {avatar
                    ? <img src={avatar} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <User size={15} strokeWidth={1.6} color="#8b5e3c" />
                  }
                </div>
                <span className="user-name">{firstName}</span>
                <ChevronDown size={14} strokeWidth={2} className={`chevron${dropdownOpen ? " open" : ""}`} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="dropdown-panel">

                  {/* Header với avatar lớn hơn */}
                  <div className="dd-header">
                    <div className="dd-header-avatar">
                      {avatar
                        ? <img src={avatar} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <User size={18} strokeWidth={1.5} color="#8b5e3c" />
                      }
                    </div>
                    <div>
                      <div className="dd-header-name">{firstName} {lastName}</div>
                      <div className="dd-header-role">{role}</div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="dd-body">
                    <Link href="/info" className="dd-item" onClick={() => setDropdownOpen(false)}>
                      <User size={14} strokeWidth={1.6} className="dd-icon" />
                      Trang cá nhân
                    </Link>
                    <Link href="/orders" className="dd-item" onClick={() => setDropdownOpen(false)}>
                      <ShoppingCart size={14} strokeWidth={1.6} className="dd-icon" />
                      Đơn mua
                    </Link>
                    <Link href="/settings" className="dd-item" onClick={() => setDropdownOpen(false)}>
                      <Settings size={14} strokeWidth={1.6} className="dd-icon" />
                      Cài đặt
                    </Link>

                    <div className="dd-sep" />

                    <button className="dd-item danger" onClick={handleLogOut}>
                      <LogOut size={14} strokeWidth={1.6} className="dd-icon" />
                      Đăng xuất
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      </nav>
    </>
  );
}