"use client"
import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Bell, CreditCard, Settings, Camera, Save, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../libs/supabaseClient';
export default function AccountProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    last_name: '',
    email: '',
    phone: '',
    address: '',
    bio: 'Full Stack Developer đam mê công nghệ',
    dateOfBirth: '1995-01-15',
    gender: 'Nam'
  });
  useEffect(() => {
    const fetchProfileData = async () => {
      const profile = await supabase.auth.getUser();

      if (!profile.data.user) return;

      // 1. Lấy dữ liệu từ bảng profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profile.data.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      console.log("Fetched profile data:", data);
      // 2. Lấy dữ liệu từ auth user

      setProfileData(prev => ({
        ...prev,
        fullName:
          data.user_metadata?.last_name ||
          data?.last_name ||        // nếu bạn có cột full_name trong bảng profiles
          prev.last_name,

        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        dateOfBirth: data.date_of_birth || prev.dateOfBirth,
      }));


    };

    fetchProfileData();
  }, []);


  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'billing', label: 'Thanh toán', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn">
          <Check className="w-5 h-5" />
          <span>Cập nhật thành công!</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profileData.last_name.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">{profileData.last_name}</h3>
                <p className="text-sm text-gray-500">{profileData.email}</p>
              </div>
              {/* Navigation Tabs */}
              <nav className="flex flex-wrap gap-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Lưu
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới thiệu
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Bảo mật</h2>

                  <div className="space-y-6">
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Đổi mật khẩu</h3>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu hiện tại
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu mới
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          Cập nhật mật khẩu
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác thực hai yếu tố</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">Xác thực qua SMS</p>
                            <p className="text-sm text-gray-600">Tăng cường bảo mật cho tài khoản</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Kích hoạt
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt thông báo</h2>

                  <div className="space-y-4">
                    {Object.entries({
                      email: 'Thông báo qua Email',
                      sms: 'Thông báo qua SMS',
                      push: 'Thông báo đẩy',
                      marketing: 'Nhận tin khuyến mãi'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{label}</p>
                          <p className="text-sm text-gray-600">
                            {key === 'email' && 'Nhận thông báo về hoạt động tài khoản'}
                            {key === 'sms' && 'Nhận mã OTP và cảnh báo bảo mật'}
                            {key === 'push' && 'Thông báo trực tiếp trên thiết bị'}
                            {key === 'marketing' && 'Nhận tin về chương trình ưu đãi'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[key]}
                            onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Phương thức thanh toán</h2>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Hết hạn 12/25</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Chỉnh sửa
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Mặc định
                        </span>
                      </div>
                    </div>

                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors">
                      + Thêm phương thức thanh toán
                    </button>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch sử giao dịch</h3>
                      <div className="space-y-3">
                        {[
                          { date: '15/12/2024', desc: 'Nâng cấp gói Premium', amount: '299.000đ' },
                          { date: '15/11/2024', desc: 'Thanh toán tháng 11', amount: '99.000đ' },
                          { date: '15/10/2024', desc: 'Thanh toán tháng 10', amount: '99.000đ' }
                        ].map((transaction, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">{transaction.desc}</p>
                              <p className="text-sm text-gray-600">{transaction.date}</p>
                            </div>
                            <p className="font-semibold text-gray-800">{transaction.amount}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}