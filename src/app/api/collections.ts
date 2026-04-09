import axios from "axios";
import { create } from "zustand";
import { supabase } from "../libs/supabaseClient";
import { Clothes } from "./productsAPI"
export type Collection = {
  id: number;
  name: string;
  tag: string;
  description: string;
  slug: string;
  image: string;
};

export interface CategoryStore {
  categories: Collection[];
  setCategories: (data: Collection[]) => void;
  fetchCategories: () => Promise<void>;
}

// export async function fetchCollections(): Promise<Collection[]> {
//   try {
//     const response = await axios.get<Collection[]>(
//       "https://api.escuelajs.co/api/v1/categories"
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Lỗi", error);
//     return [];
//   }
export async function fetchCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")

  if (error) {
    console.error("Lỗi lấy sản phẩm:", error);
    return [];
  }

  return data as Collection[];
}
export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (data) => set({ categories: data }),
  fetchCategories: async () => {
    try {
      const data = await fetchCollections();
      set({ categories: data });
    } catch (err) {
      console.error("Lỗi khi load categories:", err);
    }
  },
}));



// Lấy 1 collection theo slug
export async function fetchCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const collections = await fetchCollections();
    console.log("Kiểm tra dữ liệu", collections);
    const found = collections.find((c) => c.slug === slug);
    console.log("Check found object?", found);
    return found ?? null;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu bộ sưu tập:", error);
    return null;
  }
}

export async function fetchProductsByCategory(categoryId: number) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (
        id,
        size,
        color,
        price,
        stock
      )
    `)
    .eq("category_id", categoryId);

  console.log("check datata", data);

  if (error) {
    console.error("Lỗi lấy sản phẩm:", error);
    return [];
  }

  return data;
}



