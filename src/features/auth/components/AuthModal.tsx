"use client";

import React, { useState } from "react";

export const AuthModal = () => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending email to:", email);
    setStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    console.log("Verifying code:", fullCode);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === "email" ? "Login to Board" : "Enter Verification Code"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {step === "email" 
              ? "Enter your Gmail to receive a one-time password" 
              : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gmail Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Send Code
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
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="h-12 w-12 rounded-lg border border-gray-300 text-center text-xl font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ))}
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 p-3 font-semibold text-white transition-colors hover:bg-green-700"
            >
              Verify & Enter
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-blue-600 hover:underline"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};