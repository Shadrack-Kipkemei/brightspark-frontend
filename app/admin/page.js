"use client";

import { useAuth } from "@/components/auth/AuthContext";

const summaryCards = [
  {
    title: "Total Sales",
    value: "KSh 485,000",
    description: "This month",
    icon: "💰",
  },
  {
    title: "Gross Income",
    value: "KSh 152,000",
    description: "After cost of goods",
    icon: "📈",
  },
  {
    title: "Total Expenses",
    value: "KSh 42,000",
    description: "This month",
    icon: "🧾",
  },
  {
    title: "Net Profit",
    value: "KSh 110,000",
    description: "After expenses",
    icon: "💵",
  },
  {
    title: "Tithe",
    value: "KSh 11,000",
    description: "10% of net profit",
    icon: "🙏",
  },
];

const recentSales = [
  {
    id: "BS-001",
    product: "LED Bulb 12W",
    branch: "Roysambu",
    quantity: 5,
    amount: 1750,
  },
  {
    id: "BS-002",
    product: "Phone Charger",
    branch: "Rangau",
    quantity: 2,
    amount: 1600,
  },
  {
    id: "BS-003",
    product: "Bluetooth Speaker",
    branch: "Roysambu",
    quantity: 1,
    amount: 3500,
  },
  {
    id: "BS-004",
    product: "Electrical Socket",
    branch: "Rangau",
    quantity: 10,
    amount: 4500,
  },
];

const lowStockProducts = [
  {
    name: "Bluetooth Speaker",
    branch: "Roysambu",
    stock: 3,
    minimum: 5,
  },
  {
    name: "Rechargeable Emergency Lamp",
    branch: "Rangau",
    stock: 2,
    minimum: 5,
  },
  {
    name: "Digital Multimeter",
    branch: "Roysambu",
    stock: 4,
    minimum: 5,
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* Welcome */}
        <div className="mb-8">

          <p className="text-sm font-semibold text-[#FE7401]">
            Dashboard Overview
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
            Welcome back, {user?.name || "Administrator"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Here's what's happening at BrightSpark
            Electricals & Electronics.
          </p>

        </div>

        {/* Summary Cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#02337D]">
                    {card.value}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                  {card.icon}
                </div>

              </div>

              <p className="mt-3 text-xs text-gray-500">
                {card.description}
              </p>

            </div>
          ))}

        </div>

        {/* Branch Overview */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">

          <BranchCard
            name="Roysambu Branch"
            location="Lumumba Drive"
            sales="KSh 295,000"
            products="245"
            lowStock="8"
          />

          <BranchCard
            name="Rangau Branch"
            location="Rangau"
            sales="KSh 190,000"
            products="173"
            lowStock="5"
          />

        </div>

        {/* Sales + Low Stock */}
        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_400px]">

          {/* Recent Sales */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-200 p-5">

              <div>

                <h2 className="font-bold text-[#02337D]">
                  Recent Sales
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Latest recorded sales
                </p>

              </div>

              <a
                href="/admin/sales"
                className="text-sm font-semibold text-[#FE7401] hover:underline"
              >
                View all
              </a>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px]">

                <thead>

                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">

                    <th className="px-5 py-4">
                      Sale
                    </th>

                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      Branch
                    </th>

                    <th className="px-5 py-4">
                      Qty
                    </th>

                    <th className="px-5 py-4 text-right">
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-100 last:border-0"
                    >

                      <td className="px-5 py-4 text-sm font-semibold text-[#02337D]">
                        {sale.id}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {sale.product}
                      </td>

                      <td className="px-5 py-4">

                        <BranchBadge
                          branch={sale.branch}
                        />

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {sale.quantity}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-gray-800">
                        KSh {sale.amount.toLocaleString()}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>

          {/* Low Stock */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-200 p-5">

              <h2 className="font-bold text-[#02337D]">
                Low Stock Alert
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Products requiring attention
              </p>

            </div>

            <div className="divide-y divide-gray-100">

              {lowStockProducts.map((product) => (
                <div
                  key={`${product.name}-${product.branch}`}
                  className="flex items-center justify-between gap-4 p-5"
                >

                  <div>

                    <p className="text-sm font-semibold text-gray-800">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {product.branch}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="font-bold text-red-600">
                      {product.stock} left
                    </p>

                    <p className="text-xs text-gray-400">
                      Minimum {product.minimum}
                    </p>

                  </div>

                </div>
              ))}

            </div>

            <div className="border-t border-gray-100 p-5">

              <a
                href="/admin/stock"
                className="block text-center text-sm font-semibold text-[#FE7401] hover:underline"
              >
                View stock →
              </a>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}

function BranchCard({
  name,
  location,
  sales,
  products,
  lowStock,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="font-bold text-[#02337D]">
            {name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {location}
          </p>

        </div>

        <div className="rounded-xl bg-[#02337D]/10 px-3 py-2 text-xl">
          🏪
        </div>

      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">

        <div>

          <p className="text-xs text-gray-500">
            Sales
          </p>

          <p className="mt-1 text-sm font-bold text-gray-800">
            {sales}
          </p>

        </div>

        <div>

          <p className="text-xs text-gray-500">
            Products
          </p>

          <p className="mt-1 text-sm font-bold text-gray-800">
            {products}
          </p>

        </div>

        <div>

          <p className="text-xs text-gray-500">
            Low Stock
          </p>

          <p className="mt-1 text-sm font-bold text-red-600">
            {lowStock}
          </p>

        </div>

      </div>

    </div>
  );
}

function BranchBadge({ branch }) {
  const isRoysambu = branch === "Roysambu";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isRoysambu
          ? "bg-blue-50 text-[#02337D]"
          : "bg-orange-50 text-[#FE7401]"
      }`}
    >
      {branch}
    </span>
  );
}