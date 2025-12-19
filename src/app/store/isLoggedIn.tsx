"use client";
// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
import { LoginData, SignupForm } from "../api/loginAPI";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { persist } from "zustand/middleware";
import { create } from "zustand";
import { supabase } from "../libs/supabaseClient"
import { useRouter } from "next/router";
interface AuthContextType {
  logout: () => void;
  onSubmit: (data: LoginData) => Promise<void>;
  onSignUp: (data: SignupForm) => Promise<void>;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
}
// const router = useRouter()

export const useAuthStore = create<AuthContextType>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      email: "",
      password: "",
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
      setEmail: (value) => set({ email: value }),
      setPassword: (value) => set({ password: value }),
      // onSubmit: async ({ email, password }: LoginData) => {
      //   const result = await loginUser({ email, password });
      //   if (result) {
      //     sessionStorage.setItem("access_token", result);
      //     set({ isLoggedIn: true });
      //     toast.success("Đăng nhập thành công");
      //   } else {
      //     toast.error("Tài khoản hoặc mật khẩu không đúng");
      //   }
      //   console.log("result", result)
      // },
      onSubmit: async (data: LoginData) => {
        const { email, password } = data;

        const { data: loginData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        const user = loginData.user;
        if (!user?.email_confirmed_at) {
          toast.error("Email chưa xác thực! Vui lòng kiểm tra hộp thư.");
          return;
        }
        if (error) {
          toast.error(error.message);
          return;
        }
        if (!loginData.session) {
          toast.error("Không có session!");
          return;
        }
        const token = loginData.session.access_token;
        sessionStorage.setItem("access_token", token);
        set({ isLoggedIn: true });

        // Lấy profile
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileErr) {
          toast.error("Không thể lấy thông tin user!");
          return;
        }
        localStorage.setItem("user_id", user.id)
        console.log("check user", user.id)



        // 3. Kiểm tra user đã có cart chưa
        const { data: existingCart } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        // localStorage.setItem("user_id", userData.id)

        // 4. Nếu chưa có → tạo cart mới
        if (!existingCart) {
          const { data: newCart, error: cartError } = await supabase
            .from("carts")
            .insert({
              user_id: user.id,
            })
            .select()
            .single();

          if (cartError) {
            console.error("Lỗi tạo cart:", cartError);
          } else {
            console.log("Cart mới đã tạo:", newCart);
          }
        }
        toast.success("Đăng nhập thành công!");
      },


      onSignUp: async (values: SignupForm) => {
        if (values.password !== values.confirmPassword) {
          toast.error("Mật khẩu không khớp!");
          return;
        }

        // 1️⃣ Signup Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        const userId = data.user?.id;
        if (!userId) {
          toast.error("Không tạo được user!");
          return;
        }

        // 2️⃣ Insert vào bảng profiles
        const { error: profileErr } = await supabase.from("profiles").insert({
          id: userId,
          email: values.email,
          first_name: values.firstName,
          last_name: values.lastName,
        });

        if (profileErr) {
          toast.error(profileErr.message);
          return;
        }

        toast.success("Đăng ký thành công!");
      },
      logout() {
        set({ isLoggedIn: false });
        localStorage.removeItem("user_id")
        toast.error("Tài khoản đã đăng xuất");

      },
    }),

    {
      name: "auth_context",
    }

  )
);
// const AuthContext = createContext<AuthContextType | null>(null);
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
//   const router = useRouter();

//   useEffect(() => {
//     const stored = localStorage.getItem("isLoggedIn");
//     if (stored === "true") {
//       setIsLoggedIn(true);
//     }
//   }, []);
//   const onSubmit = async (data: LoginData) => {
//     const result = await loginUser(data.email, data.password);
//     if (result.access_token) {
//       sessionStorage.setItem("access_token", result.access_token);
//       localStorage.setItem("isLoggedIn", "true");
//       setIsLoggedIn(true);
//       router.push("/account");
//       toast.success("Đăng nhập thành công");
//     } else {
//       toast.error("Tài Khoản hoặc mật khẩu không đúng");
//     }
//   };
//   const logout = () => {
//     setIsLoggedIn(false);
//     localStorage.removeItem("isLoggedIn");
//     sessionStorage.removeItem("access_token");
//     router.push("/");
//     toast.error("Đã đăng xuất tài khoản");
//   };
//   return (
//     <AuthContext.Provider
//       value={{ isLoggedIn, setIsLoggedIn, onSubmit, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error();
//   return context;
// }
