"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiRequest from "@/lib/apiClient";
import { useAuth } from "@/components/auth/AuthContext";

const BRAND = {
  navy: "#02337D",
  orange: "#FE7401",
};

function money(value) {
  return `KSh ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getErrorMessage(error) {
  if (typeof error === "string") return error;
  return error?.message || "Something went wrong. Please try again.";
}

function normalizeProduct(product) {
  return {
    ...product,
    costPrice: Number(product.cost_price || 0),
    stock: Number(product.available_stock || 0),
  };
}

function normalizeSale(sale) {
  return {
    ...sale,
    invoiceNumber: sale.id,
    branchName: sale.branch?.name || "Assigned branch",
    employeeName: sale.employee?.full_name || "Employee",
    totalAmount: Number(sale.total_amount || 0),
    soldAt: sale.sold_at || sale.created_at,
    items: (sale.items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product?.name || "Product",
      sku: item.product?.sku || "",
      category: item.product?.category || "",
      quantity: Number(item.quantity || 0),
      unit: item.unit || "",
      costPrice: Number(item.cost_price || 0),
      actualSellingPrice: Number(item.actual_selling_price || 0),
      total: Number(item.total || 0),
    })),
    payments: (sale.payments || []).map((payment) => ({
      method: payment.payment_method,
      amount: Number(payment.amount || 0),
    })),
  };
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

export default function EmployeeSalesPage() {
  const { token, loading: authLoading } = useAuth();

  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const [savingSale, setSavingSale] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);

  const [selectedSale, setSelectedSale] = useState(null);
  const [refundedQuantities, setRefundedQuantities] = useState({});

  const [search, setSearch] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const [saleForm, setSaleForm] = useState({
    product: null,
    productSearch: "",
    quantity: "",
    actualSellingPrice: "",
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

  const loadSales = useCallback(async () => {
    if (!token) return;

    setLoadingSales(true);
    setPageError("");

    try {
      const response = await apiRequest("/sales", {
        method: "GET",
        token,
      });

      setSales((response.sales || []).map(normalizeSale));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoadingSales(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && token) {
      loadSales();
    } else if (!authLoading && !token) {
      setLoadingSales(false);
      setPageError("Please log in to access employee sales.");
    }
  }, [authLoading, token, loadSales]);

  // Search products using the employee's assigned branch.
  useEffect(() => {
    if (!token || !showSaleModal) return;

    const query = saleForm.productSearch.trim();

    if (!query || saleForm.product) {
      setProductResults([]);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearchingProducts(true);

      try {
        const response = await apiRequest(
          `/sales/search-products?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            token,
          }
        );

        if (!cancelled) {
          setProductResults(
            (response.products || []).map(normalizeProduct)
          );
        }
      } catch (error) {
        if (!cancelled) {
          setProductResults([]);
          setActionError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setSearchingProducts(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [saleForm.productSearch, saleForm.product, showSaleModal, token]);

  const visibleSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sales;

    return sales.filter((sale) => {
      const productNames = sale.items
        .map((item) => item.productName)
        .join(" ");

      return `${sale.id} ${sale.employeeName} ${productNames}`
        .toLowerCase()
        .includes(query);
    });
  }, [sales, search]);

  const saleQuantity = Number(saleForm.quantity || 0);
  const salePrice = Number(saleForm.actualSellingPrice || 0);
  const saleTotal = saleQuantity * salePrice;

  const paymentTotal =
    saleForm.paymentMethod === "Cash"
      ? Number(saleForm.cashAmount || 0)
      : saleForm.paymentMethod === "M-Pesa"
        ? Number(saleForm.mpesaAmount || 0)
        : Number(saleForm.cashAmount || 0) +
        Number(saleForm.mpesaAmount || 0);

  const refundQuantity = Number(refundForm.quantity || 0);

  const selectedItem = selectedSale?.items?.[0] || null;

  const selectedItemRefunded = selectedItem
    ? Number(refundedQuantities[selectedItem.id] || 0)
    : 0;

  const remainingRefundableQuantity = selectedItem
    ? Math.max(0, selectedItem.quantity - selectedItemRefunded)
    : 0;

  const refundAmount = selectedItem
    ? refundQuantity * selectedItem.actualSellingPrice
    : 0;

  const refundPaymentTotal =
    refundForm.paymentMethod === "Cash"
      ? Number(refundForm.cashAmount || 0)
      : refundForm.paymentMethod === "M-Pesa"
        ? Number(refundForm.mpesaAmount || 0)
        : Number(refundForm.cashAmount || 0) +
        Number(refundForm.mpesaAmount || 0);

  function resetSaleForm() {
    setSaleForm({
      product: null,
      productSearch: "",
      quantity: "",
      actualSellingPrice: "",
      paymentMethod: "Cash",
      cashAmount: "",
      mpesaAmount: "",
    });

    setProductResults([]);
    setActionError("");
  }

  function selectProduct(product) {
    setSaleForm((previous) => ({
      ...previous,
      product,
      productSearch: product.name,
    }));

    setProductResults([]);
  }

  function changePaymentMethod(method) {
    setSaleForm((previous) => ({
      ...previous,
      paymentMethod: method,
      cashAmount: "",
      mpesaAmount: "",
    }));
  }

  function closeSaleModal() {
    resetSaleForm();
    setShowSaleModal(false);
  }

  function closeRefundModal() {
    setShowRefundModal(false);
    setSelectedSale(null);
    setRefundedQuantities({});
    setActionError("");
  }
  async function recordSale() {
    setActionError("");
    setSuccessMessage("");

    if (!saleForm.product) {
      setActionError("Please search for and select a product.");
      return;
    }

    if (!saleQuantity || saleQuantity <= 0) {
      setActionError("Enter a valid quantity.");
      return;
    }

    if (saleQuantity > saleForm.product.stock) {
      setActionError("Quantity exceeds available stock.");
      return;
    }

    if (!salePrice || salePrice <= 0) {
      setActionError("Enter the actual selling price.");
      return;
    }

    if (Math.abs(paymentTotal - saleTotal) > 0.01) {
      setActionError("Payment amounts must equal the sale total.");
      return;
    }

    const payments =
      saleForm.paymentMethod === "Cash"
        ? [
          {
            payment_method: "CASH",
            amount: Number(saleForm.cashAmount),
          },
        ]
        : saleForm.paymentMethod === "M-Pesa"
          ? [
            {
              payment_method: "MPESA",
              amount: Number(saleForm.mpesaAmount),
            },
          ]
          : [
            {
              payment_method: "MPESA",
              amount: Number(saleForm.mpesaAmount),
            },
            {
              payment_method: "CASH",
              amount: Number(saleForm.cashAmount),
            },
          ];

    const payload = {
      items: [
        {
          product_id: saleForm.product.id,
          quantity: saleQuantity,
          actual_selling_price: salePrice,
        },
      ],
      payments,
    };

    setSavingSale(true);

    try {
      const response = await apiRequest("/sales", {
        method: "POST",
        body: payload,
        token,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to record sale.");
      }

      closeSaleModal();
      await loadSales();

      setSuccessMessage(
        response.message || "Sale recorded successfully."
      );
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSavingSale(false);
    }
  }

  async function openRefund(sale) {
    setSelectedSale(sale);

    setRefundForm({
      quantity: "",
      reason: "",
      stockDestination: "SELLABLE",
      paymentMethod: "Cash",
      cashAmount: "",
      mpesaAmount: "",
    });

    setRefundedQuantities({});
    setActionError("");
    setSuccessMessage("");
    setShowRefundModal(true);

    // Retrieve previous refunds so partial refunds cannot exceed
    // the remaining refundable quantity.
    try {
      const response = await apiRequest(
        `/refunds?original_sale_id=${encodeURIComponent(sale.id)}`,
        {
          method: "GET",
          token,
        }
      );

      const quantities = {};

      (response.refunds || []).forEach((refund) => {
        (refund.items || []).forEach((item) => {
          quantities[item.sale_item_id] =
            (quantities[item.sale_item_id] || 0) +
            Number(item.quantity || 0);
        });
      });

      setRefundedQuantities(quantities);
    } catch (error) {
      setActionError(
        `Could not load previous refunds: ${getErrorMessage(error)}`
      );
    }
  }

  function changeRefundPaymentMethod(method) {
    setRefundForm((previous) => ({
      ...previous,
      paymentMethod: method,
      cashAmount: "",
      mpesaAmount: "",
    }));
  }

  async function processRefund() {
    if (!selectedSale || !selectedItem) return;

    setActionError("");
    setSuccessMessage("");

    if (!refundQuantity || refundQuantity <= 0) {
      setActionError("Enter a valid refund quantity.");
      return;
    }

    if (refundQuantity > remainingRefundableQuantity) {
      setActionError(
        `Only ${remainingRefundableQuantity} ${selectedItem.unit} remain refundable.`
      );
      return;
    }

    if (!refundForm.reason.trim()) {
      setActionError("Enter the refund reason.");
      return;
    }

    if (Math.abs(refundPaymentTotal - refundAmount) > 0.01) {
      setActionError(
        "Refund payment amounts must equal the refund amount."
      );
      return;
    }

    const paymentMethod =
      refundForm.paymentMethod === "Cash"
        ? "CASH"
        : refundForm.paymentMethod === "M-Pesa"
          ? "MPESA"
          : "SPLIT";

    const payload = {
      original_sale_id: selectedSale.id,
      reason: refundForm.reason.trim(),
      payment_method: paymentMethod,
      items: [
        {
          sale_item_id: selectedItem.id,
          quantity: refundQuantity,
          stock_destination: refundForm.stockDestination,
        },
      ],
    };

    setProcessingRefund(true);

    try {
      const response = await apiRequest("/refunds", {
        method: "POST",
        body: payload,
        token,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to process refund.");
      }

      closeRefundModal();
      await loadSales();

      setSuccessMessage(
        response.message || "Refund processed successfully."
      );
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setProcessingRefund(false);
    }
  }

  function salePaymentLabel(sale) {
    const methods = [...new Set(
      (sale.payments || []).map((payment) => payment.method)
    )];

    return methods
      .map((method) =>
        method === "MPESA" ? "M-Pesa" : method
      )
      .join(" + ") || "Not available";
  }

  const branchName =
    sales.find((sale) => sale.branchName)?.branchName ||
    "Your assigned branch";

  const totalSalesValue = sales
    .filter((sale) => sale.status === "COMPLETED")
    .reduce((sum, sale) => sum + sale.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: BRAND.orange }}
              >
                EMPLOYEE SALES
              </p>

              <h1
                className="text-3xl font-bold"
                style={{ color: BRAND.navy }}
              >
                Sales
              </h1>

              <p className="mt-1 text-gray-500">
                Record sales and process permitted refunds.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 px-5 py-3">
              <p className="text-xs text-gray-500">
                Logged-in Employee
              </p>

              <p className="font-semibold">
                Employee account
              </p>

              <p className="text-sm text-gray-500">
                Branch: {branchName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {pageError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {pageError}
            <button
              onClick={loadSales}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SummaryCard
            title="Branch Sales"
            value={loadingSales ? "Loading..." : sales.length}
          />

          <SummaryCard
            title="Completed Sales Value"
            value={loadingSales ? "Loading..." : money(totalSalesValue)}
          />
        </div>

        <div className="mb-5 flex flex-col gap-4 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sale ID or product..."
            className="flex-1 rounded-xl border bg-white px-4 py-3"
          />

          <button
            onClick={() => {
              setActionError("");
              setSuccessMessage("");
              setShowSaleModal(true);
            }}
            className="rounded-xl px-5 py-3 font-semibold text-white"
            style={{ backgroundColor: BRAND.orange }}
          >
            + Record Sale
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left">Sale ID</th>
                  <th className="px-5 py-4 text-left">Product</th>
                  <th className="px-5 py-4 text-left">Quantity</th>
                  <th className="px-5 py-4 text-left">Total</th>
                  <th className="px-5 py-4 text-left">Payment</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {loadingSales ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Loading sales...
                    </td>
                  </tr>
                ) : visibleSales.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No sales found.
                    </td>
                  </tr>
                ) : (
                  visibleSales.map((sale) => {
                    const productNames = sale.items
                      .map((item) => item.productName)
                      .join(", ");

                    const totalQuantity = sale.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    const units = [
                      ...new Set(sale.items.map((item) => item.unit)),
                    ].join(", ");

                    return (
                      <tr key={sale.id} className="border-t">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{sale.id}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {sale.employeeName}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {productNames || "No item details"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {totalQuantity} {units}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {money(sale.totalAmount)}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {salePaymentLabel(sale)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={sale.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          {sale.status === "COMPLETED" && (
                            <button
                              onClick={() => openRefund(sale)}
                              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showSaleModal && (
        <Modal
          title="Record Sale"
          onClose={closeSaleModal}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={closeSaleModal}
                disabled={savingSale}
                className="rounded-xl border px-5 py-3 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={recordSale}
                disabled={savingSale}
                className="rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: BRAND.orange }}
              >
                {savingSale ? "Recording..." : "Record Sale"}
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-gray-500">Sale Branch</p>

              <p
                className="text-lg font-bold"
                style={{ color: BRAND.navy }}
              >
                {branchName}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Your branch is assigned by your employee account.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Search Product
              </label>

              <input
                value={saleForm.productSearch}
                onChange={(event) => {
                  setSaleForm((previous) => ({
                    ...previous,
                    productSearch: event.target.value,
                    product: null,
                  }));
                  setActionError("");
                }}
                placeholder="Search by product name, SKU or category..."
                className="w-full rounded-xl border px-4 py-3"
              />

              {searchingProducts && (
                <p className="mt-2 text-sm text-gray-500">
                  Searching products...
                </p>
              )}

              {productResults.length > 0 && (
                <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border">
                  {productResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="block w-full border-b p-4 text-left last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {product.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {product.sku} · {product.category}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {product.stock} {product.unit}
                          </p>
                          <p className="text-xs text-gray-500">
                            Available
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searchingProducts &&
                saleForm.productSearch.trim() &&
                !saleForm.product &&
                productResults.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No matching products found.
                  </p>
                )}
            </div>

            {saleForm.product && (
              <div className="rounded-xl border bg-gray-50 p-5">
                <h3
                  className="mb-4 font-bold"
                  style={{ color: BRAND.navy }}
                >
                  Product Information
                </h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <Info
                    label="Product"
                    value={saleForm.product.name}
                  />

                  <Info
                    label="SKU"
                    value={saleForm.product.sku}
                  />

                  <Info
                    label="Category"
                    value={saleForm.product.category}
                  />

                  <Info
                    label="Unit"
                    value={saleForm.product.unit}
                  />

                  <Info
                    label="Cost Price"
                    value={money(saleForm.product.costPrice)}
                  />
                </div>

                <div className="mt-4 rounded-lg bg-white p-3">
                  <p className="text-sm text-gray-500">
                    Available Stock
                  </p>

                  <p className="font-bold">
                    {saleForm.product.stock} {saleForm.product.unit}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label={`Quantity${saleForm.product ? ` (${saleForm.product.unit})` : ""
                  }`}
                type="number"
                step="0.001"
                value={saleForm.quantity}
                onChange={(value) =>
                  setSaleForm((previous) => ({
                    ...previous,
                    quantity: value,
                  }))
                }
                placeholder="e.g. 12.5"
              />

              <Input
                label="Actual Selling Price (per unit)"
                type="number"
                step="0.01"
                value={saleForm.actualSellingPrice}
                onChange={(value) =>
                  setSaleForm((previous) => ({
                    ...previous,
                    actualSellingPrice: value,
                  }))
                }
                placeholder="Enter actual negotiated price"
              />
            </div>

            <div className="rounded-xl border p-4">
              <Info
                label="Sale Total"
                value={money(saleTotal)}
              />

              <p className="mt-2 text-xs text-gray-500">
                Total amount payable for this sale.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["Cash", "M-Pesa", "Split Payment"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => changePaymentMethod(method)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold ${saleForm.paymentMethod === method
                        ? "text-white"
                        : ""
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
                  setSaleForm((previous) => ({
                    ...previous,
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
                  setSaleForm((previous) => ({
                    ...previous,
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
                    setSaleForm((previous) => ({
                      ...previous,
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
                    setSaleForm((previous) => ({
                      ...previous,
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

            {actionError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </div>
            )}
          </div>
        </Modal>
      )}

      {showRefundModal && selectedSale && (
        <Modal
          title={`Refund — ${selectedSale.id}`}
          onClose={closeRefundModal}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRefundModal}
                disabled={processingRefund}
                className="rounded-xl border px-5 py-3 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={processRefund}
                disabled={processingRefund || !selectedItem}
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                {processingRefund ? "Processing..." : "Process Refund"}
              </button>
            </div>
          }
        >
          {selectedItem ? (
            <div className="space-y-5">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-bold">
                  {selectedItem.productName}
                </p>

                <p className="text-sm text-gray-500">
                  {selectedItem.sku} · {selectedItem.unit}
                </p>

                <p className="mt-2 text-sm">
                  Original quantity:{" "}
                  <strong>
                    {selectedItem.quantity} {selectedItem.unit}
                  </strong>
                </p>

                <p className="text-sm">
                  Previously refunded:{" "}
                  <strong>
                    {selectedItemRefunded} {selectedItem.unit}
                  </strong>
                </p>

                <p className="text-sm">
                  Remaining refundable:{" "}
                  <strong>
                    {remainingRefundableQuantity} {selectedItem.unit}
                  </strong>
                </p>

                <p className="mt-2 text-sm">
                  Actual selling price:{" "}
                  <strong>
                    {money(selectedItem.actualSellingPrice)}
                  </strong>
                </p>
              </div>

              <Input
                label={`Return Quantity (${selectedItem.unit})`}
                type="number"
                step="0.001"
                value={refundForm.quantity}
                onChange={(value) =>
                  setRefundForm((previous) => ({
                    ...previous,
                    quantity: value,
                  }))
                }
                placeholder="Enter quantity to return"
              />

              <div className="rounded-xl border p-4">
                <p className="text-sm text-gray-500">
                  Refund Amount
                </p>

                <p className="text-2xl font-bold text-red-600">
                  {money(refundAmount)}
                </p>
              </div>

              <Input
                label="Refund Reason"
                value={refundForm.reason}
                onChange={(value) =>
                  setRefundForm((previous) => ({
                    ...previous,
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
                  onChange={(event) =>
                    setRefundForm((previous) => ({
                      ...previous,
                      stockDestination: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border px-4 py-3"
                >
                  <option value="SELLABLE">Sellable Stock</option>
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
                  {["Cash", "M-Pesa", "Split Payment"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => changeRefundPaymentMethod(method)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold ${refundForm.paymentMethod === method
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
                  ))}
                </div>
              </div>

              {refundForm.paymentMethod === "Cash" && (
                <Input
                  label="Cash Refund"
                  type="number"
                  step="0.01"
                  value={refundForm.cashAmount}
                  onChange={(value) =>
                    setRefundForm((previous) => ({
                      ...previous,
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
                    setRefundForm((previous) => ({
                      ...previous,
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
                      setRefundForm((previous) => ({
                        ...previous,
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
                      setRefundForm((previous) => ({
                        ...previous,
                        cashAmount: value,
                      }))
                    }
                  />
                </div>
              )}

              <PaymentValidation
                paymentTotal={refundPaymentTotal}
                saleTotal={refundAmount}
              />

              <p className="text-xs text-gray-500">
                The current refund API records the total refund and
                payment method, but does not save the individual cash
                and M-Pesa refund amounts.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              This sale has no refundable item details.
            </p>
          )}

          {actionError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {actionError}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    COMPLETED: "bg-green-100 text-green-700",
    REFUNDED: "bg-orange-100 text-orange-700",
    VOIDED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status] || "bg-gray-100 text-gray-600"
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
        {value ?? "—"}
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
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
      />
    </div>
  );
}

function PaymentValidation({ paymentTotal, saleTotal }) {
  const difference = paymentTotal - saleTotal;
  const balanced = Math.abs(difference) <= 0.01;

  return (
    <div
      className={`rounded-xl p-4 ${balanced ? "bg-green-50" : "bg-red-50"
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
          Expected Total
        </span>

        <strong>{money(saleTotal)}</strong>
      </div>

      <p
        className={`mt-2 text-sm font-semibold ${balanced ? "text-green-700" : "text-red-700"
          }`}
      >
        {balanced
          ? "Payment is balanced."
          : `Difference: ${money(Math.abs(difference))}`}
      </p>
    </div>
  );
}