"use client";

import { useMemo, useState } from "react";

const BRAND = {
  navy: "#02337D",
  orange: "#FE7401",
};

const DEMO_PRODUCTS = [
  {
    id: 1,
    name: "Fast Charging USB Cable",
    sku: "ACC-USB-001",
    category: "Phone Accessories",
    unit: "Piece",
    costPrice: 300,
    stock: 12,
    branchId: "roysambu",
  },
  {
    id: 2,
    name: "LED Bulb 12W",
    sku: "LED-12W-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 220,
    stock: 20,
    branchId: "roysambu",
  },
  {
    id: 3,
    name: "Electrical Extension Cable",
    sku: "CAB-EXT-001",
    category: "Electrical",
    unit: "Metre",
    costPrice: 55,
    stock: 50,
    branchId: "roysambu",
  },
  {
    id: 4,
    name: "Rechargeable Emergency Lamp",
    sku: "LMP-EMG-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 1200,
    stock: 4,
    branchId: "roysambu",
  },
  {
    id: 5,
    name: "Phone Charger",
    sku: "CHR-001",
    category: "Phone Accessories",
    unit: "Piece",
    costPrice: 500,
    stock: 15,
    branchId: "roysambu",
  },
  {
    id: 6,
    name: "Digital Multimeter",
    sku: "ELC-MUL-001",
    category: "Electrical",
    unit: "Piece",
    costPrice: 1800,
    stock: 6,
    branchId: "roysambu",
  },
  {
    id: 7,
    name: "Electrical Socket",
    sku: "SOC-001",
    category: "Electrical",
    unit: "Piece",
    costPrice: 280,
    stock: 25,
    branchId: "roysambu",
  },
  {
    id: 8,
    name: "Bluetooth Speaker",
    sku: "SPK-BT-001",
    category: "Electronics",
    unit: "Piece",
    costPrice: 2500,
    stock: 3,
    branchId: "roysambu",
  },
];

const INITIAL_SALES = [
  {
    id: "SALE-001",
    invoiceNumber: "BS-2026-0001",
    branch: "Roysambu",
    employee: "Administrator",
    status: "COMPLETED",
    totalAmount: 1527,
    totalCost: 1100,
    grossProfit: 427,
    soldAt: "2026-09-30T10:15:00",
    items: [
      {
        productId: 3,
        productName: "Electrical Extension Cable",
        sku: "CAB-EXT-001",
        quantity: 20,
        unit: "Metre",
        costPrice: 55,
        actualSellingPrice: 76.35,
        total: 1527,
      },
    ],
    payments: [
      {
        method: "M-Pesa",
        amount: 1000,
      },
      {
        method: "Cash",
        amount: 527,
      },
    ],
  },
];

const INITIAL_EXPENSES = [
  {
    id: "EXP-001",
    branch: "Roysambu",
    category: "Transport",
    description: "Supplier delivery transport",
    amount: 500,
    recordedBy: "Administrator",
    status: "ACTIVE",
    expenseDate: "2026-09-30",
  },
];

function money(value) {
  return `KSh ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Modal({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold" style={{ color: BRAND.navy }}>
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(90vh-145px)] overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSalesPage() {
  const [activeTab, setActiveTab] = useState("sales");

  const [sales, setSales] = useState(INITIAL_SALES);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [saleForm, setSaleForm] = useState({
    branch: "Roysambu",
    product: null,
    quantity: "",
    actualSellingPrice: "",
    productSearch: "",
    paymentMethod: "Cash",
    cashAmount: "",
    mpesaAmount: "",
  });

  const [refundForm, setRefundForm] = useState({
    quantity: "",
    reason: "",
    stockDestination: "SELLABLE",
    paymentMethod: "Cash",
    cashAmount: "",
    mpesaAmount: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    branch: "Roysambu",
    category: "",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().slice(0, 10),
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    amount: "",
    reason: "",
  });

  const filteredProducts = useMemo(() => {
    const query = saleForm.productSearch.trim().toLowerCase();

    if (!query) return [];

    return DEMO_PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });
  }, [saleForm.productSearch]);

  const saleQuantity = Number(saleForm.quantity || 0);
  const salePrice = Number(saleForm.actualSellingPrice || 0);

  const saleTotal = saleQuantity * salePrice;

  const saleCost =
    saleForm.product && saleQuantity
      ? saleQuantity * Number(saleForm.product.costPrice)
      : 0;

  const saleGrossProfit = saleTotal - saleCost;

  const paymentTotal =
    saleForm.paymentMethod === "Cash"
      ? Number(saleForm.cashAmount || 0)
      : saleForm.paymentMethod === "M-Pesa"
        ? Number(saleForm.mpesaAmount || 0)
        : Number(saleForm.cashAmount || 0) +
          Number(saleForm.mpesaAmount || 0);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      sale.employee.toLowerCase().includes(search.toLowerCase());

    const matchesBranch =
      branchFilter === "All" || sale.branch === branchFilter;

    const matchesStatus =
      statusFilter === "All" || sale.status === statusFilter;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  const activeSales = sales.filter(
    (sale) => sale.status === "COMPLETED"
  );

  const totalSales = activeSales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );

  const totalCOGS = activeSales.reduce(
    (sum, sale) => sum + sale.totalCost,
    0
  );

  const grossIncome = totalSales - totalCOGS;

  const activeExpenses = expenses.filter(
    (expense) => expense.status === "ACTIVE"
  );

  const totalExpenses = activeExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const netIncome = grossIncome - totalExpenses;

  const tithe = netIncome > 0 ? netIncome * 0.1 : 0;

  function resetSaleForm() {
    setSaleForm({
      branch: "Roysambu",
      product: null,
      quantity: "",
      actualSellingPrice: "",
      productSearch: "",
      paymentMethod: "Cash",
      cashAmount: "",
      mpesaAmount: "",
    });
  }

  function selectProduct(product) {
    setSaleForm((prev) => ({
      ...prev,
      product,
      productSearch: product.name,
    }));
  }

  function handlePaymentMethodChange(method) {
    setSaleForm((prev) => ({
      ...prev,
      paymentMethod: method,
      cashAmount: "",
      mpesaAmount: "",
    }));
  }

  function recordSale() {
    if (!saleForm.product) {
      alert("Please select a product.");
      return;
    }

    if (saleQuantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (saleQuantity > saleForm.product.stock) {
      alert("The quantity exceeds available stock.");
      return;
    }

    if (salePrice <= 0) {
      alert("Enter the actual selling price.");
      return;
    }

    if (Math.abs(paymentTotal - saleTotal) > 0.01) {
      alert("Payment amounts must equal the sale total.");
      return;
    }

    const newSale = {
      id: `SALE-${Date.now()}`,
      invoiceNumber: `BS-2026-${String(sales.length + 1).padStart(4, "0")}`,
      branch: saleForm.branch,
      employee: "Administrator",
      status: "COMPLETED",
      totalAmount: saleTotal,
      totalCost: saleCost,
      grossProfit: saleGrossProfit,
      soldAt: new Date().toISOString(),
      items: [
        {
          productId: saleForm.product.id,
          productName: saleForm.product.name,
          sku: saleForm.product.sku,
          quantity: saleQuantity,
          unit: saleForm.product.unit,
          costPrice: saleForm.product.costPrice,
          actualSellingPrice: salePrice,
          total: saleTotal,
        },
      ],
      payments:
        saleForm.paymentMethod === "Split Payment"
          ? [
              {
                method: "M-Pesa",
                amount: Number(saleForm.mpesaAmount),
              },
              {
                method: "Cash",
                amount: Number(saleForm.cashAmount),
              },
            ]
          : [
              {
                method: saleForm.paymentMethod,
                amount: paymentTotal,
              },
            ],
    };

    setSales((prev) => [newSale, ...prev]);

    resetSaleForm();
    setShowSaleModal(false);
  }

  function openRefund(sale) {
    setSelectedSale(sale);

    setRefundForm({
      quantity: "",
      reason: "",
      stockDestination: "SELLABLE",
      paymentMethod: "Cash",
      cashAmount: "",
      mpesaAmount: "",
    });

    setShowRefundModal(true);
  }

  function processRefund() {
    if (!selectedSale) return;

    const item = selectedSale.items[0];
    const quantity = Number(refundForm.quantity || 0);

    if (quantity <= 0) {
      alert("Enter a valid refund quantity.");
      return;
    }

    if (quantity > item.quantity) {
      alert("Refund quantity cannot exceed the sold quantity.");
      return;
    }

    if (!refundForm.reason.trim()) {
      alert("Enter a refund reason.");
      return;
    }

    const refundAmount = quantity * item.actualSellingPrice;

    const refundPaymentTotal =
      refundForm.paymentMethod === "Cash"
        ? Number(refundForm.cashAmount || 0)
        : refundForm.paymentMethod === "M-Pesa"
          ? Number(refundForm.mpesaAmount || 0)
          : Number(refundForm.cashAmount || 0) +
            Number(refundForm.mpesaAmount || 0);

    if (Math.abs(refundPaymentTotal - refundAmount) > 0.01) {
      alert("Refund payment amounts must equal the refund amount.");
      return;
    }

    setSales((prev) =>
      prev.map((sale) => {
        if (sale.id !== selectedSale.id) return sale;

        const remainingQuantity = item.quantity - quantity;
        const newTotal = sale.totalAmount - refundAmount;

        const reversedCost = quantity * item.costPrice;
        const newCost = sale.totalCost - reversedCost;

        return {
          ...sale,
          totalAmount: newTotal,
          totalCost: newCost,
          grossProfit: newTotal - newCost,
          status: remainingQuantity === 0 ? "REFUNDED" : sale.status,
          items:
            remainingQuantity === 0
              ? []
              : [
                  {
                    ...item,
                    quantity: remainingQuantity,
                    total: remainingQuantity * item.actualSellingPrice,
                  },
                ],
        };
      })
    );

    setShowRefundModal(false);
    setSelectedSale(null);
  }

  function recordExpense() {
    const amount = Number(expenseForm.amount);

    if (!expenseForm.category) {
      alert("Select an expense category.");
      return;
    }

    if (!expenseForm.description.trim()) {
      alert("Enter an expense description.");
      return;
    }

    if (amount <= 0) {
      alert("Enter a valid expense amount.");
      return;
    }

    const newExpense = {
      id: `EXP-${Date.now()}`,
      branch: expenseForm.branch,
      category: expenseForm.category,
      description: expenseForm.description,
      amount,
      recordedBy: "Administrator",
      status: "ACTIVE",
      expenseDate: expenseForm.expenseDate,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    setExpenseForm({
      branch: "Roysambu",
      category: "",
      description: "",
      amount: "",
      expenseDate: new Date().toISOString().slice(0, 10),
    });

    setShowExpenseModal(false);
  }

  function openAdjustment(expense) {
    setSelectedExpense(expense);
    setAdjustmentForm({
      amount: "",
      reason: "",
    });

    setShowAdjustmentModal(true);
  }

  function adjustExpense() {
    if (!selectedExpense) return;

    const amount = Number(adjustmentForm.amount);

    if (amount <= 0) {
      alert("Enter a valid adjustment amount.");
      return;
    }

    if (!adjustmentForm.reason.trim()) {
      alert("Enter the reason for the adjustment.");
      return;
    }

    setExpenses((prev) =>
      prev.map((expense) => {
        if (expense.id !== selectedExpense.id) return expense;

        return {
          ...expense,
          amount: Math.max(0, expense.amount - amount),
        };
      })
    );

    setShowAdjustmentModal(false);
    setSelectedExpense(null);
  }

  function voidExpense(expense) {
    const confirmed = window.confirm(
      `Void expense ${expense.id}? The original record will remain in the audit history.`
    );

    if (!confirmed) return;

    setExpenses((prev) =>
      prev.map((item) =>
        item.id === expense.id
          ? { ...item, status: "VOIDED" }
          : item
      )
    );
  }

  function voidSale(sale) {
    const confirmed = window.confirm(
      `Void ${sale.invoiceNumber}? The original sale will remain in the audit history.`
    );

    if (!confirmed) return;

    setSales((prev) =>
      prev.map((item) =>
        item.id === sale.id
          ? { ...item, status: "VOIDED" }
          : item
      )
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: BRAND.orange }}
              >
                ADMINISTRATION
              </p>

              <h1
                className="text-3xl font-bold"
                style={{ color: BRAND.navy }}
              >
                Sales & Finance
              </h1>

              <p className="mt-1 text-gray-500">
                Manage sales, refunds, expenses and financial reports.
              </p>
            </div>

            <button
              onClick={() => setShowSaleModal(true)}
              className="rounded-xl px-5 py-3 font-semibold text-white shadow"
              style={{ backgroundColor: BRAND.orange }}
            >
              + Record Sale
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total Sales"
            value={money(totalSales)}
          />

          <SummaryCard
            title="COGS"
            value={money(totalCOGS)}
          />

          <SummaryCard
            title="Gross Income"
            value={money(grossIncome)}
          />

          <SummaryCard
            title="Expenses"
            value={money(totalExpenses)}
          />

          <SummaryCard
            title="Net Income"
            value={money(netIncome)}
            highlight
          />
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Tithe</p>
              <p className="text-xl font-bold" style={{ color: BRAND.orange }}>
                {money(tithe)}
              </p>
              <p className="text-xs text-gray-400">
                10% of net profit
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Active Sales</p>
              <p className="text-xl font-bold text-gray-900">
                {activeSales.length}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Active Expenses</p>
              <p className="text-xl font-bold text-gray-900">
                {activeExpenses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex overflow-x-auto rounded-xl bg-white shadow-sm">
          {[
            ["sales", "Sales"],
            ["expenses", "Expenses"],
            ["financial", "Financial Summary"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${
                activeTab === key
                  ? "border-b-2"
                  : "text-gray-500"
              }`}
              style={
                activeTab === key
                  ? {
                      color: BRAND.navy,
                      borderColor: BRAND.orange,
                    }
                  : {}
              }
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "sales" && (
          <section className="rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b p-5 lg:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or employee..."
                className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2"
              />

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="rounded-xl border px-4 py-3"
              >
                <option>All</option>
                <option>Roysambu</option>
                <option>Rangau</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border px-4 py-3"
              >
                <option>All</option>
                <option>COMPLETED</option>
                <option>REFUNDED</option>
                <option>VOIDED</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm">Invoice</th>
                    <th className="px-5 py-4 text-left text-sm">Branch</th>
                    <th className="px-5 py-4 text-left text-sm">Employee</th>
                    <th className="px-5 py-4 text-left text-sm">Amount</th>
                    <th className="px-5 py-4 text-left text-sm">Profit</th>
                    <th className="px-5 py-4 text-left text-sm">Status</th>
                    <th className="px-5 py-4 text-right text-sm">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-t">
                      <td className="px-5 py-4 font-semibold">
                        {sale.invoiceNumber}
                      </td>

                      <td className="px-5 py-4">{sale.branch}</td>

                      <td className="px-5 py-4">{sale.employee}</td>

                      <td className="px-5 py-4">
                        {money(sale.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        {money(sale.grossProfit)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={sale.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {sale.status !== "VOIDED" &&
                            sale.status !== "REFUNDED" && (
                              <button
                                onClick={() => openRefund(sale)}
                                className="rounded-lg border px-3 py-2 text-sm"
                              >
                                Refund
                              </button>
                            )}

                          {sale.status !== "VOIDED" && (
                            <button
                              onClick={() => voidSale(sale)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                            >
                              Void
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "expenses" && (
          <section className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-bold" style={{ color: BRAND.navy }}>
                  Expenses
                </h2>
                <p className="text-sm text-gray-500">
                  Record and correct business expenses.
                </p>
              </div>

              <button
                onClick={() => setShowExpenseModal(true)}
                className="rounded-xl px-4 py-2 font-semibold text-white"
                style={{ backgroundColor: BRAND.orange }}
              >
                + Add Expense
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left">Date</th>
                    <th className="px-5 py-4 text-left">Branch</th>
                    <th className="px-5 py-4 text-left">Category</th>
                    <th className="px-5 py-4 text-left">Description</th>
                    <th className="px-5 py-4 text-left">Amount</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-t">
                      <td className="px-5 py-4">
                        {expense.expenseDate}
                      </td>

                      <td className="px-5 py-4">
                        {expense.branch}
                      </td>

                      <td className="px-5 py-4">
                        {expense.category}
                      </td>

                      <td className="px-5 py-4">
                        {expense.description}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {money(expense.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={expense.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        {expense.status === "ACTIVE" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openAdjustment(expense)}
                              className="rounded-lg border px-3 py-2 text-sm"
                            >
                              Adjust
                            </button>

                            <button
                              onClick={() => voidExpense(expense)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                            >
                              Void
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "financial" && (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FinancialCard
              title="Revenue"
              value={totalSales}
            />

            <FinancialCard
              title="Cost of Goods Sold"
              value={totalCOGS}
            />

            <FinancialCard
              title="Gross Income"
              value={grossIncome}
            />

            <FinancialCard
              title="Expenses"
              value={totalExpenses}
            />

            <FinancialCard
              title="Net Income / Profit"
              value={netIncome}
            />

            <FinancialCard
              title="Tithe"
              value={tithe}
              subtitle="10% of net profit"
            />
          </section>
        )}
      </main>

      {showSaleModal && (
        <Modal
          title="Record Sale"
          onClose={() => {
            resetSaleForm();
            setShowSaleModal(false);
          }}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  resetSaleForm();
                  setShowSaleModal(false);
                }}
                className="rounded-xl border px-5 py-3 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={recordSale}
                className="rounded-xl px-5 py-3 font-semibold text-white"
                style={{ backgroundColor: BRAND.orange }}
              >
                Record Sale
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="rounded-xl bg-gray-50 p-4">
              <label className="mb-2 block text-sm font-semibold">
                Branch
              </label>

              <select
                value={saleForm.branch}
                onChange={(e) =>
                  setSaleForm((prev) => ({
                    ...prev,
                    branch: e.target.value,
                  }))
                }
                className="w-full rounded-xl border bg-white px-4 py-3"
              >
                <option>Roysambu</option>
                <option>Rangau</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Search Product
              </label>

              <input
                value={saleForm.productSearch}
                onChange={(e) =>
                  setSaleForm((prev) => ({
                    ...prev,
                    productSearch: e.target.value,
                    product: null,
                  }))
                }
                placeholder="Type product name, SKU or category..."
                className="w-full rounded-xl border px-4 py-3"
              />

              {filteredProducts.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => selectProduct(product)}
                      className="block w-full border-b p-4 text-left last:border-b-0 hover:bg-gray-50"
                    >
                      <p className="font-semibold">
                        {product.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {product.sku} · {product.category}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {saleForm.product && (
              <div className="rounded-xl border bg-gray-50 p-5">
                <h3
                  className="mb-4 font-bold"
                  style={{ color: BRAND.navy }}
                >
                  Selected Product
                </h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <Info label="Product" value={saleForm.product.name} />
                  <Info label="SKU" value={saleForm.product.sku} />
                  <Info label="Category" value={saleForm.product.category} />
                  <Info label="Unit" value={saleForm.product.unit} />
                  <Info
                    label="Cost Price"
                    value={money(saleForm.product.costPrice)}
                  />
                </div>

                <div className="mt-4 rounded-lg bg-white p-3">
                  <span className="text-sm text-gray-500">
                    Available Stock
                  </span>

                  <p className="font-bold">
                    {saleForm.product.stock}{" "}
                    {saleForm.product.unit}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label={`Quantity${
                  saleForm.product
                    ? ` (${saleForm.product.unit})`
                    : ""
                }`}
                type="number"
                step="0.001"
                value={saleForm.quantity}
                onChange={(value) =>
                  setSaleForm((prev) => ({
                    ...prev,
                    quantity: value,
                  }))
                }
                placeholder="e.g. 12.5"
              />

              <Input
                label="Actual Selling Price"
                type="number"
                step="0.01"
                value={saleForm.actualSellingPrice}
                onChange={(value) =>
                  setSaleForm((prev) => ({
                    ...prev,
                    actualSellingPrice: value,
                  }))
                }
                placeholder="Enter negotiated selling price"
              />
            </div>

            <div className="rounded-xl border p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Info
                  label="Sale Total"
                  value={money(saleTotal)}
                />

                <Info
                  label="COGS"
                  value={money(saleCost)}
                />

                <Info
                  label="Gross Profit"
                  value={money(saleGrossProfit)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["Cash", "M-Pesa", "Split Payment"].map((method) => (
                  <button
                    key={method}
                    onClick={() => handlePaymentMethodChange(method)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                      saleForm.paymentMethod === method
                        ? "text-white"
                        : "bg-white"
                    }`}
                    style={
                      saleForm.paymentMethod === method
                        ? { backgroundColor: BRAND.navy }
                        : {}
                    }
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {saleForm.paymentMethod === "Cash" && (
              <Input
                label="Cash Amount"
                type="number"
                step="0.01"
                value={saleForm.cashAmount}
                onChange={(value) =>
                  setSaleForm((prev) => ({
                    ...prev,
                    cashAmount: value,
                  }))
                }
              />
            )}

            {saleForm.paymentMethod === "M-Pesa" && (
              <Input
                label="M-Pesa Amount"
                type="number"
                step="0.01"
                value={saleForm.mpesaAmount}
                onChange={(value) =>
                  setSaleForm((prev) => ({
                    ...prev,
                    mpesaAmount: value,
                  }))
                }
              />
            )}

            {saleForm.paymentMethod === "Split Payment" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="M-Pesa Amount"
                  type="number"
                  step="0.01"
                  value={saleForm.mpesaAmount}
                  onChange={(value) =>
                    setSaleForm((prev) => ({
                      ...prev,
                      mpesaAmount: value,
                    }))
                  }
                />

                <Input
                  label="Cash Amount"
                  type="number"
                  step="0.01"
                  value={saleForm.cashAmount}
                  onChange={(value) =>
                    setSaleForm((prev) => ({
                      ...prev,
                      cashAmount: value,
                    }))
                  }
                />
              </div>
            )}

            <PaymentValidation
              paymentTotal={paymentTotal}
              saleTotal={saleTotal}
            />
          </div>
        </Modal>
      )}

      {showRefundModal && selectedSale && (
        <Modal
          title={`Refund — ${selectedSale.invoiceNumber}`}
          onClose={() => setShowRefundModal(false)}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="rounded-xl border px-5 py-3 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={processRefund}
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
              >
                Process Refund
              </button>
            </div>
          }
        >
          {selectedSale.items.length > 0 && (
            <div className="space-y-5">
              {selectedSale.items.map((item) => {
                const refundQuantity = Number(
                  refundForm.quantity || 0
                );

                const refundAmount =
                  refundQuantity * item.actualSellingPrice;

                return (
                  <div key={item.productId}>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="font-bold">{item.productName}</p>

                      <p className="text-sm text-gray-500">
                        {item.sku} · {item.unit}
                      </p>

                      <p className="mt-2 text-sm">
                        Sold quantity:{" "}
                        <strong>
                          {item.quantity} {item.unit}
                        </strong>
                      </p>

                      <p className="text-sm">
                        Actual selling price:{" "}
                        <strong>
                          {money(item.actualSellingPrice)}
                        </strong>
                      </p>
                    </div>

                    <div className="mt-4">
                      <Input
                        label={`Return Quantity (${item.unit})`}
                        type="number"
                        step="0.001"
                        value={refundForm.quantity}
                        onChange={(value) =>
                          setRefundForm((prev) => ({
                            ...prev,
                            quantity: value,
                          }))
                        }
                      />
                    </div>

                    <div className="mt-4 rounded-xl border p-4">
                      <p className="text-sm text-gray-500">
                        Refund Amount
                      </p>

                      <p className="text-2xl font-bold text-red-600">
                        {money(refundAmount)}
                      </p>
                    </div>
                  </div>
                );
              })}

              <Input
                label="Reason for Refund"
                value={refundForm.reason}
                onChange={(value) =>
                  setRefundForm((prev) => ({
                    ...prev,
                    reason: value,
                  }))
                }
                placeholder="e.g. Product faulty"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Returned Product Destination
                </label>

                <select
                  value={refundForm.stockDestination}
                  onChange={(e) =>
                    setRefundForm((prev) => ({
                      ...prev,
                      stockDestination: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border px-4 py-3"
                >
                  <option value="SELLABLE">
                    Sellable Stock
                  </option>

                  <option value="DAMAGED">
                    Damaged / Defective Stock
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Refund Payment Method
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "M-Pesa", "Split Payment"].map(
                    (method) => (
                      <button
                        key={method}
                        onClick={() =>
                          setRefundForm((prev) => ({
                            ...prev,
                            paymentMethod: method,
                            cashAmount: "",
                            mpesaAmount: "",
                          }))
                        }
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                          refundForm.paymentMethod === method
                            ? "text-white"
                            : ""
                        }`}
                        style={
                          refundForm.paymentMethod === method
                            ? { backgroundColor: BRAND.navy }
                            : {}
                        }
                      >
                        {method}
                      </button>
                    )
                  )}
                </div>
              </div>

              {refundForm.paymentMethod === "Cash" && (
                <Input
                  label="Cash Refund"
                  type="number"
                  step="0.01"
                  value={refundForm.cashAmount}
                  onChange={(value) =>
                    setRefundForm((prev) => ({
                      ...prev,
                      cashAmount: value,
                    }))
                  }
                />
              )}

              {refundForm.paymentMethod === "M-Pesa" && (
                <Input
                  label="M-Pesa Refund"
                  type="number"
                  step="0.01"
                  value={refundForm.mpesaAmount}
                  onChange={(value) =>
                    setRefundForm((prev) => ({
                      ...prev,
                      mpesaAmount: value,
                    }))
                  }
                />
              )}

              {refundForm.paymentMethod === "Split Payment" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="M-Pesa Refund"
                    type="number"
                    step="0.01"
                    value={refundForm.mpesaAmount}
                    onChange={(value) =>
                      setRefundForm((prev) => ({
                        ...prev,
                        mpesaAmount: value,
                      }))
                    }
                  />

                  <Input
                    label="Cash Refund"
                    type="number"
                    step="0.01"
                    value={refundForm.cashAmount}
                    onChange={(value) =>
                      setRefundForm((prev) => ({
                        ...prev,
                        cashAmount: value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {showExpenseModal && (
        <Modal
          title="Record Expense"
          onClose={() => setShowExpenseModal(false)}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={recordExpense}
                className="rounded-xl px-5 py-3 font-semibold text-white"
                style={{ backgroundColor: BRAND.orange }}
              >
                Save Expense
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Branch
              </label>

              <select
                value={expenseForm.branch}
                onChange={(e) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    branch: e.target.value,
                  }))
                }
                className="w-full rounded-xl border px-4 py-3"
              >
                <option>Roysambu</option>
                <option>Rangau</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <select
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full rounded-xl border px-4 py-3"
              >
                <option value="">Select category</option>
                <option>Transport</option>
                <option>Rent</option>
                <option>Electricity</option>
                <option>Water</option>
                <option>Internet</option>
                <option>Salary</option>
                <option>Maintenance</option>
                <option>Other</option>
              </select>
            </div>

            <Input
              label="Description"
              value={expenseForm.description}
              onChange={(value) =>
                setExpenseForm((prev) => ({
                  ...prev,
                  description: value,
                }))
              }
            />

            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={expenseForm.amount}
              onChange={(value) =>
                setExpenseForm((prev) => ({
                  ...prev,
                  amount: value,
                }))
              }
            />

            <Input
              label="Expense Date"
              type="date"
              value={expenseForm.expenseDate}
              onChange={(value) =>
                setExpenseForm((prev) => ({
                  ...prev,
                  expenseDate: value,
                }))
              }
            />
          </div>
        </Modal>
      )}

      {showAdjustmentModal && selectedExpense && (
        <Modal
          title={`Adjust Expense — ${selectedExpense.id}`}
          onClose={() => setShowAdjustmentModal(false)}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={adjustExpense}
                className="rounded-xl px-5 py-3 font-semibold text-white"
                style={{ backgroundColor: BRAND.orange }}
              >
                Save Adjustment
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Original Amount
              </p>

              <p className="text-xl font-bold">
                {money(selectedExpense.amount)}
              </p>
            </div>

            <Input
              label="Adjustment Amount"
              type="number"
              step="0.01"
              value={adjustmentForm.amount}
              onChange={(value) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  amount: value,
                }))
              }
            />

            <Input
              label="Reason"
              value={adjustmentForm.reason}
              onChange={(value) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  reason: value,
                }))
              }
              placeholder="Why is this expense being corrected?"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({ title, value, highlight }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          highlight ? "text-green-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FinancialCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {money(value)}
      </p>

      {subtitle && (
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    COMPLETED: "bg-green-100 text-green-700",
    ACTIVE: "bg-green-100 text-green-700",
    REFUNDED: "bg-orange-100 text-orange-700",
    VOIDED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        classes[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
      />
    </div>
  );
}

function PaymentValidation({ paymentTotal, saleTotal }) {
  const difference = paymentTotal - saleTotal;

  return (
    <div
      className={`rounded-xl p-4 ${
        Math.abs(difference) <= 0.01
          ? "bg-green-50"
          : "bg-red-50"
      }`}
    >
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">
          Payment Total
        </span>

        <strong>{money(paymentTotal)}</strong>
      </div>

      <div className="mt-1 flex justify-between">
        <span className="text-sm text-gray-600">
          Sale Total
        </span>

        <strong>{money(saleTotal)}</strong>
      </div>

      <p
        className={`mt-2 text-sm font-semibold ${
          Math.abs(difference) <= 0.01
            ? "text-green-700"
            : "text-red-700"
        }`}
      >
        {Math.abs(difference) <= 0.01
          ? "Payment is balanced."
          : `Difference: ${money(Math.abs(difference))}`}
      </p>
    </div>
  );
}