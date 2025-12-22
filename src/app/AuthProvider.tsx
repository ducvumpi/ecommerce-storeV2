"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../app/libs/supabaseClient";
import { UserData } from "./api/loginAPI";
const AuthContext = createContext<UserData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkUser() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false);
        }
        checkUser();

        // Lắng nghe login / logout
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => listener.subscription.unsubscribe();
    }, []);

 if (loading)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#f7f5f2]/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative flex flex-col items-center gap-5 rounded-3xl bg-white/80 px-12 py-10
        shadow-[0_20px_60px_rgba(0,0,0,0.08)]
        backdrop-blur-xl
        animate-[fadeIn_0.35s_ease-out]">

        {/* Spinner tinh tế */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border border-neutral-300/60" />
          <div className="absolute inset-0 rounded-full border border-transparent border-t-neutral-800
            animate-[spin_1.4s_linear_infinite]" />
        </div>

        {/* Text fashion */}
        <p className="text-xs tracking-[0.35em] text-neutral-600 uppercase">
         Vui lòng chờ trong giây lát
        </p>
      </div>
    </div>
  );
    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
