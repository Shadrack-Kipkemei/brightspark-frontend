"use client";

import { useMemo, useState } from "react";

const initialSales = [
  {
    id: "SALE001",
    product: "LED Bulb 12W",
    sku: "BS-LB-001",
    category: "Lighting",
    branch: "Roysambu",
    quantity: 5,
    costPrice: 150,
    sellingPrice: 250,
    customer: "Walk-in Customer",
    soldBy: "Administrator",
    soldAt: "2026-09-29 09:15",
    status: "COMPLETED",
  },
  {
    id: "SALE002",
    product: "Bluetooth Speaker",
    sku: "BS-BS-001",
    category: "Electronics",
    branch: "Roysambu",
    quantity: 2,
    costPrice: 1800,
    sellingPrice: 2500,
    customer: "Walk-in Customer",
    soldBy: "John Employee",
    soldAt: "2026-09-29 10:30",
    status: "COMPLETED",
  },
  {
    id: "SALE003",
    product: "USB Type-C Cable",
    sku: "BS-UC-001",
    category: "Phone Accessories",
    branch: "Rangau",
    quantity: 10,
    costPrice: 180,
    sellingPrice: 300,
    customer: "Walk-in Customer",
    soldBy: "Mary Employee",
    soldAt: "2026-09-29 11:45",
    status: "COMPLETED",
  },
  {
    id: "SALE004",
    product: "Extension Cable 5M",
    sku: "BS-EC-001",
    category: "Electrical",
    branch: "Rangau",
    quantity: 3,
    costPrice: 700,
    sellingPrice: 1000,
    customer: "Walk-in Customer",
    soldBy: "John Employee",
    soldAt: "2026-09-29 14:20",
    status: "COMPLETED",
  },
];

/*
|--------------------------------------------------------------------------
| TEMPORARY CURRENT USER
|--------------------------------------------------------------------------
| Later this will come from JWT authentication.
*/
const currentUser = {
  id: "USR001",
  name: "Administrator",
  role: "admin",
};

export default function AdminSalesPage() {
  const [sales, setSales] = useState(initialSales);

  const [branch, setBranch] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [deleteReason, setDeleteReason] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | FILTER SALES
  |--------------------------------------------------------------------------
  */

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesBranch =
        branch === "all" ||
        sale.branch === branch;

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        sale.product
          .toLowerCase()
          .includes(searchText) ||
        sale.sku
          .toLowerCase()
          .includes(searchText) ||
        sale.customer
          .toLowerCase()
          .includes(searchText) ||
        sale.soldBy
          .toLowerCase()
          .includes(searchText) ||
        sale.id
          .toLowerCase()
          .includes(searchText);

      const matchesDate =
        !dateFilter ||
        sale.soldAt.startsWith(dateFilter);

      return (
        matchesBranch &&
        matchesSearch &&
        matchesDate
      );
    });
  }, [
    sales,
    branch,
    search,
    dateFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const totalSales = filteredSales.reduce(
    (total, sale) =>
      total +
      sale.sellingPrice * sale.quantity,
    0
  );

  const totalCost = filteredSales.reduce(
    (total, sale) =>
      total +
      sale.costPrice * sale.quantity,
    0
  );

  const grossProfit =
    totalSales - totalCost;

  const totalItemsSold =
    filteredSales.reduce(
      (total, sale) =>
        total + sale.quantity,
      0
    );

  /*
  |--------------------------------------------------------------------------
  | DELETE SALE
  |--------------------------------------------------------------------------
  */

  const openDeleteModal = (sale) => {
    setSelectedSale(sale);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedSale(null);
    setDeleteReason("");
  };

  const handleDeleteSale = (event) => {
    event.preventDefault();

    if (!selectedSale) {
      return;
    }

    if (!deleteReason.trim()) {
      alert(
        "Please provide a reason for deleting this sale."
      );
      return;
    }

    setSales((current) =>
      current.filter(
        (sale) =>
          sale.id !== selectedSale.id
      )
    );

    console.log("Sale deleted:", {
      saleId: selectedSale.id,
      deletedBy: currentUser.name,
      reason: deleteReason.trim(),
      deletedAt:
        new Date().toLocaleString(),
    });

    closeDeleteModal();
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT CURRENCY
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (amount) => {
    return `KSh ${amount.toLocaleString()}`;
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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-[#FE7401]">
              Sales Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Sales
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View, monitor and manage sales
              from both BrightSpark branches.
            </p>
          </div>

        </div>

        {/* SUMMARY CARDS */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL SALES */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Total Sales
            </p>

            <p className="mt-2 text-2xl font-bold text-[#02337D]">
              {formatCurrency(totalSales)}
            </p>

          </div>

          {/* GROSS PROFIT */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Gross Profit
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(grossProfit)}
            </p>

          </div>

          {/* ITEMS SOLD */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Items Sold
            </p>

            <p className="mt-2 text-2xl font-bold text-[#02337D]">
              {totalItemsSold}
            </p>

          </div>

          {/* SALES COUNT */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Number of Sales
            </p>

            <p className="mt-2 text-2xl font-bold text-[#02337D]">
              {filteredSales.length}
            </p>

          </div>

        </div>

        {/* FILTERS */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Product, SKU, sale ID..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
              />
            </div>

            {/* BRANCH */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Branch
              </label>

              <select
                value={branch}
                onChange={(event) =>
                  setBranch(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
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

            {/* DATE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Date
              </label>

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
              />
            </div>

          </div>

        </div>

        {/* SALES TABLE */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-5">

            <h2 className="font-bold text-[#02337D]">
              Sales Records
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredSales.length} sales shown
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1400px]">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">

                  <th className="px-5 py-4">
                    Sale
                  </th>

                  <th className="px-5 py-4">
                    Product
                  </th>

                  <th className="px-5 py-4">
                    Branch
                  </th>

                  <th className="px-5 py-4">
                    Qty
                  </th>

                  <th className="px-5 py-4">
                    Cost Price
                  </th>

                  <th className="px-5 py-4">
                    Selling Price
                  </th>

                  <th className="px-5 py-4">
                    Total Sale
                  </th>

                  <th className="px-5 py-4">
                    Gross Profit
                  </th>

                  <th className="px-5 py-4">
                    Sold By
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredSales.length === 0 ? (

                  <tr>

                    <td
                      colSpan="11"
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      No sales found.
                    </td>

                  </tr>

                ) : (

                  filteredSales.map((sale) => {

                    const total =
                      sale.sellingPrice *
                      sale.quantity;

                    const profit =
                      (sale.sellingPrice -
                        sale.costPrice) *
                      sale.quantity;

                    return (
                      <tr
                        key={sale.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >

                        {/* SALE ID */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-[#02337D]">
                            {sale.id}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {sale.customer}
                          </p>

                        </td>

                        {/* PRODUCT */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-gray-800">
                            {sale.product}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {sale.sku}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {sale.category}
                          </p>

                        </td>

                        {/* BRANCH */}

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              sale.branch ===
                              "Roysambu"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {sale.branch}
                          </span>

                        </td>

                        {/* QUANTITY */}

                        <td className="px-5 py-4 font-semibold text-gray-800">
                          {sale.quantity}
                        </td>

                        {/* COST */}

                        <td className="px-5 py-4 text-gray-700">
                          {formatCurrency(
                            sale.costPrice
                          )}
                        </td>

                        {/* SELLING */}

                        <td className="px-5 py-4 text-gray-700">
                          {formatCurrency(
                            sale.sellingPrice
                          )}
                        </td>

                        {/* TOTAL */}

                        <td className="px-5 py-4 font-bold text-[#02337D]">
                          {formatCurrency(total)}
                        </td>

                        {/* PROFIT */}

                        <td className="px-5 py-4 font-bold text-green-600">
                          {formatCurrency(profit)}
                        </td>

                        {/* SOLD BY */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-700">
                            {sale.soldBy}
                          </p>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {sale.soldAt}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          {currentUser.role ===
                            "admin" && (
                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(
                                  sale
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
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

        </div>

      </div>

      {/* DELETE SALE MODAL */}

      {showDeleteModal &&
        selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-gray-200 p-6">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                    Incorrect Sale
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                    Delete Sale
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={
                    closeDeleteModal
                  }
                  className="text-2xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>

              </div>

              {/* CONTENT */}

              <form
                onSubmit={
                  handleDeleteSale
                }
                className="space-y-5 p-6"
              >

                <div className="rounded-xl bg-gray-50 p-4">

                  <p className="font-semibold text-gray-800">
                    {selectedSale.product}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Sale ID:{" "}
                    {selectedSale.id}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Quantity:{" "}
                    {selectedSale.quantity}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Branch:{" "}
                    {selectedSale.branch}
                  </p>

                  <p className="mt-1 font-semibold text-[#02337D]">
                    Total:{" "}
                    {formatCurrency(
                      selectedSale.sellingPrice *
                        selectedSale.quantity
                    )}
                  </p>

                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                  <p className="text-sm leading-5 text-red-700">
                    Deleting an incorrect sale
                    will eventually also require
                    the backend to restore the
                    corresponding stock and
                    maintain an audit record.
                  </p>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Reason for deletion
                  </label>

                  <textarea
                    required
                    value={deleteReason}
                    onChange={(event) =>
                      setDeleteReason(
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="e.g. Incorrect quantity entered"
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  />

                </div>

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={
                      closeDeleteModal
                    }
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                  >
                    Delete Sale
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
}