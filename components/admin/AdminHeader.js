"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

export default function AdminHeader() {
  const router = useRouter();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">

      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Page Information */}
        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-[#FE7401]">
            Management System
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-700">
            BrightSpark Electricals & Electronics
          </p>

        </div>

        {/* User */}
        <div className="flex items-center gap-4">

          <div className="hidden text-right sm:block">

            <p className="text-sm font-bold text-[#02337D]">
              {user?.name || "Administrator"}
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>

          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#02337D] font-bold text-white">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "A"}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 sm:block"
          >
            Logout
          </button>

        </div>

      </div>

    </header>
  );
}