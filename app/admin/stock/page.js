"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import apiRequest from "@/lib/apiClient";

const EMPTY_BRANCH_STOCK = {
  quantity: 0,
  unitCost: 0,
  sellingPrice: 0,
};

const UNITS = [
  "Piece",
  "Metre",
  "Millilitre",
  "Litre",
  "Kilogram",
  "Gram",
  "Pack",
  "Pair",
  "Set",
];

export default function AdminInventoryPage() {
  const { token, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadStockData = async () => {
    if (!token) return;

    setLoadError("");

    try {
      const [productResponse, branchResponse, movementResponse] =
        await Promise.all([
          apiRequest("/products", { token }),
          apiRequest("/branches", { token }),
          apiRequest("/inventory/movements", { token }),
        ]);

      const activeBranches = (branchResponse.branches || []).filter(
        (item) => item.is_active
      );

      const activeProducts = (productResponse.products || []).filter(
        (item) => item.is_active
      );

      const mappedProducts = await Promise.all(
        activeProducts.map(async (product) => {
          const branchPairs = await Promise.all(
            activeBranches.map(async (branch) => {
              const detail = await apiRequest(
                `/inventory/product/${product.id}?branch_id=${encodeURIComponent(
                  branch.id
                )}`,
                { token }
              );

              const batches = (detail.batches || []).filter(
                (batch) =>
                  batch.status === "ACTIVE" &&
                  Number(batch.quantity_remaining) > 0
              );

              const quantity = batches.reduce(
                (sum, batch) =>
                  sum + Number(batch.quantity_remaining || 0),
                0
              );

              const costValue = batches.reduce(
                (sum, batch) =>
                  sum +
                  Number(batch.quantity_remaining || 0) *
                  Number(batch.unit_cost || 0),
                0
              );

              const sellingValue = batches.reduce(
                (sum, batch) =>
                  sum +
                  Number(batch.quantity_remaining || 0) *
                  Number(batch.selling_price || 0),
                0
              );

              return [
                branch.id,
                {
                  quantity,
                  unitCost: quantity ? costValue / quantity : 0,
                  sellingPrice: quantity
                    ? sellingValue / quantity
                    : 0,
                },
              ];
            })
          );

          return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            unit: product.unit,
            imageUrl: product.image_url,
            lowStockThreshold: Number(
              product.low_stock_threshold || 0
            ),
            branches: Object.fromEntries(branchPairs),
          };
        })
      );

      setBranches(activeBranches);
      setProducts(mappedProducts);

      setMovements(
        (movementResponse.movements || []).map((movement) => ({
          id: movement.id,
          date: movement.created_at
            ? new Date(movement.created_at).toLocaleString("en-KE")
            : "—",
          productName: movement.product?.name || "Unknown product",
          sku: movement.product?.sku || "—",
          branch: movement.branch_id,
          type: movement.movement_type,
          quantity: Number(movement.quantity || 0),
          unit: movement.product?.unit || "",
          unitCost: null,
          sellingPrice: null,
          reference: movement.reference || "—",
          performedBy: movement.created_by || "—",
          reason: movement.reason || "—",
        }))
      );
    } catch (error) {
      setLoadError(
        error.message || "Unable to load stock information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (token) {
      loadStockData();
    } else {
      setLoading(false);
    }
  }, [token, authLoading]);

  const [activeTab, setActiveTab] = useState("stock");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const [showAddStockModal, setShowAddStockModal] =
    useState(false);

  const [showAdjustmentModal, setShowAdjustmentModal] =
    useState(false);

  const [showTransferModal, setShowTransferModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [addStockForm, setAddStockForm] = useState({
    productId: "",
    branchId: "",
    quantity: "",
    unitCost: "",
    sellingPrice: "",
    reason: "",
    reference: "",
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: "",
    branchId: "",
    type: "increase",
    quantity: "",
    reason: "",
  });

  const [transferForm, setTransferForm] = useState({
    productId: "",
    fromBranch: "",
    toBranch: "",
    quantity: "",
    reason: "",
  });

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.sku.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

      const matchesBranch =
        branchFilter === "all" ||
        product.branches[branchFilter];

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBranch
      );
    });
  }, [products, search, categoryFilter, branchFilter]);

  const roysambuBranch = branches.find((item) =>
    item.name.toLowerCase().includes("roysambu")
  );

  const rangauBranch = branches.find((item) =>
    item.name.toLowerCase().includes("rangau")
  );

  const totalStockUnits = useMemo(() => {
    return products.reduce((total, product) => {
      return (
        total +
        Object.values(product.branches).reduce(
          (branchTotal, stock) =>
            branchTotal + Number(stock.quantity || 0),
          0
        )
      );
    }, 0);
  }, [products]);

  const stockValue = useMemo(() => {
    return products.reduce((total, product) => {
      return (
        total +
        Object.values(product.branches).reduce(
          (branchTotal, stock) =>
            branchTotal +
            Number(stock.quantity || 0) *
            Number(stock.unitCost || 0),
          0
        )
      );
    }, 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    const alerts = [];

    products.forEach((product) => {
      branches.forEach((branch) => {
        const branchStock =
          product.branches[branch.id] || EMPTY_BRANCH_STOCK;

        if (
          branchStock.quantity <= product.lowStockThreshold
        ) {
          alerts.push({
            product,
            branch,
            stock: branchStock.quantity,
          });
        }
      });
    });

    return alerts;
  }, [products, branches]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-KE").format(number || 0);
  };

  const getBranchName = (branchId) => {
    return (
      branches.find((branch) => branch.id === branchId)?.name ||
      branchId
    );
  };

  const getMovementLabel = (type) => {
    const labels = {
      STOCK_IN: "Stock In",
      ADJUSTMENT_IN: "Adjustment In",
      ADJUSTMENT_OUT: "Adjustment Out",
      TRANSFER_IN: "Transfer In",
      TRANSFER_OUT: "Transfer Out",
      DAMAGED: "Damaged Stock",
    };

    return labels[type] || type;
  };

  const resetAddStockForm = () => {
    setAddStockForm({
      productId: "",
      branchId: "",
      quantity: "",
      unitCost: "",
      sellingPrice: "",
      reason: "",
      reference: "",
    });
  };

  const openAddStockModal = (product = null, branchId = "") => {
    setSelectedProduct(product);

    setAddStockForm({
      productId: product?.id ? String(product.id) : "",
      branchId,
      quantity: "",
      unitCost: product && branchId
        ? String((product.branches[branchId] || EMPTY_BRANCH_STOCK).unitCost)
        : "",
      sellingPrice: product && branchId
        ? String((product.branches[branchId] || EMPTY_BRANCH_STOCK).sellingPrice)
        : "",
      reason: "",
      reference: "",
    });

    setShowAddStockModal(true);
  };

  const handleAddStock = async (event) => {
    event.preventDefault();

    const product = products.find(
      (item) => String(item.id) === String(addStockForm.productId)
    );
    if (!product) return alert("Please select a product.");
    if (!addStockForm.branchId) return alert("Please select a branch.");

    const quantity = Number(addStockForm.quantity);
    const unitCost = Number(addStockForm.unitCost);
    const sellingPrice = Number(addStockForm.sellingPrice);

    if (!Number.isFinite(quantity) || quantity <= 0)
      return alert("Enter a valid stock quantity.");
    if (!Number.isFinite(unitCost) || unitCost < 0)
      return alert("Enter a valid unit cost.");
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0)
      return alert("Enter a valid selling price.");
    if (!addStockForm.reason.trim())
      return alert("Please enter the reason for adding stock.");

    // Preserve the optional supplier reference in the movement reason.
    const reasonText = addStockForm.reference.trim()
      ? `${addStockForm.reason.trim()} (Supplier reference: ${addStockForm.reference.trim()})`
      : addStockForm.reason.trim();

    setSaving(true);
    try {
      await apiRequest("/inventory/receive", {
        method: "POST",
        token,
        body: {
          product_id: product.id,
          branch_id: addStockForm.branchId,
          quantity,
          unit_cost: unitCost,
          selling_price: sellingPrice,
          reason: reasonText,
        },
      });

      await loadStockData();

      alert(
        `Stock added successfully to ${getBranchName(addStockForm.branchId)}.`
      );

      resetAddStockForm();
      setSelectedProduct(null);
      setShowAddStockModal(false);
    } catch (error) {
      alert(error.message || "Unable to add stock.");
    } finally {
      setSaving(false);
    }
  };

  const openAdjustmentModal = (product, branchId = "") => {
    setSelectedProduct(product);

    setAdjustmentForm({
      productId: String(product.id),
      branchId,
      type: "increase",
      quantity: "",
      reason: "",
    });

    setShowAdjustmentModal(true);
  };

  const handleAdjustment = async (event) => {
    event.preventDefault();

    const product = products.find(
      (item) => String(item.id) === String(adjustmentForm.productId)
    );
    if (!product) return alert("Please select a product.");
    if (!adjustmentForm.branchId) return alert("Please select a branch.");

    const quantity = Number(adjustmentForm.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0)
      return alert("Enter a valid quantity.");

    if (!adjustmentForm.reason.trim())
      return alert("Please provide a reason.");

    const branchId = adjustmentForm.branchId;
    const branchStock =
      product.branches[branchId] || EMPTY_BRANCH_STOCK;

    if (
      adjustmentForm.type === "decrease" &&
      quantity > branchStock.quantity
    ) {
      return alert(
        "You cannot remove more stock than is currently available."
      );
    }

    if (
      adjustmentForm.type === "damaged" &&
      quantity > branchStock.quantity
    ) {
      return alert(
        "Damaged quantity cannot exceed available stock."
      );
    }

    const isDamaged = adjustmentForm.type === "damaged";
    const signedQuantity =
      adjustmentForm.type === "decrease" ? -quantity : quantity;

    setSaving(true);

    try {
      await apiRequest(
        isDamaged ? "/inventory/damage" : "/inventory/adjust",
        {
          method: "POST",
          token,
          body: isDamaged
            ? {
              product_id: product.id,
              branch_id: branchId,
              quantity,
              reason: adjustmentForm.reason.trim(),
            }
            : {
              product_id: product.id,
              branch_id: branchId,
              quantity: signedQuantity,
              reason: adjustmentForm.reason.trim(),
              ...(signedQuantity > 0
                ? {
                  unit_cost: branchStock.unitCost,
                  selling_price: branchStock.sellingPrice,
                }
                : {}),
            },
        }
      );

      await loadStockData();

      alert(
        isDamaged
          ? "Damaged stock recorded successfully."
          : "Stock adjustment completed."
      );

      setShowAdjustmentModal(false);
    } catch (error) {
      alert(error.message || "Unable to adjust stock.");
    } finally {
      setSaving(false);
    }
  };

  const openTransferModal = (product) => {
    setSelectedProduct(product);

    setTransferForm({
      productId: String(product.id),
      fromBranch: "",
      toBranch: "",
      quantity: "",
      reason: "",
    });

    setShowTransferModal(true);
  };

  const handleTransfer = async (event) => {
    event.preventDefault();

    const product = products.find(
      (item) => String(item.id) === String(transferForm.productId)
    );

    if (!product) return alert("Please select a product.");
    if (!transferForm.fromBranch)
      return alert("Select the source branch.");
    if (!transferForm.toBranch)
      return alert("Select the destination branch.");

    if (transferForm.fromBranch === transferForm.toBranch) {
      return alert(
        "Source and destination branches must be different."
      );
    }

    const quantity = Number(transferForm.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0)
      return alert("Enter a valid quantity.");

    const sourceStock =
      product.branches[transferForm.fromBranch] || EMPTY_BRANCH_STOCK;

    if (quantity > sourceStock.quantity) {
      return alert(
        "There is not enough stock in the source branch."
      );
    }

    if (!transferForm.reason.trim())
      return alert("Please enter a transfer reason.");

    setSaving(true);

    try {
      const createResponse = await apiRequest("/transfers", {
        method: "POST",
        token,
        body: {
          source_branch_id: transferForm.fromBranch,
          destination_branch_id: transferForm.toBranch,
          items: [
            {
              product_id: product.id,
              quantity,
            },
          ],
          reason: transferForm.reason.trim(),
        },
      });

      const transferId = createResponse.transfer?.id;

      if (!transferId) {
        throw new Error(
          "Transfer was created, but the response did not include its ID. Refresh the transfers record before trying again."
        );
      }

      await apiRequest(`/transfers/${transferId}/complete`, {
        method: "PATCH",
        token,
      });

      await loadStockData();

      alert("Stock transfer completed successfully.");
      setShowTransferModal(false);
    } catch (error) {
      // Reload in case the transfer was created but not completed.
      await loadStockData();

      alert(error.message || "Unable to complete stock transfer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {loading && (
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-[#02337D]">
            Loading live products, branches and stock from BrightSpark...
          </div>
        )}

        {loadError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
            <button
              type="button"
              onClick={loadStockData}
              className="ml-3 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              Inventory Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Stock Management
            </h1>

            <p className="mt-2 text-gray-600">
              Manage products, stock levels, stock purchases,
              transfers and adjustments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAddStockModal()}
            className="rounded-xl bg-[#FE7401] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-orange-600"
          >
            + Add Stock
          </button>
        </div>
        {/* SUMMARY */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Products"
            value={products.length}
            icon="📦"
          />

          <SummaryCard
            title="Total Stock Units"
            value={formatNumber(totalStockUnits)}
            icon="📊"
          />

          <SummaryCard
            title="Low Stock Alerts"
            value={lowStockProducts.length}
            icon="⚠️"
          />

          <SummaryCard
            title="Stock Value"
            value={formatCurrency(stockValue)}
            icon="💰"
          />
        </div>

        {/* TABS */}
        <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <div className="flex min-w-max">
            <TabButton
              active={activeTab === "stock"}
              onClick={() => setActiveTab("stock")}
            >
              Stock
            </TabButton>

            <TabButton
              active={activeTab === "movements"}
              onClick={() => setActiveTab("movements")}
            >
              Stock Movements
            </TabButton>

            <TabButton
              active={activeTab === "alerts"}
              onClick={() => setActiveTab("alerts")}
            >
              Low Stock Alerts
            </TabButton>
          </div>
        </div>

        {/* STOCK TAB */}
        {activeTab === "stock" && (
          <section className="mt-6">
            {/* FILTERS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Search
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search product, SKU..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                  >
                    <option value="all">
                      All Categories
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Branch
                  </label>

                  <select
                    value={branchFilter}
                    onChange={(event) =>
                      setBranchFilter(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                  >
                    <option value="all">
                      All Branches
                    </option>

                    {branches.map((branch) => (
                      <option
                        key={branch.id}
                        value={branch.id}
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full">
                  <thead className="bg-[#02337D] text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Product
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        SKU
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Category
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Unit
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Roysambu
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Rangau
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900">
                            {product.name}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            Low stock:{" "}
                            {product.lowStockThreshold}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {product.sku}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {product.category}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {product.unit}
                        </td>

                        <td className="px-5 py-4">
                          <BranchStock
                            stock={
                              product.branches[roysambuBranch?.id] ||
                              EMPTY_BRANCH_STOCK
                            }
                            threshold={product.lowStockThreshold}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <BranchStock
                            stock={
                              product.branches[rangauBranch?.id] ||
                              EMPTY_BRANCH_STOCK
                            }
                            threshold={product.lowStockThreshold}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openAddStockModal(product)
                              }
                              className="rounded-lg bg-[#FE7401] px-3 py-2 text-xs font-bold text-white hover:bg-orange-600"
                            >
                              Add Stock
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openAdjustmentModal(product)
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                            >
                              Adjust
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openTransferModal(product)
                              }
                              className="rounded-lg border border-[#02337D] px-3 py-2 text-xs font-bold text-[#02337D] hover:bg-blue-50"
                            >
                              Transfer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-5 py-12 text-center text-gray-500"
                        >
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* MOVEMENTS TAB */}
        {activeTab === "movements" && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead className="bg-[#02337D] text-white">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Branch
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Unit Cost
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Selling Price
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Reference
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Performed By
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {movements.map((movement) => (
                    <tr
                      key={movement.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {movement.date}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">
                          {movement.productName}
                        </div>

                        <div className="text-xs text-gray-500">
                          {movement.sku}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {getBranchName(movement.branch)}
                      </td>

                      <td className="px-5 py-4">
                        <MovementBadge
                          type={movement.type}
                          label={getMovementLabel(movement.type)}
                        />
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold">
                        {movement.quantity} {movement.unit}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {movement.unitCost == null
                          ? "—"
                          : formatCurrency(movement.unitCost)}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {movement.sellingPrice == null
                          ? "—"
                          : formatCurrency(movement.sellingPrice)}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {movement.reference}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {movement.performedBy}
                      </td>
                    </tr>
                  ))}
                  {movements.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        No stock movements recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ALERTS TAB */}
        {activeTab === "alerts" && (
          <section className="mt-6 grid gap-4">
            {lowStockProducts.length === 0 ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                <div className="text-4xl">✅</div>

                <h2 className="mt-3 text-lg font-bold text-green-800">
                  No Low Stock Alerts
                </h2>

                <p className="mt-1 text-sm text-green-700">
                  All products currently have stock above
                  their minimum threshold.
                </p>
              </div>
            ) : (
              lowStockProducts.map((alert) => (
                <div
                  key={`${alert.product.id}-${alert.branch.id}`}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
                >
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[#FE7401]">
                      Low Stock
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#02337D]">
                      {alert.product.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {alert.product.sku} •{" "}
                      {alert.branch.name}
                    </p>

                    <p className="mt-2 text-sm">
                      Available:{" "}
                      <span className="font-bold text-red-600">
                        {alert.stock}{" "}
                        {alert.product.unit}
                      </span>
                    </p>

                    <p className="text-sm text-gray-500">
                      Minimum:{" "}
                      {alert.product.lowStockThreshold}{" "}
                      {alert.product.unit}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openAddStockModal(
                        alert.product,
                        alert.branch.id
                      )
                    }
                    className="rounded-xl bg-[#FE7401] px-5 py-3 font-bold text-white hover:bg-orange-600"
                  >
                    Add Stock
                  </button>
                </div>
              ))
            )}
          </section>
        )}
      </div>

      {/* ADD STOCK MODAL */}
      {showAddStockModal && (
        <ModalShell
          title="Add Stock"
          subtitle="Record new stock received from a supplier."
          onClose={() => {
            setShowAddStockModal(false);
            resetAddStockForm();
          }}
        >
          <form onSubmit={handleAddStock}>
            <div className="space-y-5">
              {/* PRODUCT */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Product
                </label>

                <select
                  value={addStockForm.productId}
                  onChange={(event) =>
                    setAddStockForm((current) => ({
                      ...current,
                      productId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* BRANCH */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Branch
                </label>

                <select
                  value={addStockForm.branchId}
                  onChange={(event) =>
                    setAddStockForm((current) => ({
                      ...current,
                      branchId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="">
                    Select branch
                  </option>

                  {branches.map((branch) => (
                    <option
                      key={branch.id}
                      value={branch.id}
                    >
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* QUANTITY */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Quantity Received
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={addStockForm.quantity}
                  onChange={(event) =>
                    setAddStockForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* UNIT COST AND SELLING PRICE */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Unit Cost (KES)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addStockForm.unitCost}
                    onChange={(event) =>
                      setAddStockForm((current) => ({
                        ...current,
                        unitCost: event.target.value,
                      }))
                    }
                    placeholder="Purchase cost"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Selling Price (KES)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addStockForm.sellingPrice}
                    onChange={(event) =>
                      setAddStockForm((current) => ({
                        ...current,
                        sellingPrice: event.target.value,
                      }))
                    }
                    placeholder="Selling price"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* SUPPLIER REFERENCE */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Supplier Reference (Optional)
                </label>

                <input
                  type="text"
                  value={addStockForm.reference}
                  onChange={(event) =>
                    setAddStockForm((current) => ({
                      ...current,
                      reference: event.target.value,
                    }))
                  }
                  placeholder="Invoice or receipt number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* REASON */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Reason / Notes
                </label>

                <textarea
                  rows="3"
                  value={addStockForm.reason}
                  onChange={(event) =>
                    setAddStockForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Enter details about this stock receipt..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStockModal(false);
                    resetAddStockForm();
                  }}
                  className="rounded-xl border border-gray-300 px-5 py-3 font-bold text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#FE7401] px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Stock"}
                </button>
              </div>
            </div>
          </form>
        </ModalShell>
      )}
      {/* ADJUSTMENT MODAL */}
      {showAdjustmentModal && (
        <ModalShell
          title="Adjust Stock"
          subtitle="Correct an inventory quantity without deleting the audit history."
          onClose={() =>
            setShowAdjustmentModal(false)
          }
        >
          <form onSubmit={handleAdjustment}>
            <div className="space-y-5">
              {/* PRODUCT */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Product
                </label>

                <select
                  value={adjustmentForm.productId}
                  onChange={(event) =>
                    setAdjustmentForm((current) => ({
                      ...current,
                      productId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  required
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} — {product.sku}
                    </option>
                  ))}
                </select>
              </div>

              {/* BRANCH */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Branch
                </label>

                <select
                  value={adjustmentForm.branchId}
                  onChange={(event) =>
                    setAdjustmentForm((current) => ({
                      ...current,
                      branchId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  required
                >
                  <option value="">
                    Select branch
                  </option>

                  {branches.map((branch) => (
                    <option
                      key={branch.id}
                      value={branch.id}
                    >
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ADJUSTMENT TYPE */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Adjustment Type
                </label>

                <select
                  value={adjustmentForm.type}
                  onChange={(event) =>
                    setAdjustmentForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                >
                  <option value="increase">
                    Increase Stock
                  </option>

                  <option value="decrease">
                    Decrease Stock
                  </option>

                  <option value="damaged">
                    Record Damaged Stock
                  </option>
                </select>
              </div>

              {/* QUANTITY */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={adjustmentForm.quantity}
                  onChange={(event) =>
                    setAdjustmentForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  required
                />
              </div>

              {/* REASON */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Reason
                </label>

                <textarea
                  rows="3"
                  value={adjustmentForm.reason}
                  onChange={(event) =>
                    setAdjustmentForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Explain why this adjustment is required."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  required
                />
              </div>
            </div>

            <ModalFooter
              onCancel={() =>
                setShowAdjustmentModal(false)
              }
              submitText="Save Adjustment"
              disabled={saving}
            />
          </form>
        </ModalShell>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <ModalShell
          title="Transfer Stock"
          subtitle="Move stock between Roysambu and Rangau."
          onClose={() =>
            setShowTransferModal(false)
          }
        >
          <form onSubmit={handleTransfer}>
            <div className="space-y-5">
              {/* PRODUCT */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Product
                </label>

                <select
                  value={transferForm.productId}
                  onChange={(event) =>
                    setTransferForm((current) => ({
                      ...current,
                      productId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  required
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} — {product.sku}
                    </option>
                  ))}
                </select>
              </div>

              {/* SOURCE AND DESTINATION */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    From Branch
                  </label>

                  <select
                    value={transferForm.fromBranch}
                    onChange={(event) =>
                      setTransferForm((current) => ({
                        ...current,
                        fromBranch: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    required
                  >
                    <option value="">
                      Select source
                    </option>

                    {branches.map((branch) => (
                      <option
                        key={branch.id}
                        value={branch.id}
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    To Branch
                  </label>

                  <select
                    value={transferForm.toBranch}
                    onChange={(event) =>
                      setTransferForm((current) => ({
                        ...current,
                        toBranch: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    required
                  >
                    <option value="">
                      Select destination
                    </option>

                    {branches.map((branch) => (
                      <option
                        key={branch.id}
                        value={branch.id}
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* QUANTITY */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={transferForm.quantity}
                  onChange={(event) =>
                    setTransferForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  required
                />
              </div>

              {/* REASON */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Reason
                </label>

                <textarea
                  rows="3"
                  value={transferForm.reason}
                  onChange={(event) =>
                    setTransferForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="e.g. Rebalancing stock between branches"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  required
                />
              </div>
            </div>

            <ModalFooter
              onCancel={() =>
                setShowTransferModal(false)
              }
              submitText="Transfer Stock"
              disabled={saving}
            />
          </form>
        </ModalShell>
      )}
    </main>
  );
}

/* =========================
   COMPONENTS
========================= */

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#02337D]">
            {value}
          </p>
        </div>

        <div className="text-3xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-6 py-4 text-sm font-bold transition ${active
          ? "border-[#FE7401] text-[#02337D]"
          : "border-transparent text-gray-500 hover:text-[#02337D]"
        }`}
    >
      {children}
    </button>
  );
}

function BranchStock({
  stock,
  threshold,
}) {
  const isLow = stock.quantity <= threshold;

  return (
    <div>
      <p
        className={`font-bold ${isLow
            ? "text-red-600"
            : "text-gray-900"
          }`}
      >
        {stock.quantity}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Cost: KSh{" "}
        {Number(stock.unitCost).toFixed(2)}
      </p>

      <p className="text-xs text-gray-500">
        Sell: KSh{" "}
        {Number(stock.sellingPrice).toFixed(2)}
      </p>

      {isLow && (
        <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
          LOW STOCK
        </span>
      )}
    </div>
  );
}

function MovementBadge({
  type,
  label,
}) {
  let classes = "bg-gray-100 text-gray-700";

  if (type === "STOCK_IN") {
    classes = "bg-green-100 text-green-700";
  }

  if (type === "ADJUSTMENT_IN") {
    classes = "bg-blue-100 text-blue-700";
  }

  if (type === "ADJUSTMENT_OUT") {
    classes = "bg-red-100 text-red-700";
  }

  if (type === "TRANSFER_IN") {
    classes = "bg-purple-100 text-purple-700";
  }

  if (type === "TRANSFER_OUT") {
    classes = "bg-orange-100 text-orange-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${classes}`}
    >
      {label}
    </span>
  );
}

function SelectedProductInfo({
  product,
}) {
  if (!product) {
    return null;
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-bold text-[#02337D]">
        Selected Product
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <InfoItem
          label="SKU"
          value={product.sku}
        />

        <InfoItem
          label="Category"
          value={product.category}
        />

        <InfoItem
          label="Unit"
          value={product.unit}
        />
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* FIXED HEADER */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#02337D]">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel,
  submitText,
  disabled = false,
}) {
  return (
    <div className="mt-6 flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white pt-5">
      <button
        type="button"
        onClick={onCancel}
        disabled={disabled}
        className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-[#FE7401] px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? "Saving..." : submitText}
      </button>
    </div>
  );
}