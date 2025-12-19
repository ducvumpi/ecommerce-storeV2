"use client";

import { useState, useEffect } from "react";
import { supabase } from "../libs/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Navbar123() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function loadUser() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);    // ✔ OK
        }
        loadUser();
    }, []);

    return (
        <>
            {user ? <button>Đăng xuất</button> : <button>Đăng nhập</button>}
        </>
    );
}
