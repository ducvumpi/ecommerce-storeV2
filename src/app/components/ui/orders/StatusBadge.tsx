const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    pending: { label: 'Chờ xác nhận', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
    pending_payment: { label: 'Chờ thanh toán', dot: 'bg-orange-400', bg: 'bg-orange-50', text: 'text-orange-700' },
    paid: { label: 'Đã thanh toán', dot: 'bg-sky-400', bg: 'bg-sky-50', text: 'text-sky-700' },
    packing: { label: 'Đang đóng gói', dot: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-700' },
    shipping: { label: 'Đang giao hàng', dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
    completed: { label: 'Đã hoàn thành', dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    cancelled: { label: 'Đã hủy', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-500' },
    payment_failed: { label: 'Thanh toán thất bại', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-500' },
};
export const StatusBadge = ({ status }: { status: string }) => {
    if (!status) return null; // ✅ chờ data load xong

    const cfg = STATUS_CONFIG[status?.trim()] ?? {
        label: 'Không xác định',
        dot: 'bg-stone-400',
        bg: 'bg-stone-50',
        text: 'text-stone-500'
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};