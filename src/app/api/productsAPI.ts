import axios from "axios";
import { supabase } from "../libs/supabaseClient";
import toast from "react-hot-toast";
export interface Clothes {
  id: number,
  title: string,
  slug: string,
  price: number,
  image: string,
  description: string,
  category_id: number,
  category: {
    id: number;
    name: string;
    image: string;
  },
  variants: any;
  images: string[]
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
    .select("*")
    .order("id", { ascending: true })
    .in("gender", ["male", "unisex"])
  if (error) {
    console.error("Lỗi lấy sản phẩm:", error);
    return [];
  }

  return data as Clothes[];
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


export async function createCartIfNotExists(userId: number) {
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    const { data, error } = await supabase.from("carts").insert({
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
  toast.success("Xóa sản phẩm thành công")
  return true;
}
