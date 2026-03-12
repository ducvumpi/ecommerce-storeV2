"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../app/libs/supabaseClient";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!mounted) return;

            setUser(session?.user ?? null);
            setLoading(false);
        };

        initAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false); // 🔥 đảm bảo loading tắt luôn
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // ⚡ Chỉ block UI khi load lần đầu
    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#f7f5f2]/70 backdrop-blur-sm" />
                <div className="relative flex flex-col items-center gap-5 rounded-3xl bg-white/80 px-12 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border border-neutral-300/60" />
                        <div className="absolute inset-0 rounded-full border border-transparent border-t-neutral-800 animate-spin" />
                    </div>
                    <p className="text-xs tracking-[0.35em] text-neutral-600 uppercase">
                        Vui lòng chờ trong giây lát
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}