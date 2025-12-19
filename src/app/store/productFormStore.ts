import { create } from "zustand";
import { UploadFile } from "../api/postproductAPI"; // import hàm upload đã sửa

export interface ProductFormState {
    id: string;
    title: string;
    price: string;
    description: string;
    categoryId: string;
    image: string[]; // lưu URL ảnh sau khi upload
    setField: (field: keyof Omit<ProductFormState, "setField">, value: string) => void;
    // setImages: (files: FileList | File[]) => Promise<void>; // upload và set image URLs
    reset: () => void;
}

export const useProductFormStore = create<ProductFormState>((set) => ({
    id: "",
    title: "",
    price: "",
    description: "",
    categoryId: "",
    image: [""],

    setField: (field, value) => set({ [field]: value }),

    // // upload file và lưu URL vào image
    // setImages: async (files: FileList | File[]) => {
    //     try {
    //         const urls = await UploadFile(files);
    //         console.log("urls", urls)
    //         if (urls.length > 0) set({ image: urls });
    //     } catch (err) {
    //         console.error("Upload images failed:", err);
    //     }
    // },

    reset: () =>
        set({
            id: "",
            title: "",
            price: "",
            description: "",
            categoryId: "",
            image: [""],
        }),
}));
