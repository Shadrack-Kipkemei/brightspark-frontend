"use client";

import { useMemo, useState } from "react";

/*
|--------------------------------------------------------------------------
| TEMPORARY PRODUCT DATA
|--------------------------------------------------------------------------
| This will later come from the Flask REST API + PostgreSQL.
|--------------------------------------------------------------------------
*/

const initialProducts = [
  {
    id: "PROD001",
    name: "LED Bulb 12W",
    sku: "BS-LB-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 150,
    stock: {
      Roysambu: 25,
      Rangau: 15,
    },
  },

  {
    id: "PROD002",
    name: "Electric Cable 2.5mm",
    sku: "BS-EC-002",
    category: "Electrical",
    unit: "Metre",
    costPrice: 50,
    stock: {
      Roysambu: 150,
      Rangau: 85,
    },
  },

  {
    id: "PROD003",
    name: "Electric Cable 1.5mm",
    sku: "BS-EC-003",
    category: "Electrical",
    unit: "Metre",
    costPrice: 35,
    stock: {
      Roysambu: 200,
      Rangau: 100,
    },
  },

  {
    id: "PROD004",
    name: "Perfume",
    sku: "BS-PF-001",
    category: "Perfumes",
    unit: "Millilitre",
    costPrice: 2,
    stock: {
      Roysambu: 2500,
      Rangau: 1500,
    },
  },

  {
    id: "PROD005",
    name: "Phone Charger Type-C",
    sku: "BS-PC-001",
    category: "Phone Accessories",
    unit: "Piece",
    costPrice: 350,
    stock: {
      Roysambu: 30,
      Rangau: 18,
    },
  },
];

/*
|--------------------------------------------------------------------------
| TEMPORARY SALES DATA
|--------------------------------------------------------------------------
*/

const initialSales = [
  {
    id: "SALE001",
    productId: "PROD001",
    product: "LED Bulb 12W",
    sku: "BS-LB-001",
    category: "Lighting",
    branch: "Roysambu",
    quantity: 5,
    unit: "Piece",
    costPrice: 150,
    sellingPrice: 250,
    customer: "Walk-in Customer",
    paymentMethod: "cash",
    payments: [
      {
        method: "cash",
        amount: 1250,
        reference: "",
      },
    ],
    soldBy: "Administrator",
    soldAt: "2026-09-29 09:15",
    status: "COMPLETED",
  },

  {
    id: "SALE002",
    productId: "PROD002",
    product: "Electric Cable 2.5mm",
    sku: "BS-EC-002",
    category: "Electrical",
    branch: "Roysambu",
    quantity: 20,
    unit: "Metre",
    costPrice: 50,
    sellingPrice: 76.35,
    customer: "Walk-in Customer",
    paymentMethod: "mpesa",
    payments: [
      {
        method: "mpesa",
        amount: 1527,
        reference: "QH72ABC123",
      },
    ],
    soldBy: "John Employee",
    soldAt: "2026-09-29 10:30",
    status: "COMPLETED",
  },

  {
    id: "SALE003",
    productId: "PROD004",
    product: "Perfume",
    sku: "BS-PF-001",
    category: "Perfumes",
    branch: "Rangau",
    quantity: 250,
    unit: "Millilitre",
    costPrice: 2,
    sellingPrice: 4,
    customer: "Walk-in Customer",
    paymentMethod: "split",
    payments: [
      {
        method: "mpesa",
        amount: 500,
        reference: "QK82XYZ789",
      },
      {
        method: "cash",
        amount: 500,
        reference: "",
      },
    ],
    soldBy: "Mary Employee",
    soldAt: "2026-09-29 11:45",
    status: "COMPLETED",
  },
];

/*
|--------------------------------------------------------------------------
| TEMPORARY CURRENT USER
|--------------------------------------------------------------------------
| Later this will come from JWT authentication.
|--------------------------------------------------------------------------
*/

const currentUser = {
  id: "USR001",
  name: "Administrator",
  role: "admin",

  /*
  |--------------------------------------------------------------------------
  | Temporary branch
  |--------------------------------------------------------------------------
  | Later this will come from the authenticated user's account.
  |--------------------------------------------------------------------------
  */

  branch: "Roysambu",
};

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function AdminSalesPage() {
  const [products, setProducts] =
    useState(initialProducts);

  const [sales, setSales] =
    useState(initialSales);

  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

  const [branch, setBranch] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | SALE MODAL
  |--------------------------------------------------------------------------
  */

  const [showSaleModal, setShowSaleModal] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | DELETE MODAL
  |--------------------------------------------------------------------------
  */

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [deleteReason, setDeleteReason] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | PRODUCT SEARCH
  |--------------------------------------------------------------------------
  */

  const [productSearch, setProductSearch] =
    useState("");

  const [showProductResults, setShowProductResults] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | NEW SALE FORM
  |--------------------------------------------------------------------------
  */

  const [saleForm, setSaleForm] =
    useState({
      quantity: "",
      sellingPrice: "",
      customer: "Walk-in Customer",

      paymentMethod: "cash",

      mpesaAmount: "",
      cashAmount: "",

      mpesaReference: "",
    });

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
        search.toLowerCase().trim();

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
  | SALES CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const totalSales =
    filteredSales.reduce(
      (total, sale) =>
        total +
        sale.sellingPrice *
          sale.quantity,
      0
    );

  const totalCost =
    filteredSales.reduce(
      (total, sale) =>
        total +
        sale.costPrice *
          sale.quantity,
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
  | FORMAT CURRENCY
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (amount) => {
    return `KSh ${Number(
      amount || 0
    ).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT QUANTITY
  |--------------------------------------------------------------------------
  */

  const formatQuantity = (
    quantity,
    unit
  ) => {
    const value = Number(quantity);

    if (Number.isInteger(value)) {
      return `${value} ${unit}`;
    }

    return `${value.toFixed(3)} ${unit}`;
  };

  /*
  |--------------------------------------------------------------------------
  | PRODUCT SEARCH RESULTS
  |--------------------------------------------------------------------------
  */

  const productSearchResults =
    useMemo(() => {
      const query =
        productSearch
          .toLowerCase()
          .trim();

      if (!query) {
        return [];
      }

      return products
        .filter((product) =>
          product.name
            .toLowerCase()
            .includes(query) ||
          product.sku
            .toLowerCase()
            .includes(query)
        )
        .slice(0, 8);
    }, [
      products,
      productSearch,
    ]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT PRODUCT STOCK
  |--------------------------------------------------------------------------
  */

  const availableStock =
    selectedProduct
      ? Number(
          selectedProduct.stock[
            currentUser.branch
          ] || 0
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | SALE QUANTITY
  |--------------------------------------------------------------------------
  */

  const quantity =
    Number(saleForm.quantity) || 0;

  /*
  |--------------------------------------------------------------------------
  | SELLING PRICE
  |--------------------------------------------------------------------------
  */

  const sellingPrice =
    Number(
      saleForm.sellingPrice
    ) || 0;

  /*
  |--------------------------------------------------------------------------
  | COST PRICE
  |--------------------------------------------------------------------------
  */

  const costPrice =
    selectedProduct
      ? Number(
          selectedProduct.costPrice
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | SALE TOTAL
  |--------------------------------------------------------------------------
  */

  const saleTotal =
    quantity * sellingPrice;

  /*
  |--------------------------------------------------------------------------
  | GROSS PROFIT
  |--------------------------------------------------------------------------
  */

  const newSaleGrossProfit =
    (sellingPrice -
      costPrice) *
    quantity;

  /*
  |--------------------------------------------------------------------------
  | M-PESA
  |--------------------------------------------------------------------------
  */

  const mpesaAmount =
    Number(
      saleForm.mpesaAmount
    ) || 0;

  /*
  |--------------------------------------------------------------------------
  | CASH
  |--------------------------------------------------------------------------
  */

  const cashAmount =
    Number(
      saleForm.cashAmount
    ) || 0;

  /*
  |--------------------------------------------------------------------------
  | AMOUNT PAID
  |--------------------------------------------------------------------------
  */

  let amountPaid = 0;

  if (
    saleForm.paymentMethod ===
    "cash"
  ) {
    amountPaid = cashAmount;
  }

  if (
    saleForm.paymentMethod ===
    "mpesa"
  ) {
    amountPaid = mpesaAmount;
  }

  if (
    saleForm.paymentMethod ===
    "split"
  ) {
    amountPaid =
      mpesaAmount +
      cashAmount;
  }

  /*
  |--------------------------------------------------------------------------
  | PAYMENT BALANCE
  |--------------------------------------------------------------------------
  */

  const paymentBalance =
    saleTotal - amountPaid;

  /*
  |--------------------------------------------------------------------------
  | PAYMENT VALIDATION
  |--------------------------------------------------------------------------
  */

  const paymentIsCorrect =
    saleTotal > 0 &&
    Math.abs(
      paymentBalance
    ) < 0.01;

  /*
  |--------------------------------------------------------------------------
  | RESET SALE FORM
  |--------------------------------------------------------------------------
  */

  const resetSaleForm = () => {
    setSaleForm({
      quantity: "",
      sellingPrice: "",
      customer: "Walk-in Customer",

      paymentMethod: "cash",

      mpesaAmount: "",
      cashAmount: "",

      mpesaReference: "",
    });

    setProductSearch("");
    setSelectedProduct(null);
    setShowProductResults(false);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN SALE MODAL
  |--------------------------------------------------------------------------
  */

  const openSaleModal = () => {
    resetSaleForm();
    setShowSaleModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE SALE MODAL
  |--------------------------------------------------------------------------
  */

  const closeSaleModal = () => {
    setShowSaleModal(false);
    resetSaleForm();
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE SALE FORM
  |--------------------------------------------------------------------------
  */

  const updateSaleForm = (
    field,
    value
  ) => {
    setSaleForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SELECT PRODUCT
  |--------------------------------------------------------------------------
  */

  const handleSelectProduct = (
    product
  ) => {
    setSelectedProduct(product);

    setProductSearch(
      product.name
    );

    setShowProductResults(false);

    /*
    |--------------------------------------------------------------------------
    | Reset values related to previous product
    |--------------------------------------------------------------------------
    */

    setSaleForm((current) => ({
      ...current,
      quantity: "",
      sellingPrice: "",
      mpesaAmount: "",
      cashAmount: "",
      mpesaReference: "",
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLE PRODUCT SEARCH
  |--------------------------------------------------------------------------
  */

  const handleProductSearch = (
    value
  ) => {
    setProductSearch(value);

    /*
    |--------------------------------------------------------------------------
    | If employee changes the product
    | after selecting one, remove the
    | selected product.
    |--------------------------------------------------------------------------
    */

    if (
      selectedProduct &&
      value !== selectedProduct.name
    ) {
      setSelectedProduct(null);

      setSaleForm((current) => ({
        ...current,
        quantity: "",
        sellingPrice: "",
      }));
    }

    setShowProductResults(
      value.trim().length > 0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RECORD SALE
  |--------------------------------------------------------------------------
  */

  const handleRecordSale = (
    event
  ) => {
    event.preventDefault();

    /*
    |--------------------------------------------------------------------------
    | PRODUCT VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!selectedProduct) {
      alert(
        "Please search for and select a product."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | QUANTITY VALIDATION
    |--------------------------------------------------------------------------
    */

    if (quantity <= 0) {
      alert(
        "Quantity must be greater than zero."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      quantity >
      availableStock
    ) {
      alert(
        `Insufficient stock. Only ${formatQuantity(
          availableStock,
          selectedProduct.unit
        )} is available at ${currentUser.branch}.`
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | SELLING PRICE VALIDATION
    |--------------------------------------------------------------------------
    */

    if (sellingPrice <= 0) {
      alert(
        "Please enter the selling price."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | PAYMENT VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!paymentIsCorrect) {
      alert(
        "The payment amount must exactly match the sale total."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | PAYMENT RECORDS
    |--------------------------------------------------------------------------
    */

    const payments = [];

    /*
    |--------------------------------------------------------------------------
    | CASH
    |--------------------------------------------------------------------------
    */

    if (
      saleForm.paymentMethod ===
      "cash"
    ) {
      payments.push({
        method: "cash",
        amount: cashAmount,
        reference: "",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | M-PESA
    |--------------------------------------------------------------------------
    */

    if (
      saleForm.paymentMethod ===
      "mpesa"
    ) {
      if (
        !saleForm.mpesaReference.trim()
      ) {
        alert(
          "Please enter the M-Pesa transaction code."
        );

        return;
      }

      payments.push({
        method: "mpesa",
        amount: mpesaAmount,
        reference:
          saleForm.mpesaReference.trim(),
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SPLIT PAYMENT
    |--------------------------------------------------------------------------
    */

    if (
      saleForm.paymentMethod ===
      "split"
    ) {
      if (
        mpesaAmount > 0 &&
        !saleForm.mpesaReference.trim()
      ) {
        alert(
          "Please enter the M-Pesa transaction code."
        );

        return;
      }

      if (mpesaAmount > 0) {
        payments.push({
          method: "mpesa",
          amount: mpesaAmount,
          reference:
            saleForm.mpesaReference.trim(),
        });
      }

      if (cashAmount > 0) {
        payments.push({
          method: "cash",
          amount: cashAmount,
          reference: "",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE SALE
    |--------------------------------------------------------------------------
    */

    const newSale = {
      id: `SALE${String(
        sales.length + 1
      ).padStart(3, "0")}`,

      /*
      |--------------------------------------------------------------------------
      | Product information comes from
      | the selected product.
      |--------------------------------------------------------------------------
      */

      productId:
        selectedProduct.id,

      product:
        selectedProduct.name,

      sku:
        selectedProduct.sku,

      category:
        selectedProduct.category,

      unit:
        selectedProduct.unit,

      /*
      |--------------------------------------------------------------------------
      | Branch comes from the logged-in
      | employee/admin.
      |--------------------------------------------------------------------------
      */

      branch:
        currentUser.branch,

      quantity,

      /*
      |--------------------------------------------------------------------------
      | Cost price comes automatically
      | from the product.
      |--------------------------------------------------------------------------
      */

      costPrice,

      /*
      |--------------------------------------------------------------------------
      | Employee enters selling price.
      |--------------------------------------------------------------------------
      */

      sellingPrice,

      customer:
        saleForm.customer.trim() ||
        "Walk-in Customer",

      paymentMethod:
        saleForm.paymentMethod,

      payments,

      soldBy:
        currentUser.name,

      soldAt:
        new Date().toLocaleString(
          "en-KE"
        ),

      status:
        "COMPLETED",
    };

    /*
    |--------------------------------------------------------------------------
    | UPDATE SALES
    |--------------------------------------------------------------------------
    */

    setSales((current) => [
      newSale,
      ...current,
    ]);

    /*
    |--------------------------------------------------------------------------
    | UPDATE TEMPORARY STOCK
    |--------------------------------------------------------------------------
    */

    setProducts((current) =>
      current.map((product) => {
        if (
          product.id !==
          selectedProduct.id
        ) {
          return product;
        }

        return {
          ...product,

          stock: {
            ...product.stock,

            [currentUser.branch]:
              Number(
                product.stock[
                  currentUser.branch
                ] || 0
              ) - quantity,
          },
        };
      })
    );

    /*
    |--------------------------------------------------------------------------
    | TEMPORARY CONSOLE LOG
    |--------------------------------------------------------------------------
    | Later this will become a POST
    | request to Flask.
    |--------------------------------------------------------------------------
    */

    console.log(
      "Sale recorded:",
      newSale
    );

    closeSaleModal();
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE SALE
  |--------------------------------------------------------------------------
  */

  const openDeleteModal = (
    sale
  ) => {
    setSelectedSale(sale);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedSale(null);
    setDeleteReason("");
  };

  const handleDeleteSale = (
    event
  ) => {
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
          sale.id !==
          selectedSale.id
      )
    );

    /*
    |--------------------------------------------------------------------------
    | TEMPORARY LOG
    |--------------------------------------------------------------------------
    */

    console.log(
      "Sale deletion:",
      {
        saleId:
          selectedSale.id,

        deletedBy:
          currentUser.name,

        reason:
          deleteReason.trim(),

        deletedAt:
          new Date().toLocaleString(
            "en-KE"
          ),
      }
    );

    closeDeleteModal();
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ================================================================
            HEADER
        ================================================================ */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-semibold text-[#FE7401]">
              Sales Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Sales
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Record and monitor sales
              from BrightSpark.
            </p>

          </div>

          <button
            type="button"
            onClick={
              openSaleModal
            }
            className="rounded-xl bg-[#02337D] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#01275f]"
          >
            + Record Sale
          </button>

        </div>

        {/* ================================================================
            SUMMARY CARDS
        ================================================================ */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Total Sales
            </p>

            <p className="mt-2 text-2xl font-bold text-[#02337D]">
              {formatCurrency(
                totalSales
              )}
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Gross Profit
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(
                grossProfit
              )}
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Items Sold
            </p>

            <p className="mt-2 text-2xl font-bold text-[#02337D]">
              {totalItemsSold.toLocaleString()}
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Number of Sales
            </p>

            <p className="mt-2 text-2xl font-bold text-[#02337D]">
              {
                filteredSales.length
              }
            </p>

          </div>

        </div>

        {/* ================================================================
            FILTERS
        ================================================================ */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

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

        {/* ================================================================
            SALES TABLE
        ================================================================ */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-5">

            <h2 className="font-bold text-[#02337D]">
              Sales Records
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {
                filteredSales.length
              }{" "}
              sales shown
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1500px]">

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
                    Quantity
                  </th>

                  <th className="px-5 py-4">
                    Cost Price
                  </th>

                  <th className="px-5 py-4">
                    Selling Price
                  </th>

                  <th className="px-5 py-4">
                    Total
                  </th>

                  <th className="px-5 py-4">
                    Gross Profit
                  </th>

                  <th className="px-5 py-4">
                    Payment
                  </th>

                  <th className="px-5 py-4">
                    Sold By
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredSales.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="12"
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      No sales found.
                    </td>

                  </tr>

                ) : (

                  filteredSales.map(
                    (sale) => {

                      const total =
                        sale.sellingPrice *
                        sale.quantity;

                      const profit =
                        (
                          sale.sellingPrice -
                          sale.costPrice
                        ) *
                        sale.quantity;

                      return (
                        <tr
                          key={
                            sale.id
                          }
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >

                          <td className="px-5 py-4">

                            <p className="font-semibold text-[#02337D]">
                              {sale.id}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {
                                sale.customer
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <p className="font-semibold text-gray-800">
                              {
                                sale.product
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {sale.sku}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {
                                sale.category
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                sale.branch ===
                                "Roysambu"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {
                                sale.branch
                              }
                            </span>

                          </td>

                          <td className="px-5 py-4 font-semibold text-gray-800">

                            {formatQuantity(
                              sale.quantity,
                              sale.unit
                            )}

                          </td>

                          <td className="px-5 py-4 text-gray-600">

                            {formatCurrency(
                              sale.costPrice
                            )}

                          </td>

                          <td className="px-5 py-4 font-semibold text-gray-800">

                            {formatCurrency(
                              sale.sellingPrice
                            )}

                          </td>

                          <td className="px-5 py-4 font-bold text-[#02337D]">

                            {formatCurrency(
                              total
                            )}

                          </td>

                          <td className="px-5 py-4 font-bold text-green-600">

                            {formatCurrency(
                              profit
                            )}

                          </td>

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">

                              {
                                sale.paymentMethod ===
                                "mpesa"
                                  ? "M-Pesa"
                                  : sale.paymentMethod ===
                                    "split"
                                  ? "Split Payment"
                                  : "Cash"
                              }

                            </span>

                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">

                            {
                              sale.soldBy
                            }

                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500">

                            {
                              sale.soldAt
                            }

                          </td>

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
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ================================================================
          RECORD SALE MODAL
      ================================================================ */}

      {showSaleModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">

            {/* ============================================================
                FIXED MODAL HEADER
            ============================================================ */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white p-6">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#FE7401]">
                  New Sale
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                  Record Sale
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Record a sale for{" "}
                  <span className="font-semibold">
                    {
                      currentUser.branch
                    }
                  </span>
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeSaleModal
                }
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            {/* ============================================================
                SCROLLABLE MODAL BODY
            ============================================================ */}

            <div className="max-h-[calc(90vh-125px)] overflow-y-auto">

              <form
                onSubmit={
                  handleRecordSale
                }
                className="space-y-5 p-6"
              >

                {/* ========================================================
                    PRODUCT SEARCH
                ======================================================== */}

                <div className="relative">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Product
                  </label>

                  <input
                    type="text"
                    value={
                      productSearch
                    }
                    onChange={(event) =>
                      handleProductSearch(
                        event.target.value
                      )
                    }
                    onFocus={() => {
                      if (
                        productSearch.trim()
                      ) {
                        setShowProductResults(
                          true
                        );
                      }
                    }}
                    placeholder="Start typing product name..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D] focus:ring-1 focus:ring-[#02337D]"
                  />

                  {/* ======================================================
                      SEARCH RESULTS
                  ====================================================== */}

                  {showProductResults &&
                    productSearchResults.length >
                      0 && (

                    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                      {productSearchResults.map(
                        (product) => {

                          const stock =
                            Number(
                              product.stock[
                                currentUser.branch
                              ] || 0
                            );

                          return (

                            <button
                              key={
                                product.id
                              }
                              type="button"
                              onClick={() =>
                                handleSelectProduct(
                                  product
                                )
                              }
                              className="block w-full border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
                            >

                              <div className="flex items-center justify-between gap-4">

                                <div>

                                  <p className="font-semibold text-[#02337D]">
                                    {
                                      product.name
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500">
                                    SKU:{" "}
                                    {
                                      product.sku
                                    }
                                    {" • "}
                                    {
                                      product.category
                                    }
                                  </p>

                                </div>

                                <div className="text-right">

                                  <p className="text-xs text-gray-500">
                                    Stock
                                  </p>

                                  <p
                                    className={`font-semibold ${
                                      stock <= 5
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {formatQuantity(
                                      stock,
                                      product.unit
                                    )}
                                  </p>

                                </div>

                              </div>

                            </button>

                          );
                        }
                      )}

                    </div>

                  )}

                  {/* ======================================================
                      NO SEARCH RESULTS
                  ====================================================== */}

                  {showProductResults &&
                    productSearch.trim() &&
                    productSearchResults.length ===
                      0 && (

                    <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-xl">

                      No products found.

                    </div>

                  )}

                </div>

                {/* ========================================================
                    SELECTED PRODUCT INFORMATION
                ======================================================== */}

                {selectedProduct && (

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                          Selected Product
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-[#02337D]">
                          {
                            selectedProduct.name
                          }
                        </h3>

                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(
                            null
                          );

                          setProductSearch(
                            ""
                          );

                          setSaleForm(
                            (current) => ({
                              ...current,
                              quantity: "",
                              sellingPrice: "",
                            })
                          );
                        }}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Change
                      </button>

                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">

                      <div>

                        <p className="text-xs text-gray-500">
                          SKU
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {
                            selectedProduct.sku
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-500">
                          Category
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {
                            selectedProduct.category
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-500">
                          Unit
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {
                            selectedProduct.unit
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-500">
                          Cost Price
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {formatCurrency(
                            selectedProduct.costPrice
                          )}
                        </p>

                      </div>

                      <div className="sm:col-span-2">

                        <p className="text-xs text-gray-500">
                          Available Stock at{" "}
                          {
                            currentUser.branch
                          }
                        </p>

                        <p
                          className={`mt-1 text-lg font-bold ${
                            availableStock <=
                            5
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatQuantity(
                            availableStock,
                            selectedProduct.unit
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {/* ========================================================
                    QUANTITY
                ======================================================== */}

                {selectedProduct && (

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Quantity
                    </label>

                    <input
                      type="number"
                      required
                      min="0.001"
                      step="0.001"
                      max={
                        availableStock
                      }
                      value={
                        saleForm.quantity
                      }
                      onChange={(event) =>
                        updateSaleForm(
                          "quantity",
                          event.target.value
                        )
                      }
                      placeholder={`e.g. 20 ${selectedProduct.unit}`}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                      Maximum available:{" "}
                      {formatQuantity(
                        availableStock,
                        selectedProduct.unit
                      )}
                    </p>

                  </div>

                )}

                {/* ========================================================
                    SELLING PRICE
                ======================================================== */}

                {selectedProduct && (

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Selling Price per{" "}
                      {
                        selectedProduct.unit
                      }
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                        KSh
                      </span>

                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={
                          saleForm.sellingPrice
                        }
                        onChange={(event) =>
                          updateSaleForm(
                            "sellingPrice",
                            event.target.value
                          )
                        }
                        placeholder="Enter selling price"
                        className="w-full rounded-xl border border-gray-300 py-3 pl-14 pr-4 outline-none focus:border-[#FE7401] focus:ring-1 focus:ring-[#FE7401]"
                      />

                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Enter the price at which
                      this product was actually
                      sold.
                    </p>

                  </div>

                )}

                {/* ========================================================
                    SALE SUMMARY
                ======================================================== */}

                {selectedProduct &&
                  quantity > 0 &&
                  sellingPrice > 0 && (

                  <div className="rounded-xl bg-gray-50 p-5">

                    <p className="mb-4 font-semibold text-[#02337D]">
                      Sale Summary
                    </p>

                    <div className="space-y-3">

                      <div className="flex justify-between">

                        <span className="text-sm text-gray-500">
                          Product
                        </span>

                        <span className="text-sm font-semibold text-gray-800">
                          {
                            selectedProduct.name
                          }
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-sm text-gray-500">
                          Quantity
                        </span>

                        <span className="text-sm font-semibold text-gray-800">
                          {formatQuantity(
                            quantity,
                            selectedProduct.unit
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-sm text-gray-500">
                          Selling Price
                        </span>

                        <span className="text-sm font-semibold text-gray-800">
                          {formatCurrency(
                            sellingPrice
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between border-t border-gray-200 pt-3">

                        <span className="font-semibold text-gray-700">
                          Total
                        </span>

                        <span className="text-xl font-bold text-[#02337D]">
                          {formatCurrency(
                            saleTotal
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-sm text-gray-500">
                          Gross Profit
                        </span>

                        <span
                          className={`font-semibold ${
                            newSaleGrossProfit >=
                            0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            newSaleGrossProfit
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                )}

                {/* ========================================================
                    CUSTOMER
                ======================================================== */}

                {selectedProduct && (

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Customer
                    </label>

                    <input
                      type="text"
                      value={
                        saleForm.customer
                      }
                      onChange={(event) =>
                        updateSaleForm(
                          "customer",
                          event.target.value
                        )
                      }
                      placeholder="Walk-in Customer"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                    />

                  </div>

                )}

                {/* ========================================================
                    PAYMENT METHOD
                ======================================================== */}

                {selectedProduct &&
                  saleTotal > 0 && (

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Payment Method
                    </label>

                    <select
                      value={
                        saleForm.paymentMethod
                      }
                      onChange={(event) =>
                        updateSaleForm(
                          "paymentMethod",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                    >

                      <option value="cash">
                        Cash
                      </option>

                      <option value="mpesa">
                        M-Pesa
                      </option>

                      <option value="split">
                        Split Payment
                      </option>

                    </select>

                  </div>

                )}

                {/* ========================================================
                    CASH PAYMENT
                ======================================================== */}

                {selectedProduct &&
                  saleForm.paymentMethod ===
                    "cash" && (

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Cash Received
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        saleForm.cashAmount
                      }
                      onChange={(event) =>
                        updateSaleForm(
                          "cashAmount",
                          event.target.value
                        )
                      }
                      placeholder="Enter cash amount"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#02337D]"
                    />

                  </div>

                )}

                {/* ========================================================
                    MPESA PAYMENT
                ======================================================== */}

                {selectedProduct &&
                  saleForm.paymentMethod ===
                    "mpesa" && (

                  <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        M-Pesa Amount
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          saleForm.mpesaAmount
                        }
                        onChange={(event) =>
                          updateSaleForm(
                            "mpesaAmount",
                            event.target.value
                          )
                        }
                        placeholder="Enter M-Pesa amount"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#02337D]"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        M-Pesa Transaction Code
                      </label>

                      <input
                        type="text"
                        value={
                          saleForm.mpesaReference
                        }
                        onChange={(event) =>
                          updateSaleForm(
                            "mpesaReference",
                            event.target.value.toUpperCase()
                          )
                        }
                        placeholder="e.g. QH72ABC123"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 uppercase outline-none focus:border-[#02337D]"
                      />

                    </div>

                  </div>

                )}

                {/* ========================================================
                    SPLIT PAYMENT
                ======================================================== */}

                {selectedProduct &&
                  saleForm.paymentMethod ===
                    "split" && (

                  <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-4">

                    <div>

                      <p className="font-semibold text-gray-800">
                        Split Payment
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        The M-Pesa amount and
                        cash amount must add up
                        to the total sale amount.
                      </p>

                    </div>

                    {/* MPESA */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        M-Pesa Amount
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          saleForm.mpesaAmount
                        }
                        onChange={(event) =>
                          updateSaleForm(
                            "mpesaAmount",
                            event.target.value
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#02337D]"
                      />

                    </div>

                    {/* MPESA CODE */}

                    {mpesaAmount > 0 && (

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          M-Pesa Transaction Code
                        </label>

                        <input
                          type="text"
                          value={
                            saleForm.mpesaReference
                          }
                          onChange={(event) =>
                            updateSaleForm(
                              "mpesaReference",
                              event.target.value.toUpperCase()
                            )
                          }
                          placeholder="e.g. QH72ABC123"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 uppercase outline-none focus:border-[#02337D]"
                        />

                      </div>

                    )}

                    {/* CASH */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Cash Amount
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          saleForm.cashAmount
                        }
                        onChange={(event) =>
                          updateSaleForm(
                            "cashAmount",
                            event.target.value
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#02337D]"
                      />

                    </div>

                  </div>

                )}

                {/* ========================================================
                    PAYMENT SUMMARY
                ======================================================== */}

                {selectedProduct &&
                  saleTotal > 0 && (

                  <div
                    className={`rounded-xl border p-4 ${
                      paymentIsCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >

                    <div className="flex justify-between">

                      <span className="text-sm text-gray-600">
                        Sale Total
                      </span>

                      <span className="font-bold">
                        {formatCurrency(
                          saleTotal
                        )}
                      </span>

                    </div>

                    <div className="mt-2 flex justify-between">

                      <span className="text-sm text-gray-600">
                        Amount Paid
                      </span>

                      <span className="font-bold">
                        {formatCurrency(
                          amountPaid
                        )}
                      </span>

                    </div>

                    <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">

                      <span className="text-sm font-semibold text-gray-700">
                        {paymentIsCorrect
                          ? "Payment Status"
                          : paymentBalance >
                            0
                          ? "Balance Remaining"
                          : "Overpayment"}
                      </span>

                      <span
                        className={`font-bold ${
                          paymentIsCorrect
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {paymentIsCorrect
                          ? "FULLY PAID"
                          : formatCurrency(
                              Math.abs(
                                paymentBalance
                              )
                            )}
                      </span>

                    </div>

                  </div>

                )}

                {/* ========================================================
                    BUTTONS
                ======================================================== */}

                <div className="flex gap-3 pt-2">

                  <button
                    type="button"
                    onClick={
                      closeSaleModal
                    }
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      !selectedProduct ||
                      !paymentIsCorrect ||
                      quantity <= 0 ||
                      quantity >
                        availableStock ||
                      sellingPrice <= 0
                    }
                    className="flex-1 rounded-xl bg-[#02337D] px-4 py-3 font-semibold text-white hover:bg-[#01275f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Complete Sale
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {/* ================================================================
          DELETE SALE MODAL
      ================================================================ */}

      {showDeleteModal &&
        selectedSale && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

            <div className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">

              {/* FIXED HEADER */}

              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white p-6">

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

              {/* SCROLLABLE CONTENT */}

              <div className="max-h-[calc(90vh-105px)] overflow-y-auto">

                <form
                  onSubmit={
                    handleDeleteSale
                  }
                  className="space-y-5 p-6"
                >

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="font-semibold text-gray-800">
                      {
                        selectedSale.product
                      }
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Sale ID:{" "}
                      {
                        selectedSale.id
                      }
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity:{" "}
                      {formatQuantity(
                        selectedSale.quantity,
                        selectedSale.unit
                      )}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Branch:{" "}
                      {
                        selectedSale.branch
                      }
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
                      Deleting an incorrect
                      sale will eventually
                      restore the stock in the
                      backend and retain an
                      audit record.
                    </p>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Reason for deletion
                    </label>

                    <textarea
                      required
                      value={
                        deleteReason
                      }
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

          </div>

        )}

    </div>
  );
}