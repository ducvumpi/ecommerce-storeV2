import axios from "axios";
import { supabase } from "../libs/supabaseClient";
import toast from "react-hot-toast";
export interface Clothes {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  image_url: string;
  material: string;
  description: string;
  gender_id: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
    image: string;
  };

  product_variants: {
    id: string;
    size: string;
    color: string;
    stock: number;
  }[];

  images?: string[];
}
export interface CategoryStore {
  product: Clothes[];

}
// export async function fetchProduct(): Promise<Clothes[]> {
//   try {
//     const response = await axios.get(
//       "https://api.escuelajs.co/api/v1/products"
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Lỗi khi lấy dữ liệu quần áo:", error);
//     return [];
//   }
// }
export async function fetchProduct(): Promise<Clothes[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      genders(slug)
    `)
    .in("gender_id", [1, 3]) // nam + unisex
    .order("id", { ascending: true });

  console.log(data);
  return data || [];
}
export async function fetchProductWoman(): Promise<Clothes[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      genders(slug)
    `)
    .in("gender_id", [2, 3]) // nữ + unisex
    .order("id", { ascending: true });

  console.log(data);
  return data || [];
}
export async function fetchProductDetail(id: number) {
  try {
    const response = await axios.get(
      `https://api.escuelajs.co/api/v1/products/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu quần áo:", error);
    return;
  }
}
export async function fetchClothesByProduct(slug: string): Promise<Clothes | null> {
  try {
    const products = await fetchProduct();
    const found = products.find((c) => c.slug === slug);
    console.log("check found", found)
    return found ?? null;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu quần áo theo slug:", error);
    return null;
  }
}
export async function fetchClothesByProductWoman(slug: string): Promise<Clothes | null> {
  try {
    const products = await fetchProductWoman();
    const found = products.find((c) => c.slug === slug);
    console.log("check found", found)
    return found ?? null;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu quần áo theo slug:", error);
    return null;
  }
}

export async function createCartIfNotExists(userId: number) {
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    const { data, error } = await supabase.from("cart").insert({
      user_id: userId
    }).select().single();

    if (error) throw error;

    return data;
  }

  return existing;
}

export async function deleteCartItems(idCartItems: number) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", idCartItems);

  if (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    return false;
  }
  return true;
}

// ✅ Thêm hàm xóa nhiều item 1 lần
export async function deleteMultipleCartItems(ids: number[]) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    return false;
  }
  return true;
}