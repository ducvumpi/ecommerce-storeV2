import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/app/libs/supabaseClient";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Lưu token vào cookie server
    cookies().set("access_token", data.session?.access_token!, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
    });

    return NextResponse.json({ user: data.user });
}
