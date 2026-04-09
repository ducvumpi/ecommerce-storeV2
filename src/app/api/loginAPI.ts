import axios from "axios";
import { supabase } from '../libs/supabaseClient'
import * as yup from "yup";
import toast from "react-hot-toast";
import { InferType } from "yup";

export type UserData = {
  id: number,
  user: string,
  email: string,
  first_name: string,
  last_name: string;
  role: string;
  avatar: string;
};
export type SignupForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
// export type LoginData = {
//   email: string;
//   password: string;
//   role?: "user" | "admin";
// };
export const LoginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),
  password: yup.string().required("Vui lòng nhập mật khẩu"),
});
export const SignUpSchema = yup.object().shape({
  firstName: yup.string().required("Vui lòng nhập Họ"),
  lastName: yup.string().required("Vui lòng nhập Tên"),
  email: yup
    .string()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),
  password: yup.string().required("Vui lòng nhập mật khẩu"),
  confirmPassword: yup.string().required("Vui lòng nhập mật khẩu"),

})
export type LoginData = InferType<typeof LoginSchema>;


const URL = "https://api.escuelajs.co/api/v1/auth";
const GetAPI = axios.create({
  baseURL: URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// export async function loginUser({ email, password }: LoginData) {
//   try {
//     await LoginSchema.validate({ email, password }, { abortEarly: false });
//     const response = await GetAPI.post("/login", { email, password });
//     console.log("loginUser", response)

//     return response.data.access_token;
//   } catch { }
// }

export async function getProfile(token: string) {
  // 1. Lấy user từ Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 2. Gọi API ngoài (optional)
  const response = await GetAPI.get("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const profile = response.data;

  // 3. Upsert vào bảng users
  const { data: userData, error } = await supabase
    .from("profiles") // ⚠️ đổi từ users -> profiles
    .update({
      full_name: profile?.name || user.user_metadata?.name,
      avatar_url: profile?.avatar || user.user_metadata?.avatar,
      role: profile?.role || "user",
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Update user lỗi:", error);
    return profile;
  }

  // 4. Tạo cart nếu chưa có
  const { data: existingCart } = await supabase
    .from("cart")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingCart) {
    await supabase.from("cart").insert({
      user_id: user.id,
    });
  }

  return userData;
}
export async function getOrCreateCart(userId: string) {
  // Kiểm tra cart đã tồn tại chưa
  let { data: cart } = await supabase
    .from("cart")
    .select("*")
    .eq("user_id", userId)
    .single();
  // Nếu chưa có → tạo cart mới
  if (!cart) {
    const { data: newCart, error } = await supabase
      .from("cart")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return newCart;
  }

  return cart;
}
export async function addToCart(product_id: number, variantId: string, quantity: number) {
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    toast.error("Bạn cần đăng nhập");
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 800);
    return;
  }

  const cart = await getOrCreateCart(authData.user.id);

  const { data: existingItem, error: fetchError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("variant_id", variantId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error(fetchError);
    toast.error("Không thể kiểm tra giỏ hàng");
    return;
  }

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + quantity,
      })
      .eq("id", existingItem.id);

    if (error) {
      console.error(error);
      toast.error("Không thể cập nhật giỏ hàng");
    }
    return;
  }

  const { error } = await supabase.from("cart_items").insert({
    cart_id: cart.id,
    variant_id: variantId,
    quantity,

  });

  if (error) {
    console.error(error);
    toast.error("Không thể thêm vào giỏ");
  }

}



export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/",
    },
  });

  if (error) {
    console.error("Lỗi đăng nhập Google:", error);
    return null;
  }

  return data;
}
export async function GetUserProfile(): Promise<UserData | null> {
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    console.warn("Không tìm thấy user_id trong localStorage");
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle(); // tránh lỗi "Cannot coerce..."

  if (error) {
    console.error("Lỗi lấy profile:", error);
    return null;
  }

  console.log("check Profile", data);
  return data as UserData | null;
}