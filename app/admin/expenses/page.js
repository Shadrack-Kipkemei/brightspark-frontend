"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

const INITIAL_EXPENSES = [
  {
    id: "EXP-001",
    category: "Transport",
    amount: 1200,
    description: "Delivery of electrical items",
    paymentMethod: "Cash",
    expenseDate: "2026-10-04",
    branch: "Roysambu",
    employeeName: "John Employee",
  },
  {
    id: "EXP-002",
    category: "Stationery",
    amount: 650,
    description: "Purchase of receipt books",
    paymentMethod: "M-Pesa",
    expenseDate: "2026-10-04",
    branch: "Roysambu",
    employeeName: "John Employee",
  },
  {
    id: "EXP-003",
    category: "Electricity",
    amount: 4500,
    description: "Monthly electricity bill",
    paymentMethod: "M-Pesa",
    expenseDate: "2026-10-03",
    branch: "Rangau",
    employeeName: "Jane Employee",
  },
  {
    id: "EXP-004",
    category: "Packaging",
    amount: 1800,
    description: "Shopping bags and packaging materials",
    paymentMethod: "Cash",
    expenseDate: "2026-10-02",
    branch: "Roysambu",
    employeeName: "John Employee",
  },
];

const CATEGORIES = [
  "Rent",
  "Electricity",
  "Water",
  "Internet",
  "Transport",
  "Delivery",
  "Salaries/Wages",
  "Repairs & Maintenance",
  "Stationery",
  "Packaging",
  "Advertising/Marketing",
  "Bank/M-Pesa Charges",
  "Licenses/Permits",
  "Security",
  "Cleaning",
  "Other",
];

export default function AdminExpensesPage() {
  const router = useRouter();

  const { user, loading, isAuthenticated } = useAuth();

  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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
  }, [loading, isAuthenticated, user, router]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        expense.description.toLowerCase().includes(searchText) ||
        expense.category.toLowerCase().includes(searchText) ||
        expense.employeeName.toLowerCase().includes(searchText) ||
        expense.id.toLowerCase().includes(searchText);

      const matchesBranch =
        branchFilter === "All" || expense.branch === branchFilter;

      const matchesCategory =
        categoryFilter === "All" || expense.category === categoryFilter;

      const matchesDateFrom =
        !dateFrom || expense.expenseDate >= dateFrom;

      const matchesDateTo =
        !dateTo || expense.expenseDate <= dateTo;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesCategory &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    expenses,
    search,
    branchFilter,
    categoryFilter,
    dateFrom,
    dateTo,
  ]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );
  }, [filteredExpenses]);

  const roysambuTotal = useMemo(() => {
    return expenses
      .filter((expense) => expense.branch === "Roysambu")
      .reduce((total, expense) => total + Number(expense.amount), 0);
  }, [expenses]);

  const rangauTotal = useMemo(() => {
    return expenses
      .filter((expense) => expense.branch === "Rangau")
      .reduce((total, expense) => total + Number(expense.amount), 0);
  }, [expenses]);

  const handleDelete = (expense) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete expense ${expense.id}?\n\n` +
        `${expense.category} - KSh ${Number(
          expense.amount
        ).toLocaleString()}\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setExpenses((previous) =>
      previous.filter((item) => item.id !== expense.id)
    );
  };

  const clearFilters = () => {
    setSearch("");
    setBranchFilter("All");
    setCategoryFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#02337D] text-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button
            onClick={() => router.push("/admin")}
            className="mb-3 text-sm text-blue-100 hover:text-white"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Expense Management</h1>

              <p className="mt-1 text-sm text-blue-100">
                View and manage expenses across BrightSpark branches.
              </p>
            </div>

            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="text-xs text-blue-100">Total Recorded</p>
              <p className="text-xl font-bold">
                KSh {expenses.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Filtered Expenses"
            value={`KSh ${totalExpenses.toLocaleString()}`}
          />

          <SummaryCard
            title="Roysambu"
            value={`KSh ${roysambuTotal.toLocaleString()}`}
          />

          <SummaryCard
            title="Rangau"
            value={`KSh ${rangauTotal.toLocaleString()}`}
          />

          <SummaryCard
            title="Records"
            value={filteredExpenses.length}
          />
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Filters
              </h2>

              <p className="text-sm text-slate-500">
                Filter expenses by branch, category, employee or date.
              </p>
            </div>

            <button
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expenses..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#FE7401]"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Branch
              </label>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#FE7401]"
              >
                <option value="All">All Branches</option>
                <option value="Roysambu">Roysambu</option>
                <option value="Rangau">Rangau</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#FE7401]"
              >
                <option value="All">All Categories</option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* From */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                From
              </label>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#FE7401]"
              />
            </div>

            {/* To */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                To
              </label>

              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#FE7401]"
              />
            </div>
          </div>
        </section>

        {/* Expense Table */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Expense Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredExpenses.length} expense record
              {filteredExpenses.length !== 1 ? "s" : ""} found.
            </p>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-slate-500">
                No expenses match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Branch
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#02337D]">
                        {expense.id}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {expense.expenseDate}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            expense.branch === "Roysambu"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {expense.branch}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {expense.category}
                      </td>

                      <td className="max-w-[280px] px-6 py-4 text-sm text-slate-600">
                        {expense.description}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {expense.employeeName}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {expense.paymentMethod}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                        KSh {Number(expense.amount).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(expense)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="border-t border-slate-200 bg-slate-50">
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-5 text-right font-bold text-slate-700"
                    >
                      Filtered Total
                    </td>

                    <td className="px-6 py-5 text-right text-lg font-bold text-[#02337D]">
                      KSh {totalExpenses.toLocaleString()}
                    </td>

                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-[#02337D]">
        {value}
      </p>
    </div>
  );
}