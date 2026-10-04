"use client";

import { useMemo, useState } from "react";

const BRANCHES = [
  {
    id: "roysambu",
    name: "Roysambu",
  },
  {
    id: "rangau",
    name: "Rangau",
  },
];

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

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Electrical Extension Cable",
    sku: "ELEC-EXT-001",
    category: "Electrical",
    unit: "Metre",
    lowStockThreshold: 20,

    branches: {
      roysambu: {
        quantity: 50,
        unitCost: 55,
        sellingPrice: 80,
      },
      rangau: {
        quantity: 35,
        unitCost: 57,
        sellingPrice: 82,
      },
    },
  },
  {
    id: 2,
    name: "LED Bulb 12W",
    sku: "LED-BULB-12",
    category: "Lighting",
    unit: "Piece",
    lowStockThreshold: 10,

    branches: {
      roysambu: {
        quantity: 20,
        unitCost: 250,
        sellingPrice: 350,
      },
      rangau: {
        quantity: 8,
        unitCost: 260,
        sellingPrice: 370,
      },
    },
  },
  {
    id: 3,
    name: "Fast Charging USB Cable",
    sku: "USB-CABLE-001",
    category: "Phone Accessories",
    unit: "Piece",
    lowStockThreshold: 10,

    branches: {
      roysambu: {
        quantity: 12,
        unitCost: 350,
        sellingPrice: 500,
      },
      rangau: {
        quantity: 5,
        unitCost: 360,
        sellingPrice: 520,
      },
    },
  },
  {
    id: 4,
    name: "Rechargeable Emergency Lamp",
    sku: "LAMP-EMG-001",
    category: "Lighting",
    unit: "Piece",
    lowStockThreshold: 5,

    branches: {
      roysambu: {
        quantity: 4,
        unitCost: 1400,
        sellingPrice: 1800,
      },
      rangau: {
        quantity: 7,
        unitCost: 1450,
        sellingPrice: 1900,
      },
    },
  },
  {
    id: 5,
    name: "Phone Charger",
    sku: "CHARGER-001",
    category: "Phone Accessories",
    unit: "Piece",
    lowStockThreshold: 8,

    branches: {
      roysambu: {
        quantity: 15,
        unitCost: 550,
        sellingPrice: 800,
      },
      rangau: {
        quantity: 10,
        unitCost: 580,
        sellingPrice: 850,
      },
    },
  },
  {
    id: 6,
    name: "Digital Multimeter",
    sku: "MULTI-001",
    category: "Electrical",
    unit: "Piece",
    lowStockThreshold: 5,

    branches: {
      roysambu: {
        quantity: 6,
        unitCost: 1900,
        sellingPrice: 2500,
      },
      rangau: {
        quantity: 3,
        unitCost: 2000,
        sellingPrice: 2700,
      },
    },
  },
  {
    id: 7,
    name: "Electrical Socket",
    sku: "SOCKET-001",
    category: "Electrical",
    unit: "Piece",
    lowStockThreshold: 10,

    branches: {
      roysambu: {
        quantity: 25,
        unitCost: 300,
        sellingPrice: 450,
      },
      rangau: {
        quantity: 12,
        unitCost: 310,
        sellingPrice: 470,
      },
    },
  },
  {
    id: 8,
    name: "Bluetooth Speaker",
    sku: "SPEAKER-001",
    category: "Electronics",
    unit: "Piece",
    lowStockThreshold: 5,

    branches: {
      roysambu: {
        quantity: 3,
        unitCost: 2800,
        sellingPrice: 3500,
      },
      rangau: {
        quantity: 6,
        unitCost: 2900,
        sellingPrice: 3700,
      },
    },
  },
];

const INITIAL_MOVEMENTS = [
  {
    id: 1,
    date: "2026-10-01 09:30",
    productName: "Electrical Extension Cable",
    sku: "ELEC-EXT-001",
    branch: "roysambu",
    type: "STOCK_IN",
    quantity: 50,
    unit: "Metre",
    unitCost: 55,
    sellingPrice: 80,
    reference: "PUR-001",
    performedBy: "Administrator",
    reason: "Opening stock",
  },
  {
    id: 2,
    date: "2026-10-01 10:15",
    productName: "LED Bulb 12W",
    sku: "LED-BULB-12",
    branch: "rangau",
    type: "STOCK_IN",
    quantity: 8,
    unit: "Piece",
    unitCost: 260,
    sellingPrice: 370,
    reference: "PUR-002",
    performedBy: "Administrator",
    reason: "Supplier delivery",
  },
];

export default function AdminInventoryPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);

  const [activeTab, setActiveTab] = useState("stock");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

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

      return matchesSearch && matchesCategory && matchesBranch;
    });
  }, [products, search, categoryFilter, branchFilter]);

  const totalStockUnits = useMemo(() => {
    return products.reduce((total, product) => {
      return (
        total +
        product.branches.roysambu.quantity +
        product.branches.rangau.quantity
      );
    }, 0);
  }, [products]);

  const stockValue = useMemo(() => {
    return products.reduce((total, product) => {
      return (
        total +
        product.branches.roysambu.quantity *
          product.branches.roysambu.unitCost +
        product.branches.rangau.quantity *
          product.branches.rangau.unitCost
      );
    }, 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    const alerts = [];

    products.forEach((product) => {
      BRANCHES.forEach((branch) => {
        const branchStock = product.branches[branch.id];

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
  }, [products]);

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
      BRANCHES.find((branch) => branch.id === branchId)?.name ||
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
        ? String(product.branches[branchId].unitCost)
        : "",
      sellingPrice: product && branchId
        ? String(product.branches[branchId].sellingPrice)
        : "",
      reason: "",
      reference: "",
    });

    setShowAddStockModal(true);
  };

  const handleAddStock = (event) => {
    event.preventDefault();

    const product = products.find(
      (item) =>
        String(item.id) === String(addStockForm.productId)
    );

    if (!product) {
      alert("Please select a product.");
      return;
    }

    if (!addStockForm.branchId) {
      alert("Please select a branch.");
      return;
    }

    const quantity = Number(addStockForm.quantity);
    const unitCost = Number(addStockForm.unitCost);
    const sellingPrice = Number(addStockForm.sellingPrice);

    if (!quantity || quantity <= 0) {
      alert("Enter a valid stock quantity.");
      return;
    }

    if (unitCost < 0 || !Number.isFinite(unitCost)) {
      alert("Enter a valid unit cost.");
      return;
    }

    if (sellingPrice < 0 || !Number.isFinite(sellingPrice)) {
      alert("Enter a valid selling price.");
      return;
    }

    if (!addStockForm.reason.trim()) {
      alert("Please enter the reason for adding stock.");
      return;
    }

    const branchId = addStockForm.branchId;

    setProducts((currentProducts) =>
      currentProducts.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        const oldBranch = item.branches[branchId];

        return {
          ...item,
          branches: {
            ...item.branches,
            [branchId]: {
              ...oldBranch,
              quantity: oldBranch.quantity + quantity,

              // New purchase cost for this branch
              unitCost,

              // New selling price for this branch
              sellingPrice,
            },
          },
        };
      })
    );

    const movement = {
      id: Date.now(),
      date: new Date().toLocaleString("en-KE"),
      productName: product.name,
      sku: product.sku,
      branch: branchId,
      type: "STOCK_IN",
      quantity,
      unit: product.unit,
      unitCost,
      sellingPrice,
      reference:
        addStockForm.reference.trim() || "N/A",
      performedBy: "Administrator",
      reason: addStockForm.reason.trim(),
    };

    setMovements((currentMovements) => [
      movement,
      ...currentMovements,
    ]);

    alert(
      `Stock added successfully to ${getBranchName(
        branchId
      )}.`
    );

    resetAddStockForm();
    setSelectedProduct(null);
    setShowAddStockModal(false);
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

  const handleAdjustment = (event) => {
    event.preventDefault();

    const product = products.find(
      (item) =>
        String(item.id) ===
        String(adjustmentForm.productId)
    );

    if (!product) {
      alert("Please select a product.");
      return;
    }

    if (!adjustmentForm.branchId) {
      alert("Please select a branch.");
      return;
    }

    const quantity = Number(adjustmentForm.quantity);

    if (!quantity || quantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (!adjustmentForm.reason.trim()) {
      alert("Please provide a reason.");
      return;
    }

    const branchId = adjustmentForm.branchId;
    const currentQuantity =
      product.branches[branchId].quantity;

    if (
      adjustmentForm.type === "decrease" &&
      quantity > currentQuantity
    ) {
      alert(
        "You cannot remove more stock than is currently available."
      );
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        const branch = item.branches[branchId];

        const newQuantity =
          adjustmentForm.type === "increase"
            ? branch.quantity + quantity
            : branch.quantity - quantity;

        return {
          ...item,
          branches: {
            ...item.branches,
            [branchId]: {
              ...branch,
              quantity: newQuantity,
            },
          },
        };
      })
    );

    setMovements((currentMovements) => [
      {
        id: Date.now(),
        date: new Date().toLocaleString("en-KE"),
        productName: product.name,
        sku: product.sku,
        branch: branchId,
        type:
          adjustmentForm.type === "increase"
            ? "ADJUSTMENT_IN"
            : "ADJUSTMENT_OUT",
        quantity,
        unit: product.unit,
        unitCost:
          product.branches[branchId].unitCost,
        sellingPrice:
          product.branches[branchId].sellingPrice,
        reference: "ADJUSTMENT",
        performedBy: "Administrator",
        reason: adjustmentForm.reason.trim(),
      },
      ...currentMovements,
    ]);

    alert("Stock adjustment completed.");

    setShowAdjustmentModal(false);
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

  const handleTransfer = (event) => {
    event.preventDefault();

    const product = products.find(
      (item) =>
        String(item.id) ===
        String(transferForm.productId)
    );

    if (!product) {
      alert("Please select a product.");
      return;
    }

    if (!transferForm.fromBranch) {
      alert("Select the source branch.");
      return;
    }

    if (!transferForm.toBranch) {
      alert("Select the destination branch.");
      return;
    }

    if (
      transferForm.fromBranch ===
      transferForm.toBranch
    ) {
      alert(
        "Source and destination branches must be different."
      );
      return;
    }

    const quantity = Number(transferForm.quantity);

    if (!quantity || quantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    const sourceStock =
      product.branches[transferForm.fromBranch].quantity;

    if (quantity > sourceStock) {
      alert("There is not enough stock in the source branch.");
      return;
    }

    if (!transferForm.reason.trim()) {
      alert("Please enter a transfer reason.");
      return;
    }

    const sourceBranch = transferForm.fromBranch;
    const destinationBranch = transferForm.toBranch;

    const sourceData = product.branches[sourceBranch];

    setProducts((currentProducts) =>
      currentProducts.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        return {
          ...item,
          branches: {
            ...item.branches,

            [sourceBranch]: {
              ...item.branches[sourceBranch],
              quantity:
                item.branches[sourceBranch].quantity -
                quantity,
            },

            [destinationBranch]: {
              ...item.branches[destinationBranch],
              quantity:
                item.branches[destinationBranch].quantity +
                quantity,

              // Transfer existing stock cost and selling price
              unitCost: sourceData.unitCost,
              sellingPrice: sourceData.sellingPrice,
            },
          },
        };
      })
    );

    const reference = `TRF-${Date.now()}`;

    const transferOut = {
      id: Date.now(),
      date: new Date().toLocaleString("en-KE"),
      productName: product.name,
      sku: product.sku,
      branch: sourceBranch,
      type: "TRANSFER_OUT",
      quantity,
      unit: product.unit,
      unitCost: sourceData.unitCost,
      sellingPrice: sourceData.sellingPrice,
      reference,
      performedBy: "Administrator",
      reason: transferForm.reason.trim(),
    };

    const transferIn = {
      id: Date.now() + 1,
      date: new Date().toLocaleString("en-KE"),
      productName: product.name,
      sku: product.sku,
      branch: destinationBranch,
      type: "TRANSFER_IN",
      quantity,
      unit: product.unit,
      unitCost: sourceData.unitCost,
      sellingPrice: sourceData.sellingPrice,
      reference,
      performedBy: "Administrator",
      reason: transferForm.reason.trim(),
    };

    setMovements((currentMovements) => [
      transferIn,
      transferOut,
      ...currentMovements,
    ]);

    alert("Stock transfer completed.");

    setShowTransferModal(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
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

                    {BRANCHES.map((branch) => (
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
                              product.branches.roysambu
                            }
                            threshold={
                              product.lowStockThreshold
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <BranchStock
                            stock={
                              product.branches.rangau
                            }
                            threshold={
                              product.lowStockThreshold
                            }
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
                          label={getMovementLabel(
                            movement.type
                          )}
                        />
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold">
                        {movement.quantity}{" "}
                        {movement.unit}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {formatCurrency(
                          movement.unitCost
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {formatCurrency(
                          movement.sellingPrice
                        )}
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
                      {product.name} — {product.sku}
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECTED PRODUCT INFORMATION */}
              {addStockForm.productId && (
                <SelectedProductInfo
                  product={products.find(
                    (product) =>
                      String(product.id) ===
                      String(
                        addStockForm.productId
                      )
                  )}
                />
              )}

              {/* BRANCH */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Branch
                </label>

                <select
                  value={addStockForm.branchId}
                  onChange={(event) => {
                    const branchId =
                      event.target.value;

                    const product =
                      products.find(
                        (item) =>
                          String(item.id) ===
                          String(
                            addStockForm.productId
                          )
                      );

                    setAddStockForm((current) => ({
                      ...current,
                      branchId,

                      unitCost:
                        product && branchId
                          ? String(
                              product.branches[
                                branchId
                              ].unitCost
                            )
                          : current.unitCost,

                      sellingPrice:
                        product && branchId
                          ? String(
                              product.branches[
                                branchId
                              ].sellingPrice
                            )
                          : current.sellingPrice,
                    }));
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="">
                    Select branch
                  </option>

                  {BRANCHES.map((branch) => (
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
                  min="0.001"
                  step="0.001"
                  value={addStockForm.quantity}
                  onChange={(event) =>
                    setAddStockForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                  required
                />

                {addStockForm.productId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Unit:{" "}
                    {
                      products.find(
                        (product) =>
                          String(product.id) ===
                          String(
                            addStockForm.productId
                          )
                      )?.unit
                    }
                  </p>
                )}
              </div>

              {/* UNIT COST + SELLING PRICE */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Unit Cost
                  </label>

                  <p className="mb-2 text-xs text-gray-500">
                    Amount paid to the supplier per unit.
                  </p>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                      KSh
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={addStockForm.unitCost}
                      onChange={(event) =>
                        setAddStockForm((current) => ({
                          ...current,
                          unitCost:
                            event.target.value,
                        }))
                      }
                      placeholder="e.g. 55.00"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-14 pr-4 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Selling Price
                  </label>

                  <p className="mb-2 text-xs text-gray-500">
                    Current intended selling price per unit.
                  </p>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                      KSh
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={addStockForm.sellingPrice}
                      onChange={(event) =>
                        setAddStockForm((current) => ({
                          ...current,
                          sellingPrice:
                            event.target.value,
                        }))
                      }
                      placeholder="e.g. 80.00"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-14 pr-4 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* PURCHASE SUMMARY */}
              {addStockForm.quantity &&
                addStockForm.unitCost && (
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-sm font-bold text-[#02337D]">
                      Purchase Summary
                    </p>

                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-gray-600">
                        Quantity
                      </span>

                      <span className="font-semibold">
                        {addStockForm.quantity}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-600">
                        Unit Cost
                      </span>

                      <span className="font-semibold">
                        {formatCurrency(
                          Number(
                            addStockForm.unitCost
                          )
                        )}
                      </span>
                    </div>

                    <div className="mt-3 border-t border-blue-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-700">
                          Total Purchase Cost
                        </span>

                        <span className="font-bold text-[#02337D]">
                          {formatCurrency(
                            Number(
                              addStockForm.quantity
                            ) *
                              Number(
                                addStockForm.unitCost
                              )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {/* REASON */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Reason
                </label>

                <textarea
                  value={addStockForm.reason}
                  onChange={(event) =>
                    setAddStockForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  rows="3"
                  placeholder="e.g. New supplier delivery"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* REFERENCE */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Supplier / Purchase Reference
                  <span className="ml-1 font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={addStockForm.reference}
                  onChange={(event) =>
                    setAddStockForm((current) => ({
                      ...current,
                      reference:
                        event.target.value,
                    }))
                  }
                  placeholder="e.g. INV-2026-001"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* WARNING */}
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-bold text-orange-800">
                  Important
                </p>

                <p className="mt-1 text-sm text-orange-700">
                  This stock will be added to the selected
                  branch. The entered unit cost and selling
                  price will be recorded with this stock
                  movement.
                </p>
              </div>
            </div>

            <ModalFooter
              onCancel={() => {
                setShowAddStockModal(false);
                resetAddStockForm();
              }}
              submitText="Add Stock"
            />
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

                  {BRANCHES.map((branch) => (
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
                </select>
              </div>

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
                        fromBranch:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    required
                  >
                    <option value="">
                      Select source
                    </option>

                    {BRANCHES.map((branch) => (
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
                        toBranch:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    required
                  >
                    <option value="">
                      Select destination
                    </option>

                    {BRANCHES.map((branch) => (
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
      className={`border-b-2 px-6 py-4 text-sm font-bold transition ${
        active
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
        className={`font-bold ${
          isLow
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
  let classes =
    "bg-gray-100 text-gray-700";

  if (type === "STOCK_IN") {
    classes =
      "bg-green-100 text-green-700";
  }

  if (type === "ADJUSTMENT_IN") {
    classes =
      "bg-blue-100 text-blue-700";
  }

  if (type === "ADJUSTMENT_OUT") {
    classes =
      "bg-red-100 text-red-700";
  }

  if (type === "TRANSFER_IN") {
    classes =
      "bg-purple-100 text-purple-700";
  }

  if (type === "TRANSFER_OUT") {
    classes =
      "bg-orange-100 text-orange-700";
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
}) {
  return (
    <div className="mt-6 flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white pt-5">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="rounded-xl bg-[#FE7401] px-5 py-3 font-bold text-white hover:bg-orange-600"
      >
        {submitText}
      </button>
    </div>
  );
}