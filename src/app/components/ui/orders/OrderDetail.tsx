'use client';
import { Ban, Truck, CheckCircle, MapPin, Phone, Mail, ShoppingBag, Package, RotateCcw, AlertCircle, Clock, Banknote, CreditCard as CreditCardIcon, ImagePlus, X } from 'lucide-react';
import { Order } from '@/app/types/order.types';
import { StatusBadge } from './StatusBadge';
import { memo, useState, useRef } from 'react';
import { CreditCard } from 'lucide-react';
import { useReturnCountdown } from '@/app/hooks/useReturnCountdown';
import { supabase } from '@/app/libs/supabaseClient';
const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const canCancel = (s: string) => s === 'pending' || s === 'paid';

const isWithinReturnWindow = (completedAt: string | null | undefined): boolean => {
    if (!completedAt) return false;
    const diff = Date.now() - new Date(completedAt).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
};

const getDaysRemaining = (completedAt: string | null | undefined): number => {
    if (!completedAt) return 0;
    const diff = Date.now() - new Date(completedAt).getTime();
    return Math.max(0, 7 - Math.floor(diff / (24 * 60 * 60 * 1000)));
};

type PaymentCategory = 'online' | 'cod';
const getPaymentCategory = (method: string): PaymentCategory => {
    if (String(method).toLowerCase() === 'cod') return 'cod';
    return 'online';
};

// ─── Return Policy Banner ────────────────────────────────────────────────────
interface ReturnPolicyProps {
    order: Order;
    onReturnRequest: (order: Order) => void;
}

const ReturnPolicySection = ({ order, onReturnRequest }: ReturnPolicyProps) => {
    const { expired, label, remainingMs } = useReturnCountdown(order.completed_at);

    const paymentCategory = getPaymentCategory(order.payment_method);
    const canReturn = order.status === 'completed' && !expired;
    const isExpired = order.status === 'completed' && expired && !!order.completed_at;

    if (order.status === 'cancelled') return null;

    if (order.status !== 'completed' && !isExpired) {
        return (
            <div className="flex items-start gap-3 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="text-blue-500" size={15} />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-blue-700 text-sm">Chính sách đổi trả 7 ngày</p>
                    <p className="text-blue-500 text-xs mt-0.5 leading-relaxed">
                        Sau khi nhận hàng, bạn có <span className="font-semibold">7 ngày</span> để yêu cầu đổi/trả.
                        {paymentCategory === 'online'
                            ? ' Hoàn tiền sẽ được chuyển về tài khoản thanh toán trong 3–5 ngày làm việc.'
                            : ' Hoàn tiền COD sẽ được chuyển khoản sau khi xác nhận hàng trả về.'
                        }
                    </p>
                </div>
            </div>
        );
    }

    if (isExpired) {
        return (
            <div className="flex items-start gap-3 px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="text-stone-400" size={15} />
                </div>
                <div>
                    <p className="font-semibold text-stone-500 text-sm">Hết hạn đổi trả</p>
                    <p className="text-stone-400 text-xs mt-0.5">Đơn hàng này đã quá 7 ngày kể từ ngày nhận hàng.</p>
                </div>
            </div>
        );
    }

    if (canReturn) {
        if (paymentCategory === 'online') {
            return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CreditCardIcon className="text-emerald-600" size={15} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-emerald-700 text-sm">Hoàn tiền qua ngân hàng</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${remainingMs < 24 * 60 * 60 * 1000
                                        ? 'text-red-600 bg-red-50 border-red-200'   // dưới 24h → đỏ cảnh báo
                                        : 'text-emerald-700 bg-emerald-100 border-emerald-200'
                                        }`}>
                                        Còn {label}
                                    </span>
                                </div>
                                <p className="text-emerald-600 text-xs mt-0.5 leading-relaxed">
                                    Tiền hoàn sẽ được chuyển về tài khoản/ví thanh toán gốc trong <span className="font-semibold">3–5 ngày làm việc</span>.
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-3 gap-2 text-center">
                            {[
                                { label: 'Gửi yêu cầu', sub: 'Hôm nay' },
                                { label: 'Xác nhận', sub: '1–2 ngày' },
                                { label: 'Hoàn tiền', sub: '3–5 ngày' },
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col gap-0.5">
                                    <p className="text-[10px] font-semibold text-emerald-700">{step.label}</p>
                                    <p className="text-[10px] text-emerald-500">{step.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="px-5 pb-4">
                        <button onClick={() => onReturnRequest(order)}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                            <RotateCcw size={13} /> Yêu cầu hoàn trả hàng
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Banknote className="text-amber-600" size={15} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-amber-700 text-sm">Hoàn tiền mặt (COD)</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${remainingMs < 24 * 60 * 60 * 1000
                                    ? 'text-red-600 bg-red-50 border-red-200'   // dưới 24h → đỏ cảnh báo
                                    : 'text-emerald-700 bg-emerald-100 border-emerald-200'
                                    }`}>
                                    Còn {label}
                                </span>
                            </div>
                            <p className="text-amber-600 text-xs mt-0.5 leading-relaxed">
                                Sau khi chúng tôi nhận lại hàng, tiền mặt sẽ được <span className="font-semibold">chuyển khoản</span> cho bạn trong 1–3 ngày làm việc.
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-200 grid grid-cols-3 gap-2 text-center">
                        {[
                            { label: 'Gửi yêu cầu', sub: 'Hôm nay' },
                            { label: 'Gửi hàng về', sub: 'Trong 2 ngày' },
                            { label: 'Chuyển khoản', sub: '1–3 ngày' },
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col gap-0.5">
                                <p className="text-[10px] font-semibold text-amber-700">{step.label}</p>
                                <p className="text-[10px] text-amber-500">{step.sub}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-200 flex items-start gap-2">
                        <AlertCircle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-600 leading-relaxed">
                            Bạn cần cung cấp số tài khoản ngân hàng để nhận tiền hoàn. Không hoàn tiền mặt trực tiếp.
                        </p>
                    </div>
                </div>
                <div className="px-5 pb-4">
                    <button onClick={() => onReturnRequest(order)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                        <RotateCcw size={13} /> Yêu cầu hoàn trả hàng
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

// ─── Return Request Modal ────────────────────────────────────────────────────
interface ReturnModalProps {
    order: Order;
    onClose: () => void;
    onSubmit: (reason: string, images: File[], bankInfo?: string) => void;
}

const RETURN_REASONS = [
    'Sản phẩm bị lỗi/hư hỏng',
    'Sản phẩm không đúng mô tả',
    'Nhận sai sản phẩm/màu/size',
    'Sản phẩm kém chất lượng',
    'Thay đổi ý định',
    'Khác',
];

const ReturnModal = ({ order, onClose, onSubmit }: ReturnModalProps) => {
    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');
    const [bankInfo, setBankInfo] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isCOD = getPaymentCategory(order.payment_method) === 'cod';

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const remaining = 5 - images.length;
        const accepted = files.slice(0, remaining);
        if (!accepted.length) return;
        setImages(prev => [...prev, ...accepted]);
        setPreviews(prev => [...prev, ...accepted.map(f => URL.createObjectURL(f))]);
        e.target.value = '';
    };

    const removeImage = (i: number) => {
        URL.revokeObjectURL(previews[i]);
        setImages(prev => prev.filter((_, idx) => idx !== i));
        setPreviews(prev => prev.filter((_, idx) => idx !== i));
    };

    const isValid = reason && images.length > 0 && (!isCOD || bankInfo.trim());

    // ─── Upload từng ảnh lên Supabase Storage ────────────────────────────────
    const uploadImages = async (files: File[]): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of files) {
            const ext = file.name.split('.').pop();
            const path = `order-returns/${order.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('returns')
                .upload(path, file, { upsert: false });
            if (uploadError) throw new Error(`Upload ảnh thất bại: ${uploadError.message}`);
            const { data } = supabase.storage.from('returns').getPublicUrl(path);
            urls.push(data.publicUrl);
        }
        return urls;
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!isValid || loading) return;
        setLoading(true);
        setError(null);

        try {
            // 1. Lấy user hiện tại
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Bạn cần đăng nhập để gửi yêu cầu.');

            // 2. Kiểm tra chưa có request active
            const { data: existing } = await supabase
                .from('order_returns')
                .select('id')
                .eq('order_id', order.id)
                .not('status', 'eq', 'rejected')
                .maybeSingle();
            if (existing) throw new Error('Đơn hàng này đã có yêu cầu hoàn trả đang xử lý.');

            // 3. Upload ảnh
            const imageUrls = await uploadImages(images);

            // 4. Insert vào order_returns
            const { error: insertError } = await supabase
                .from('order_returns')
                .insert({
                    order_id: order.id,
                    user_id: user.id,
                    status: 'pending',
                    reason,
                    note: note || null,
                    images: imageUrls,
                    payment_method: isCOD ? 'cod' : 'online',
                    refund_amount: order.total_price,
                    bank_info: isCOD ? bankInfo : null,
                });
            if (insertError) throw new Error(insertError.message);

            // 5. Callback lên cha
            onSubmit(reason + (note ? ` — ${note}` : ''), images, isCOD ? bankInfo : undefined);

        } catch (err: any) {
            setError(err.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl">

                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                            <RotateCcw size={15} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-stone-800">Yêu cầu hoàn trả</h3>
                            <p className="text-[10px] text-stone-400">Đơn #{order.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={loading}
                        className="text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-40">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">

                    {/* Error banner */}
                    {error && (
                        <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Refund method info */}
                    <div className={`flex items-center gap-2.5 p-3 rounded-xl ${isCOD ? 'bg-amber-50 border border-amber-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                        {isCOD
                            ? <Banknote size={14} className="text-amber-600 flex-shrink-0" />
                            : <CreditCardIcon size={14} className="text-emerald-600 flex-shrink-0" />
                        }
                        <p className={`text-xs ${isCOD ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {isCOD
                                ? 'Hoàn tiền mặt qua chuyển khoản sau khi nhận lại hàng'
                                : `Hoàn ${formatPrice(order.total_price)} về tài khoản thanh toán gốc`
                            }
                        </p>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                            Lý do hoàn trả <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {RETURN_REASONS.map(r => (
                                <button key={r} onClick={() => setReason(r)} disabled={loading}
                                    className={`px-3 py-2 rounded-xl text-xs text-left transition-all border ${reason === r
                                        ? 'bg-red-50 border-red-200 text-red-600 font-medium'
                                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                                        }`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upload ảnh */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                                Ảnh sản phẩm lỗi <span className="text-red-400">*</span>
                            </label>
                            <span className="text-[10px] text-stone-300">{images.length}/5 ảnh</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {previews.map((src, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                    {!loading && (
                                        <button onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={10} className="text-white" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {images.length < 5 && !loading && (
                                <button onClick={() => inputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all flex flex-col items-center justify-center gap-1">
                                    <ImagePlus size={16} className="text-stone-300" />
                                    <span className="text-[9px] text-stone-300">Thêm</span>
                                </button>
                            )}
                        </div>
                        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                        {images.length === 0 && (
                            <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                                <AlertCircle size={10} /> Vui lòng upload ít nhất 1 ảnh để xác minh lỗi
                            </p>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">Ghi chú thêm</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} disabled={loading}
                            rows={2} placeholder="Mô tả chi tiết vấn đề..."
                            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 resize-none focus:outline-none focus:border-stone-400 transition-colors disabled:opacity-60" />
                    </div>

                    {/* Bank info — COD only */}
                    {isCOD && (
                        <div>
                            <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                                Số tài khoản nhận hoàn tiền <span className="text-red-400">*</span>
                            </label>
                            <input value={bankInfo} onChange={e => setBankInfo(e.target.value)} disabled={loading}
                                placeholder="VD: Vietcombank - 1234567890 - Nguyễn Văn A"
                                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors disabled:opacity-60" />
                            <p className="text-[10px] text-stone-400 mt-1.5">Nhập tên ngân hàng · số tài khoản · tên chủ tài khoản</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-stone-100 flex gap-2.5">
                    <button onClick={onClose} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-xs font-semibold hover:bg-stone-50 transition-all disabled:opacity-40">
                        Huỷ bỏ
                    </button>
                    <button onClick={handleSubmit} disabled={!isValid || loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                        {loading ? (
                            <>
                                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Đang gửi...
                            </>
                        ) : (
                            <><RotateCcw size={12} /> Gửi yêu cầu</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Props ──────────────────────────────────────────────────────────────
interface Props {
    order: Order | null;
    progressPct: number;
    onCancelRequest: (order: Order) => void;
    onReturnRequest?: (order: Order, reason: string, images: File[], bankInfo?: string) => void;
}

export const OrderDetail = memo(function OrderDetail({ order, progressPct, onCancelRequest, onReturnRequest }: Props) {
    const [showReturnModal, setShowReturnModal] = useState(false);

    if (!order) return (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center mb-3">
                    <Package className="text-stone-300" size={28} />
                </div>
                <p className="text-stone-400 text-sm">Đang tải đơn hàng...</p>
            </div>
        </div>
    );

    const isCOD = String(order.payment_method) === 'cod';
    const completedCount = order.trackingSteps.filter((s: any) => s.completed).length;

    const handleReturnSubmit = (reason: string, images: File[], bankInfo?: string) => {
        setShowReturnModal(false);
        onReturnRequest?.(order, reason, images, bankInfo);
    };

    return (
        <>
            <div className="space-y-4">

                {/* Cancelled banner */}
                {order.status === 'cancelled' && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl">
                        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                            <Ban className="text-red-400" size={16} />
                        </div>
                        <div>
                            <p className="font-semibold text-red-600 text-sm">Đơn hàng đã bị hủy</p>
                            <p className="text-red-400 text-xs mt-0.5">Đơn hàng này không còn được xử lý nữa.</p>
                        </div>
                    </div>
                )}

                {/* Return Policy Section */}
                <ReturnPolicySection
                    order={order}
                    onReturnRequest={() => setShowReturnModal(true)}
                />

                {/* Tracking card */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-stone-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Truck className="text-amber-600" size={17} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-stone-800 text-sm">Trạng thái giao hàng</h2>
                                    <p className="text-xs text-stone-400 mt-0.5">Mã đơn #{order.id.slice(0, 8)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={order.status} />
                                {canCancel(order.status) && (
                                    <button onClick={() => onCancelRequest(order)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-400 text-xs font-medium hover:bg-red-50 transition-all">
                                        <Ban size={11} /> Hủy đơn
                                    </button>
                                )}
                            </div>
                        </div>

                        {order.status !== 'cancelled' && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-stone-400 mb-1.5">
                                    <span>Tiến độ</span>
                                    <span className="font-semibold text-amber-700">{progressPct}%</span>
                                </div>
                                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-700"
                                        style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="px-6 py-5">
                        <div className="relative">
                            <div className="absolute left-[1.3rem] top-4 bottom-4 w-px bg-stone-100" />
                            <div className="space-y-1">
                                {order.trackingSteps.map((step: any, i: number) => {
                                    const isCurrent = step.completed && i === completedCount - 1 && order.status !== 'completed';
                                    const isCodStep = step.isCodStep;
                                    return (
                                        <div key={i} className="flex items-center gap-4 py-2.5 relative">
                                            <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCodStep
                                                ? step.completed ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-white border-2 border-dashed border-emerald-300'
                                                : step.completed ? 'bg-amber-500 shadow-sm shadow-amber-200' : 'bg-white border-2 border-stone-200'
                                                }`}>
                                                {isCodStep
                                                    ? step.completed ? <CheckCircle className="text-white" size={18} /> : <CreditCard className="text-emerald-400" size={15} />
                                                    : step.completed ? <CheckCircle className="text-white" size={18} /> : <span className="text-xs font-semibold text-stone-400">{i + 1}</span>
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className={`text-sm font-medium ${step.completed ? 'text-stone-800' : 'text-stone-400'}`}>{step.label}</p>
                                                    {isCurrent && !isCodStep && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Hiện tại</span>}
                                                    {isCodStep && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 tracking-wide">COD</span>}
                                                    {isCodStep && step.completed && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Đã thu tiền</span>}
                                                </div>
                                                <p className={`text-xs mt-0.5 ${step.completed ? 'text-stone-400' : 'text-stone-300'}`}>
                                                    {isCodStep && !step.completed ? 'Thanh toán tiền mặt khi nhận hàng' : step.date || '—'}
                                                </p>
                                            </div>
                                            {isCodStep && (
                                                <div className="flex-shrink-0 text-right">
                                                    <p className={`text-xs font-bold ${step.completed ? 'text-emerald-600' : 'text-emerald-400'}`}>{formatPrice(order.total_price)}</p>
                                                    <p className="text-[10px] text-stone-400">{step.completed ? 'đã thu' : 'cần thu'}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info + Products */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                <MapPin className="text-amber-600" size={15} />
                            </div>
                            <h3 className="text-sm font-semibold text-stone-800">Thông tin giao hàng</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Người nhận</p>
                                <p className="text-sm font-semibold text-stone-800">{order.receiver_name}</p>
                                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                    {order.address_line}
                                    {order.ward_name && `, ${order.ward_name}`}
                                    {order.city_name && `, ${order.city_name}`}
                                </p>
                            </div>
                            <div className="h-px bg-stone-100" />
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                    <Phone className="text-stone-500" size={12} />
                                </div>
                                <span className="text-sm text-stone-600">{order.phone}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                    <Mail className="text-stone-500" size={12} />
                                </div>
                                <span className="text-sm text-stone-600 truncate">{order.mail}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="text-stone-500" size={12} />
                                </div>
                                <span className="text-sm text-stone-600">
                                    {order.payment_method_icon} {order.payment_method_label ?? 'Không xác định'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                <ShoppingBag className="text-amber-600" size={15} />
                            </div>
                            <h3 className="text-sm font-semibold text-stone-800">Sản phẩm đã đặt</h3>
                        </div>
                        <div className="space-y-2.5 mb-4">
                            {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                                        {item.image
                                            ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center"><Package size={12} className="text-stone-300" /></div>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-stone-700 truncate">{item.title}</p>
                                        <p className="text-[10px] text-stone-400 mt-0.5">{item.color} · {item.size} · x{item.quantity}</p>
                                    </div>
                                    <p className="text-xs font-semibold text-stone-700 flex-shrink-0">{formatPrice(item.price)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-stone-100 pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-stone-500">Tổng thanh toán</span>
                                <span className="text-base font-bold text-amber-700">{formatPrice(order.total_price)}</span>
                            </div>
                        </div>
                        {canCancel(order.status) && (
                            <button onClick={() => onCancelRequest(order)}
                                className="w-full mt-3.5 py-2.5 rounded-xl border border-red-200 text-red-400 text-xs font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
                                <Ban size={12} /> Hủy đơn hàng
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && (
                <ReturnModal
                    order={order}
                    onClose={() => setShowReturnModal(false)}
                    onSubmit={handleReturnSubmit}
                />
            )}
        </>
    );
});