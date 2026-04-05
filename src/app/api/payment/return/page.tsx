"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { handlePaymentSuccess } from "@/lib/payment"; // sửa đúng đường dẫn

function PaymentReturnContent() {
    const params = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "failed" | "cancelled">("loading");

    useEffect(() => {
        const process = async () => {
            const responseCode = params.get("vnp_ResponseCode");
            const orderId = localStorage.getItem("pending_order_id");
            const cartItemsRaw = localStorage.getItem("pending_cart_items");

            // ✅ User hủy thanh toán
            if (responseCode === "24") {
                setStatus("cancelled");
                return;
            }

            // ✅ Thanh toán thành công
            if (responseCode === "00" && orderId && cartItemsRaw) {
                const cartItems = JSON.parse(cartItemsRaw);
                const success = await handlePaymentSuccess(orderId, cartItems);

                localStorage.removeItem("pending_order_id");
                localStorage.removeItem("pending_cart_items");
                localStorage.removeItem("order_id");

                setStatus(success ? "success" : "failed");
                return;
            }

            // ✅ Lỗi khác
            setStatus("failed");
        };

        process();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#faf8f5]">

            {status === "loading" && (
                <p className="text-[#a08060]">Đang xử lý thanh toán...</p>
            )}

            {status === "success" && (
                <>
                    <div className="w-20 h-20 rounded-full bg-[#f0f8e8] flex items-center justify-center">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h1 className="text-2xl font-bold text-green-700">Thanh toán thành công!</h1>
                    <p className="text-[#a09080]">Đơn hàng của bạn đã được xác nhận.</p>
                    <button onClick={() => router.push("/")}
                        className="mt-4 px-8 py-3 bg-[#8b6343] text-white rounded-full font-medium hover:bg-[#6e4e34] transition-all">
                        Về trang chủ
                    </button>
                </>
            )}

            {status === "cancelled" && (
                <>
                    <div className="w-20 h-20 rounded-full bg-[#fff8f0] flex items-center justify-center">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-orange-500">Bạn đã hủy thanh toán</h1>
                    <p className="text-[#a09080]">Đơn hàng vẫn được giữ, bạn có thể thanh toán lại.</p>
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => router.push("/cart")}
                            className="px-6 py-3 border border-[#e2d9ce] text-[#7a6050] rounded-full font-medium hover:bg-[#f3ede6] transition-all">
                            Quay lại giỏ hàng
                        </button>
                        <button onClick={() => router.back()}
                            className="px-6 py-3 bg-[#8b6343] text-white rounded-full font-medium hover:bg-[#6e4e34] transition-all">
                            Thử thanh toán lại
                        </button>
                    </div>
                </>
            )}

            {status === "failed" && (
                <>
                    <div className="w-20 h-20 rounded-full bg-[#fff0f0] flex items-center justify-center">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-bold text-red-600">Thanh toán thất bại</h1>
                    <p className="text-[#a09080]">Mã lỗi: {params.get("vnp_ResponseCode")}</p>
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => router.push("/")}
                            className="px-6 py-3 border border-[#e2d9ce] text-[#7a6050] rounded-full font-medium hover:bg-[#f3ede6] transition-all">
                            Về trang chủ
                        </button>
                        <button onClick={() => router.push("/cart")}
                            className="px-6 py-3 bg-[#8b6343] text-white rounded-full font-medium hover:bg-[#6e4e34] transition-all">
                            Thử lại
                        </button>
                    </div>
                </>
            )}

        </div>
    );
}

export default function PaymentReturn() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#faf8f5]">
                <p className="text-[#a08060]">Đang tải...</p>
            </div>
        }>
            <PaymentReturnContent />
        </Suspense>
    );
}