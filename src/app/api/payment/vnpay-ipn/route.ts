import { NextRequest, NextResponse } from 'next/server';
import { VNPay, IpnSuccess, IpnFailChecksum, IpnOrderNotFound, IpnInvalidAmount, InpOrderAlreadyConfirmed, IpnUnknownError, ReturnQueryFromVNPay } from 'vnpay';
import { supabase } from '@/app/libs/supabaseClient'; // dùng service role key ở đây

const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE!,
    secureSecret: process.env.VNPAY_SECURE_SECRET!,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: process.env.VNPAY_SANDBOX === 'true',
});

export async function GET(req: NextRequest) {
    const query = Object.fromEntries(req.nextUrl.searchParams) as ReturnQueryFromVNPay;

    try {
        const verify = vnpay.verifyIpnCall(query);

        if (!verify.isVerified) return NextResponse.json(IpnFailChecksum);
        if (!verify.isSuccess) return NextResponse.json(IpnUnknownError);

        // Tìm đơn hàng trong database
        const { data: order } = await supabase
            .from('orders')
            .select('id, total_amount, status')
            .eq('id', verify.vnp_TxnRef)
            .single();

        if (!order) return NextResponse.json(IpnOrderNotFound);
        if (verify.vnp_Amount !== order.total_amount) return NextResponse.json(IpnInvalidAmount);
        if (order.status === 'paid') return NextResponse.json(InpOrderAlreadyConfirmed);

        // Cập nhật trạng thái đơn hàng
        await supabase
            .from('orders')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', order.id);

        return NextResponse.json(IpnSuccess);
    } catch (err) {
        console.error('VNPay IPN error:', err);
        return NextResponse.json(IpnUnknownError);
    }
}