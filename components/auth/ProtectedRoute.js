"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const router = useRouter();

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      if (user.role === "employee") {
        router.replace("/employee");
      } else if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/login");
      }
    }
  }, [
    loading,
    isAuthenticated,
    user,
    allowedRoles,
    router,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#02337D]" />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }

  return children;
}