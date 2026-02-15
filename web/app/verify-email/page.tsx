"use client";

import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("Missing token");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setStatus("Email verified successfully 🎉");
      })
      .catch(() => setStatus("Invalid or expired link"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-lg">{status}</div>
    </div>
  );
}
