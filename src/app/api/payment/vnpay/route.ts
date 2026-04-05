import { NextRequest, NextResponse } from 'next/server';
import { VNPay, ProductCode, VnpLocale } from 'vnpay';

const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE!,
    secureSecret: process.env.VNPAY_SECURE_SECRET!,
    vnpayHost: 'https://sandbox.vnpayment.vn', // đổi sang production khi live
    testMode: process.env.VNPAY_SANDBOX === 'true',
});

export async function POST(req: NextRequest) {
    const { orderId, amount, orderInfo } = await req.json();

    // Lấy IP của user
    const ipAddr =
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1';

    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,           // VND, thư viện tự nhân 100
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: orderId,          // mã đơn hàng, unique mỗi ngày
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vnpay-return`,
        vnp_Locale: VnpLocale.VN,
    });

    return NextResponse.json({ paymentUrl });
}