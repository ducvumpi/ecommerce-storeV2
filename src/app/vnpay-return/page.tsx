'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { handlePaymentSuccess } from '@/app/store/createOrder';

function PaymentReturnContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'cancelled' | 'failed'>('loading');
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const process = async () => {
            const responseCode = searchParams.get('vnp_ResponseCode');
            const orderId = localStorage.getItem('pending_order_id');
            const cartItemsRaw = localStorage.getItem('pending_cart_items');

            if (responseCode === '24') {
                setStatus('cancelled');
                return;
            }

            if (responseCode === '00' && orderId && cartItemsRaw) {
                const cartItems = JSON.parse(cartItemsRaw);
                const success = await handlePaymentSuccess(orderId, cartItems);
                localStorage.removeItem('pending_order_id');
                localStorage.removeItem('pending_cart_items');
                localStorage.removeItem('order_id');
                setStatus(success ? 'success' : 'failed');
                return;
            }

            setStatus('failed');
        };
        process();
    }, []);

    useEffect(() => {
        if (status !== 'success') return;
        if (countdown === 0) { router.push('/'); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [status, countdown]);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-background-tertiary)', padding: '1rem'
        }}>
            <div style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-xl)',
                padding: '2.5rem 2rem', maxWidth: 420, width: '100%', textAlign: 'center'
            }}>

                {status === 'loading' && (
                    <>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'var(--color-background-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                                </path>
                            </svg>
                        </div>
                        <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', margin: 0 }}>Đang xử lý thanh toán...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'var(--color-background-success)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Thanh toán thành công</h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 1.5rem' }}>
                            Đơn hàng đã được xác nhận. Chuyển về trang chủ sau {countdown}s...
                        </p>
                        <div style={{
                            background: 'var(--color-background-success)',
                            border: '0.5px solid var(--color-border-success)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: '10px 16px', fontSize: 13,
                            color: 'var(--color-text-success)', marginBottom: '1.5rem'
                        }}>
                            Mã GD: {searchParams.get('vnp_TransactionNo')}
                        </div>
                        <button onClick={() => router.push('/')} style={{
                            width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)',
                            background: 'var(--color-background-success)',
                            border: '0.5px solid var(--color-border-success)',
                            color: 'var(--color-text-success)', fontSize: 14, cursor: 'pointer'
                        }}>
                            Về trang chủ
                        </button>
                    </>
                )}

                {status === 'cancelled' && (
                    <>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'var(--color-background-warning)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Đã hủy thanh toán</h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 1.5rem' }}>
                            Đơn hàng vẫn được giữ lại. Bạn có thể thanh toán lại bất cứ lúc nào.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => router.push('/')} style={{
                                flex: 1, padding: '10px', borderRadius: 'var(--border-radius-md)',
                                background: 'transparent', border: '0.5px solid var(--color-border-secondary)',
                                color: 'var(--color-text-secondary)', fontSize: 14, cursor: 'pointer'
                            }}>
                                Về trang chủ
                            </button>
                            <button onClick={() => {
                                const orderId = localStorage.getItem('pending_order_id');
                                router.push(`/cart?step=3&orderId=${orderId}`);
                            }} style={{
                                flex: 1, padding: '10px', borderRadius: 'var(--border-radius-md)',
                                background: 'var(--color-background-warning)',
                                border: '0.5px solid var(--color-border-warning)',
                                color: 'var(--color-text-warning)', fontSize: 14, cursor: 'pointer'
                            }}>
                                Thanh toán lại
                            </button>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'var(--color-background-danger)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Thanh toán thất bại</h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 1.5rem' }}>
                            Mã lỗi: {searchParams.get('vnp_ResponseCode')} · Vui lòng thử lại hoặc chọn phương thức khác.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => router.push('/')} style={{
                                flex: 1, padding: '10px', borderRadius: 'var(--border-radius-md)',
                                background: 'transparent', border: '0.5px solid var(--color-border-secondary)',
                                color: 'var(--color-text-secondary)', fontSize: 14, cursor: 'pointer'
                            }}>
                                Về trang chủ
                            </button>
                            <button onClick={() => router.push('/cart')} style={{
                                flex: 1, padding: '10px', borderRadius: 'var(--border-radius-md)',
                                background: 'var(--color-background-danger)',
                                border: '0.5px solid var(--color-border-danger)',
                                color: 'var(--color-text-danger)', fontSize: 14, cursor: 'pointer'
                            }}>
                                Thử lại
                            </button>
                        </div>
                    </>
                )}

                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: '1.5rem', marginBottom: 0 }}>
                    Hỗ trợ: support@yourdomain.com
                </p>
            </div>
        </div>
    );
}

export default function PaymentReturn() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>Đang tải...</p>
            </div>
        }>
            <PaymentReturnContent />
        </Suspense>
    );
}