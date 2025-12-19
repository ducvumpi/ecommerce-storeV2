"use client";

import { useEffect, useState } from "react";
import { getProfile, UserData } from "../api/loginAPI";
import { useAuthStore } from "../context/isLoggedIn";
import Link from "next/link";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Box,
} from "@mui/material";

export default function DashboardClient() {
    const [profile, setProfile] = useState<UserData | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { isLoggedIn, logout } = useAuthStore();

    useEffect(() => {
        const token = sessionStorage.getItem("access_token");
        if (!token) return;

        getProfile(token)
            .then((data) => setProfile(data))
            .catch((err) => console.error("❌ Lỗi lấy profile:", err));
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    href="/"
                    sx={{
                        flexGrow: 1,
                        color: "inherit",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}
                >
                    Khoa học & Công nghệ
                </Typography>

                {isLoggedIn && profile ? (
                    <>
                        <IconButton color="inherit" onClick={handleMenuOpen}>
                            <Avatar
                                src={profile.avatar || "https://i.imgur.com/DTfowdu.jpg"}
                                alt={profile.name}
                            />
                        </IconButton>

                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <Box px={2} py={1}>
                                <Typography variant="subtitle1">{profile.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {profile.role}
                                </Typography>
                            </Box>

                            <MenuItem component={Link} href="/account" onClick={handleMenuClose}>
                                Trang cá nhân
                            </MenuItem>
                            <MenuItem component={Link} href="/settings" onClick={handleMenuClose}>
                                Cài đặt
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    logout();
                                    handleMenuClose();
                                }}
                                sx={{ color: "error.main" }}
                            >
                                Đăng xuất
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Box display="flex" gap={2}>
                        <Button color="inherit" component={Link} href="/login" variant="outlined">
                            Đăng nhập
                        </Button>

                        <Button variant="contained" color="secondary" component={Link} href="/register">
                            Đăng ký
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
