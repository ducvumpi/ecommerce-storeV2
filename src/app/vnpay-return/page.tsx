'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VNPay, VnpLocale } from 'vnpay';

export default function VnpayReturn() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');

    useEffect(() => {
        // vnp_ResponseCode = '00' là thành công
        const responseCode = searchParams.get('vnp_ResponseCode');
        if (responseCode === '00') {
            setStatus('success');
            setTimeout(() => router.push('/orders'), 3000);
        } else {
            setStatus('fail');
        }
    }, []);

    if (status === 'loading') return <p>Đang xử lý...</p>;
    if (status === 'success') return (
        <div>✅ Thanh toán thành công! Đang chuyển hướng...</div>
    );
    return <div>❌ Thanh toán thất bại. Vui lòng thử lại.</div>;
}