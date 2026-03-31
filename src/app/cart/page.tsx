"use client"
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, Package, User, MapPin, Phone, Mail, CreditCard, Wallet, Building2, Check } from 'lucide-react';
import { DiaGioiHanhChinh2Cap, Commune } from '../api/addressAPI'
import { supabase } from "../libs/supabaseClient";
import Image from 'next/image';
import { deleteCartItems } from "../api/productsAPI"
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { handlePaymentSuccess } from '../store/createOrder';
import { string } from 'yup';
// Thêm sau các import
type GuestCartItem = {
  id: number; // dùng index làm id tạm
  quantity: number;
  product_variant: CartItem['product_variant'];
};

const GUEST_CART_KEY = "guest_cart";

function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]"); }
  catch { return []; }
}

function saveGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}
type CartItem = {
  id: number;
  quantity: number;
  product_variant: {
    id: string;
    size: string;
    color: string;
    price: number;
    product: {
      id: number;
      name: string;
      description: string;
      image_url: string;
    };
  };
};
type Coupon = {
  code: string;
  discountAmount: number;
};
export default function ShoppingCartUI() {
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
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

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [addressData, setAddressData] = useState<Commune[]>([]);
  const [provinces, setProvinces] = useState<Commune[]>([]);
  const [wards, setWards] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);

  const handlePlaceOrder = async () => {
    if (!orderId) {
      alert("Không tìm thấy đơn hàng");
      return;
    }
    const success = await handlePaymentSuccess(orderId, cartItems);
    if (!success) {
      alert("Đặt hàng thất bại, vui lòng thử lại");
      return;
    }
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setCurrentStep(1);
      setCartItems([]);
      setCustomerInfo({ fullName: "", email: "", phone: "", address: "", city: "", ward: "", note: "", totalAmount: 0 });
      setAppliedCoupon(null);
      setCouponCode("");
      setOrderId(null);
      localStorage.removeItem("order_id");
    }, 3000);
  };

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
    async function fetchCart() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        const guestItems = getGuestCart();
        setCartItems(guestItems as any);
        setLoading(false);
        return;
      }

      const { data: cartData, error: cartError } = await supabase
        .from('cart').select('id').eq('user_id', user.id).single();
      if (cartError) { setLoading(false); return; }

      const { data, error } = await supabase.from('cart_items').select(`
      id, quantity,
      product_variant:variant_id (
        id, size, color, price,
        product:product_id ( id, name, description, image_url )
      )
    `).eq('cart_id', cartData.id);

      if (error) { setCartItems([]); setLoading(false); return; }
      setCartItems((data ?? []) as unknown as CartItem[]);
      setLoading(false);
    }
    fetchCart();
  }, []);

  useEffect(() => {
    if (customerInfo.city && addressData.length > 0) {
      const filtered = addressData.filter((item) => item.provinceCode === customerInfo.city);
      setWards(filtered.map(item => ({ code: item.code, name: item.name })));
      setCustomerInfo(prev => ({ ...prev, ward: '' }));
    }
  }, [customerInfo.city, addressData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => cartItems.length > 0;
  const validateStep2 = () => customerInfo.fullName && customerInfo.email && customerInfo.phone && customerInfo.address && customerInfo.city;

  const handleContinue = async () => {
    try {
      if (orderId) { setCurrentStep(3); return; }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        localStorage.setItem("pending_checkout", JSON.stringify(customerInfo));
        window.location.href = "/auth/login?redirect=/cart";
        return;
      }

      if (!validateStep2()) { alert("Vui lòng điền đầy đủ thông tin giao hàng"); return; }

      const { data, error } = await supabase.rpc('create_order_from_cart_full', {
        p_user_id: user.id, p_full_name: customerInfo.fullName, p_phone: customerInfo.phone,
        p_mail: customerInfo.email, p_address_line: customerInfo.address,
        p_city: customerInfo.city, p_ward: customerInfo.ward
      });
      if (error) throw error;
      setOrderId(data);
      setCurrentStep(3);
    } catch (err: any) {
      alert(err?.message || "Không thể tạo đơn hàng");
    }
  };

  const updateQuantity = async (cartItemId: number, delta: number) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const updated = cartItems.map(i =>
        i.id === cartItemId ? { ...i, quantity: newQuantity } : i
      );
      saveGuestCart(updated as any);
      setCartItems(updated);
      return;
    }

    await updateCartItemQuantity(cartItemId, newQuantity);
    setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQuantity } : i));
  };

  const removeItem = async (idCartItems: number) => {
    const oldItems = cartItems;
    const updated = cartItems.filter(item => item.id !== idCartItems);
    setCartItems(updated);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      saveGuestCart(updated as any);
      setOpen(false);
      return;
    }

    const success = await deleteCartItems(idCartItems);
    if (!success) { setCartItems(oldItems); alert("Không thể xóa sản phẩm!"); }
    setOpen(false);
  };

  const applyCoupon = async () => {
    if (!couponCode) return;

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())

    if (error || !data) {
      alert("Mã không tồn tại");
      setAppliedCoupon(null);
      return;
    }

    const now = new Date();

    if (data.start_date && new Date(data.start_date) > now) {
      alert("Mã chưa bắt đầu");
      return;
    }

    if (data.end_date && new Date(data.end_date) < now) {
      alert("Mã đã hết hạn");
      return;
    }

    if (subtotal < data.min_order_value) {
      alert(`Đơn tối thiểu ${data.min_order_value}`);
      return;
    }

    let discountAmount = 0;

    if (data.discount_type === "percent") {
      discountAmount = subtotal * (data.discount_value / 100);
      if (data.max_discount) {
        discountAmount = Math.min(discountAmount, data.max_discount);
      }
    } else if (data.discount_type === "fixed") {
      discountAmount = data.discount_value;
    }

    setAppliedCoupon({
      code: data.code,
      discountAmount,
    });
  };

  // ✅ FIX: thêm optional chaining để tránh crash khi product_variant undefined
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_variant?.price ?? 0) * item.quantity, 0);
  const discount = appliedCoupon?.discountAmount || 0;
  const shipping = (appliedCoupon as any)?.freeShip ? 0 : 30000;
  const total = subtotal - discount;
  const calculation = subtotal - discount + shipping;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const updateCartItemQuantity = async (cartItemId: number, newQuantity: number) => {
    const { data, error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", cartItemId).select();
    if (error) { console.error("Lỗi update quantity:", error); return null; }
    return data;
  };

  const steps = ['Giỏ hàng', 'Thông tin', 'Thanh toán'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#faf8f5] min-h-screen">
        <img src="/loadingcart.png" className="w-14 h-14 animate-bounce mb-5 opacity-60" />
        <p className="text-[#a08060] font-medium tracking-wide animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#faf8f5] min-h-screen">
        <div className="w-28 h-28 rounded-full bg-[#ede8e0] flex items-center justify-center mb-6">
          <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" className="w-16 h-16 opacity-60" />
        </div>
        <h2 className="text-2xl font-semibold text-[#5c4a32] mb-2">Giỏ hàng đang trống</h2>
        <p className="text-[#a08060] mb-8">Hãy thêm sản phẩm yêu thích để bắt đầu nhé!</p>
        <a href="/" className="px-8 py-3 bg-[#8b6343] text-white rounded-full font-medium hover:bg-[#6e4e34] transition-all shadow-md">
          Tiếp tục mua sắm
        </a>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        .cart-root { font-family: 'DM Sans', Lora, serif; background: #faf8f5; min-height: 100vh; }
        .cart-heading { font-family: 'Playfair Display', serif; }
        .input-warm {
          width: 100%; padding: 0.75rem 1rem;
          border: 1.5px solid #e2d9ce; border-radius: 10px;
          background: #ffffff; color: #1a1a1a ;
          outline: none; transition: border-color .2s, box-shadow .2s;
          font-family: 'DM Sans', Lora, serif; font-size: 0.9rem;
        }
        .input-warm:focus { border-color: #b8926a; box-shadow: 0 0 0 3px rgba(184,146,106,.15); }
        .input-warm::placeholder { color: #c4b09a; }
        .btn-primary {
          background: linear-gradient(135deg, #a07050 0%, #7a5135 100%);
          color: white; border-radius: 50px; font-weight: 500;
          transition: all .25s; box-shadow: 0 4px 14px rgba(122,81,53,.25);
          font-family: 'DM Sans', Lora, serif; cursor: pointer; border: none;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(122,81,53,.35); }
        .btn-primary:disabled { opacity: .45; cursor: not-allowed; transform: none; }
        .btn-ghost {
          border: 1.5px solid #ddd3c6; background: transparent; color: #7a6050;
          border-radius: 50px; font-weight: 500; cursor: pointer;
          transition: all .2s; font-family: 'DM Sans', Lora, serif;
        }
        .btn-ghost:hover { background: #f3ede6; }
        .card-warm {
          background: #ffffff; border-radius: 18px;
          border: 1px solid #ede6dc; box-shadow: 0 2px 12px rgba(140,100,60,.06);
        }
        .step-line { height: 2px; width: 56px; background: #e4d9ce; transition: background .4s; }
        .step-line.active { background: #a07050; }
        .qty-btn {
          width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer;
          background: #f3ede6; color: #7a5135; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s;
        }
        .qty-btn:hover { background: #e4d4c0; }
        .payment-card {
          border: 1.5px solid #e4d9ce; border-radius: 14px; cursor: pointer;
          transition: all .2s; background: #fffdfb;
        }
        .payment-card:hover { border-color: #c4956a; }
        .payment-card.selected { border-color: #a07050; background: #fdf6ef; }
        .badge-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fdf0e4; color: #a07050; font-size: .78rem;
          padding: .25rem .75rem; border-radius: 50px;
          border: 1px solid #f0d9c0;
        }
        .label-warm { font-size: .82rem; color: #8a7060; font-weight: 500; margin-bottom: .4rem; display: block; }
        .textarea-warm {
          width: 100%; padding: .75rem 1rem; resize: none;
          border: 1.5px solid #e2d9ce; border-radius: 10px;
          background: #fffdfb; color: #4a3728;
          outline: none; transition: border-color .2s, box-shadow .2s;
          font-family: 'DM Sans', Lora, serif; font-size: .9rem;
        }
        .textarea-warm:focus { border-color: #b8926a; box-shadow: 0 0 0 3px rgba(184,146,106,.15); }
        .success-overlay {
          position: fixed; inset: 0; background: rgba(80,50,20,.45);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 50; padding: 1rem;
          animation: fadeIn .3s ease;
        }
        .success-modal {
          background: white; border-radius: 24px; padding: 2.5rem;
          max-width: 380px; width: 100%; text-align: center;
          animation: scaleUp .35s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleUp { from { transform:scale(.85); opacity:0 } to { transform:scale(1); opacity:1 } }
      `}</style>

      <div className="cart-root">
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '2rem 1rem' }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <div style={{ width: 38, height: 38, background: '#f3ede6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={20} color="#a07050" />
              </div>
              <h1 className="cart-heading" style={{ fontSize: '1.7rem', color: '#4a3728', margin: 0 }}>
                {currentStep === 1 ? 'Giỏ hàng của bạn' : currentStep === 2 ? 'Thông tin giao hàng' : 'Thanh toán'}
              </h1>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: currentStep > i + 1 ? '#a07050' : currentStep === i + 1 ? '#a07050' : '#ede8e0',
                      color: currentStep >= i + 1 ? 'white' : '#b0967a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.82rem', fontWeight: 600, transition: 'all .4s',
                      boxShadow: currentStep === i + 1 ? '0 0 0 4px rgba(160,112,80,.2)' : 'none'
                    }}>
                      {currentStep > i + 1 ? <Check size={14} /> : i + 1}
                    </div>
                    <span style={{ fontSize: '.85rem', fontWeight: currentStep >= i + 1 ? 600 : 400, color: currentStep >= i + 1 ? '#5c3d22' : '#b0967a' }}>{s}</span>
                  </div>
                  {i < 2 && <div className={`step-line ${currentStep > i + 1 ? 'active' : ''}`} style={{ margin: '0 12px' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ═══════════════ STEP 1 ═══════════════ */}
          {currentStep === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
              {/* Cart items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cartItems.map(item => (
                  <div key={item.id} className="card-warm" style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <img
                        src={Array.isArray(item.product_variant?.product?.image_url) ? item.product_variant.product.image_url[0] : item.product_variant?.product?.image_url || "/no-image.jpg"}
                        alt={item.product_variant?.product?.name || ""}
                        style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 12, flexShrink: 0, border: '1px solid #ede6dc' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h3 style={{ fontWeight: 600, color: '#3d2b1a', margin: '0 0 4px', fontSize: '1rem' }}>
                              {item.product_variant?.product?.name || "Sản phẩm"}
                            </h3>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '.78rem', color: '#a08060', background: '#faf3ea', padding: '2px 10px', borderRadius: 50, border: '1px solid #f0e0cc' }}>
                                Size: {item.product_variant?.size || "N/A"}
                              </span>
                              <span style={{ fontSize: '.78rem', color: '#a08060', background: '#faf3ea', padding: '2px 10px', borderRadius: 50, border: '1px solid #f0e0cc' }}>
                                Màu: {item.product_variant?.color || "N/A"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => { setSelectedItemId(item.id); setOpen(true); }}
                            style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid #f0ddd0', background: '#fff8f4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c07050', transition: 'all .2s', flexShrink: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#ffe8e0')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#fff8f4')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                          {/* Qty control */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f2ec', borderRadius: 50, padding: '4px 8px', border: '1px solid #ede6dc' }}>
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button>
                            <span style={{ width: 24, textAlign: 'center', fontWeight: 600, color: '#5c3d22', fontSize: '.9rem' }}>{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><Plus size={13} /></button>
                          </div>
                          {/* Price */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#8b5e3c', fontSize: '1.05rem' }}>
                              {formatPrice((item.product_variant?.price ?? 0) * item.quantity)}
                            </div>
                            <div style={{ fontSize: '.75rem', color: '#c0a080' }}>
                              {formatPrice(item.product_variant?.price ?? 0)} / sp
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary sidebar */}
              <div className="card-warm" style={{ padding: '1.5rem', position: 'sticky', top: 24 }}>
                <h2 className="cart-heading" style={{ fontSize: '1.15rem', color: '#4a3728', marginBottom: '1.25rem' }}>Tóm tắt đơn hàng</h2>

                {/* Coupon */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="label-warm"><Tag size={12} style={{ display: 'inline', marginRight: 4 }} />Mã giảm giá</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Nhập mã..." className="input-warm" style={{ flex: 1 }} />
                    <button onClick={applyCoupon} className="btn-primary" style={{ padding: '.65rem 1rem', fontSize: '.82rem', borderRadius: 10 }}>
                      Áp dụng
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="badge-tag" style={{ marginTop: 8 }}>
                      <Check size={11} /> Mã "{appliedCoupon.code}" đã áp dụng
                    </div>
                  )}
                </div>

                {/* Price breakdown — ✅ FIX: key={row.label} đã có, giữ nguyên */}
                <div style={{ borderTop: '1px dashed #e8ddd0', paddingTop: '1rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Tạm tính', value: formatPrice(subtotal), color: '#5c4a38' },
                    ...(discount > 0 ? [{ label: 'Giảm giá', value: `-${formatPrice(discount)}`, color: '#7a9060' }] : []),
                    { label: 'Phí vận chuyển', value: shipping === 0 ? 'Miễn phí' : formatPrice(shipping), color: shipping === 0 ? '#7a9060' : '#5c4a38' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.6rem' }}>
                      <span style={{ color: '#a09080', fontSize: '.88rem' }}>{row.label}</span>
                      <span style={{ fontWeight: 500, fontSize: '.88rem', color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdf6ef', borderRadius: 12, padding: '12px 14px', marginBottom: '1.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#4a3728' }}>Tổng cộng</span>
                  <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#8b5e3c' }}>{formatPrice(calculation)}</span>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!validateStep1()}
                  className="btn-primary"
                  style={{ width: '100%', padding: '13px', fontSize: '.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Thông tin giao hàng <ArrowRight size={17} />
                </button>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {['✦ Miễn phí đổi trả 30 ngày', '✦ Giao hàng nhanh 2–3 ngày', '✦ Thanh toán an toàn & bảo mật'].map(t => (
                    <p key={t} style={{ fontSize: '.75rem', color: '#b8a090', margin: 0 }}>{t}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 2 ═══════════════ */}
          {currentStep === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
              <div className="card-warm" style={{ padding: '2rem' }}>
                <h2 className="cart-heading" style={{ fontSize: '1.3rem', color: '#4a3728', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={20} color="#a07050" /> Thông tin khách hàng
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="label-warm">Họ và tên <span style={{ color: '#c07050' }}>*</span></label>
                    <input type="text" name="fullName" value={customerInfo.fullName} onChange={handleInputChange} placeholder="Nguyễn Văn A" className="input-warm" />
                  </div>
                  <div>
                    <label className="label-warm">Email <span style={{ color: '#c07050' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#c0a080' }} />
                      <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange} placeholder="email@example.com" className="input-warm" style={{ paddingLeft: '2.2rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="label-warm">Số điện thoại <span style={{ color: '#c07050' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#c0a080' }} />
                    <input type="tel" name="phone" value={customerInfo.phone} onChange={handleInputChange} placeholder="0912 345 678" className="input-warm" style={{ paddingLeft: '2.2rem' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="label-warm">Địa chỉ <span style={{ color: '#c07050' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#c0a080' }} />
                    <input type="text" name="address" value={customerInfo.address} onChange={handleInputChange} placeholder="Số nhà, tên đường" className="input-warm" style={{ paddingLeft: '2.2rem' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="label-warm">Tỉnh / Thành phố <span style={{ color: '#c07050' }}>*</span></label>
                    <select name="city" value={customerInfo.city} onChange={handleInputChange} className="input-warm" >
                      <option value="">Chọn tỉnh / thành</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-warm">Phường / Xã</label>
                    <select name="ward" value={customerInfo.ward} onChange={handleInputChange} disabled={!customerInfo.city} className="input-warm" style={{ opacity: !customerInfo.city ? 0.5 : 1 }}>
                      <option value="">Chọn phường / xã</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label-warm">Ghi chú đơn hàng</label>
                  <textarea name="note" value={customerInfo.note} onChange={handleInputChange} rows={3} placeholder="Ghi chú về thời gian, địa điểm giao hàng..." className="textarea-warm" />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setCurrentStep(1)} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>
                    ← Quay lại
                  </button>
                  <button onClick={handleContinue} disabled={!!orderId} className="btn-primary" style={{ flex: 2, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Tiếp tục thanh toán <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Mini order summary */}
              <div className="card-warm" style={{ padding: '1.25rem', position: 'sticky', top: 24 }}>
                <h2 className="cart-heading" style={{ fontSize: '1rem', color: '#4a3728', marginBottom: '1rem' }}>Đơn hàng</h2>
                <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1rem' }}>
                  {/* ✅ FIX: thêm key={item.id} vào div ngoài cùng */}
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 10, paddingBottom: 10, borderBottom: '1px solid #f0e8e0' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 600, color: '#4a3728' }}>{item.product_variant?.product?.description || "Sản phẩm"}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '.75rem', color: '#a09080' }}>SL: {item.quantity} · {item.product_variant?.color} · {item.product_variant?.size}</p>
                        <p style={{ margin: '3px 0 0', fontSize: '.82rem', fontWeight: 600, color: '#8b5e3c' }}>{formatPrice((item.product_variant?.price ?? 0) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px dashed #e8ddd0', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                    <span style={{ color: '#a09080', fontSize: '.85rem' }}>Tạm tính</span>
                    <span style={{ fontSize: '.85rem', color: '#5c4a38' }}>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                    <span style={{ color: '#a09080', fontSize: '.85rem' }}>Giảm giá</span>
                    <span style={{ fontSize: '.85rem', color: '#7a9060' }}>-{formatPrice(discount)}</span>
                  </div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.8rem' }}>
                    <span style={{ color: '#a09080', fontSize: '.85rem' }}>Phí vận chuyển</span>
                    <span style={{ fontSize: '.85rem', color: shipping === 0 ? '#7a9060' : '#5c4a38' }}>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdf6ef', borderRadius: 10, padding: '10px 12px' }}>
                    <span style={{ fontWeight: 600, color: '#4a3728', fontSize: '.9rem' }}>Tổng cộng</span>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#8b5e3c' }}>{formatPrice(calculation)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 3 ═══════════════ */}
          {currentStep === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
              <div className="card-warm" style={{ padding: '2rem' }}>
                <h2 className="cart-heading" style={{ fontSize: '1.3rem', color: '#4a3728', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={20} color="#a07050" /> Phương thức thanh toán
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { key: 'cod', icon: <Wallet size={20} color="#8b6343" />, title: 'Thanh toán khi nhận hàng (COD)', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
                    { key: 'bank', icon: <Building2 size={20} color="#8b6343" />, title: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản trực tiếp vào tài khoản' },
                    { key: 'card', icon: <CreditCard size={20} color="#8b6343" />, title: 'Thẻ tín dụng / ghi nợ', desc: 'Visa, Mastercard, JCB' },
                  ].map(opt => (
                    <div key={opt.key} className={`payment-card ${paymentMethod === opt.key ? 'selected' : ''}`} style={{ padding: '1rem 1.25rem' }} onClick={() => setPaymentMethod(opt.key)}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                          border: `2px solid ${paymentMethod === opt.key ? '#a07050' : '#d8ccc0'}`,
                          background: paymentMethod === opt.key ? '#a07050' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s'
                        }}>
                          {paymentMethod === opt.key && <Check size={12} color="white" />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            {opt.icon}
                            <span style={{ fontWeight: 600, color: '#3d2b1a', fontSize: '.95rem' }}>{opt.title}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '.8rem', color: '#a09080' }}>{opt.desc}</p>
                          {paymentMethod === 'bank' && opt.key === 'bank' && (
                            <div style={{ marginTop: 10, background: '#fffdfb', border: '1px solid #ede6dc', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {[['Ngân hàng', 'Vietcombank'], ['Số tài khoản', '1234567890'], ['Chủ tài khoản', 'Vũ Đặng Minh Đức'], ['Nội dung CK', `DH${Date.now().toString().slice(-6)}`]].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                                  <span style={{ color: '#a09080' }}>{k}:</span>
                                  <span style={{ fontWeight: 600, color: '#4a3728' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer info recap — ✅ FIX: thêm key={k} vào div ngoài cùng */}
                <div style={{ background: '#fdf8f3', border: '1px solid #ede6dc', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 600, color: '#4a3728', marginBottom: '0.75rem', fontSize: '.95rem' }}>Thông tin nhận hàng</h3>
                  {[
                    ['Người nhận', customerInfo.fullName],
                    ['Điện thoại', customerInfo.phone],
                    ['Email', customerInfo.email],
                    ['Địa chỉ', `${customerInfo.address}, ${wards.find(w => w.code === customerInfo.ward)?.name || ''}, ${provinces.find(p => p.code === customerInfo.city)?.name || ''}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 8, marginBottom: '.45rem', fontSize: '.85rem' }}>
                      <span style={{ color: '#a09080', minWidth: 90 }}>{k}:</span>
                      <span style={{ fontWeight: 500, color: '#4a3728' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setCurrentStep(2)} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>
                    ← Quay lại
                  </button>
                  <button onClick={handlePlaceOrder} className="btn-primary" style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #6a8f50 0%, #4e6e38 100%)', boxShadow: '0 4px 14px rgba(80,120,50,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Check size={18} /> Đặt hàng ngay
                  </button>
                </div>
              </div>

              {/* Sidebar summary — ✅ FIX: thêm key={item.id} vào div ngoài cùng */}
              <div className="card-warm" style={{ padding: '1.25rem', position: 'sticky', top: 24 }}>
                <h2 className="cart-heading" style={{ fontSize: '1rem', color: '#4a3728', marginBottom: '1rem' }}>Tóm tắt đơn hàng</h2>
                <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1rem' }}>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 10, paddingBottom: 10, borderBottom: '1px solid #f0e8e0' }}>
                      <img
                        src={Array.isArray(item.product_variant?.product?.image_url) ? item.product_variant.product.image_url[0] : item.product_variant?.product?.image_url || "/no-image.jpg"}
                        alt={item.product_variant?.product?.name || ""}
                        style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 9, border: '1px solid #ede6dc', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 600, color: '#4a3728' }}>{item.product_variant?.product?.name || "Sản phẩm"}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '.75rem', color: '#a09080' }}>SL: {item.quantity}</p>
                        <p style={{ margin: '3px 0 0', fontSize: '.82rem', fontWeight: 600, color: '#8b5e3c' }}>{formatPrice((item.product_variant?.price ?? 0) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px dashed #e8ddd0', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                    <span style={{ color: '#a09080', fontSize: '.85rem' }}>Tạm tính</span>
                    <span style={{ fontSize: '.85rem', color: '#5c4a38' }}>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                    <span style={{ color: '#a09080', fontSize: '.85rem' }}>Giảm giá</span>
                    <span style={{ fontSize: '.85rem', color: '#7a9060' }}>-{formatPrice(discount)}</span>
                  </div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: '#a09080', fontSize: '.85rem' }}>Phí vận chuyển</span>
                    <span style={{ fontSize: '.85rem', color: shipping === 0 ? '#7a9060' : '#5c4a38' }}>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#fdf6ef', borderRadius: 10, padding: '10px 12px', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 600, color: '#4a3728', fontSize: '.9rem' }}>Tổng cộng</span>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#8b5e3c' }}>{formatPrice(calculation)}</span>
                  </div>
                  <div style={{ background: '#f5f9f0', border: '1px solid #ddecd0', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Check size={15} color="#7a9060" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: '.78rem', color: '#6a8050' }}>Đơn hàng được xử lý trong vòng 24 giờ</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Success modal ── */}
        {orderSuccess && (
          <div className="success-overlay">
            <div className="success-modal">
              <div style={{ width: 72, height: 72, background: '#f0f8e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Check size={34} color="#6a9050" />
              </div>
              <h2 className="cart-heading" style={{ fontSize: '1.5rem', color: '#3d2b1a', marginBottom: '.5rem' }}>Đặt hàng thành công!</h2>
              <p style={{ color: '#a09080', marginBottom: '1rem' }}>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ sớm nhất.</p>
              <div style={{ background: '#fdf6ef', borderRadius: 10, padding: '10px 16px', display: 'inline-block' }}>
                <span style={{ fontSize: '.82rem', color: '#a09080' }}>Mã đơn hàng: </span>
                <span style={{ fontWeight: 700, color: '#8b5e3c', fontSize: '.9rem' }}>DH{Date.now().toString().slice(-8)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete confirm dialog ── */}
        <Dialog
          open={open}
          keepMounted
          aria-describedby="delete-confirm"
          PaperProps={{ style: { borderRadius: 18, padding: '8px', boxShadow: '0 8px 32px rgba(80,40,0,.14)', border: '1px solid #ede6dc', minWidth: 300 } }}
        >
          <DialogTitle>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', color: '#3d2b1a' }}>
              Xác nhận xóa sản phẩm?
            </span>
          </DialogTitle>
          <DialogActions>
            <div style={{ display: 'flex', gap: 10, padding: '0 8px 8px', width: '100%', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                className="btn-ghost"
                style={{ padding: '8px 20px', fontSize: '.88rem' }}
              >
                Hủy
              </button>
              <button
                onClick={() => selectedItemId !== null && removeItem(selectedItemId)}
                style={{ padding: '8px 20px', fontSize: '.88rem', borderRadius: 50, background: '#c05040', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background .2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#a03020')}
                onMouseLeave={e => (e.currentTarget.style.background = '#c05040')}
              >
                Xóa
              </button>
            </div>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}