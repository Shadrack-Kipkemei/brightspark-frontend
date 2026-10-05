"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

const EXPENSE_CATEGORIES = [
  "Rent",
  "Electricity",
  "Water",
  "Lunch",
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

const PAYMENT_METHODS = ["Cash", "M-Pesa"];

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
];

export default function EmployeeExpensesPage() {
  const router = useRouter();

  const { user, loading, isAuthenticated } = useAuth();

  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  const [form, setForm] = useState({
    category: "",
    amount: "",
    description: "",
    paymentMethod: "Cash",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const branchName =
    user?.branch === "rangau"
      ? "Rangau"
      : user?.branch === "roysambu"
        ? "Roysambu"
        : user?.branch || "Roysambu";

  const employeeName = user?.name || "Employee";

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (user?.role !== "employee") {
        router.replace("/admin");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const branchExpenses = useMemo(() => {
    return expenses.filter((expense) => expense.branch === branchName);
  }, [expenses, branchName]);

  const todayTotal = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return branchExpenses
      .filter((expense) => expense.expenseDate === today)
      .reduce((total, expense) => total + Number(expense.amount), 0);
  }, [branchExpenses]);

  const totalExpenses = useMemo(() => {
    return branchExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );
  }, [branchExpenses]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.category) {
      setError("Please select an expense category.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please provide a description.");
      return;
    }

    if (!form.expenseDate) {
      setError("Please select the expense date.");
      return;
    }

    setSubmitting(true);

    try {
      // Temporary frontend implementation.
      // This will later be replaced with:
      // POST /api/expenses

      const newExpense = {
        id: `EXP-${Date.now()}`,
        category: form.category,
        amount: Number(form.amount),
        description: form.description.trim(),
        paymentMethod: form.paymentMethod,
        expenseDate: form.expenseDate,
        branch: branchName,
        employeeName,
      };

      setExpenses((previous) => [newExpense, ...previous]);

      setForm({
        category: "",
        amount: "",
        description: "",
        paymentMethod: "Cash",
        expenseDate: new Date().toISOString().split("T")[0],
      });

      setMessage("Expense recorded successfully.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while recording the expense.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isAuthenticated || user?.role !== "employee") {
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                onClick={() => router.push("/employee")}
                className="mb-3 text-sm text-blue-100 hover:text-white"
              >
                ← Back to Dashboard
              </button>

              <h1 className="text-2xl font-bold">Expenses</h1>

              <p className="mt-1 text-sm text-blue-100">
                Record and manage expenses for {branchName}
              </p>
            </div>

            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="text-xs text-blue-100">Branch</p>
              <p className="font-semibold">{branchName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Today's Expenses"
            value={`KSh ${todayTotal.toLocaleString()}`}
          />

          <SummaryCard
            title="Branch Expenses"
            value={`KSh ${totalExpenses.toLocaleString()}`}
          />

          <SummaryCard
            title="Recorded Expenses"
            value={branchExpenses.length}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          {/* Expense Form */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Record Expense
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the details of the expense.
              </p>
            </div>

            {message && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Branch */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Branch
                </label>

                <input
                  type="text"
                  value={branchName}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Expense Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#FE7401]"
                >
                  <option value="">Select category</option>

                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount (KSh)
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Explain what the expense was for..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
                />
              </div>

              {/* Payment */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          paymentMethod: method,
                        }))
                      }
                      className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        form.paymentMethod === method
                          ? "border-[#FE7401] bg-orange-50 text-[#FE7401]"
                          : "border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Expense Date
                </label>

                <input
                  type="date"
                  name="expenseDate"
                  value={form.expenseDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#FE7401] px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Recording..." : "Record Expense"}
              </button>
            </form>
          </section>

          {/* Recent Expenses */}
          <section className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Expenses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Expenses recorded for {branchName}
              </p>
            </div>

            {branchExpenses.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                No expenses recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                        Description
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                        Payment
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {branchExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {expense.expenseDate}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {expense.category}
                        </td>

                        <td className="max-w-[280px] px-6 py-4 text-sm text-slate-600">
                          {expense.description}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {expense.paymentMethod}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                          KSh {Number(expense.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-[#02337D]">{value}</p>
    </div>
  );
}