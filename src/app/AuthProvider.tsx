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

    if (loading) return <div>Loading...</div>; // tránh render nháy

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
