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

    // Cập nhật Supabase
    await supabase
        .from("orders")
        .update({ payment_status: status, vnpay_response: params })
        .eq("id", orderId);

    return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
}