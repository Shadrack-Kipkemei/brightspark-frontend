"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: "📦",
  },
  {
    name: "Stock",
    href: "/admin/stock",
    icon: "🏪",
  },
  {
    name: "Sales",
    href: "/admin/sales",
    icon: "💰",
  },
  {
    name: "Expenses",
    href: "/admin/expenses",
    icon: "🧾",
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: "📈",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: "👥",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">

      <div className="sticky top-0 flex h-screen flex-col">

        {/* Logo */}
        <div className="border-b border-gray-200 px-6 py-5">

          <Link href="/admin">

            <p className="text-lg font-bold text-[#02337D]">
              BrightSpark
            </p>

            <p className="text-xs font-medium text-[#FE7401]">
              Admin Panel
            </p>

          </Link>

        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">

          {menuItems.map((item) => {

            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#02337D] text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#02337D]"
                }`}
              >

                <span className="text-lg">
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>

              </Link>
            );
          })}

        </nav>

        {/* Branches */}
        <div className="border-t border-gray-200 p-4">

          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            Branches
          </p>

          <div className="space-y-2">

            <div className="rounded-lg bg-blue-50 px-3 py-2">

              <p className="text-xs font-semibold text-[#02337D]">
                Roysambu Branch
              </p>

              <p className="text-xs text-gray-500">
                Lumumba Drive
              </p>

            </div>

            <div className="rounded-lg bg-orange-50 px-3 py-2">

              <p className="text-xs font-semibold text-[#FE7401]">
                Rongai Branch
              </p>

              <p className="text-xs text-gray-500">
                Rangau
              </p>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}