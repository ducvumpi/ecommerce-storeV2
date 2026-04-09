import { useRef, useEffect, useCallback, useState } from "react";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

export function useCaptcha() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const codeRef = useRef("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const w = canvas.width, h = canvas.height;
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = isDark ? "#2a2a28" : "#fdf8f3";
        ctx.fillRect(0, 0, w, h);

        // Noise lines
        for (let i = 0; i < 6; i++) {
            ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rand(0, w), rand(0, h));
            ctx.lineTo(rand(0, w), rand(0, h));
            ctx.stroke();
        }

        // Noise dots
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
            ctx.fillRect(rand(0, w), rand(0, h), 1.5, 1.5);
        }

        // Generate code
        let code = "";
        for (let i = 0; i < 5; i++) code += CHARS[rand(0, CHARS.length - 1)];
        codeRef.current = code;

        const palette = isDark
            ? ["#9FE1CB", "#AFA9EC", "#F5C4B3", "#FAC775", "#B5D4F4"]
            : ["#185FA5", "#533AB7", "#993C1D", "#3B6D11", "#854F0B"];

        const charW = w / (code.length + 1);
        for (let i = 0; i < code.length; i++) {
            ctx.save();
            ctx.translate(charW * (i + 0.8) + rand(-3, 3), h / 2 + rand(-4, 4));
            ctx.rotate((rand(-18, 18) * Math.PI) / 180);
            ctx.font = `${rand(22, 28)}px monospace`;
            ctx.fillStyle = palette[rand(0, palette.length - 1)];
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(code[i], 0, 0);
            ctx.restore();
        }

        // Wave lines
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, rand(10, h - 10));
            ctx.bezierCurveTo(rand(0, w / 2), rand(0, h), rand(w / 2, w), rand(0, h), w, rand(10, h - 10));
            ctx.stroke();
        }
    }, []);

    useEffect(() => {
        draw();
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener("change", draw);
        return () => mq.removeEventListener("change", draw);
    }, [draw]);

    const refresh = useCallback(() => {
        draw();
        setCaptchaInput("");
        setCaptchaError("");
    }, [draw]);

    const validate = useCallback((): boolean => {
        if (captchaInput.trim().toUpperCase() !== codeRef.current) {
            setCaptchaError("Captcha không đúng, vui lòng thử lại.");
            refresh();
            return false;
        }
        return true;
    }, [captchaInput, refresh]);

    return { canvasRef, captchaInput, setCaptchaInput, captchaError, setCaptchaError, refresh, validate };
}