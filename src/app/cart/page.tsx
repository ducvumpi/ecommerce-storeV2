"use client"
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, Package, User, MapPin, Phone, Mail, CreditCard, Wallet, Building2, Check } from 'lucide-react';
import { DiaGioiHanhChinh2Cap, Commune } from '../api/addressAPI'
import { supabase } from "../libs/supabaseClient";
import Image from 'next/image';
import { deleteCartItems } from "../api/productsAPI"
import { Transition } from "@headlessui/react";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/DialogTitle';
import { createOrder, handlePaymentSuccess, insertOrderItemsFromCart } from '../store/createOrder';


export type CartItem = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  ward: string;
  note: string;
  quantity: number;
  cart: {
    user_id: string;
  };
  variants: {
    id: number;
    sizes: {
      id: number;
      name: string;
    };
    colors: {
      id: number;
      name: string;
    };
    products: {
      id: number;
      price: number;
      title: string;
      image: string;
    };
  };

};
export default function ShoppingCartUI() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
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
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Address data from API
  const [addressData, setAddressData] = useState([]);
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

    // ✅ TỪ ĐÂY TRỞ ĐI MỚI LÀ SUCCESS
    setOrderSuccess(true);

    setTimeout(() => {
      setOrderSuccess(false);
      setCurrentStep(1);
      setCartItems([]);
      setCustomerInfo({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        ward: "",
        note: "",
      });
      setAppliedCoupon(null);
      setCouponCode("");
      setOrderId(null);
      localStorage.removeItem("order_id");
    }, 3000);
  };


  // Load address data from API
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setLoading(true);
        const data = await DiaGioiHanhChinh2Cap();
        setAddressData(data.communes || []);
        // Extract unique provinces
        const uniqueProvinces = [...new Map(
          data.communes.map(item => [item.provinceCode, {
            code: item.provinceCode,
            name: item.provinceName
          }])
        ).values()];
        setProvinces(uniqueProvinces as Commune[]);
        console.log("check", uniqueProvinces)
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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setCartItems([]);
        return;
      }
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
    id,
    quantity,
    cart:cart_id (
      id,
      user_id
    ),
    variants:variant_id (
      id,
      colors:color_id (
        id,
        name
      ),
      sizes:size_id (
        id,
        name
      ),
      products:product_id (
        id,
        title,price,
        image
      )
    )
  `)
        .eq("cart.user_id", user.id);


      if (error) {
        console.error("Fetch cart error:", error);
        setCartItems([]);
        return;
      }

      const transformedData = (data ?? []).map(item => {
        const variant = Array.isArray(item.variants) ? item.variants[0] : item.variants;
        const products = Array.isArray(variant.products) ? variant.products[0] : variant.products;
        return {
          ...item,
          cart: Array.isArray(item.cart) ? item.cart[0] : item.cart,
          variants: {
            ...variant,
            product_id: products?.id || 0,
            products: products
          }
        };
      });

      setCartItems(transformedData);
    }

    fetchCart();
  }, []);


  // Update wards when province changes
  useEffect(() => {
    if (customerInfo.city && addressData.length > 0) {
      const filtered = addressData.filter((item) => item.provinceCode === customerInfo.city);
      const wardList = filtered.map(item => ({
        code: item.code,
        name: `${item.name}`
      }));
      setWards(wardList);
      setCustomerInfo(prev => ({ ...prev, ward: '' }));
    }
  }, [customerInfo.city, addressData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    return cartItems.length > 0;
  };

  const validateStep2 = () => {
    return customerInfo.fullName &&
      customerInfo.email &&
      customerInfo.phone &&
      customerInfo.address &&
      customerInfo.city;

  };
  const handleContinue = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Vui lòng đăng nhập để tiếp tục");
        return;
      }

      const orderId = await createOrder({
        ...customerInfo,
        cartID: user.id
      }, total);

      await insertOrderItemsFromCart(orderId); // 🔥 BẮT BUỘC

      setOrderId(orderId);
      setCurrentStep(3); // sang thanh toán
    } catch (err: any) {
      console.error("CREATE ORDER ERROR:", err);
      alert(err?.message || "Không thể tạo đơn hàng");
    }

  };



  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  // const removeItem = (id: number) => {
  //   setCartItems(items => items.filter(item => item.id !== id));
  // };
  const removeItem = async (idCartItems: number) => {
    // const userId = sessionStorage.getItem("user_id");

    // if (!userId) {
    //   console.error("Không tìm thấy user_id");
    //   return;
    // }

    // Xóa tạm trên UI trước cho nhanh
    setCartItems(items => items.filter(item => item.id !== idCartItems));

    // Xóa thật trong Supabase
    const success = await deleteCartItems(idCartItems);
    setOpen(false)
    console.log("ktra id", idCartItems)
    if (!success) {
      // Nếu xóa thất bại -> rollback UI
      setCartItems(items => [...items]);
      alert("Không thể xóa sản phẩm!");
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discount: 0.1 });
    } else if (couponCode.toUpperCase() === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discount: 0, freeShip: true });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.variants.products.price * item.quantity, 0);
  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount || 0) : 0;
  const shipping = appliedCoupon?.freeShip ? 0 : 30000;
  const total = subtotal - discount;
  const calculation = subtotal - discount + shipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <img
          src="/loadingcart.jpg"
          className="w-16 h-16 animate-bounce mb-4 opacity-80"
        />
        <p className="text-gray-600 animate-pulse text-lg">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
          alt="Empty Cart"
          className="w-40 h-40 opacity-80 mb-6"
        />

        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Giỏ hàng của bạn đang trống
        </h2>

        <p className="text-gray-500 mb-6">
          Hãy thêm một vài sản phẩm để bắt đầu mua sắm nhé!
        </p>

        <a
          href="/"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Tiếp tục mua sắm
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            {currentStep === 1 ? 'Giỏ Hàng Của Bạn' : currentStep === 2 ? 'Thông Tin Giao Hàng' : 'Thanh Toán'}
          </h1>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                1
              </div>
              <span className={currentStep >= 1 ? 'font-semibold text-slate-800' : 'text-slate-500'}>
                Giỏ hàng
              </span>
            </div>
            <div className={`h-0.5 w-16 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                2
              </div>
              <span className={currentStep >= 2 ? 'font-semibold text-slate-800' : 'text-slate-500'}>
                Thông tin
              </span>
            </div>
            <div className={`h-0.5 w-16 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                3
              </div>
              <span className={currentStep >= 3 ? 'font-semibold text-slate-800' : 'text-slate-500'}>
                Thanh toán
              </span>
            </div>
          </div>
        </div>

        {currentStep === 1 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6">
                    <Image
                      src={item.variants.products.image && item.variants.products.image.trim() !== "" ? item.variants.products.image : "/no-image.jpg"}
                      alt={item.variants.products.title}
                      width={80}
                      height={80}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-800">
                            {item.variants.products.title}
                          </h3>
                          <div className="flex gap-4 mt-1 text-sm text-slate-600">
                            <span>Size: {item.variants.sizes?.name}</span>
                            <span>Màu: {item.variants.colors?.name}</span>
                          </div>

                        </div>
                        <button
                          onClick={handleClickOpen}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-white rounded-md transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-white rounded-md transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {formatPrice(item.variants.products.price * item.quantity)}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatPrice(item.variants.products.price)} / sp
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Giỏ hàng của bạn đang trống</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  Tóm Tắt Đơn Hàng
                </h2>

                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Tag className="w-4 h-4" />
                    Mã Giảm Giá
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Mã "{appliedCoupon.code}" đã được áp dụng
                    </div>
                  )}
                </div>
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex justify-between text-slate-700">
                    <span>Tạm tính</span>
                    <span>{formatPrice(total)}</span>
                  </div>



                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-700">
                    <span>Phí vận chuyển</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-slate-800">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(calculation)}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!validateStep1()}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp Theo: Thông Tin Giao Hàng
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-6 text-xs text-slate-500 space-y-2">
                  <p>✓ Miễn phí đổi trả trong 30 ngày</p>
                  <p>✓ Giao hàng nhanh 2-3 ngày</p>
                  <p>✓ Thanh toán an toàn & bảo mật</p>
                </div>
              </div>
            </div>
          </div>
        ) : currentStep === 2 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Thông Tin Khách Hàng
                </h2>

                {loading && (
                  <div className="text-center py-4 text-slate-600">
                    Đang tải dữ liệu địa chỉ...
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={customerInfo.fullName}
                        onChange={handleInputChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        placeholder="0912345678"
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường"
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="city"
                        value={customerInfo.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {provinces.map(province => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phường/Xã
                      </label>
                      <select
                        name="ward"
                        value={customerInfo.ward}
                        onChange={handleInputChange}
                        disabled={!customerInfo.city}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      >
                        <option value="">Chọn phường/xã</option>
                        {wards.map(ward => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ghi chú đơn hàng (tuỳ chọn)
                    </label>
                    <textarea
                      name="note"
                      value={customerInfo.note}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Quay lại giỏ hàng
                  </button>
                  <button
                    onClick={handleContinue}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                  >
                    Tiếp tục
                    <ArrowRight className="w-5 h-5" />
                  </button>

                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Đơn Hàng
                </h2>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-slate-100">
                      {/* <Image
                        alt={item.variants.products.title}
                        src={item.variants.products.image && item.variants.products.image.trim() !== "" ? item.variants.products.image : "/no-image.jpg"}
                        width={80}
                        height={80}
                        className="w-16 h-16 object-cover rounded-lg"
                      /> */}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-slate-800">{item.variants.products.title}</h4>
                        <p className="text-xs text-slate-500">SL: {item.quantity} <br /> Màu: {item.variants.colors?.name} Size: {item.variants.sizes?.name}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">
                          {formatPrice(item.variants.products.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex justify-between text-sm text-slate-700">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-slate-700">
                    <span>Phí vận chuyển</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">Tổng cộng</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(calculation)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Step */
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  Phương Thức Thanh Toán
                </h2>

                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                        {paymentMethod === 'cod' && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Wallet className="w-6 h-6 text-slate-700" />
                          <h3 className="font-semibold text-lg text-slate-800">
                            Thanh toán khi nhận hàng (COD)
                          </h3>
                        </div>
                        <p className="text-slate-600 text-sm">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                        {paymentMethod === 'bank' && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-6 h-6 text-slate-700" />
                          <h3 className="font-semibold text-lg text-slate-800">
                            Chuyển khoản ngân hàng
                          </h3>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">
                          Chuyển khoản trực tiếp đến tài khoản ngân hàng
                        </p>
                        {paymentMethod === 'bank' && (
                          <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Ngân hàng:</span>
                              <span className="font-semibold">Vietcombank</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Số tài khoản:</span>
                              <span className="font-semibold">1234567890</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Chủ tài khoản:</span>
                              <span className="font-semibold">Vũ Đặng Minh Đức</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Nội dung:</span>
                              <span className="font-semibold">DH{Date.now().toString().slice(-6)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Credit Card */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                        {paymentMethod === 'card' && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="w-6 h-6 text-slate-700" />
                          <h3 className="font-semibold text-lg text-slate-800">
                            Thanh toán thẻ tín dụng/ghi nợ
                          </h3>
                        </div>
                        <p className="text-slate-600 text-sm">
                          Visa, Mastercard, JCB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary Info */}
                <div className="mt-8 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-slate-800 mb-4">Thông tin đơn hàng</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Người nhận:</span>
                      <span className="font-medium">{customerInfo.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số điện thoại:</span>
                      <span className="font-medium">{customerInfo.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span className="font-medium">{customerInfo.email}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-600">Địa chỉ:</span>
                      <span className="font-medium text-right flex-1">
                        {customerInfo.address}, {
                          wards.find(w => w.code === customerInfo.ward)?.name || ''
                        }, {
                          provinces.find(p => p.code === customerInfo.city)?.name || ''
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Quay lại thông tin
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                  >
                    <Check className="w-5 h-5" />
                    Đặt hàng
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Tóm Tắt Đơn Hàng
                </h2>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-slate-100">
                      <img
                        src={item.variants.products.image}
                        alt={item.variants.products.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-slate-800">{item.variants.products.title}</h4>
                        <p className="text-xs text-slate-500">SL: {item.quantity}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">
                          {formatPrice(item.variants.products.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex justify-between text-sm text-slate-700">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-slate-700">
                    <span>Phí vận chuyển</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-slate-800">Tổng cộng</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(calculation)}
                  </span>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2 text-sm text-blue-800">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>Đơn hàng của bạn sẽ được xử lý trong vòng 24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {orderSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Đặt hàng thành công!
              </h2>
              <p className="text-slate-600 mb-6">
                Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.
              </p>
              <div className="text-sm text-slate-500">
                Mã đơn hàng: <span className="font-semibold">DH{Date.now().toString().slice(-8)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {cartItems.map((item, idx) => (
        <Dialog
          key={idx}
          open={open}
          keepMounted
          aria-describedby="alert-dialog-description"
          PaperProps={{
            className:
              "!rounded-2xl !p-4 !shadow-xl !border !border-gray-100 bg-white",
          }}
        >
          <DialogTitle>
            <span className="text-xl font-semibold text-gray-800">
              Bạn có chắc muốn xóa?
            </span>
          </DialogTitle>

          <DialogActions>
            <div className="flex w-full justify-end gap-3 mt-2">

              {/* Nút thoát */}
              <button
                onClick={() => setOpen(false)}
                className="
          px-4 py-2 rounded-xl 
          bg-gray-100 text-gray-600 
          hover:bg-gray-200 
          transition-all duration-200
          font-medium shadow-sm
        "
              >
                Thoát
              </button>

              {/* Nút xoá */}
              <button
                onClick={() => removeItem(item.id)}
                className="
          px-4 py-2 rounded-xl 
          bg-red-600 text-white 
          hover:bg-red-700 
          transition-all duration-200
          font-semibold shadow-sm
        "
              >
                Xóa
              </button>
            </div>
          </DialogActions>
        </Dialog>

      ))}

    </div>
  );
}

