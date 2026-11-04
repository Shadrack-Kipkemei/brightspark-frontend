"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import apiRequest from "@/lib/apiClient";

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

function Modal({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Fixed Header */}
        <div className="flex shrink-0 items-center justify-between border-b bg-white px-6 py-4">
          <h2
            className="text-xl font-bold"
            style={{ color: BRAND.navy }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(90vh-145px)] overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="shrink-0 border-t bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeInventoryPage() {
  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  const [products, setProducts] = useState([]);

  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventoryError, setInventoryError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [stockForm, setStockForm] = useState({
    quantity: "",
    unitCost: "",
    sellingPrice: "",
    reason: "",
  });
  const [submittingStock, setSubmittingStock] = useState(false);

  // =========================================================
  // AUTHORIZATION
  // =========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "employee") {
      router.replace("/admin");
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    router,
  ]);

  // =========================================================
  // LOAD REAL INVENTORY
  // =========================================================

  async function loadInventory() {
    if (!token || !user) {
      return;
    }

    try {
      setLoadingInventory(true);
      setInventoryError("");

      const response = await apiRequest("/inventory", {
        method: "GET",
        token,
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
          "Unable to load inventory."
        );
      }

      setProducts(response.inventory || []);
    } catch (error) {
      console.error(
        "Failed to load employee inventory:",
        error
      );

      setInventoryError(
        error.message ||
        "Unable to load inventory."
      );
    } finally {
      setLoadingInventory(false);
    }
  }

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      !user ||
      user.role !== "employee" ||
      !token
    ) {
      return;
    }

    loadInventory();
  }, [
    authLoading,
    isAuthenticated,
    user,
    token,
  ]);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const productName = String(
        product.name || ""
      ).toLowerCase();

      const sku = String(
        product.sku || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        productName.includes(searchValue) ||
        sku.includes(searchValue);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    category,
  ]);

  // =========================================================
  // LOW STOCK
  // =========================================================

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) => product.is_low_stock
    );
  }, [products]);

  // =========================================================
  // STOCK VALUE
  // =========================================================
  //
  // The inventory endpoint does not provide a single
  // cost price for each product because a product can have
  // multiple FIFO inventory batches with different costs.
  //
  // Therefore, we do not calculate stock value here yet.
  //
  // This will be handled properly when we integrate
  // inventory batches and reporting.
  // =========================================================

  const totalStockQuantity = useMemo(() => {
    return products.reduce(
      (sum, product) =>
        sum + Number(product.quantity || 0),
      0
    );
  }, [products]);

  // =========================================================
  // OPEN STOCK MODAL
  // =========================================================

  function openStockModal(product) {
    setSelectedProduct(product);

    setStockForm({
      quantity: "",
      unitCost: "",
      sellingPrice: "",
      reason: "",
    });

    setShowStockModal(true);
  }

  // =========================================================
  // CLOSE STOCK MODAL
  // =========================================================

  function closeStockModal() {
    setShowStockModal(false);
    setSelectedProduct(null);

    setStockForm({
      quantity: "",
      unitCost: "",
      sellingPrice: "",
      reason: "",
    });
  }
  async function handleAddStock() {
    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }

    const quantity = Number(stockForm.quantity);
    const unitCost = Number(stockForm.unitCost);
    const sellingPrice = Number(stockForm.sellingPrice);

    if (!stockForm.quantity || quantity <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    if (stockForm.unitCost === "" || unitCost < 0) {
      alert("Unit cost must be zero or greater.");
      return;
    }

    if (stockForm.sellingPrice === "" || sellingPrice < 0) {
      alert("Selling price must be zero or greater.");
      return;
    }

    if (!token) {
      alert("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSubmittingStock(true);

      const response = await apiRequest("/inventory/receive", {
        method: "POST",
        token,
        body: {
          product_id: selectedProduct.product_id,
          quantity,
          unit_cost: unitCost,
          selling_price: sellingPrice,
          reason:
            stockForm.reason.trim() || "New stock received",
        },
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to receive stock."
        );
      }

      alert(
        response.message || "Stock received successfully."
      );

      closeStockModal();

      await loadInventory();
    } catch (error) {
      console.error("Failed to add stock:", error);

      alert(
        error.message ||
        "Something went wrong while adding stock."
      );
    } finally {
      setSubmittingStock(false);
    }
  }

  // =========================================================
  // AUTH / LOADING SCREEN
  // =========================================================

  if (
    authLoading ||
    !isAuthenticated ||
    !user
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#02337D]"
          />

          <p className="text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== "employee") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">
            Access denied.
          </p>

          <p className="mt-1 text-gray-500">
            This page is only available to employees.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: BRAND.orange,
                }}
              >
                EMPLOYEE INVENTORY
              </p>

              <h1
                className="text-3xl font-bold"
                style={{
                  color: BRAND.navy,
                }}
              >
                Products & Stock
              </h1>

              <p className="mt-1 text-gray-500">
                View products and manage stock for your branch.
              </p>
            </div>

            {/* Employee Branch */}
            <div className="rounded-xl bg-gray-50 px-5 py-3">
              <p className="text-xs text-gray-500">
                Your Branch
              </p>

              <p
                className="font-bold"
                style={{
                  color: BRAND.navy,
                }}
              >
                {user.branch_id === "98980b28-48ad-427c-8d5e-5e8a7885d534"
                  ? "Roysambu Branch"
                  : user.branch_id === "3517a3e0-71d1-4956-b427-29c2a3fdecc2"
                    ? "Rangau Branch"
                    : "Unassigned Branch"}
              </p>
            </div>

          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ===================================================
            ERROR
        ==================================================== */}

        {inventoryError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <h2 className="font-bold text-red-700">
              Unable to Load Inventory
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {inventoryError}
            </p>

            <button
              type="button"
              onClick={loadInventory}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ===================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <SummaryCard
            title="Products"
            value={loadingInventory ? "..." : products.length}
          />

          <SummaryCard
            title="Low Stock"
            value={
              loadingInventory
                ? "..."
                : lowStockProducts.length
            }
          />

          <SummaryCard
            title="Total Stock Quantity"
            value={
              loadingInventory
                ? "..."
                : totalStockQuantity.toLocaleString(
                  "en-KE"
                )
            }
          />

        </div>

        {/* ===================================================
            LOW STOCK ALERT
        ==================================================== */}

        {!loadingInventory &&
          lowStockProducts.length > 0 && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

              <h2 className="font-bold text-red-700">
                Low Stock Alert
              </h2>

              <p className="mt-1 text-sm text-red-600">
                The following products need attention:
              </p>

              <div className="mt-3 space-y-2">

                {lowStockProducts.map((product) => (
                  <div
                    key={`${product.product_id}-${product.branch_id}`}
                    className="flex flex-col justify-between gap-2 rounded-lg bg-white p-3 sm:flex-row sm:items-center"
                  >

                    <span className="font-semibold">
                      {product.name}
                    </span>

                    <span className="font-bold text-red-600">
                      {product.quantity}{" "}
                      {product.unit}
                    </span>

                  </div>
                ))}

              </div>
            </div>
          )}

        {/* ===================================================
            PRODUCTS TABLE
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* Search and Filter */}
          <div className="flex flex-col gap-4 border-b p-5 md:flex-row">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search product or SKU..."
              className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-[#02337D]"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-xl border px-4 py-3 outline-none focus:border-[#02337D]"
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

          </div>

          {/* Loading */}
          {loadingInventory ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">

                <div
                  className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#02337D]"
                />

                <p className="text-gray-500">
                  Loading inventory...
                </p>

              </div>
            </div>
          ) : (

            /* Table */
            <div className="overflow-x-auto">

              <table className="min-w-[1050px] w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left">
                      SKU
                    </th>

                    <th className="px-5 py-4 text-left">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left">
                      Unit
                    </th>

                    <th className="px-5 py-4 text-left">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-left">
                      Low Stock Threshold
                    </th>

                    <th className="px-5 py-4 text-left">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.length === 0 ? (

                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        No products found.
                      </td>
                    </tr>

                  ) : (

                    filteredProducts.map((product) => {

                      const lowStock =
                        product.is_low_stock;

                      return (
                        <tr
                          key={`${product.product_id}-${product.branch_id}`}
                          className="border-t hover:bg-gray-50"
                        >

                          <td className="px-5 py-4 font-semibold">
                            {product.name}
                          </td>

                          <td className="px-5 py-4">
                            {product.sku}
                          </td>

                          <td className="px-5 py-4">
                            {product.category}
                          </td>

                          <td className="px-5 py-4">
                            {product.unit}
                          </td>

                          <td className="px-5 py-4 font-bold">
                            {product.quantity}
                          </td>

                          <td className="px-5 py-4">
                            {product.low_stock_threshold}
                          </td>

                          <td className="px-5 py-4">

                            {lowStock ? (

                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                LOW STOCK
                              </span>

                            ) : (

                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                IN STOCK
                              </span>

                            )}

                          </td>

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                openStockModal(product)
                              }
                              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                              style={{
                                backgroundColor:
                                  BRAND.orange,
                              }}
                            >
                              Add Stock
                            </button>

                          </td>

                        </tr>
                      );
                    })

                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {/* =====================================================
          ADD STOCK MODAL
          =====================================================
          The form is intentionally preserved in this step.
          API submission will be connected in 3P.7.2.
      ====================================================== */}

      {showStockModal &&
        selectedProduct && (

          <Modal
            title={`Add Stock — ${selectedProduct.name}`}
            onClose={closeStockModal}
            footer={

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeStockModal}
                  className="rounded-xl border px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAddStock}
                  disabled={submittingStock}
                  className="rounded-xl px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: BRAND.orange,
                  }}
                > 
                  {submittingStock ? "Adding stock..." : "Add stock"}
                </button>

              </div>

            }
          >

            <div className="space-y-5">

              {/* Product Information */}
              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Product
                </p>

                <p
                  className="font-bold"
                  style={{
                    color: BRAND.navy,
                  }}
                >
                  {selectedProduct.name}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

                  <div>
                    <p className="text-xs text-gray-500">
                      SKU
                    </p>

                    <p className="font-semibold">
                      {selectedProduct.sku}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Unit
                    </p>

                    <p className="font-semibold">
                      {selectedProduct.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Current Stock
                    </p>

                    <p className="font-semibold">
                      {selectedProduct.quantity}{" "}
                      {selectedProduct.unit}
                    </p>
                  </div>

                </div>

              </div>

              {/* Quantity */}
              <Input
                label={`Quantity (${selectedProduct.unit})`}
                type="number"
                step="0.001"
                min="0"
                value={stockForm.quantity}
                onChange={(value) =>
                  setStockForm((prev) => ({
                    ...prev,
                    quantity: value,
                  }))
                }
                placeholder={`Enter quantity in ${selectedProduct.unit.toLowerCase()}`}
              />

              {/* Unit Cost */}
              <Input
                label={`Unit Cost (${selectedProduct.unit})`}
                type="number"
                step="0.01"
                min="0"
                value={stockForm.unitCost}
                onChange={(value) =>
                  setStockForm((prev) => ({
                    ...prev,
                    unitCost: value,
                  }))
                }
                placeholder="Enter purchase cost per unit"
              />

              <p className="-mt-3 text-xs text-gray-500">
                Enter the actual cost you paid for this new stock.
                This can be different from previous stock.
              </p>

              {/* Selling Price */}
              <Input
                label={`Selling Price (${selectedProduct.unit})`}
                type="number"
                step="0.01"
                min="0"
                value={stockForm.sellingPrice}
                onChange={(value) =>
                  setStockForm((prev) => ({
                    ...prev,
                    sellingPrice: value,
                  }))
                }
                placeholder="Enter intended selling price per unit"
              />

              <p className="-mt-3 text-xs text-gray-500">
                This becomes the selling price for the new
                inventory batch.
              </p>

              {/* Reason */}
              <Input
                label="Reason"
                value={stockForm.reason}
                onChange={(value) =>
                  setStockForm((prev) => ({
                    ...prev,
                    reason: value,
                  }))
                }
                placeholder="e.g. Supplier delivery"
              />

              {/* Preview */}
              {Number(stockForm.quantity) > 0 &&
                Number(stockForm.unitCost) >= 0 && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <h3
                      className="font-bold"
                      style={{
                        color: BRAND.navy,
                      }}
                    >
                      Stock Receipt Summary
                    </h3>

                    <div className="mt-3 space-y-2 text-sm">

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Quantity
                        </span>

                        <span className="font-semibold">
                          {stockForm.quantity}{" "}
                          {selectedProduct.unit}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Unit Cost
                        </span>

                        <span className="font-semibold">
                          {money(stockForm.unitCost)}
                        </span>
                      </div>

                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">
                          Total Purchase Cost
                        </span>

                        <span
                          className="font-bold"
                          style={{
                            color: BRAND.navy,
                          }}
                        >
                          {money(
                            Number(
                              stockForm.quantity
                            ) *
                            Number(
                              stockForm.unitCost
                            )
                          )}
                        </span>
                      </div>

                    </div>

                  </div>
                )}

            </div>

          </Modal>

        )}

    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
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
  min,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        type={type}
        step={step}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-[#02337D] focus:ring-1 focus:ring-[#02337D]"
      />

    </div>
  );
}