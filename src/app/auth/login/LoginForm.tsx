"use client"
import feather from "feather-icons";
import { useEffect, useState } from "react";
import { LoginData, LoginSchema } from "@/app/api/loginAPI";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useAuthStore } from "@/app/store/isLoggedIn";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/libs/supabaseClient";
import toast from "react-hot-toast";
export default function LoginFormAuth() {
    const { onSubmit } = useAuthStore();
    const router = useRouter()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({
        resolver: yupResolver(LoginSchema),
    });
    const handleLogin = async (data: LoginData) => {
        const success = await onSubmit(data);

        if (success) {
            router.push("/");
        }
    };

    useEffect(() => {
        feather.replace();
    }, []);
    return (
        <div className="bg-gray-50">
            <main className="containerlogin mx-auto px-4 py-20 max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Chào mừng trở lại
                    </h1>

                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            ></label>
                            <Controller
                                name="email"
                                defaultValue=""
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        label="Nhập email của bạn"
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            ></label>
                            <Controller
                                name="password"
                                defaultValue=""
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="password"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        label="Nhập mật khẩu của bạn"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Ghi nhớ
                                </label>
                            </div>

                            <a
                                href="/forgotpassword"
                                className="text-sm text-purple-500 hover:text-purple-700"
                            >
                                Quên mật khẩu?
                            </a>
                        </div>
                        { }
                        <Button
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-lg font-medium hover:opacity-90 transition"
                            type="submit"
                            style={{ color: "white" }}
                        >
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Bạn chưa có tài khoản?
                            <a
                                href="/signup"
                                className="text-purple-500 hover:text-purple-700 font-medium"
                            >
                                Đăng ký
                            </a>
                        </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center mb-4">
                            hoặc tiếp tục với
                        </p>
                        <div className="flex gap-4 justify-center">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                                <i data-feather="facebook" className="text-blue-600"></i>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                                <i data-feather="twitter" className="text-blue-400"></i>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                                <i data-feather="github" className="text-gray-800"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
