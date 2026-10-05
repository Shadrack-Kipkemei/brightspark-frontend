"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

const INITIAL_SALES = [
  {
    id: "SALE-001",
    branch: "Roysambu",
    employee: "John Employee",
    date: "2026-10-05",
    total: 12500,
    cost: 8500,
    status: "COMPLETED",
  },
  {
    id: "SALE-002",
    branch: "Roysambu",
    employee: "John Employee",
    date: "2026-10-05",
    total: 8500,
    cost: 5600,
    status: "COMPLETED",
  },
  {
    id: "SALE-003",
    branch: "Rangau",
    employee: "Jane Employee",
    date: "2026-10-05",
    total: 22000,
    cost: 14500,
    status: "COMPLETED",
  },
  {
    id: "SALE-004",
    branch: "Rangau",
    employee: "Jane Employee",
    date: "2026-10-04",
    total: 7500,
    cost: 4800,
    status: "COMPLETED",
  },
  {
    id: "SALE-005",
    branch: "Roysambu",
    employee: "John Employee",
    date: "2026-10-04",
    total: 15000,
    cost: 9300,
    status: "COMPLETED",
  },
];

const INITIAL_EXPENSES = [
  {
    id: "EXP-001",
    branch: "Roysambu",
    category: "Transport",
    amount: 1200,
    date: "2026-10-05",
  },
  {
    id: "EXP-002",
    branch: "Roysambu",
    category: "Stationery",
    amount: 650,
    date: "2026-10-05",
  },
  {
    id: "EXP-003",
    branch: "Rangau",
    category: "Electricity",
    amount: 4500,
    date: "2026-10-05",
  },
  {
    id: "EXP-004",
    branch: "Rangau",
    category: "Transport",
    amount: 1500,
    date: "2026-10-04",
  },
  {
    id: "EXP-005",
    branch: "Roysambu",
    category: "Packaging",
    amount: 1800,
    date: "2026-10-04",
  },
];

const INITIAL_REFUNDS = [
  {
    id: "REF-001",
    branch: "Roysambu",
    amount: 1000,
    date: "2026-10-04",
    status: "COMPLETED",
  },
];

export default function AdminReportsPage() {
  const router = useRouter();

  const { user, loading, isAuthenticated } = useAuth();

  const [sales] = useState(INITIAL_SALES);
  const [expenses] = useState(INITIAL_EXPENSES);
  const [refunds] = useState(INITIAL_REFUNDS);

  const [branchFilter, setBranchFilter] = useState("All");

  const [reportType, setReportType] = useState("monthly");

  const [dateFrom, setDateFrom] = useState("2026-10-01");
  const [dateTo, setDateTo] = useState("2026-10-31");

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

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesBranch =
        branchFilter === "All" || sale.branch === branchFilter;

      const matchesDate =
        sale.date >= dateFrom && sale.date <= dateTo;

      const validSale = sale.status === "COMPLETED";

      return matchesBranch && matchesDate && validSale;
    });
  }, [sales, branchFilter, dateFrom, dateTo]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesBranch =
        branchFilter === "All" ||
        expense.branch === branchFilter;

      const matchesDate =
        expense.date >= dateFrom && expense.date <= dateTo;

      return matchesBranch && matchesDate;
    });
  }, [expenses, branchFilter, dateFrom, dateTo]);

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      const matchesBranch =
        branchFilter === "All" ||
        refund.branch === branchFilter;

      const matchesDate =
        refund.date >= dateFrom && refund.date <= dateTo;

      return (
        matchesBranch &&
        matchesDate &&
        refund.status === "COMPLETED"
      );
    });
  }, [refunds, branchFilter, dateFrom, dateTo]);

  /*
   * TOTAL SALES
   *
   * Refunds are deducted from sales revenue.
   */
  const totalSales = useMemo(() => {
    const salesTotal = filteredSales.reduce(
      (total, sale) => total + Number(sale.total),
      0
    );

    const refundTotal = filteredRefunds.reduce(
      (total, refund) => total + Number(refund.amount),
      0
    );

    return salesTotal - refundTotal;
  }, [filteredSales, filteredRefunds]);

  /*
   * COGS
   */
  const totalCOGS = useMemo(() => {
    return filteredSales.reduce(
      (total, sale) => total + Number(sale.cost),
      0
    );
  }, [filteredSales]);

  /*
   * GROSS PROFIT
   */
  const grossProfit = useMemo(() => {
    return totalSales - totalCOGS;
  }, [totalSales, totalCOGS]);

  /*
   * EXPENSES
   */
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );
  }, [filteredExpenses]);

  /*
   * NET PROFIT
   */
  const netProfit = useMemo(() => {
    return grossProfit - totalExpenses;
  }, [grossProfit, totalExpenses]);

  /*
   * TITHE
   *
   * No tithe when there is no profit.
   */
  const tithe = useMemo(() => {
    if (netProfit <= 0) {
      return 0;
    }

    return netProfit * 0.1;
  }, [netProfit]);

  const formatCurrency = (value) => {
    return `KSh ${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleReportType = (type) => {
    setReportType(type);

    const today = new Date();

    if (type === "daily") {
      const date = today.toISOString().split("T")[0];

      setDateFrom(date);
      setDateTo(date);
    }

    if (type === "monthly") {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");

      const firstDay = `${year}-${month}-01`;

      const lastDay = new Date(
        year,
        today.getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];

      setDateFrom(firstDay);
      setDateTo(lastDay);
    }

    if (type === "custom") {
      // Keep current dates.
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-[#02337D] text-white print:hidden">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button
            onClick={() => router.push("/admin")}
            className="mb-3 text-sm text-blue-100 hover:text-white"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Financial Reports
              </h1>

              <p className="mt-1 text-sm text-blue-100">
                Monitor sales, costs, expenses and profitability.
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="rounded-lg bg-[#FE7401] px-5 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Print Report
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* REPORT CONTROLS */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm print:hidden">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Report Period
            </h2>

            <p className="text-sm text-slate-500">
              Select the branch and period you want to analyze.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Report type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Report Type
              </label>

              <select
                value={reportType}
                onChange={(e) =>
                  handleReportType(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#FE7401]"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Branch
              </label>

              <select
                value={branchFilter}
                onChange={(e) =>
                  setBranchFilter(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#FE7401]"
              >
                <option value="All">Both Branches</option>
                <option value="Roysambu">Roysambu</option>
                <option value="Rangau">Rangau</option>
              </select>
            </div>

            {/* From */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                From
              </label>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setReportType("custom");
                }}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
              />
            </div>

            {/* To */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                To
              </label>

              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setReportType("custom");
                }}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
              />
            </div>

            {/* Report button */}
            <div className="flex items-end">
              <button
                onClick={() => {}}
                className="w-full rounded-lg bg-[#02337D] px-5 py-3 font-semibold text-white hover:bg-blue-900"
              >
                Generate Report
              </button>
            </div>
          </div>
        </section>

        {/* REPORT */}
        <section className="rounded-xl bg-white shadow-sm">
          {/* Report heading */}
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#02337D]">
                  BrightSpark Electricals & Electronics
                </h2>

                <p className="mt-1 font-medium text-slate-700">
                  Financial Report
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {dateFrom} to {dateTo}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">
                  Branch
                </p>

                <p className="font-bold text-slate-900">
                  {branchFilter === "All"
                    ? "Both Branches"
                    : branchFilter}
                </p>
              </div>
            </div>
          </div>

          {/* Main Financial Cards */}
          <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">
            <FinancialCard
              title="Total Sales"
              value={formatCurrency(totalSales)}
              description="Net sales after refunds"
            />

            <FinancialCard
              title="Cost of Goods Sold"
              value={formatCurrency(totalCOGS)}
              description="Historical product costs"
            />

            <FinancialCard
              title="Gross Profit"
              value={formatCurrency(grossProfit)}
              description="Sales minus COGS"
            />

            <FinancialCard
              title="Total Expenses"
              value={formatCurrency(totalExpenses)}
              description="Business expenses"
            />
          </div>

          {/* Profit Section */}
          <div className="mx-6 mb-6 rounded-xl bg-slate-50 p-6">
            <h3 className="mb-5 text-lg font-bold text-slate-900">
              Profitability
            </h3>

            <div className="grid gap-6 md:grid-cols-3">
              <ProfitRow
                label="Gross Profit"
                value={grossProfit}
              />

              <ProfitRow
                label="Net Profit"
                value={netProfit}
                highlighted
              />

              <ProfitRow
                label="Tithe (10%)"
                value={tithe}
              />
            </div>
          </div>

          {/* Summary Table */}
          <div className="border-t border-slate-200 px-6 py-6">
            <h3 className="mb-5 text-lg font-bold text-slate-900">
              Financial Summary
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  <ReportRow
                    label="Total Sales"
                    value={formatCurrency(totalSales)}
                  />

                  <ReportRow
                    label="Refunds"
                    value={formatCurrency(
                      filteredRefunds.reduce(
                        (total, refund) =>
                          total + Number(refund.amount),
                        0
                      )
                    )}
                  />

                  <ReportRow
                    label="Cost of Goods Sold"
                    value={formatCurrency(totalCOGS)}
                  />

                  <ReportRow
                    label="Gross Profit"
                    value={formatCurrency(grossProfit)}
                  />

                  <ReportRow
                    label="Total Expenses"
                    value={formatCurrency(totalExpenses)}
                  />

                  <ReportRow
                    label="Net Profit"
                    value={formatCurrency(netProfit)}
                    bold
                  />

                  <ReportRow
                    label="Tithe"
                    value={formatCurrency(tithe)}
                    bold
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="border-t border-slate-200 px-6 py-6">
            <h3 className="mb-5 text-lg font-bold text-slate-900">
              Transaction Summary
            </h3>

            <div className="grid gap-4 md:grid-cols-4">
              <SmallStat
                label="Sales Transactions"
                value={filteredSales.length}
              />

              <SmallStat
                label="Expense Records"
                value={filteredExpenses.length}
              />

              <SmallStat
                label="Refunds"
                value={filteredRefunds.length}
              />

              <SmallStat
                label="Branches"
                value={
                  branchFilter === "All" ? 2 : 1
                }
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FinancialCard({
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#02337D]">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ProfitRow({
  label,
  value,
  highlighted = false,
}) {
  return (
    <div
      className={`rounded-lg p-5 ${
        highlighted
          ? "bg-[#02337D] text-white"
          : "bg-white"
      }`}
    >
      <p
        className={`text-sm ${
          highlighted
            ? "text-blue-100"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        KSh{" "}
        {Number(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

function ReportRow({
  label,
  value,
  bold = false,
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td
        className={`px-4 py-4 ${
          bold
            ? "font-bold text-slate-900"
            : "text-slate-600"
        }`}
      >
        {label}
      </td>

      <td
        className={`px-4 py-4 text-right ${
          bold
            ? "font-bold text-[#02337D]"
            : "font-medium text-slate-900"
        }`}
      >
        {value}
      </td>
    </tr>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-xl font-bold text-[#02337D]">
        {value}
      </p>
    </div>
  );
}