import { supabase } from "../../libs/supabaseClient";

const uploadFile = async (file: File): Promise<string | null> => {
    try {
        if (!file) return null;

        const fileName = `${Date.now()}-${file.name}`;

        // 1. Upload bằng Supabase SDK (ĐÚNG)
        const { data, error } = await supabase.storage
            .from("image") // tên bucket (public)
            .upload(fileName, file);

        if (error) {
            console.error("Upload error:", error);
            return null;
        }

        // 2. Lấy URL public (CHỈ GET, KHÔNG POST)
        const { data: publicData } = supabase.storage
            .from("image")
            .getPublicUrl(data.path);

        return publicData.publicUrl;
    } catch (err) {
        console.error("Unexpected upload error:", err);
        return null;
    }
};

export default uploadFile;
