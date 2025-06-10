"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        console.log("Login successful. Response data:", data);
        console.log("Attempting to redirect to /admin...");
        router.push("/admin");
      } else {
        console.error("Login failed. Status:", res.status, "Error:", data.error);
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      alert("An error occurred during login");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Admin Login</h1>
      <input
        className="border p-2 w-full mb-4"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-black text-white px-4 py-2 w-full mb-4 cursor-pointer"
        onClick={handleLogin}
      >
        Login
      </button>
      <div className="text-center">
        <button
          onClick={() => router.push("/forgot-password")}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}
