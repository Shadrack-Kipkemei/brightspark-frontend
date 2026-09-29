"use client";

import { useMemo, useState } from "react";

/*
|--------------------------------------------------------------------------
| TEMPORARY FRONTEND DATA
|--------------------------------------------------------------------------
|
| This data will eventually come from the Flask REST API and PostgreSQL.
|
| We are keeping the structure similar to the final backend structure
| so that replacing the mock data later will be easier.
|
*/

const initialStockItems = [
  {
    id: "ST001",
    product: "LED Bulb 12W",
    sku: "BS-LB-001",
    category: "Lighting",
    branch: "Roysambu",
    stock: 25,
    minimumStock: 5,
  },
  {
    id: "ST002",
    product: "Phone Charger",
    sku: "BS-PC-001",
    category: "Phone Accessories",
    branch: "Roysambu",
    stock: 15,
    minimumStock: 5,
  },
  {
    id: "ST003",
    product: "Bluetooth Speaker",
    sku: "BS-BS-001",
    category: "Electronics",
    branch: "Roysambu",
    stock: 3,
    minimumStock: 5,
  },
  {
    id: "ST004",
    product: "Digital Multimeter",
    sku: "BS-DM-001",
    category: "Electrical",
    branch: "Roysambu",
    stock: 8,
    minimumStock: 5,
  },
  {
    id: "ST005",
    product: "LED Flood Light",
    sku: "BS-FL-001",
    category: "Lighting",
    branch: "Rangau",
    stock: 12,
    minimumStock: 5,
  },
  {
    id: "ST006",
    product: "Extension Cable",
    sku: "BS-EC-001",
    category: "Electrical",
    branch: "Rangau",
    stock: 20,
    minimumStock: 5,
  },
  {
    id: "ST007",
    product: "Rechargeable Emergency Lamp",
    sku: "BS-EL-001",
    category: "Electronics",
    branch: "Rangau",
    stock: 2,
    minimumStock: 5,
  },
  {
    id: "ST008",
    product: "USB Type-C Cable",
    sku: "BS-UC-001",
    category: "Phone Accessories",
    branch: "Rangau",
    stock: 30,
    minimumStock: 10,
  },
];

/*
|--------------------------------------------------------------------------
| TEMPORARY USER
|--------------------------------------------------------------------------
|
| Later this will come from JWT authentication.
|
*/

const currentUser = {
  id: "USR001",
  name: "Administrator",
  role: "admin",
};

/*
|--------------------------------------------------------------------------
| TEMPORARY STOCK MOVEMENT HISTORY
|--------------------------------------------------------------------------
|
| In production this will come from PostgreSQL.
|
*/

const initialMovements = [
  {
    id: "MOV001",
    stockId: "ST003",
    product: "Bluetooth Speaker",
    branch: "Roysambu",
    type: "OPENING_STOCK",
    quantity: 20,
    previousStock: 0,
    newStock: 20,
    reason: "Opening stock",
    createdBy: "Administrator",
    createdAt: "2026-09-29 08:00",
    reversed: false,
  },
  {
    id: "MOV002",
    stockId: "ST003",
    product: "Bluetooth Speaker",
    branch: "Roysambu",
    type: "SALE",
    quantity: -17,
    previousStock: 20,
    newStock: 3,
    reason: "Recorded sale",
    createdBy: "Administrator",
    createdAt: "2026-09-29 10:15",
    reversed: false,
  },
];

/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

export default function AdminStockPage() {
  const [stockItems, setStockItems] = useState(
    initialStockItems
  );

  const [movements, setMovements] = useState(
    initialMovements
  );

  const [branch, setBranch] = useState("all");

  const [search, setSearch] = useState("");

  const [stockFilter, setStockFilter] =
    useState("all");

  const [showAddStock, setShowAddStock] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const [showReverse, setShowReverse] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedMovement, setSelectedMovement] =
    useState(null);

  const [quantity, setQuantity] = useState("");

  const [reason, setReason] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FILTER STOCK
  |--------------------------------------------------------------------------
  */

  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {

      const matchesBranch =
        branch === "all" ||
        item.branch === branch;

      const matchesSearch =
        item.product
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.sku
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStockFilter =
        stockFilter === "all" ||
        (stockFilter === "low" &&
          item.stock <= item.minimumStock) ||
        (stockFilter === "available" &&
          item.stock > item.minimumStock);

      return (
        matchesBranch &&
        matchesSearch &&
        matchesStockFilter
      );
    });
  }, [
    stockItems,
    branch,
    search,
    stockFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SUMMARY DATA
  |--------------------------------------------------------------------------
  */

  const totalStock = stockItems.reduce(
    (total, item) => total + item.stock,
    0
  );

  const lowStockCount = stockItems.filter(
    (item) => item.stock <= item.minimumStock
  ).length;

  const roysambuStock = stockItems
    .filter((item) => item.branch === "Roysambu")
    .reduce(
      (total, item) => total + item.stock,
      0
    );

  const rangauStock = stockItems
    .filter((item) => item.branch === "Rangau")
    .reduce(
      (total, item) => total + item.stock,
      0
    );

  /*
  |--------------------------------------------------------------------------
  | OPEN ADD STOCK
  |--------------------------------------------------------------------------
  */

  const openAddStock = (product = null) => {
    setSelectedProduct(product);
    setQuantity("");
    setReason("");
    setShowAddStock(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE ADD STOCK
  |--------------------------------------------------------------------------
  */

  const closeAddStock = () => {
    setShowAddStock(false);
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
  };

  /*
  |--------------------------------------------------------------------------
  | ADD STOCK
  |--------------------------------------------------------------------------
  */

  const handleAddStock = (event) => {
    event.preventDefault();

    const amount = Number(quantity);

    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (!reason.trim()) {
      alert("Please provide a reason.");
      return;
    }

    const previousStock =
      selectedProduct.stock;

    const newStock =
      previousStock + amount;

    /*
    |--------------------------------------------------------------------------
    | UPDATE STOCK
    |--------------------------------------------------------------------------
    */

    setStockItems((currentStock) =>
      currentStock.map((item) =>
        item.id === selectedProduct.id
          ? {
              ...item,
              stock: newStock,
            }
          : item
      )
    );

    /*
    |--------------------------------------------------------------------------
    | CREATE STOCK MOVEMENT
    |--------------------------------------------------------------------------
    */

    const newMovement = {
      id: `MOV${Date.now()}`,
      stockId: selectedProduct.id,
      product: selectedProduct.product,
      branch: selectedProduct.branch,
      type: "STOCK_ADDITION",
      quantity: amount,
      previousStock,
      newStock,
      reason: reason.trim(),
      createdBy: currentUser.name,
      createdAt: new Date().toLocaleString(),
      reversed: false,
    };

    setMovements((currentMovements) => [
      newMovement,
      ...currentMovements,
    ]);

    closeAddStock();
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN HISTORY
  |--------------------------------------------------------------------------
  */

  const openHistory = (product) => {
    setSelectedProduct(product);
    setShowHistory(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE HISTORY
  |--------------------------------------------------------------------------
  */

  const closeHistory = () => {
    setShowHistory(false);
    setSelectedProduct(null);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN REVERSAL
  |--------------------------------------------------------------------------
  */

  const openReverse = (movement) => {
    setSelectedMovement(movement);
    setReason("");
    setShowReverse(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE REVERSAL
  |--------------------------------------------------------------------------
  */

  const closeReverse = () => {
    setShowReverse(false);
    setSelectedMovement(null);
    setReason("");
  };

  /*
  |--------------------------------------------------------------------------
  | REVERSE STOCK MOVEMENT
  |--------------------------------------------------------------------------
  */

  const handleReverse = (event) => {
    event.preventDefault();

    if (!selectedMovement) {
      return;
    }

    if (!reason.trim()) {
      alert("Please provide a reason for the reversal.");
      return;
    }

    if (selectedMovement.reversed) {
      alert("This movement has already been reversed.");
      return;
    }

    const stockItem = stockItems.find(
      (item) =>
        item.id === selectedMovement.stockId
    );

    if (!stockItem) {
      alert("Stock item not found.");
      return;
    }

    const reversalQuantity =
      -selectedMovement.quantity;

    const previousStock =
      stockItem.stock;

    const newStock =
      previousStock + reversalQuantity;

    /*
    |--------------------------------------------------------------------------
    | UPDATE STOCK
    |--------------------------------------------------------------------------
    */

    setStockItems((currentStock) =>
      currentStock.map((item) =>
        item.id === selectedMovement.stockId
          ? {
              ...item,
              stock: newStock,
            }
          : item
      )
    );

    /*
    |--------------------------------------------------------------------------
    | MARK ORIGINAL MOVEMENT AS REVERSED
    |--------------------------------------------------------------------------
    */

    setMovements((currentMovements) =>
      currentMovements.map((movement) =>
        movement.id === selectedMovement.id
          ? {
              ...movement,
              reversed: true,
            }
          : movement
      )
    );

    /*
    |--------------------------------------------------------------------------
    | CREATE REVERSAL MOVEMENT
    |--------------------------------------------------------------------------
    */

    const reversalMovement = {
      id: `MOV${Date.now()}`,
      stockId: selectedMovement.stockId,
      product: selectedMovement.product,
      branch: selectedMovement.branch,
      type: "STOCK_REVERSAL",
      quantity: reversalQuantity,
      previousStock,
      newStock,
      reason: reason.trim(),
      createdBy: currentUser.name,
      createdAt: new Date().toLocaleString(),
      reversed: false,
      reversedMovementId: selectedMovement.id,
    };

    setMovements((currentMovements) => [
      reversalMovement,
      ...currentMovements,
    ]);

    closeReverse();
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-semibold text-[#FE7401]">
              Inventory Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Stock Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage stock and track every stock movement
              across both BrightSpark branches.
            </p>

          </div>

          <button
            type="button"
            onClick={() => openAddStock()}
            className="rounded-xl bg-[#FE7401] px-5 py-3 font-semibold text-white hover:bg-[#D85F00]"
          >
            + Add Stock
          </button>

        </div>

        {/* SUMMARY CARDS */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Stock"
            value={totalStock.toLocaleString()}
            description="Units across all branches"
            icon="📦"
          />

          <SummaryCard
            title="Roysambu"
            value={roysambuStock.toLocaleString()}
            description="Lumumba Drive"
            icon="🏪"
          />

          <SummaryCard
            title="Rangau"
            value={rangauStock.toLocaleString()}
            description="Rangau Branch"
            icon="🏪"
          />

          <SummaryCard
            title="Low Stock"
            value={lowStockCount}
            description="Products need attention"
            icon="⚠️"
            warning
          />

        </div>

        {/* FILTERS */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid gap-5 lg:grid-cols-3">

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Branch
              </label>

              <select
                value={branch}
                onChange={(event) =>
                  setBranch(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              >

                <option value="all">
                  All Branches
                </option>

                <option value="Roysambu">
                  Roysambu - Lumumba Drive
                </option>

                <option value="Rangau">
                  Rangau
                </option>

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Search
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search product or SKU..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stock Status
              </label>

              <select
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              >

                <option value="all">
                  All Stock
                </option>

                <option value="low">
                  Low Stock
                </option>

                <option value="available">
                  Available
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* LOW STOCK ALERT */}

        {lowStockCount > 0 && (
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5">

            <div className="text-2xl">
              ⚠️
            </div>

            <div>

              <h2 className="font-bold text-orange-800">
                Low Stock Alert
              </h2>

              <p className="mt-1 text-sm text-orange-700">
                {lowStockCount} product
                {lowStockCount !== 1
                  ? "s are"
                  : " is"}{" "}
                at or below the minimum stock
                level.
              </p>

            </div>

          </div>
        )}

        {/* STOCK TABLE */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-5">

            <h2 className="font-bold text-[#02337D]">
              Stock Inventory
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredStock.length} products shown
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">

                  <th className="px-5 py-4">
                    Product
                  </th>

                  <th className="px-5 py-4">
                    Category
                  </th>

                  <th className="px-5 py-4">
                    Branch
                  </th>

                  <th className="px-5 py-4">
                    Current Stock
                  </th>

                  <th className="px-5 py-4">
                    Minimum
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredStock.map((item) => {

                  const isLowStock =
                    item.stock <=
                    item.minimumStock;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0"
                    >

                      <td className="px-5 py-4">

                        <p className="font-semibold text-gray-800">
                          {item.product}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {item.sku}
                        </p>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.category}
                      </td>

                      <td className="px-5 py-4">

                        <BranchBadge
                          branch={item.branch}
                        />

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`text-lg font-bold ${
                            isLowStock
                              ? "text-red-600"
                              : "text-gray-800"
                          }`}
                        >
                          {item.stock}
                        </span>

                        <span className="ml-1 text-xs text-gray-400">
                          units
                        </span>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.minimumStock}
                      </td>

                      <td className="px-5 py-4">

                        {isLowStock ? (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                            In Stock
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openHistory(item)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            History
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openAddStock(item)
                            }
                            className="rounded-lg border border-[#02337D] px-3 py-2 text-xs font-semibold text-[#02337D] hover:bg-blue-50"
                          >
                            Add Stock
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {filteredStock.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">
              No stock records found.
            </div>
          )}

        </div>

      </div>

      {/* ================================================================ */}
      {/* ADD STOCK MODAL                                                  */}
      {/* ================================================================ */}

      {showAddStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            <div className="border-b border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-[#02337D]">
                    Add Stock
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Record a new stock movement.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeAddStock}
                  className="text-2xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>

              </div>

            </div>

            <form
              onSubmit={handleAddStock}
              className="space-y-5 p-6"
            >

              {/* PRODUCT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Product
                </label>

                {selectedProduct ? (
                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="font-semibold text-gray-800">
                      {selectedProduct.product}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {selectedProduct.sku}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {selectedProduct.branch}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Current stock:{" "}
                      <strong>
                        {selectedProduct.stock}
                      </strong>
                    </p>

                  </div>
                ) : (
                  <select
                    required
                    value=""
                    onChange={(event) => {

                      const product =
                        stockItems.find(
                          (item) =>
                            item.id ===
                            event.target.value
                        );

                      setSelectedProduct(product);
                    }}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                  >

                    <option value="">
                      Select product
                    </option>

                    {stockItems.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.product} -{" "}
                        {item.branch}
                      </option>
                    ))}

                  </select>
                )}

              </div>

              {/* QUANTITY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
                />

              </div>

              {/* REASON */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Reason
                </label>

                <textarea
                  required
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  rows={3}
                  placeholder="e.g. New stock received from supplier"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
                />

              </div>

              {/* WARNING */}

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                <p className="text-xs leading-5 text-blue-800">
                  This stock addition will be recorded in
                  the stock movement history. It will not
                  simply overwrite the existing stock
                  quantity.
                </p>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeAddStock}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedProduct}
                  className="flex-1 rounded-xl bg-[#02337D] px-4 py-3 font-semibold text-white hover:bg-[#01265C] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Stock
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================================================================ */}
      {/* HISTORY MODAL                                                     */}
      {/* ================================================================ */}

      {showHistory && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 p-6">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#FE7401]">
                  Stock Audit Trail
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                  {selectedProduct.product}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedProduct.branch} •{" "}
                  {selectedProduct.sku}
                </p>

              </div>

              <button
                type="button"
                onClick={closeHistory}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            {/* HISTORY */}

            <div className="max-h-[60vh] overflow-y-auto p-6">

              {movements.filter(
                (movement) =>
                  movement.stockId ===
                  selectedProduct.id
              ).length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  No stock movements recorded.
                </div>
              ) : (
                <div className="space-y-4">

                  {movements
                    .filter(
                      (movement) =>
                        movement.stockId ===
                        selectedProduct.id
                    )
                    .map((movement) => (
                      <MovementCard
                        key={movement.id}
                        movement={movement}
                        onReverse={openReverse}
                      />
                    ))}

                </div>
              )}

            </div>

            {/* FOOTER */}

            <div className="border-t border-gray-200 p-5 text-right">

              <button
                type="button"
                onClick={closeHistory}
                className="rounded-xl bg-[#02337D] px-5 py-3 font-semibold text-white hover:bg-[#01265C]"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================================================================ */}
      {/* REVERSE STOCK MOVEMENT MODAL                                    */}
      {/* ================================================================ */}

      {showReverse && selectedMovement && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            <div className="border-b border-gray-200 p-6">

              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Stock Correction
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                Reverse Stock Entry
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                The original movement will remain in the
                audit history. A new reversal movement
                will be created.
              </p>

            </div>

            <form
              onSubmit={handleReverse}
              className="space-y-5 p-6"
            >

              {/* MOVEMENT DETAILS */}

              <div className="rounded-xl bg-gray-50 p-4">

                <p className="font-semibold text-gray-800">
                  {selectedMovement.product}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedMovement.branch}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-xs text-gray-500">
                      Original Entry
                    </p>

                    <p className="mt-1 font-bold text-gray-800">
                      +{selectedMovement.quantity}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Current Stock
                    </p>

                    <p className="mt-1 font-bold text-gray-800">
                      {
                        stockItems.find(
                          (item) =>
                            item.id ===
                            selectedMovement.stockId
                        )?.stock
                      }
                    </p>

                  </div>

                </div>

              </div>

              {/* REASON */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Reason for Reversal
                </label>

                <textarea
                  required
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  rows={4}
                  placeholder="e.g. Typing error — entered 100 instead of 10"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />

              </div>

              {/* WARNING */}

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                <p className="text-xs leading-5 text-red-700">
                  This action will reduce the current
                  stock by{" "}
                  <strong>
                    {selectedMovement.quantity}
                  </strong>{" "}
                  units and create a permanent reversal
                  record.
                </p>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={closeReverse}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                >
                  Confirm Reversal
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

function SummaryCard({
  title,
  value,
  description,
  icon,
  warning = false,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              warning
                ? "text-red-600"
                : "text-[#02337D]"
            }`}
          >
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-xs text-gray-500">
        {description}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| BRANCH BADGE
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| MOVEMENT CARD
|--------------------------------------------------------------------------
*/

function MovementCard({
  movement,
  onReverse,
}) {
  const isPositive =
    movement.quantity > 0;

  const isReversal =
    movement.type === "STOCK_REVERSAL";

  return (
    <div
      className={`rounded-xl border p-5 ${
        movement.reversed
          ? "border-gray-200 bg-gray-50 opacity-70"
          : "border-gray-200 bg-white"
      }`}
    >

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-start gap-4">

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              isReversal
                ? "bg-red-100"
                : isPositive
                  ? "bg-green-100"
                  : "bg-gray-100"
            }`}
          >
            {isReversal
              ? "↩️"
              : isPositive
                ? "↗️"
                : "↘️"}
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <p className="font-bold text-gray-800">
                {formatMovementType(
                  movement.type
                )}
              </p>

              {movement.reversed && (
                <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
                  Reversed
                </span>
              )}

            </div>

            <p className="mt-1 text-sm text-gray-500">
              {movement.reason}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              {movement.createdAt} •{" "}
              {movement.createdBy}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-5">

          <div className="text-right">

            <p
              className={`text-lg font-bold ${
                movement.quantity > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {movement.quantity > 0
                ? "+"
                : ""}
              {movement.quantity}
            </p>

            <p className="text-xs text-gray-400">
              {movement.previousStock} →{" "}
              {movement.newStock}
            </p>

          </div>

          {movement.type ===
            "STOCK_ADDITION" &&
            !movement.reversed && (
              <button
                type="button"
                onClick={() =>
                  onReverse(movement)
                }
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Reverse
              </button>
            )}

        </div>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MOVEMENT TYPE FORMATTER
|--------------------------------------------------------------------------
*/

function formatMovementType(type) {
  const types = {
    OPENING_STOCK: "Opening Stock",
    STOCK_ADDITION: "Stock Addition",
    STOCK_REVERSAL: "Stock Reversal",
    SALE: "Sale",
    ADJUSTMENT: "Stock Adjustment",
    RETURN: "Customer Return",
    DAMAGED: "Damaged Stock",
    TRANSFER_IN: "Transfer In",
    TRANSFER_OUT: "Transfer Out",
  };

  return types[type] || type;
}