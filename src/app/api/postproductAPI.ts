import axios from "axios";
export type ProductType = {
    id: number,
    title: string,
    price: number,
    description: string,
    categoryId: number,
    images: string[],
}

export async function PostProductAPI(data: ProductType) {
    try {
        const res = await axios.post(
            "https://api.escuelajs.co/api/v1/products/",
            data,
            { headers: { "Content-Type": "application/json" } }
        );
        console.log("✅ Product created:", res.data);
        return res.data;
    } catch (error: any) {
        console.error("❌ Product post error:", error.response?.data || error.message);
        throw error;
    }
}


export async function deleteProduct(id: number) {
    try {
        const res = await axios.delete(`https://api.escuelajs.co/api/v1/products/${id}`)
        return res.data
    } catch (error) {
        console.error(error)
    }
}

export async function putProduct(data: ProductType) {
    try {
        const res = await axios.put(`https://api.escuelajs.co/api/v1/products/${data.id}`, data)
        return res.data
    } catch (error) {
        console.error(error)
    }
}
export async function UploadFile(files: FileList | File[]) {
    try {
        const formData = new FormData();
        // Array.from(files).forEach((file) => formData.append("file", file))
        const res = await axios.post("https://api.escuelajs.co/api/v1/upload/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        const data = res.data
        if (Array.isArray(data)) {
            return data.map((item) => item.location)
        }
        if (data && data.location) {
            return [data.location]
        }
        console.warn("Không có location hợp lệ trong phản hồi API:", data);
        return [];
    } catch (error) {
        console.error("Upload file error:", error);
        return [];




        //     const formData = new FormData();

        //     // Nếu là FileList → chuyển thành mảng để duyệt
        //     Array.from(files).forEach((file) => formData.append("file", file));

        //     const res = await axios.post(
        //         "https://api.escuelajs.co/api/v1/files/upload",
        //         formData,
        //         {
        //             headers: { "Content-Type": "multipart/form-data" },
        //         }
        //     );
        //     // Xử lý kết quả trả về: có thể là 1 object hoặc mảng object
        //     const data = res.data;
        //     console.log("check data", data)
        //     // Nếu API trả về mảng ảnh
        //     if (Array.isArray(data)) {
        //         return data.map((item) => item.location);
        //     }

        //     // Nếu API trả về 1 object duy nhất
        //     if (data && data.location) {
        //         return [data.location];
        //     }

        //     console.warn("Không có location hợp lệ trong phản hồi API:", data);
        //     return [];
        // } catch (error) {
        //     console.error("Upload file error:", error);
        //     return [];
    }
}