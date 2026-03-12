"use client";

import { LoginData, SignupForm } from "../api/loginAPI";
import toast from "react-hot-toast";
import { persist } from "zustand/middleware";
import { create } from "zustand";
import { supabase } from "../libs/supabaseClient";

interface AuthContextType {
  isLoggedIn: boolean;
  hasHydrated: boolean;

  email: string;
  password: string;

  setIsLoggedIn: (value: boolean) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;

  onSubmit: (data: LoginData) => Promise<boolean>;
  onSignUp: (data: SignupForm) => Promise<void>;
  logout: () => Promise<void>;

  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthContextType>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      hasHydrated: false,

      email: "",
      password: "",

      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
      setEmail: (value) => set({ email: value }),
      setPassword: (value) => set({ password: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),

      // ================= LOGIN =================
      onSubmit: async (data: LoginData) => {
        const { email, password } = data;

        const { data: loginData, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          toast.error(error.message);
          return false;
        }

        const user = loginData.user;

        if (!user?.email_confirmed_at) {
          toast.error("Email chưa xác thực!");
          return false;
        }

        if (!loginData.session) {
          toast.error("Không có session!");
          return false;
        }

        // ❌ KHÔNG cần isLoggedIn nữa nếu bạn dùng SSR
        // set({ isLoggedIn: true });

        localStorage.setItem("user_id", user.id);

        toast.success("Đăng nhập thành công!");
        return true; // 🔥 QUAN TRỌNG
      },

      // ================= SIGNUP =================
      onSignUp: async (values: SignupForm) => {
        if (values.password !== values.confirmPassword) {
          toast.error("Mật khẩu không khớp!");
          return;
        }

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

      // ================= LOGOUT =================
      logout: async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("user_id");
        set({ isLoggedIn: false });
        toast("Đã đăng xuất");
      },
    }),

    {
      name: "auth-storage",

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);