"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { GetUserProfile } from "../api/loginAPI";
import { useAuth } from "../AuthProvider";
import { supabase } from "../libs/supabaseClient";

export default function UserPage() {
  const { user } = useAuth(); // ✅ dùng 1 nguồn auth duy nhất
  const [profile, setProfile] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchGetUser() {
      const data = await GetUserProfile();
      setProfile(data);
      console.log("ktra data profile", data);
    }

    fetchGetUser();
  }, [user]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleMenuClose();
  };

  return (
    <div>
      {!user ? (
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
            href="/auth/register"
          >
            Đăng ký
          </Button>
        </Box>
      ) : (
        <>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar
              src={profile?.avatar || ""}
              alt={profile?.first_name || "User"}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <Box px={2} py={1}>
              <Typography variant="subtitle1">
                {profile?.first_name || "Loading..."}{" "}
                {profile?.last_name || ""}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.role || ""}
              </Typography>
            </Box>

            <MenuItem component={Link} href="/info" onClick={handleMenuClose}>
              Trang cá nhân
            </MenuItem>

            <MenuItem component={Link} href="/orders" onClick={handleMenuClose}>
              Đơn mua
            </MenuItem>

            <MenuItem component={Link} href="/settings" onClick={handleMenuClose}>
              Cài đặt
            </MenuItem>

            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              Đăng xuất
            </MenuItem>
          </Menu>
        </>
      )}
    </div>
  );
}