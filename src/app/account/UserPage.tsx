"use client";
import { useEffect, useState } from "react";
import { getProfile, UserData } from "../api/loginAPI";
import { useAuthStore } from "../store/isLoggedIn";
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
// import AccountCircle from "@mui/icons-material/AccountCircle";
import { GetUserProfile } from "../api/loginAPI";
export default function UserPage({ data }: { data: UserData | null }) {
    // const [profile, setProfile] = useState<UserData | null>(null);
    // const [profile, setProfile] = useState<UserData | null>(null);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { isLoggedIn, logout } = useAuthStore();

    // useEffect(() => {
    //   const token = sessionStorage.getItem("access_token");
    //   if (!token) return;

    //   getProfile(token)
    //     .then((data) => {
    //       setProfile(data);
    //       console.log("✅ Profile loaded:", data);
    //     })
    //     .catch((err) => console.error("❌ Lỗi lấy profile:", err));
    // }, []);

    // useEffect(() => {
    //     async function fetchGetUser() {
    //         const data = await GetUserProfile()
    //         setProfile(data)
    //         console.log("ktra data profile", data)
    //     }
    //     fetchGetUser()
    // }, [])

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            {isLoggedIn && data ? (
                <>
                    <IconButton color="inherit" onClick={handleMenuOpen}>
                        <Avatar
                            src={data.avatar || "https://i.imgur.com/DTfowdu.jpg"}
                            alt={data.first_name}
                        />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <Box px={2} py={1}>
                            <Typography variant="subtitle1">{data.first_name} {data.last_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {data.role}
                            </Typography>
                        </Box>
                        <MenuItem
                            component={Link}
                            href="/account"
                            onClick={handleMenuClose}
                        >
                            Trang cá nhân
                        </MenuItem>
                        <MenuItem
                            component={Link}
                            href="/settings"
                            onClick={handleMenuClose}
                        >
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
                // Nếu chưa đăng nhập
                <Box display="flex" gap={2}>
                    <Button
                        color="inherit"
                        component={Link}
                        href="/auth/login"
                        variant="outlined"
                    >
                        Đăng nhập
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        component={Link}
                        href="/register"
                    >
                        Đăng ký
                    </Button>
                </Box>
            )}
        </div>
    );
}
