import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function sortObject(obj: Record<string, string>) {
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {} as Record<string, string>);
}

export async function POST(req: NextRequest) {
    const { amount, orderInfo, orderId } = await req.json();

    const tmnCode = process.env.VNPAY_TMN_CODE!;
    const secretKey = process.env.VNPAY_HASH_SECRET!;
    const vnpUrl = process.env.VNPAY_URL!;
    const returnUrl = process.env.VNPAY_RETURN_URL!;

    const date = new Date();
    const createDate = date.toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

    const params: Record<string, string> = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: String(amount * 100), // VNPay tính theo đơn vị x100
        vnp_CreateDate: createDate,
        vnp_CurrCode: "VND",
        vnp_IpAddr: req.headers.get("x-forwarded-for") || "127.0.0.1",
        vnp_Locale: "vn",
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: "other",
        vnp_ReturnUrl: returnUrl,
        vnp_TxnRef: orderId,
    };

    const sorted = sortObject(params);
    const signData = new URLSearchParams(sorted).toString();
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    sorted["vnp_SecureHash"] = signed;

    const paymentUrl = `${vnpUrl}?${new URLSearchParams(sorted).toString()}`;

    return NextResponse.json({ paymentUrl });
}