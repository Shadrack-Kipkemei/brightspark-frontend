"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiRequest from "@/lib/apiClient";
import { useAuth } from "@/components/auth/AuthContext";

const BRAND = {
  navy: "#02337D",
  orange: "#FE7401",
};

const INITIAL_EXPENSES = [];

const money = (value) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getErrorMessage = (error, fallback) =>
  error?.message || fallback;

function normalizeSale(sale) {
  return {
    ...sale,
    id: sale.id,
    reference: sale.id,
    branch: sale.branch?.name || "Unknown branch",
    branchId: sale.branch?.id || sale.branch_id,
    employee: sale.employee?.full_name || "Administrator",
    status: sale.status || "COMPLETED",
    totalAmount: Number(sale.total_amount || 0),
    totalCost: Number(sale.total_cost || 0),
    grossProfit: Number(sale.gross_profit || 0),
    soldAt: sale.sold_at || sale.created_at,
    items: (sale.items || []).map((item) => ({
      ...item,
      id: item.id,
      saleItemId: item.id,
      productId: item.product_id,
      productName: item.product?.name || "Unknown product",
      sku: item.product?.sku || "",
      category: item.product?.category || "",
      quantity: Number(item.quantity || 0),
      unit: item.unit || "Piece",
      costPrice: Number(item.cost_price || 0),
      actualSellingPrice: Number(item.actual_selling_price || 0),
      total: Number(item.total || 0),
    })),
    payments: (sale.payments || []).map((payment) => ({
      ...payment,
      method:
        payment.payment_method === "MPESA"
          ? "M-Pesa"
          : payment.payment_method === "CASH"
            ? "Cash"
            : payment.payment_method,
      amount: Number(payment.amount || 0),
    })),
  };
}

function normalizeRefund(refund) {
  return {
    ...refund,
    id: refund.id,
    originalSaleId: refund.original_sale_id,
    branchId: refund.branch_id,
    reason: refund.reason || "",
    status: refund.status || "COMPLETED",
    totalRefundAmount: Number(refund.total_refund_amount || 0),
    createdAt: refund.created_at,
    items: (refund.items || []).map((item) => ({
      ...item,
      saleItemId: item.sale_item_id,
      productId: item.product_id,
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unit_price || 0),
      refundAmount: Number(item.refund_amount || 0),
      stockDestination: item.stock_destination,
    })),
  };
}

function getBranchId(branch) {
  return branch?.id || branch?._id || "";
}

function getBranchName(branch) {
  return branch?.name || branch?.branch_name || "Unnamed branch";
}

export default function AdminSalesPage() {
  const { token, loading: authLoading } = useAuth();

  // --------------------------------------------------
  // MAIN DATA
  // --------------------------------------------------

  const [activeTab, setActiveTab] = useState("sales");

  const [sales, setSales] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [branches, setBranches] = useState([]);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingSale, setSavingSale] = useState(false);
  const [savingRefund, setSavingRefund] = useState(false);

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");

  // --------------------------------------------------
  // MODALS
  // --------------------------------------------------

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExpenseAdjustmentModal, setShowExpenseAdjustmentModal] =
    useState(false);
  const [showSaleDetailsModal, setShowSaleDetailsModal] = useState(false);

  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // --------------------------------------------------
  // SALE FORM
  // --------------------------------------------------

  const [saleForm, setSaleForm] = useState({
    branchId: "",
    product: null,
    quantity: "",
    actualSellingPrice: "",
    productSearch: "",
    paymentMethod: "Cash",
    cashAmount: "",
    mpesaAmount: "",
  });

  const [productResults, setProductResults] = useState([]);

  // --------------------------------------------------
  // REFUND FORM
  // --------------------------------------------------

  const [refundForm, setRefundForm] = useState({
    quantity: "",
    reason: "",
    stockDestination: "SELLABLE",
    paymentMethod: "Cash",
  });

  // --------------------------------------------------
  // EXPENSE FORM
  // --------------------------------------------------

  const [expenseForm, setExpenseForm] = useState({
    branchId: "",
    category: "Rent",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    amount: "",
    reason: "",
  });

  // --------------------------------------------------
  // LOAD BACKEND DATA
  // --------------------------------------------------

  const loadSales = useCallback(async () => {
    if (!token) return;

    setLoadingSales(true);
    setPageError("");

    try {
      const salesQuery =
        branchFilter !== "all"
          ? `?branch_id=${encodeURIComponent(branchFilter)}`
          : "";

      const [salesResponse, refundsResponse, branchesResponse] =
        await Promise.all([
          apiRequest(`/sales${salesQuery}`, { token }),
          apiRequest("/refunds", { token }),
          apiRequest("/branches/public"),
        ]);

      setSales((salesResponse?.sales || []).map(normalizeSale));
      setRefunds((refundsResponse?.refunds || []).map(normalizeRefund));

      const branchList =
        branchesResponse?.branches ||
        branchesResponse?.data?.branches ||
        branchesResponse?.data ||
        [];

      setBranches(Array.isArray(branchList) ? branchList : []);
    } catch (error) {
      console.error("Failed to load admin sales:", error);
      setPageError(
        getErrorMessage(error, "Unable to load sales from the server.")
      );
    } finally {
      setLoadingSales(false);
    }
  }, [token, branchFilter]);

  useEffect(() => {
    if (!authLoading && token) {
      loadSales();
    }
  }, [authLoading, token, loadSales]);

  // --------------------------------------------------
  // PRODUCT SEARCH
  // --------------------------------------------------

  useEffect(() => {
    const query = saleForm.productSearch.trim();

    if (!token || !saleForm.branchId || query.length < 2) {
      setProductResults([]);
      return;
    }

    let cancelled = false;

    const searchProducts = async () => {
      setLoadingProducts(true);

      try {
        const response = await apiRequest(
          `/sales/search-products?q=${encodeURIComponent(query)}&branch_id=${encodeURIComponent(saleForm.branchId)}`,
          { token }
        );

        if (!cancelled) {
          setProductResults(response?.products || []);
        }
      } catch (error) {
        console.error("Product search failed:", error);

        if (!cancelled) {
          setProductResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    searchProducts();

    return () => {
      cancelled = true;
    };
  }, [saleForm.productSearch, saleForm.branchId, token]);

  // --------------------------------------------------
  // SALE CALCULATIONS
  // --------------------------------------------------

  const saleQuantity = Number(saleForm.quantity || 0);
  const salePrice = Number(saleForm.actualSellingPrice || 0);

  const saleTotal = saleQuantity * salePrice;

  const saleCost =
    saleQuantity * Number(saleForm.product?.cost_price || 0);

  const saleGrossProfit = saleTotal - saleCost;

  const cashAmount = Number(saleForm.cashAmount || 0);
  const mpesaAmount = Number(saleForm.mpesaAmount || 0);

  const paymentTotal =
    saleForm.paymentMethod === "Split Payment"
      ? cashAmount + mpesaAmount
      : saleTotal;

  // --------------------------------------------------
  // REFUND CALCULATIONS
  // --------------------------------------------------

  const selectedRefundItem = selectedSale?.items?.[0] || null;

  const alreadyRefundedQuantity = useMemo(() => {
    if (!selectedRefundItem) return 0;

    return refunds.reduce((total, refund) => {
      return (
        total +
        refund.items
          .filter(
            (item) =>
              item.saleItemId === selectedRefundItem.saleItemId
          )
          .reduce((sum, item) => sum + item.quantity, 0)
      );
    }, 0);
  }, [refunds, selectedRefundItem]);

  const remainingRefundQuantity = selectedRefundItem
    ? Math.max(
        0,
        selectedRefundItem.quantity - alreadyRefundedQuantity
      )
    : 0;

  const refundQuantity = Number(refundForm.quantity || 0);

  const refundAmount =
    refundQuantity *
    Number(selectedRefundItem?.actualSellingPrice || 0);

  // --------------------------------------------------
  // SALES FILTERING
  // --------------------------------------------------

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const searchableText = [
        sale.reference,
        sale.id,
        sale.employee,
        sale.branch,
        ...sale.items.map((item) => item.productName),
        ...sale.items.map((item) => item.sku),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      const matchesBranch =
        branchFilter === "All" || sale.branchId === branchFilter;

      const matchesStatus =
        statusFilter === "All" || sale.status === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [sales, search, branchFilter, statusFilter]);

  // --------------------------------------------------
  // FINANCIAL CALCULATIONS
  // --------------------------------------------------

  const activeSales = sales.filter(
    (sale) => sale.status === "COMPLETED"
  );

  const totalSales = activeSales.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  const totalCOGS = activeSales.reduce(
    (total, sale) => total + sale.totalCost,
    0
  );

  const grossIncome = totalSales - totalCOGS;

  const totalRefunds = refunds.reduce(
    (total, refund) => total + refund.totalRefundAmount,
    0
  );

  const activeExpenses = expenses.filter(
    (expense) => expense.status !== "VOIDED"
  );

  const totalExpenses = activeExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const netIncome = grossIncome - totalExpenses;
  const tithe = Math.max(netIncome, 0) * 0.1;

  // --------------------------------------------------
  // SALE FORM FUNCTIONS
  // --------------------------------------------------

  function resetSaleForm() {
    setSaleForm({
      branchId: "",
      product: null,
      quantity: "",
      actualSellingPrice: "",
      productSearch: "",
      paymentMethod: "Cash",
      cashAmount: "",
      mpesaAmount: "",
    });

    setProductResults([]);
  }

  function selectProduct(product) {
    setSaleForm((previous) => ({
      ...previous,
      product,
      productSearch: product.name,
    }));

    setProductResults([]);
  }

  function changeSaleBranch(branchId) {
    setSaleForm((previous) => ({
      ...previous,
      branchId,
      product: null,
      productSearch: "",
      quantity: "",
      actualSellingPrice: "",
    }));

    setProductResults([]);
  }

  function handlePaymentMethodChange(method) {
    setSaleForm((previous) => ({
      ...previous,
      paymentMethod: method,
      cashAmount: method === "Cash" ? saleTotal.toString() : "",
      mpesaAmount: method === "M-Pesa" ? saleTotal.toString() : "",
    }));
  }

  // --------------------------------------------------
  // RECORD SALE
  // --------------------------------------------------

  async function recordSale(event) {
    event?.preventDefault();

    if (!saleForm.branchId) {
      alert("Please select a branch.");
      return;
    }

    if (!saleForm.product) {
      alert("Please search for and select a product.");
      return;
    }

    if (saleQuantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (saleQuantity > Number(saleForm.product.available_stock || 0)) {
      alert("The quantity exceeds available stock.");
      return;
    }

    if (salePrice <= 0) {
      alert("Enter the actual selling price.");
      return;
    }

    if (
      saleForm.paymentMethod === "Split Payment" &&
      Math.abs(paymentTotal - saleTotal) > 0.01
    ) {
      alert("Cash and M-Pesa payments must equal the sale total.");
      return;
    }

    const payments =
      saleForm.paymentMethod === "Split Payment"
        ? [
            {
              payment_method: "CASH",
              amount: cashAmount,
            },
            {
              payment_method: "MPESA",
              amount: mpesaAmount,
            },
          ].filter((payment) => payment.amount > 0)
        : [
            {
              payment_method:
                saleForm.paymentMethod === "M-Pesa"
                  ? "MPESA"
                  : "CASH",
              amount: saleTotal,
            },
          ];

    setSavingSale(true);
    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest("/sales", {
        method: "POST",
        token,
        body: {
          branch_id: saleForm.branchId,
          items: [
            {
              product_id: saleForm.product.id,
              quantity: saleQuantity,
              actual_selling_price: salePrice,
            },
          ],
          payments,
        },
      });

      await loadSales();

      setShowSaleModal(false);
      resetSaleForm();
      setSuccessMessage("Sale recorded successfully.");
    } catch (error) {
      console.error("Sale recording failed:", error);
      alert(getErrorMessage(error, "Unable to record the sale."));
    } finally {
      setSavingSale(false);
    }
  }

  // --------------------------------------------------
  // REFUND FUNCTIONS
  // --------------------------------------------------

  function openRefund(sale) {
    setSelectedSale(sale);

    setRefundForm({
      quantity: "",
      reason: "",
      stockDestination: "SELLABLE",
      paymentMethod: "Cash",
    });

    setShowRefundModal(true);
  }

  async function processRefund(event) {
    event?.preventDefault();

    if (!selectedSale || !selectedRefundItem) {
      alert("No sale item was selected.");
      return;
    }

    if (refundQuantity <= 0) {
      alert("Enter a valid refund quantity.");
      return;
    }

    if (refundQuantity > remainingRefundQuantity) {
      alert(
        `Only ${remainingRefundQuantity} unit(s) remain refundable.`
      );
      return;
    }

    if (!refundForm.reason.trim()) {
      alert("Enter a refund reason.");
      return;
    }

    setSavingRefund(true);

    try {
      await apiRequest("/refunds", {
        method: "POST",
        token,
        body: {
          original_sale_id: selectedSale.id,
          reason: refundForm.reason.trim(),
          payment_method:
            refundForm.paymentMethod === "M-Pesa"
              ? "MPESA"
              : refundForm.paymentMethod === "Split Payment"
                ? "SPLIT"
                : "CASH",
          items: [
            {
              sale_item_id: selectedRefundItem.saleItemId,
              quantity: refundQuantity,
              stock_destination: refundForm.stockDestination,
            },
          ],
        },
      });

      await loadSales();

      setShowRefundModal(false);
      setSelectedSale(null);
      setSuccessMessage("Refund processed successfully.");
    } catch (error) {
      console.error("Refund processing failed:", error);
      alert(getErrorMessage(error, "Unable to process the refund."));
    } finally {
      setSavingRefund(false);
    }
  }

  // --------------------------------------------------
  // VOID SALE
  // --------------------------------------------------

  async function voidSale(sale) {
    const confirmed = window.confirm(
      `Are you sure you want to void sale ${sale.reference || sale.id}?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/sales/${sale.id}/void`, {
        method: "PATCH",
        token,
      });

      await loadSales();
      setSuccessMessage("Sale voided successfully.");
    } catch (error) {
      console.error("Sale void failed:", error);
      alert(getErrorMessage(error, "Unable to void this sale."));
    }
  }

  // --------------------------------------------------
  // EXPENSE FUNCTIONS
  // Local functionality retained for the next integration
  // --------------------------------------------------

  function resetExpenseForm() {
    setExpenseForm({
      branchId: "",
      category: "Rent",
      description: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
    });
  }

  function recordExpense(event) {
    event?.preventDefault();

    if (!expenseForm.description.trim()) {
      alert("Enter an expense description.");
      return;
    }

    if (Number(expenseForm.amount) <= 0) {
      alert("Enter a valid expense amount.");
      return;
    }

    const branch = branches.find(
      (item) => getBranchId(item) === expenseForm.branchId
    );

    const expense = {
      id: `EXP-${Date.now()}`,
      branchId: expenseForm.branchId,
      branch: branch ? getBranchName(branch) : "All branches",
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      status: "ACTIVE",
    };

    setExpenses((previous) => [expense, ...previous]);
    setShowExpenseModal(false);
    resetExpenseForm();
    setSuccessMessage("Expense added locally.");
  }

  function openAdjustment(expense) {
    setSelectedExpense(expense);

    setAdjustmentForm({
      amount: "",
      reason: "",
    });

    setShowExpenseAdjustmentModal(true);
  }

  function adjustExpense(event) {
    event?.preventDefault();

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

    setExpenses((previous) =>
      previous.map((expense) =>
        expense.id === selectedExpense.id
          ? {
              ...expense,
              amount: Math.max(0, expense.amount - amount),
              adjustmentReason: adjustmentForm.reason.trim(),
            }
          : expense
      )
    );

    setShowExpenseAdjustmentModal(false);
    setSelectedExpense(null);
    setSuccessMessage("Expense adjusted locally.");
  }

  function voidExpense(expense) {
    const confirmed = window.confirm(
      "Are you sure you want to void this expense?"
    );

    if (!confirmed) return;

    setExpenses((previous) =>
      previous.map((item) =>
        item.id === expense.id
          ? { ...item, status: "VOIDED" }
          : item
      )
    );
  }

  // --------------------------------------------------
  // SHARED UI HELPERS
  // --------------------------------------------------

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#02337D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50";

  const dangerButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50";

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-700" />
          <p className="text-sm text-gray-500">Loading your account...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sales & Finance
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage sales, refunds, expenses and financial performance.
          </p>
        </div>

        <button
          onClick={() => {
            resetSaleForm();
            setShowSaleModal(true);
          }}
          className={primaryButton}
        >
          <span className="text-lg">+</span>
          Record Sale
        </button>
      </div>

      {/* NOTIFICATIONS */}

      {pageError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{pageError}</span>

          <button
            onClick={loadSales}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <span>{successMessage}</span>

          <button
            onClick={() => setSuccessMessage("")}
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total Sales"
          value={money(totalSales)}
          description={`${activeSales.length} completed sales`}
          icon="↗"
        />

        <SummaryCard
          title="Cost of Goods Sold"
          value={money(totalCOGS)}
          description="Product costs"
          icon="▣"
        />

        <SummaryCard
          title="Gross Income"
          value={money(grossIncome)}
          description="Sales less product costs"
          icon="◈"
        />

        <SummaryCard
          title="Expenses"
          value={money(totalExpenses)}
          description="Active expenses"
          icon="−"
        />

        <SummaryCard
          title="Net Income"
          value={money(netIncome)}
          description="After expenses"
          icon="="
          highlight
        />
      </div>

      {/* FINANCIAL OVERVIEW */}

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-3">
        <FinancialCard
          title="Tithe (10%)"
          value={money(tithe)}
          description="10% of positive net income"
        />

        <FinancialCard
          title="Total Refunds"
          value={money(totalRefunds)}
          description={`${refunds.length} recorded refunds`}
        />

        <FinancialCard
          title="Active Expenses"
          value={activeExpenses.length}
          description="Expenses currently included"
        />
      </div>

      {/* TABS */}

      <div className="border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: "sales", label: "Sales" },
            { id: "expenses", label: "Expenses" },
            { id: "financial", label: "Financial Summary" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-[#FE7401] text-[#02337D]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SALES TAB */}

      {activeTab === "sales" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Sales Records
              </h2>
              <p className="text-sm text-gray-500">
                Sales retrieved from the BrightSpark backend.
              </p>
            </div>

            <button
              onClick={loadSales}
              disabled={loadingSales}
              className={secondaryButton}
            >
              {loadingSales ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {/* FILTERS */}

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Search sales</label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Sale ID, employee, product or SKU..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Branch</label>
              <select
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
                className={inputClass}
              >
                <option value="all">All branches</option>

                {branches.map((branch) => (
                  <option
                    key={getBranchId(branch)}
                    value={getBranchId(branch)}
                  >
                    {getBranchName(branch)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Sale status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={inputClass}
              >
                <option value="All">All statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="VOIDED">Voided</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          {/* SALES TABLE */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {loadingSales ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-700" />
                <p className="text-sm text-gray-500">
                  Loading sales records...
                </p>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mb-2 text-3xl text-gray-300">▤</div>
                <h3 className="font-semibold text-gray-700">
                  No sales found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sales matching your filters will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Sale Reference</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Profit</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowSaleDetailsModal(true);
                            }}
                            className="font-semibold text-[#02337D] hover:underline"
                          >
                            {String(sale.reference || sale.id).slice(0, 12)}
                          </button>
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {formatDate(sale.soldAt)}
                        </td>

                        <td className="px-4 py-4 text-gray-700">
                          {sale.branch}
                        </td>

                        <td className="px-4 py-4 text-gray-700">
                          {sale.employee}
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {money(sale.totalAmount)}
                        </td>

                        <td className="px-4 py-4 font-semibold text-green-700">
                          {money(sale.grossProfit)}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={sale.status} />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openRefund(sale)}
                              disabled={
                                sale.status !== "COMPLETED" ||
                                !sale.items?.length
                              }
                              className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-40"
                            >
                              Refund
                            </button>

                            <button
                              onClick={() => voidSale(sale)}
                              disabled={sale.status !== "COMPLETED"}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                            >
                              Void
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Showing {filteredSales.length} of {sales.length} sales.
          </p>
        </div>
      )}

      {/* EXPENSES TAB */}

      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Expense Management
              </h2>
              <p className="text-sm text-gray-500">
                Record and manage business expenses.
              </p>
            </div>

            <button
              onClick={() => {
                resetExpenseForm();
                setShowExpenseModal(true);
              }}
              className={primaryButton}
            >
              + Add Expense
            </button>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Expense records are currently stored in this page's local state.
            Backend expense integration will be done separately.
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {activeExpenses.length === 0 ? (
              <div className="py-14 text-center">
                <h3 className="font-semibold text-gray-700">
                  No expenses recorded
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add an expense to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {activeExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-4 py-4">{expense.date}</td>
                        <td className="px-4 py-4">{expense.category}</td>
                        <td className="px-4 py-4">
                          {expense.description}
                        </td>
                        <td className="px-4 py-4">{expense.branch}</td>
                        <td className="px-4 py-4 font-semibold">
                          {money(expense.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={expense.status} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openAdjustment(expense)}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Adjust
                            </button>

                            <button
                              onClick={() => voidExpense(expense)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Void
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FINANCIAL SUMMARY TAB */}

      {activeTab === "financial" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Financial Summary
            </h2>
            <p className="text-sm text-gray-500">
              Overview of sales, costs, expenses and net income.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-5">
              <h3 className="font-bold text-gray-900">
                Business Performance
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              <FinancialRow
                label="Total Sales Revenue"
                value={money(totalSales)}
              />

              <FinancialRow
                label="Cost of Goods Sold"
                value={`(${money(totalCOGS)})`}
                negative
              />

              <FinancialRow
                label="Gross Income"
                value={money(grossIncome)}
                strong
              />

              <FinancialRow
                label="Refunds"
                value={`(${money(totalRefunds)})`}
                negative
              />

              <FinancialRow
                label="Operating Expenses"
                value={`(${money(totalExpenses)})`}
                negative
              />

              <FinancialRow
                label="Net Income"
                value={money(netIncome)}
                strong
                highlight
              />

              <FinancialRow
                label="Tithe (10% of positive net income)"
                value={money(tithe)}
                strong
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FinancialCard
              title="Completed Sales"
              value={activeSales.length}
              description="Successful sales"
            />

            <FinancialCard
              title="Recorded Refunds"
              value={refunds.length}
              description="Refund transactions"
            />

            <FinancialCard
              title="Voided Sales"
              value={sales.filter((sale) => sale.status === "VOIDED").length}
              description="Voided transactions"
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Refunds are shown separately from original sales. The backend
            currently records the refund total, but the current financial
            calculation does not yet deduct refunds from net income.
            Expenses are still local until their backend integration is
            completed.
          </div>
        </div>
      )}

      {/* RECORD SALE MODAL */}

      {showSaleModal && (
        <Modal
          title="Record New Sale"
          onClose={() => {
            setShowSaleModal(false);
            resetSaleForm();
          }}
        >
          <form onSubmit={recordSale} className="space-y-5">
            <div>
              <label className={labelClass}>Select Branch *</label>

              <select
                value={saleForm.branchId}
                onChange={(event) => changeSaleBranch(event.target.value)}
                className={inputClass}
                required
              >
                <option value="">Choose a branch</option>

                {branches.map((branch) => (
                  <option
                    key={getBranchId(branch)}
                    value={getBranchId(branch)}
                  >
                    {getBranchName(branch)}
                  </option>
                ))}
              </select>

              {branches.length === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  No branches were returned. Check the branches API.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Search Product *</label>

              <input
                value={saleForm.productSearch}
                onChange={(event) =>
                  setSaleForm((previous) => ({
                    ...previous,
                    productSearch: event.target.value,
                    product: null,
                  }))
                }
                placeholder="Enter product name or SKU..."
                className={inputClass}
                disabled={!saleForm.branchId}
              />

              {!saleForm.branchId && (
                <p className="mt-1 text-xs text-gray-400">
                  Select a branch before searching for products.
                </p>
              )}

              {loadingProducts && (
                <p className="mt-2 text-xs text-gray-500">
                  Searching products...
                </p>
              )}

              {productResults.length > 0 && (
                <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-gray-200">
                  {productResults.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => selectProduct(product)}
                      className="flex w-full items-center justify-between gap-3 border-b border-gray-100 p-3 text-left last:border-b-0 hover:bg-blue-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          SKU: {product.sku || "—"} ·{" "}
                          {product.category || "Uncategorised"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {Number(product.available_stock || 0)}{" "}
                          {product.unit || "units"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cost: {money(product.cost_price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {saleForm.product && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#02337D]">
                        {saleForm.product.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        SKU: {saleForm.product.sku || "—"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Cost price: {money(saleForm.product.cost_price)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Available stock:{" "}
                        {saleForm.product.available_stock}{" "}
                        {saleForm.product.unit || "units"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSaleForm((previous) => ({
                          ...previous,
                          product: null,
                          productSearch: "",
                        }))
                      }
                      className="text-sm font-semibold text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Quantity *</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={saleForm.quantity}
                  onChange={(event) =>
                    setSaleForm((previous) => ({
                      ...previous,
                      quantity: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Actual Selling Price per Unit *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={saleForm.actualSellingPrice}
                  onChange={(event) =>
                    setSaleForm((previous) => ({
                      ...previous,
                      actualSellingPrice: event.target.value,
                    }))
                  }
                  placeholder="Enter selling price"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {saleForm.product && saleQuantity > 0 && salePrice > 0 && (
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sale total</span>
                  <span className="font-semibold text-gray-900">
                    {money(saleTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost of goods</span>
                  <span className="font-semibold text-gray-900">
                    {money(saleCost)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                  <span className="font-semibold text-gray-700">
                    Gross profit
                  </span>
                  <span
                    className={`font-bold ${
                      saleGrossProfit >= 0
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {money(saleGrossProfit)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Payment Method *</label>

              <select
                value={saleForm.paymentMethod}
                onChange={(event) =>
                  handlePaymentMethodChange(event.target.value)
                }
                className={inputClass}
              >
                <option value="Cash">Cash</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Split Payment">Split Payment</option>
              </select>
            </div>

            {saleForm.paymentMethod === "Split Payment" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Cash Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={saleForm.cashAmount}
                    onChange={(event) =>
                      setSaleForm((previous) => ({
                        ...previous,
                        cashAmount: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>M-Pesa Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={saleForm.mpesaAmount}
                    onChange={(event) =>
                      setSaleForm((previous) => ({
                        ...previous,
                        mpesaAmount: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <PaymentValidation
                    total={saleTotal}
                    paid={paymentTotal}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSaleModal(false);
                  resetSaleForm();
                }}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingSale}
                className={primaryButton}
              >
                {savingSale ? "Recording..." : "Record Sale"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* REFUND MODAL */}

      {showRefundModal && selectedSale && (
        <Modal
          title="Process Refund"
          onClose={() => {
            setShowRefundModal(false);
            setSelectedSale(null);
          }}
        >
          <form onSubmit={processRefund} className="space-y-5">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">
                Original Sale
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {String(selectedSale.reference || selectedSale.id).slice(
                  0,
                  16
                )}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {selectedSale.branch} · {money(selectedSale.totalAmount)}
              </p>
            </div>

            {selectedRefundItem ? (
              <>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-gray-800">
                    {selectedRefundItem.productName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    SKU: {selectedRefundItem.sku || "—"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Sold quantity: {selectedRefundItem.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Already refunded: {alreadyRefundedQuantity}
                  </p>
                  <p className="text-sm font-semibold text-green-700">
                    Remaining refundable: {remainingRefundQuantity}
                  </p>
                </div>

                {remainingRefundQuantity > 0 ? (
                  <div>
                    <label className={labelClass}>
                      Quantity to Refund *
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      max={remainingRefundQuantity}
                      step="any"
                      value={refundForm.quantity}
                      onChange={(event) =>
                        setRefundForm((previous) => ({
                          ...previous,
                          quantity: event.target.value,
                        }))
                      }
                      className={inputClass}
                      required
                    />
                  </div>
                ) : (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    This sale item has already been fully refunded.
                  </p>
                )}

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Calculated refund amount
                    </span>
                    <span className="font-bold text-gray-900">
                      {money(refundAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Refund Reason *</label>
                  <textarea
                    rows={3}
                    value={refundForm.reason}
                    onChange={(event) =>
                      setRefundForm((previous) => ({
                        ...previous,
                        reason: event.target.value,
                      }))
                    }
                    placeholder="Explain why the customer is returning the item..."
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Returned Stock Status</label>
                  <select
                    value={refundForm.stockDestination}
                    onChange={(event) =>
                      setRefundForm((previous) => ({
                        ...previous,
                        stockDestination: event.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="SELLABLE">
                      Return to sellable stock
                    </option>
                    <option value="DAMAGED">
                      Mark as damaged
                    </option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Refund Payment Method
                  </label>
                  <select
                    value={refundForm.paymentMethod}
                    onChange={(event) =>
                      setRefundForm((previous) => ({
                        ...previous,
                        paymentMethod: event.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Split Payment">Split Payment</option>
                  </select>

                  <p className="mt-1 text-xs text-gray-500">
                    The current backend records the refund total but does
                    not save a cash/M-Pesa refund allocation.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-red-600">
                No sale items are available for refund.
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedSale(null);
                }}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  savingRefund ||
                  !selectedRefundItem ||
                  remainingRefundQuantity <= 0
                }
                className={primaryButton}
              >
                {savingRefund ? "Processing..." : "Process Refund"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* SALE DETAILS MODAL */}

      {showSaleDetailsModal && selectedSale && (
        <Modal
          title="Sale Details"
          onClose={() => {
            setShowSaleDetailsModal(false);
            setSelectedSale(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Sale Reference" value={selectedSale.id} />
              <Info
                label="Date"
                value={formatDate(selectedSale.soldAt)}
              />
              <Info label="Branch" value={selectedSale.branch} />
              <Info label="Employee" value={selectedSale.employee} />
              <Info
                label="Total Amount"
                value={money(selectedSale.totalAmount)}
              />
              <Info
                label="Gross Profit"
                value={money(selectedSale.grossProfit)}
              />
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-800">
                Products Sold
              </h3>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[450px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {selectedSale.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <p className="font-medium">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.sku}
                          </p>
                        </td>
                        <td className="p-3">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-3">
                          {money(item.actualSellingPrice)}
                        </td>
                        <td className="p-3 font-semibold">
                          {money(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-800">
                Payments
              </h3>

              <div className="space-y-2">
                {selectedSale.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between rounded-lg bg-gray-50 p-3 text-sm"
                  >
                    <span>{payment.method}</span>
                    <span className="font-semibold">
                      {money(payment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  setShowSaleDetailsModal(false);
                  setSelectedSale(null);
                }}
                className={secondaryButton}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD EXPENSE MODAL */}

      {showExpenseModal && (
        <Modal
          title="Add Expense"
          onClose={() => setShowExpenseModal(false)}
        >
          <form onSubmit={recordExpense} className="space-y-4">
            <div>
              <label className={labelClass}>Branch</label>
              <select
                value={expenseForm.branchId}
                onChange={(event) =>
                  setExpenseForm((previous) => ({
                    ...previous,
                    branchId: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">All branches / General expense</option>

                {branches.map((branch) => (
                  <option
                    key={getBranchId(branch)}
                    value={getBranchId(branch)}
                  >
                    {getBranchName(branch)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Expense Category *</label>
              <select
                value={expenseForm.category}
                onChange={(event) =>
                  setExpenseForm((previous) => ({
                    ...previous,
                    category: event.target.value,
                  }))
                }
                className={inputClass}
              >
                {[
                  "Rent",
                  "Salaries",
                  "Transport",
                  "Electricity",
                  "Water",
                  "Internet",
                  "Repairs",
                  "Marketing",
                  "Office Supplies",
                  "Other",
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                rows={3}
                value={expenseForm.description}
                onChange={(event) =>
                  setExpenseForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Amount (KES) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={expenseForm.amount}
                  onChange={(event) =>
                    setExpenseForm((previous) => ({
                      ...previous,
                      amount: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Date *</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(event) =>
                    setExpenseForm((previous) => ({
                      ...previous,
                      date: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button type="submit" className={primaryButton}>
                Add Expense
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADJUST EXPENSE MODAL */}

      {showExpenseAdjustmentModal && selectedExpense && (
        <Modal
          title="Adjust Expense"
          onClose={() => setShowExpenseAdjustmentModal(false)}
        >
          <form onSubmit={adjustExpense} className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-800">
                {selectedExpense.description}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Current amount: {money(selectedExpense.amount)}
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Amount to Deduct (KES) *
              </label>
              <input
                type="number"
                min="0.01"
                max={selectedExpense.amount}
                step="any"
                value={adjustmentForm.amount}
                onChange={(event) =>
                  setAdjustmentForm((previous) => ({
                    ...previous,
                    amount: event.target.value,
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Reason *</label>
              <textarea
                rows={3}
                value={adjustmentForm.reason}
                onChange={(event) =>
                  setAdjustmentForm((previous) => ({
                    ...previous,
                    reason: event.target.value,
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowExpenseAdjustmentModal(false)}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button type="submit" className={primaryButton}>
                Save Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ==================================================
// REUSABLE COMPONENTS
// ==================================================

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-blue-200 bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold"
          style={{
            backgroundColor: highlight ? "#DBEAFE" : "#FFF1E7",
            color: highlight ? BRAND.navy : BRAND.orange,
          }}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 break-words text-xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function FinancialCard({ title, value, description }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function FinancialRow({
  label,
  value,
  negative = false,
  strong = false,
  highlight = false,
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
        highlight ? "bg-blue-50" : ""
      }`}
    >
      <span
        className={`text-sm ${
          strong ? "font-bold text-gray-900" : "text-gray-600"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-sm ${
          strong ? "font-bold" : "font-medium"
        } ${negative ? "text-red-600" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    COMPLETED: "bg-green-100 text-green-700",
    ACTIVE: "bg-green-100 text-green-700",
    VOIDED: "bg-red-100 text-red-700",
    REFUNDED: "bg-orange-100 text-orange-700",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
}

function PaymentValidation({ total, paid }) {
  const difference = Number(total || 0) - Number(paid || 0);
  const balanced = Math.abs(difference) < 0.01;

  return (
    <div
      className={`rounded-lg p-3 text-sm ${
        balanced
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-800"
      }`}
    >
      <div className="flex justify-between">
        <span>Sale total</span>
        <strong>{money(total)}</strong>
      </div>

      <div className="mt-1 flex justify-between">
        <span>Amount paid</span>
        <strong>{money(paid)}</strong>
      </div>

      <div className="mt-2 border-t border-current/10 pt-2 font-semibold">
        {balanced
          ? "Payment is balanced."
          : difference > 0
            ? `Underpaid by ${money(difference)}`
            : `Overpaid by ${money(Math.abs(difference))}`}
      </div>
    </div>
  );
}