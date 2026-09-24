"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    /*
      TEMPORARY LOGIN

      This will be replaced by:

      Next.js
          ↓
      Flask REST API
          ↓
      PostgreSQL
    */

    try {
      let user;

      if (
        formData.email === "admin@brightspark.com" &&
        formData.password === "admin123"
      ) {
        user = {
          id: 1,
          name: "BrightSpark Admin",
          email: formData.email,
          role: "admin",
          branch: null,
        };
      } else if (
        formData.email === "employee@brightspark.com" &&
        formData.password === "employee123"
      ) {
        user = {
          id: 2,
          name: "BrightSpark Employee",
          email: formData.email,
          role: "employee",
          branch: "roysambu",
        };
      } else {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      const temporaryToken = "temporary-demo-jwt-token";

      login(temporaryToken, user);

      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/employee");
      }
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">

      <div className="w-full max-w-md">

        {/* Logo / Heading */}
        <div className="mb-8 text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-[#FE7401]">
            BrightSpark Electricals
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#02337D]">
            Staff Login
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Login to access the BrightSpark management
            system.
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              />

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              />

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#02337D] py-3.5 font-semibold text-white transition hover:bg-[#01265C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="mt-6 border-t border-gray-200 pt-5 text-center">

            <Link
              href="/"
              className="text-sm font-semibold text-[#02337D] hover:underline"
            >
              ← Back to BrightSpark
            </Link>

          </div>

        </div>

        {/* Temporary Demo Credentials */}
        <div className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">

          <p className="font-bold">
            Development Login
          </p>

          <p className="mt-2">
            Admin:
            <br />
            admin@brightspark.com / admin123
          </p>

          <p className="mt-2">
            Employee:
            <br />
            employee@brightspark.com / employee123
          </p>

          <p className="mt-3 text-xs">
            These are temporary frontend credentials.
            They will be removed when Flask authentication
            is connected.
          </p>

        </div>

      </div>

    </main>
  );
}