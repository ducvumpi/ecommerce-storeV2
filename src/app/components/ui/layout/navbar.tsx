"use client";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, LogOut, Settings, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Khoá scroll body khi mobile menu mở
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Đóng mobile menu khi đổi route
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function fetchCartCount() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        try {
          const guest = JSON.parse(localStorage.getItem("guest_cart") || "[]");
          const total = guest.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
          setCartCount(total);
        } catch { setCartCount(0); }
        return;
      }

      const { data: cartData } = await supabase
        .from("cart").select("id").eq("user_id", currentUser.id).single();
      if (!cartData) return;

      // Load lần đầu
      const { data } = await supabase
        .from("cart_items").select("quantity").eq("cart_id", cartData.id);
      if (data) {
        const total = data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      }

      // ✅ Realtime: lắng nghe thay đổi cart_items
      const channel = supabase
        .channel(`cart_items_${cartData.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // INSERT, UPDATE, DELETE
            schema: "public",
            table: "cart_items",
            filter: `cart_id=eq.${cartData.id}`,
          },
          async () => {
            // Re-fetch khi có thay đổi
            const { data: updated } = await supabase
              .from("cart_items").select("quantity").eq("cart_id", cartData.id);
            if (updated) {
              const total = updated.reduce((sum, item) => sum + (item.quantity || 1), 0);
              setCartCount(total);
            }
          }
        )
        .subscribe();

      // Cleanup khi unmount
      return () => { supabase.removeChannel(channel); };
    }

    fetchCartCount();
  }, [user]);
  const handleLogOut = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await supabase.auth.signOut();
    router.push("/collections");
  };

  const firstName = user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Người dùng";
  const lastName = user?.user_metadata?.last_name || "";
  const role = user?.user_metadata?.role || "Thành viên";
  const avatar = user?.user_metadata?.avatar_url || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
.cart-badge-wrap { position: relative; }
.cart-badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 16px; height: 16px; padding: 0 4px;
  background: #a07050; color: white;
  border-radius: 50px; border: 2px solid #fffdfb;
  font-size: 9px; font-weight: 700; line-height: 12px;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
        .navbar-root {
          background: rgba(255, 253, 251, 0.95);
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
          transition: background 0.18s, color 0.18s; border: none; background: transparent; cursor: pointer;
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

        .dropdown-wrap { position: relative; }
        .dropdown-panel {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 236px; background: #fffdfb;
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
        .dd-header {
          padding: 16px 18px 14px; border-bottom: 1px solid #f0e8de;
          background: linear-gradient(135deg, #fdf8f3 0%, #f6ede0 100%);
          display: flex; align-items: center; gap: 12px;
        }
        .dd-header-avatar {
          width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
          background: linear-gradient(135deg, #f3ede6, #e8d8c8);
          border: 2px solid #d4b898;
          display: flex; align-items: center; justify-content: center;
        }
        .dd-header-name { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 600; color: #3d2b1a; line-height: 1.3; }
        .dd-header-role { font-size: 10.5px; color: #b08060; letter-spacing: 0.07em; text-transform: uppercase; margin-top: 1px; }
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

        /* ── Hamburger ── */
        .hamburger-btn { display: none; }

        /* ── Mobile Drawer ── */
        .mobile-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 200;
          background: rgba(40, 22, 10, 0.45);
          backdrop-filter: blur(3px);
          animation: fadeIn 0.25s ease;
        }
        .mobile-overlay.open { display: block; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .mobile-drawer {
          position: fixed; top: 0; left: -100%; width: min(300px, 85vw);
          height: 100dvh; z-index: 201;
          background: #fffdfb;
          border-right: 1px solid #e8ddd0;
          box-shadow: 8px 0 32px rgba(80,45,20,0.18);
          display: flex; flex-direction: column;
          transition: left 0.32s cubic-bezier(0.32, 0.72, 0, 1);
          overflow-y: auto;
        }
        .mobile-drawer.open { left: 0; }

        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 16px;
          border-bottom: 1px solid #f0e8de;
          background: linear-gradient(135deg, #fdf8f3, #f6ede0);
          flex-shrink: 0;
        }
        .drawer-close {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1px solid #e0d0c0; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #9a8070;
          transition: background 0.18s, color 0.18s;
        }
        .drawer-close:hover { background: #f5ede3; color: #5c3d22; }

        .drawer-user {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 20px 16px; border-bottom: 1px solid #f0e8de; flex-shrink: 0;
        }
        .drawer-user-avatar {
          width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
          background: linear-gradient(135deg, #f3ede6, #e8d8c8);
          border: 2px solid #d4b898; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .drawer-user-name { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-weight: 600; color: #3d2b1a; line-height: 1.3; }
        .drawer-user-role { font-size: 10.5px; color: #b08060; letter-spacing: 0.07em; text-transform: uppercase; margin-top: 2px; }

        .drawer-nav { padding: 10px 0; flex: 1; }
        .drawer-nav-label { font-size: 9.5px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #c4a484; padding: 8px 20px 4px; }
        .drawer-link {
          display: flex; align-items: center;
          padding: 12px 20px; font-size: 14px; font-weight: 400;
          color: #6a5040; text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .drawer-link:hover, .drawer-link.active { background: #f8f0e8; color: #3d2b1a; }
        .drawer-link.active { font-weight: 500; border-left: 3px solid #b08060; padding-left: 17px; }
        .drawer-link-dot { width: 5px; height: 5px; border-radius: 50%; background: #d4b898; margin-right: 12px; flex-shrink: 0; }
        .drawer-link.active .drawer-link-dot { background: #b08060; }
        .drawer-sep { height: 1px; background: #f0e8de; margin: 8px 12px; }

        .drawer-actions { padding: 6px 0 16px; flex-shrink: 0; }
        .drawer-action {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 20px; font-size: 13.5px; color: #6a5040;
          text-decoration: none; cursor: pointer;
          border: none; background: transparent; width: 100%; text-align: left;
          font-family: 'DM Sans', Lora, serif; transition: background 0.15s, color 0.15s;
        }
        .drawer-action:hover { background: #f8f0e8; color: #3d2b1a; }
        .drawer-action-icon { color: #c4a484; flex-shrink: 0; }
        .drawer-action:hover .drawer-action-icon { color: #a07050; }
        .drawer-action.danger { color: #c05040; }
        .drawer-action.danger:hover { background: #fff3f0; }
        .drawer-action.danger .drawer-action-icon { color: #e0a090; }

        .drawer-auth { padding: 16px 20px 20px; border-top: 1px solid #f0e8de; flex-shrink: 0; }
        .drawer-btn-login {
          display: block; width: 100%; text-align: center;
          padding: 11px; border-radius: 50px; font-size: 13px; font-weight: 500;
          color: #7a5135; border: 1px solid #d4b090; background: transparent;
          text-decoration: none; margin-bottom: 8px; transition: background 0.18s;
          font-family: 'DM Sans', Lora, serif;
        }
        .drawer-btn-login:hover { background: #fdf6ef; }
        .drawer-btn-register {
          display: block; width: 100%; text-align: center;
          padding: 11px; border-radius: 50px; font-size: 13px; font-weight: 500;
          color: #fff; background: linear-gradient(135deg, #a07050 0%, #7a5135 100%);
          border: none; text-decoration: none;
          box-shadow: 0 2px 10px rgba(120,75,45,0.22);
          font-family: 'DM Sans', Lora, serif;
        }

        /* ── RESPONSIVE BREAKPOINTS ── */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .hamburger-btn { display: flex; }
          .nav-sep { display: none; }
          .navbar-inner { padding: 0 16px; height: 60px; }
          .navbar-logo { margin-right: auto; }
          .user-name { display: none; }
          .chevron { display: none; }
          .user-trigger { padding: 4px; border-radius: 50%; }
          .btn-login, .btn-register { display: none; }
        }
        @media (max-width: 480px) {
          .navbar-inner { padding: 0 12px; height: 56px; }
        }
      `}</style>

      <nav className="navbar-root">
        <div className="navbar-container">
          <div className="navbar-inner">

            {/* Logo */}
            <Link href="/" className="navbar-logo">
              <Image src="/logo.png" alt="Tiệm Mùa Chậm" width={110} height={38}
                style={{ objectFit: "contain", display: "block" }} priority />
            </Link>

            {/* Desktop nav links */}
            <div className="nav-links">
              {NAV_LINKS.map(([label, href]) => (
                <Link key={href} href={href} className={`nav-link${pathname === href ? " active" : ""}`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Icon buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Link href="/search" className="icon-btn" title="Tìm kiếm">
                <Search size={17} strokeWidth={1.6} />
              </Link>
              <Link href="/cart" className="icon-btn cart-badge-wrap" title="Giỏ hàng">
                <ShoppingBag size={17} strokeWidth={1.6} />
                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="nav-sep" />

            {/* Auth area */}
            {!user ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link href="/auth/login" className="btn-login">Đăng nhập</Link>
                  <Link href="/auth/register" className="btn-register">Đăng ký</Link>
                </div>
                <button className="icon-btn hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Mở menu">
                  <Menu size={20} strokeWidth={1.6} />
                </button>
              </>
            ) : (
              <>
                {/* Desktop dropdown */}
                <div ref={dropdownRef} className="dropdown-wrap" style={{ display: "flex", alignItems: "center" }}>
                  <button className={`user-trigger${dropdownOpen ? " open" : ""}`} onClick={() => setDropdownOpen(v => !v)}>
                    <div className="user-avatar-wrap">
                      {avatar
                        ? <img src={avatar} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <User size={15} strokeWidth={1.6} color="#8b5e3c" />
                      }
                    </div>
                    <span className="user-name">{firstName}</span>
                    <ChevronDown size={14} strokeWidth={2} className={`chevron${dropdownOpen ? " open" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="dropdown-panel">
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
                      <div className="dd-body">
                        <Link href="/info" className="dd-item" onClick={() => setDropdownOpen(false)}>
                          <User size={14} strokeWidth={1.6} className="dd-icon" />Trang cá nhân
                        </Link>
                        <Link href="/orders" className="dd-item" onClick={() => setDropdownOpen(false)}>
                          <ShoppingCart size={14} strokeWidth={1.6} className="dd-icon" />Đơn mua
                        </Link>
                        <Link href="/settings" className="dd-item" onClick={() => setDropdownOpen(false)}>
                          <Settings size={14} strokeWidth={1.6} className="dd-icon" />Cài đặt
                        </Link>
                        <div className="dd-sep" />
                        <button className="dd-item danger" onClick={handleLogOut}>
                          <LogOut size={14} strokeWidth={1.6} className="dd-icon" />Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hamburger (mobile only) */}
                <button className="icon-btn hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Mở menu" style={{ marginLeft: 4 }}>
                  <Menu size={20} strokeWidth={1.6} />
                </button>
              </>
            )}
          </div>
        </div>

      </nav>

      {/* ── Mobile Overlay ── */}
      <div className={`mobile-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)} />

      {/* ── Mobile Drawer ── */}
      <div className={`mobile-drawer${mobileOpen ? " open" : ""}`}>

        <div className="drawer-header">
          <Image src="/logo.png" alt="Tiệm Mùa Chậm" width={90} height={32} style={{ objectFit: "contain" }} />
          <button className="drawer-close" onClick={() => setMobileOpen(false)} aria-label="Đóng menu">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {user && (
          <div className="drawer-user">
            <div className="drawer-user-avatar">
              {avatar
                ? <img src={avatar} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <User size={20} strokeWidth={1.5} color="#8b5e3c" />
              }
            </div>
            <div>
              <div className="drawer-user-name">{firstName} {lastName}</div>
              <div className="drawer-user-role">{role}</div>
            </div>
          </div>
        )}

        <nav className="drawer-nav">
          <div className="drawer-nav-label">Danh mục</div>
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href}
              className={`drawer-link${pathname === href ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}>
              <span className="drawer-link-dot" />
              {label}
            </Link>
          ))}
        </nav>

        {user ? (
          <>
            <div className="drawer-sep" />
            <div className="drawer-actions">
              <div className="drawer-nav-label">Tài khoản</div>
              <Link href="/info" className="drawer-action" onClick={() => setMobileOpen(false)}>
                <User size={15} strokeWidth={1.6} className="drawer-action-icon" />Trang cá nhân
              </Link>
              <Link href="/orders" className="drawer-action" onClick={() => setMobileOpen(false)}>
                <ShoppingCart size={15} strokeWidth={1.6} className="drawer-action-icon" />Đơn mua
              </Link>
              <Link href="/settings" className="drawer-action" onClick={() => setMobileOpen(false)}>
                <Settings size={15} strokeWidth={1.6} className="drawer-action-icon" />Cài đặt
              </Link>
              <div className="drawer-sep" />
              <button className="drawer-action danger" onClick={handleLogOut}>
                <LogOut size={15} strokeWidth={1.6} className="drawer-action-icon" />Đăng xuất
              </button>
            </div>
          </>
        ) : (
          <div className="drawer-auth">
            <Link href="/auth/login" className="drawer-btn-login" onClick={() => setMobileOpen(false)}>Đăng nhập</Link>
            <Link href="/auth/register" className="drawer-btn-register" onClick={() => setMobileOpen(false)}>Đăng ký</Link>
          </div>
        )}
      </div>
    </>
  );
}