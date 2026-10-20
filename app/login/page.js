"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "@/services/authService";
import { saveAuthData } from "@/lib/authStorage";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setLoading(true);

    try {
      const response = await loginUser(
        formData.email,
        formData.password
      );

      saveAuthData({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user,
      });

      if (response.user.role === "admin") {
        router.replace("/admin");
      } else if (response.user.role === "employee") {
        router.replace("/employee");
      } else {
        setError("Your account does not have a valid role.");
      }
    } catch (error) {
      setError(
        error.message ||
        "Unable to sign in. Please check your credentials."
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
                required
                autoComplete="email"
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

              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:text-[#02337D] focus:outline-none"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (

                    /* Eye Off Icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c1.64 0 3.18-.376 4.54-1.045M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5a10.523 10.523 0 0 1-4.293 5.273M6.228 6.228 3 3m3.228 3.228 4.242 4.242m0 0a3 3 0 1 0 4.243 4.243m-4.243-4.243L21 21"
                      />
                    </svg>

                  ) : (

                    /* Eye Icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 4.5 12 4.5c4.478 0 8.268 3.443 9.542 7.5C20.268 16.057 16.478 19.5 12 19.5c-4.477 0-8.268-3.443-9.542-7.5Z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>

                  )}

                </button>

              </div>

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

      </div>

    </main>
  );
}