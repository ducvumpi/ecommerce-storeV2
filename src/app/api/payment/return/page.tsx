"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { handlePaymentSuccess } from "@/app/store/createOrder";
function PaymentReturnContent() {
    const params = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

    useEffect(() => {
        const process = async () => {
            const responseCode = params.get("vnp_ResponseCode");
            const orderId = localStorage.getItem("pending_order_id");
            const cartItemsRaw = localStorage.getItem("pending_cart_items");

            if (responseCode === "00" && orderId && cartItemsRaw) {
                const cartItems = JSON.parse(cartItemsRaw);
                const success = await handlePaymentSuccess(orderId, cartItems);

                localStorage.removeItem("pending_order_id");
                localStorage.removeItem("pending_cart_items");
                localStorage.removeItem("order_id");

                setStatus(success ? "success" : "failed");
            } else {
                setStatus("failed");
            }
        };

        process();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            {status === "loading" && <p>Đang xử lý thanh toán...</p>}

            {status === "success" && (
                <>
                    <h1 className="text-2xl font-bold text-green-600">✅ Thanh toán thành công!</h1>
                    <p>Đơn hàng của bạn đã được xác nhận.</p>
                    <button onClick={() => router.push("/")} className="mt-4 px-6 py-2 bg-black text-white rounded">
                        Về trang chủ
                    </button>
                </>
            )}

            {status === "failed" && (
                <>
                    <h1 className="text-2xl font-bold text-red-600">❌ Thanh toán thất bại</h1>
                    <p>Mã lỗi: {params.get("vnp_ResponseCode")}</p>
                    <button onClick={() => router.push("/checkout")} className="mt-4 px-6 py-2 bg-black text-white rounded">
                        Thử lại
                    </button>
                </>
            )}
        </div>
    );
}

export default function PaymentReturn() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Đang tải...</div>}>
            <PaymentReturnContent />
        </Suspense>
    );
}