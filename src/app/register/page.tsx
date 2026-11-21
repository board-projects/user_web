"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/app/components/forms/auth/AuthForm";
import RequestService from "@/services/RequestService";
import Link from "next/link";

const Register = () => {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsSubmitting(true);
    const requestService = new RequestService("/auth/register");
    await requestService.post(data);
    setIsSubmitting(false);
    router.push("/login");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-300 px-4 py-6">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-4 text-black sm:p-6">
        <AuthForm
          id="register"
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          formTitle="Register Form"
          buttonTitle="Register"
        />
        <Link href="/login" className="border rounded-xl p-2 hover:bg">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Register;
