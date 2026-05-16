"use client";

import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authApi } from "@/features/auth/services/auth.api";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const cookies = new Cookies(null, { path: "/" });
  
  const router = useRouter();
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authApi.sendOtp(email);
      if (res) {
        setOtp(new Array(6).fill(""));
        setStep("otp");
        setTimeout(() => {
          document.getElementById('otp-0')?.focus();
        }, 100);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(email, fullCode);

      // هندل کردن مستقیم پاسخ
      const token = res?.access_token || res?.data?.access_token;
      const user = res?.user || res?.data?.user;

      if (token) {
        // 🌟 ست کردن مستقیم کوکی توسط فرانت‌اَند
        // بدون نوشتن آپشن domain، مرورگر خودکار کوکی را روی دامنه فعلی (چه localhost و چه دامنه Amplify) ست می‌کند
        document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;

        // به روز رسانی استور زاستند
        setLoggedIn(true, user || { email }); 
        
        // هدایت قطعی با متد نیتیو مرورگر برای لود کامل هدرها در میدل‌ور
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setOtp(new Array(6).fill(""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length === 0 && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.charAt(cleanValue.length - 1);
    setOtp(newOtp);

    if (cleanValue && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {step === "email" ? "Login to Board" : "Verify OTP"}
          </h1>
          <p className="mt-3 text-gray-600">
            {step === "email" 
              ? "Enter your email to get started" 
              : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendEmail} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 ml-1">Gmail Address</label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="mt-1 w-full rounded-xl border border-gray-200 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 p-4 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  disabled={isLoading}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="h-14 w-full rounded-xl border border-gray-200 text-center text-2xl font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-green-600 p-4 font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify & Enter"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}