"use client";

import { useEffect, useState } from "react";
import {
  CircularProgress,
  Box,
  Typography,
  Avatar,
  Button,
  Fade,
} from "@mui/material";
import { useAuth } from "@/app/AuthProvider";
import { supabase } from "@/app/libs/supabaseClient";
import { getProfile, UserData } from "@/app/api/loginAPI";

export default function Dashboard() {
  const { user } = useAuth(); // ✅ chỉ dùng Supabase session
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    getProfile(user.id) // 👈 truyền user.id nếu API cần
      .then((data) => setProfile(data))
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
      <Fade in={loading} timeout={300} unmountOnExit>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: 0.8,
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Đang tải thông tin...
          </Typography>
        </Box>
      </Fade>

      <Fade in={!loading} timeout={300}>
        <Box
          sx={{
            display: loading ? "none" : "flex",
            alignItems: "center",
            gap: 2,
            p: 3,
            borderRadius: 3,
            boxShadow: 2,
            backgroundColor: "#fff",
          }}
        >
          {user && profile ? (
            <>
              <Avatar alt={profile.name} src="/avatar.png" />
              <Typography variant="h6">{profile.name}</Typography>
              <Button
                onClick={handleLogout}
                variant="outlined"
                color="error"
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button href="/auth/login" variant="contained">
              Đăng nhập
            </Button>
          )}
        </Box>
      </Fade>
    </Box>
  );
}