"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthContext";

export default function AdminDashboard() {
  const router = useRouter();

  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (user?.role !== "admin") {
        router.replace("/employee");
      }
    }
  }, [
    loading,
    isAuthenticated,
    user,
    router,
  ]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">
          Loading...
        </p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Welcome, {user.name}
            </p>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 hover:bg-red-50"
          >
            Logout
          </button>

        </div>

        {/* Dashboard Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <DashboardCard
            title="Products"
            description="Manage products"
            href="/admin/products"
            icon="📦"
          />

          <DashboardCard
            title="Stock"
            description="Monitor branch stock"
            href="/admin/stock"
            icon="🏪"
          />

          <DashboardCard
            title="Sales"
            description="View sales"
            href="/admin/sales"
            icon="💰"
          />

          <DashboardCard
            title="Expenses"
            description="Track expenses"
            href="/admin/expenses"
            icon="🧾"
          />

          <DashboardCard
            title="Reports"
            description="View financial reports"
            href="/admin/reports"
            icon="📊"
          />

          <DashboardCard
            title="Users"
            description="Manage admins & employees"
            href="/admin/users"
            icon="👥"
          />

        </div>

      </div>

    </main>
  );
}

function DashboardCard({
  title,
  description,
  href,
  icon,
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >

      <div className="text-3xl">
        {icon}
      </div>

      <h2 className="mt-4 text-lg font-bold text-[#02337D]">
        {title}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

    </Link>
  );
}