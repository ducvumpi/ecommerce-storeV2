"use client";
import { useEffect, useState, useRef } from "react";
import { getProfile, UserData } from "../api/loginAPI";
import { useAuthStore } from "../context/isLoggedIn";
import {
  CircularProgress,
  Box,
  Typography,
  Avatar,
  Button,
  Fade,
} from "@mui/material";

export default function Dashboard() {
  const { isLoggedIn, setIsLoggedIn, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const isInit = useRef(true);

  useEffect(() => {
    if (isInit.current) {
      isInit.current = false;
      const token = sessionStorage.getItem("access_token");
      if (token) {
        getProfile(token)
          .then((data) => {
            setProfile(data);
            setIsLoggedIn(true);
          })
          .catch(() => setIsLoggedIn(false))
          .finally(() => setTimeout(() => setLoading(false), 0)); // ⏱ delay nhẹ để mượt hơn
      } else {
        setTimeout(() => setLoading(false), 0);
      }
    }
  }, [setIsLoggedIn]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
      }}
    >
      {/* ⏳ Hiệu ứng fade mờ cho spinner */}
      <Fade in={loading} timeout={600} unmountOnExit>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: 0.8,
          }}
        >
          <CircularProgress size={60} thickness={4} color="primary" />
          <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
            Đang tải thông tin...
          </Typography>
        </Box>
      </Fade>

      {/* ✨ Hiệu ứng fade-in cho nội dung chính */}
      <Fade in={!loading} timeout={800}>
        <Box
          sx={{
            display: loading ? "none" : "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "80%",
            maxWidth: 800,
            p: 3,
            borderRadius: 3,
            boxShadow: 2,
            backgroundColor: "#fff",
          }}
        >
          {isLoggedIn && profile ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar alt={profile.name} src="/avatar.png" />
              <Typography variant="h6">{profile.name}</Typography>
              <Button
                onClick={logout}
                variant="outlined"
                color="error"
                sx={{ textTransform: "none" }}
              >
                Đăng xuất
              </Button>
            </Box>
          ) : (
            <Button
              href="/login"
              variant="contained"
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Đăng nhập
            </Button>
          )}
        </Box>
      </Fade>
    </Box>
  );
}
