import { supabase } from "../libs/supabaseClient";
import axios from "axios";

// Interface (tuỳ chọn)
interface Category {
    id: number;
    name: string;
    slug: string;
    image: string;
    creationAt: string;
    updatedAt: string;
}

interface Product {
    id: number;
    title: string;
    slug: string;
    price: number;
    image: string;
    description: string;
    category: Category;
    images: string[];
    creationAt: string;
    updatedAt: string;
}

export async function syncProductsToSupabase() {
    try {
        // 1️⃣ Lấy danh sách sản phẩm từ API Escuelajs
        const response = await axios.get<Product[]>(
            "https://api.escuelajs.co/api/v1/products"
        );

        const products = response.data;

        for (const product of products) {
            // 2️⃣ Upsert category trước
            await supabase.from("categories").upsert({
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
                image: product.category.image,
                created_at: product.category.creationAt,
                updated_at: product.category.updatedAt,
            });

            // 3️⃣ Upsert product
            const { error } = await supabase.from("products").upsert({
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                image: product.category.image,
                description: product.description,
                category_id: product.category.id,
                images: product.images,
                created_at: product.creationAt,
                updated_at: product.updatedAt,
            });

            if (error) console.error("Error inserting product:", product.id, error);
        }

        console.log("✅ Sync products completed!");
    } catch (err) {
        console.error("Error fetching products:", err);
    }
}
