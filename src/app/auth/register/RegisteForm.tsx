"use client";
import { useEffect } from "react";
import feather from "feather-icons";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { SignupForm, SignUpSchema } from "../../api/loginAPI";
import { Button, TextField } from "@mui/material";
import { useAuthStore } from "@/app/store/isLoggedIn"
import { useRouter } from "next/navigation";
export default function RegisterForm() {
    const router = useRouter()

    const { onSignUp } = useAuthStore()
    useEffect(() => {
        feather.replace(); // <- quan trọng
    }, []);
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupForm>({
        resolver: yupResolver(SignUpSchema),
    });
    const handleSignUp = async (data: SignupForm) => {
        await onSignUp(data)
        router.push("/auth/login");

    }
    return (
        <div className="bg-gray-50">
            <main className="containersignup mx-auto px-4 py-20 max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Đăng ký tài khoản
                    </h1>

                    <form className="space-y-6" onSubmit={handleSubmit(handleSignUp)} >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                {/* <label
                  htmlFor="first-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Họ
                </label> */}
                                <Controller
                                    name="firstName"
                                    defaultValue=""
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            label="Nhập Họ của bạn"
                                            error={!!errors.firstName}
                                            helperText={errors.firstName?.message}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                {/* <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên
                </label> */}
                                <Controller
                                    name="lastName"
                                    defaultValue=""
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            label="Nhập Tên của bạn"
                                            error={!!errors.lastName}
                                            helperText={errors.lastName?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div>
                            {/* <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label> */}
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
                            {/* <label
                htmlFor="Mật khẩu"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label> */}
                            <Controller
                                name="password"
                                defaultValue=""
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="password"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        label="Nhập mật khẩu"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            {/* <label
                htmlFor="Xác nhận "
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label> */}
                            <Controller
                                name="confirmPassword"
                                defaultValue=""
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="password"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        label="Xác nhận mật khẩu"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                )}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="terms"
                                type="checkbox"
                                className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="terms"
                                className="ml-2 block text-sm text-gray-700"
                            >
                                Tôi đồng ý với các{" "}
                                <a
                                    href="/terms.html"
                                    className="text-purple-500 hover:text-purple-700"
                                >
                                    Điều khoản
                                </a>{" "}
                                và{" "}
                                <a
                                    href="/privacy.html"
                                    className="text-purple-500 hover:text-purple-700"
                                >
                                    Chính sách bảo mật
                                </a>
                            </label>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-lg font-medium hover:opacity-90 transition"
                            type="submit"
                            style={{ color: "white" }}
                        >
                            Đăng ký tài khoản
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Bạn đã có tài khoản?
                            <a
                                href="/login.html"
                                className="text-purple-500 hover:text-purple-700 font-medium"
                            >
                                Đăng nhập
                            </a>
                        </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center mb-4">
                            Hoặc đăng nhập với
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
