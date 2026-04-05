import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sortObject(obj: Record<string, string>) {
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {} as Record<string, string>);
}

// ✅ TẠO PAYMENT URL
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, amount, orderInfo } = body;

        // ✅ Parse amount thành số, tránh NaN
        const parsedAmount = Number(amount);
        if (!parsedAmount || isNaN(parsedAmount)) {
            return NextResponse.json({ error: "Amount không hợp lệ" }, { status: 400 });
        }

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
            vnp_Amount: String(Math.round(parsedAmount) * 100), // ✅ dùng parsedAmount
            vnp_CreateDate: createDate,
            vnp_CurrCode: "VND",
            vnp_IpAddr: req.headers.get("x-forwarded-for") || "127.0.0.1",
            vnp_Locale: "vn",
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: "other",
            vnp_ReturnUrl: returnUrl,
            vnp_TxnRef: String(orderId),
        };

        const sorted = sortObject(params);
        const signData = new URLSearchParams(sorted).toString();
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
        sorted["vnp_SecureHash"] = signed;

        const paymentUrl = `${vnpUrl}?${new URLSearchParams(sorted).toString()}`;
        return NextResponse.json({ paymentUrl });

    } catch (err) {
        console.error("VNPAY POST ERROR:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// ✅ IPN - VNPAY GỌI ĐỂ XÁC NHẬN
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    const secureHash = params["vnp_SecureHash"];
    delete params["vnp_SecureHash"];
    delete params["vnp_SecureHashType"];

    const sorted = sortObject(params);
    const signData = new URLSearchParams(sorted).toString();
    const hmac = crypto.createHmac("sha512", process.env.VNPAY_HASH_SECRET!);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash !== signed) {
        return NextResponse.json({ RspCode: "97", Message: "Invalid checksum" });
    }

    const orderId = params["vnp_TxnRef"];
    const responseCode = params["vnp_ResponseCode"];
    const status = responseCode === "00" ? "success" : "failed";

    await supabase
        .from("orders")
        .update({ payment_status: status, vnpay_response: params })
        .eq("id", orderId);

    return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
}