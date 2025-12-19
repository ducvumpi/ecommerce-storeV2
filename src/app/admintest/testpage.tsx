"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import {
    PostProductAPI,
    ProductType,
    deleteProduct,
    putProduct,
} from "../api/postproductAPI";
import { TextField, MenuItem } from "@mui/material";
import { useProductFormStore } from "../store/productFormStore";
import {
    fetchCollections,
    Collection,
    useCategoryStore,
} from "../api/collections";
import toast from "react-hot-toast";

export default function CreateProduct() {
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit } = useForm<ProductType>();
    const { categories, setCategories } = useCategoryStore();

    useEffect(() => {
        async function LoadCollections() {
            const data: Collection[] = await fetchCollections();
            setCategories(data);
        }
        LoadCollections();
    }, []);

    // ✅ Hàm xử lý upload ảnh
    const uploadImages = async (files: FileList | File[]): Promise<string[]> => {
        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => formData.append("file", file));

            const res = await axios.post(
                "https://api.escuelajs.co/api/v1/files/upload",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            // API có thể trả về 1 object hoặc mảng object
            if (Array.isArray(res.data)) {
                return res.data.map((item: any) => item.location || item.url).filter(Boolean);
            } else if (res.data && (res.data.location || res.data.url)) {
                return [res.data.location || res.data.url];
            }

            return [];
        } catch (error) {
            console.error("❌ Upload error:", error);
            toast.error("Tải ảnh lên thất bại");
            return [];
        }
    };

    // ✅ Gửi form
    const handlePostAPI = async (data: any) => {
        try {
            setLoading(true);
            let imageUrls: string[] = [];

            // Trường hợp có chọn file upload
            if (data.images && data.images.length > 0 && data.images[0] instanceof File) {
                imageUrls = await uploadImages(data.images);
            }

            // Trường hợp nhập link thủ công (nếu images là string)
            if (!imageUrls.length && typeof data.images === "string") {
                imageUrls = data.images
                    .split(/[,\n]/)
                    .map((url: string) => url.trim())
                    .filter((url: string) => url !== "");
            }

            // Nếu vẫn rỗng → ảnh mặc định
            if (!imageUrls.length) {
                imageUrls = ["https://placeimg.com/640/480/any"];
            }

            const payload: ProductType = {
                ...data,
                price: Number(data.price),
                categoryId: Number(data.categoryId),
                images: imageUrls,
            };

            await PostProductAPI(payload);
            console.log("✅ Final payload:", payload);
            toast.success("Gửi sản phẩm thành công ✅");
        } catch (error) {
            console.error("❌ Lỗi khi gửi dữ liệu:", error);
            toast.error("Gửi thất bại ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-[100px]">
            <div className="mx-auto max-w-md">
                <form onSubmit={handleSubmit(handlePostAPI)} className="space-y-6 p-[20px]">
                    {/* 🟩 Tên sản phẩm */}
                    <Controller
                        name="title"
                        control={control}
                        rules={{ required: "Vui lòng nhập tên sản phẩm" }}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                value={field.value ?? ""}
                                className="w-full"
                                label="Tên sản phẩm"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* 🟩 Giá */}
                    <Controller
                        name="price"
                        control={control}
                        defaultValue={0}
                        rules={{ required: "Vui lòng nhập giá sản phẩm" }}
                        render={({ field, fieldState }) => (
                            <TextField
                                type="number"
                                {...field}
                                className="w-full"
                                label="Giá"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* 🟩 Mô tả */}
                    <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        rules={{ required: "Vui lòng nhập mô tả" }}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                className="w-full"
                                label="Mô tả"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* 🟩 Danh mục */}
                    <Controller
                        name="categoryId"
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                            <TextField {...field} select label="Chọn danh mục" fullWidth>
                                <MenuItem value="0">-- Chọn danh mục --</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />

                    {/* 🟩 Ảnh (upload hoặc nhập link) */}
                    <Controller
                        name="images"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Ảnh sản phẩm
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => field.onChange(e.target.files)}
                                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                                />
                                <p className="text-gray-500 text-sm">Hoặc dán link ảnh bên dưới:</p>
                                <TextField
                                    {...field}
                                    value={typeof field.value === "string" ? field.value : ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    label="Link ảnh (nếu có)"
                                    fullWidth
                                />
                            </div>
                        )}
                    />

                    {/* 🟩 Nút gửi */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        {loading ? "Đang gửi..." : "Tạo mới"}
                    </button>
                </form>
            </div>
        </div>
    );
}
