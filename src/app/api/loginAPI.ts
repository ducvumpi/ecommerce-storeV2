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
  // 1. Gọi API profile
  const response = await GetAPI.get("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const profile = response.data;

  // 2. Upsert user vào bảng users
  const { data: userData, error: userError } = await supabase
    .from("users")
    .upsert({
      id: profile.id,          // id từ API escuelajs
      email: profile.email,
      name: profile.name,
      role: profile.role,
      avatar: profile.avatar,
    })
    .select()
    .single();

  if (userError) {
    console.error("Lỗi insert user:", userError);
    return profile;
  }

  // 3. Kiểm tra user đã có cart chưa
  const { data: existingCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userData.id)
    .maybeSingle();
  // localStorage.setItem("user_id", userData.id)

  // 4. Nếu chưa có → tạo cart mới
  if (!existingCart) {
    const { data: newCart, error: cartError } = await supabase
      .from("carts")
      .insert({
        user_id: userData.id,
      })
      .select()
      .single();

    if (cartError) {
      console.error("Lỗi tạo cart:", cartError);
    } else {
      console.log("Cart mới đã tạo:", newCart);
    }
  }

  return profile;
}
export async function getOrCreateCart(userId: string) {
  // Kiểm tra cart đã tồn tại chưa
  let { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();
  // Nếu chưa có → tạo cart mới
  if (!cart) {
    const { data: newCart, error } = await supabase
      .from("carts")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return newCart;
  }

  return cart;
} export async function addToCart(product_id: number, variantId: number, quantity: number) {
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    toast.error("Bạn cần đăng nhập");
    return;
  }

  const cart = await getOrCreateCart(authData.user.id);

  // 1️⃣ Kiểm tra item đã tồn tại chưa
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

  // 2️⃣ Nếu đã tồn tại → CỘNG DỒN
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

  // 3️⃣ Nếu chưa tồn tại → INSERT
  const { error } = await supabase.from("cart_items").insert({
    cart_id: cart.id,
    product_id: product_id,
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
      redirectTo: window.location.origin + "/auth/callback",
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
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error) {
    console.error("Lỗi xóa sản phẩm:", error);
  }
  console.log("check Profile", data)
  console.log("check userId", userId)

  return data as null;
}
