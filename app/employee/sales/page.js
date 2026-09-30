"use client";

import { useMemo, useState } from "react";

/*
|--------------------------------------------------------------------------
| TEMPORARY PRODUCT DATA
|--------------------------------------------------------------------------
| Later this will come from Flask + PostgreSQL.
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

const initialSales = [];

/*
|--------------------------------------------------------------------------
| TEMPORARY LOGGED-IN EMPLOYEE
|--------------------------------------------------------------------------
| Later this information will come from JWT.
|--------------------------------------------------------------------------
*/

const currentUser = {
  id: "EMP001",
  name: "John Employee",
  role: "employee",

  // This will eventually come from the employee account.
  branch: "Roysambu",
};

export default function EmployeeSalesPage() {
  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [products, setProducts] =
    useState(initialProducts);

  const [sales, setSales] =
    useState(initialSales);

  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

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
  | SALE FORM
  |--------------------------------------------------------------------------
  */

  const [saleForm, setSaleForm] =
    useState({
      quantity: "",
      sellingPrice: "",

      customer: "Walk-in Customer",

      paymentMethod: "cash",

      cashAmount: "",

      mpesaAmount: "",

      mpesaReference: "",
    });

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
        .filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(query) ||
            product.sku
              .toLowerCase()
              .includes(query) ||
            product.category
              .toLowerCase()
              .includes(query)
        )
        .slice(0, 8);
    }, [
      productSearch,
      products,
    ]);

  /*
  |--------------------------------------------------------------------------
  | AVAILABLE STOCK
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
  | FORM VALUES
  |--------------------------------------------------------------------------
  */

  const quantity =
    Number(
      saleForm.quantity
    ) || 0;

  const sellingPrice =
    Number(
      saleForm.sellingPrice
    ) || 0;

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
    quantity *
    sellingPrice;

  /*
  |--------------------------------------------------------------------------
  | GROSS PROFIT
  |--------------------------------------------------------------------------
  */

  const grossProfit =
    (
      sellingPrice -
      costPrice
    ) * quantity;

  /*
  |--------------------------------------------------------------------------
  | PAYMENT VALUES
  |--------------------------------------------------------------------------
  */

  const cashAmount =
    Number(
      saleForm.cashAmount
    ) || 0;

  const mpesaAmount =
    Number(
      saleForm.mpesaAmount
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
    amountPaid =
      cashAmount;
  }

  if (
    saleForm.paymentMethod ===
    "mpesa"
  ) {
    amountPaid =
      mpesaAmount;
  }

  if (
    saleForm.paymentMethod ===
    "split"
  ) {
    amountPaid =
      cashAmount +
      mpesaAmount;
  }

  /*
  |--------------------------------------------------------------------------
  | PAYMENT BALANCE
  |--------------------------------------------------------------------------
  */

  const paymentBalance =
    saleTotal -
    amountPaid;

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
  | SEARCH SALES
  |--------------------------------------------------------------------------
  */

  const filteredSales =
    useMemo(() => {
      return sales.filter(
        (sale) => {
          const searchText =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            sale.product
              .toLowerCase()
              .includes(
                searchText
              ) ||
            sale.sku
              .toLowerCase()
              .includes(
                searchText
              ) ||
            sale.id
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesDate =
            !dateFilter ||
            sale.soldAt.startsWith(
              dateFilter
            );

          return (
            matchesSearch &&
            matchesDate
          );
        }
      );
    }, [
      sales,
      search,
      dateFilter,
    ]);

  /*
  |--------------------------------------------------------------------------
  | TODAY'S SALES
  |--------------------------------------------------------------------------
  */

  const totalSales =
    filteredSales.reduce(
      (
        total,
        sale
      ) =>
        total +
        sale.sellingPrice *
          sale.quantity,
      0
    );

  const totalGrossProfit =
    filteredSales.reduce(
      (
        total,
        sale
      ) =>
        total +
        (
          sale.sellingPrice -
          sale.costPrice
        ) *
          sale.quantity,
      0
    );

  const totalItemsSold =
    filteredSales.reduce(
      (
        total,
        sale
      ) =>
        total +
        sale.quantity,
      0
    );

  /*
  |--------------------------------------------------------------------------
  | CURRENCY FORMAT
  |--------------------------------------------------------------------------
  */

  const formatCurrency =
    (amount) => {
      return `KSh ${Number(
        amount || 0
      ).toLocaleString(
        "en-KE",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    };

  /*
  |--------------------------------------------------------------------------
  | QUANTITY FORMAT
  |--------------------------------------------------------------------------
  */

  const formatQuantity =
    (
      amount,
      unit
    ) => {
      const value =
        Number(amount);

      if (
        Number.isInteger(
          value
        )
      ) {
        return `${value} ${unit}`;
      }

      return `${value.toFixed(
        3
      )} ${unit}`;
    };

  /*
  |--------------------------------------------------------------------------
  | UPDATE FORM
  |--------------------------------------------------------------------------
  */

  const updateSaleForm =
    (
      field,
      value
    ) => {
      setSaleForm(
        (current) => ({
          ...current,
          [field]: value,
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | SELECT PRODUCT
  |--------------------------------------------------------------------------
  */

  const handleSelectProduct =
    (product) => {
      setSelectedProduct(
        product
      );

      setProductSearch(
        product.name
      );

      setShowProductResults(
        false
      );

      setSaleForm(
        (current) => ({
          ...current,

          quantity: "",

          sellingPrice: "",

          cashAmount: "",

          mpesaAmount: "",

          mpesaReference: "",
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | PRODUCT SEARCH
  |--------------------------------------------------------------------------
  */

  const handleProductSearch =
    (value) => {
      setProductSearch(
        value
      );

      /*
      |--------------------------------------------------------------------------
      | If employee changes the text
      | after selecting a product,
      | remove selected product.
      |--------------------------------------------------------------------------
      */

      if (
        selectedProduct &&
        value !==
          selectedProduct.name
      ) {
        setSelectedProduct(
          null
        );

        setSaleForm(
          (current) => ({
            ...current,

            quantity: "",

            sellingPrice: "",
          })
        );
      }

      setShowProductResults(
        value.trim()
          .length > 0
      );
    };

  /*
  |--------------------------------------------------------------------------
  | RESET FORM
  |--------------------------------------------------------------------------
  */

  const resetSaleForm =
    () => {
      setSaleForm({
        quantity: "",
        sellingPrice: "",

        customer:
          "Walk-in Customer",

        paymentMethod:
          "cash",

        cashAmount: "",

        mpesaAmount: "",

        mpesaReference: "",
      });

      setProductSearch("");

      setSelectedProduct(
        null
      );

      setShowProductResults(
        false
      );
    };

  /*
  |--------------------------------------------------------------------------
  | OPEN MODAL
  |--------------------------------------------------------------------------
  */

  const openSaleModal =
    () => {
      resetSaleForm();

      setShowSaleModal(
        true
      );
    };

  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  const closeSaleModal =
    () => {
      setShowSaleModal(
        false
      );

      resetSaleForm();
    };

  /*
  |--------------------------------------------------------------------------
  | RECORD SALE
  |--------------------------------------------------------------------------
  */

  const handleRecordSale =
    (event) => {
      event.preventDefault();

      /*
      |--------------------------------------------------------------------------
      | PRODUCT
      |--------------------------------------------------------------------------
      */

      if (
        !selectedProduct
      ) {
        alert(
          "Please search for and select a product."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | QUANTITY
      |--------------------------------------------------------------------------
      */

      if (
        quantity <= 0
      ) {
        alert(
          "Please enter a valid quantity."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | STOCK
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
      | SELLING PRICE
      |--------------------------------------------------------------------------
      */

      if (
        sellingPrice <= 0
      ) {
        alert(
          "Please enter the selling price."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | PAYMENT
      |--------------------------------------------------------------------------
      */

      if (
        !paymentIsCorrect
      ) {
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
          amount:
            cashAmount,
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
          amount:
            mpesaAmount,
          reference:
            saleForm.mpesaReference.trim(),
        });
      }

      /*
      |--------------------------------------------------------------------------
      | SPLIT
      |--------------------------------------------------------------------------
      */

      if (
        saleForm.paymentMethod ===
        "split"
      ) {
        if (
          mpesaAmount >
            0 &&
          !saleForm.mpesaReference.trim()
        ) {
          alert(
            "Please enter the M-Pesa transaction code."
          );

          return;
        }

        if (
          mpesaAmount >
          0
        ) {
          payments.push({
            method:
              "mpesa",

            amount:
              mpesaAmount,

            reference:
              saleForm.mpesaReference.trim(),
          });
        }

        if (
          cashAmount >
          0
        ) {
          payments.push({
            method:
              "cash",

            amount:
              cashAmount,

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
        ).padStart(
          3,
          "0"
        )}`,

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
        | Branch is automatically taken
        | from the employee account.
        |--------------------------------------------------------------------------
        */

        branch:
          currentUser.branch,

        quantity,

        /*
        |--------------------------------------------------------------------------
        | Cost price is automatically
        | taken from the product.
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
      | ADD SALE
      |--------------------------------------------------------------------------
      */

      setSales(
        (current) => [
          newSale,
          ...current,
        ]
      );

      /*
      |--------------------------------------------------------------------------
      | REDUCE STOCK
      |--------------------------------------------------------------------------
      */

      setProducts(
        (current) =>
          current.map(
            (product) => {
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
                    ) -
                    quantity,
                },
              };
            }
          )
      );

      /*
      |--------------------------------------------------------------------------
      | TEMPORARY DEBUG
      |--------------------------------------------------------------------------
      */

      console.log(
        "Employee sale:",
        newSale
      );

      closeSaleModal();
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ================================================================
            PAGE HEADER
        ================================================================ */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-semibold text-[#FE7401]">
              Employee Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Sales
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Record and monitor your sales.
            </p>

          </div>

          <button
            type="button"
            onClick={
              openSaleModal
            }
            className="rounded-xl bg-[#02337D] px-5 py-3 font-semibold text-white transition hover:bg-[#01275f]"
          >
            + Record Sale
          </button>

        </div>

        {/* ================================================================
            BRANCH
        ================================================================ */}

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Assigned Branch
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#02337D]">
            {currentUser.branch ===
            "Roysambu"
              ? "Roysambu - Lumumba Drive"
              : "Rangau"}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Sales and stock changes are automatically
            assigned to your branch.
          </p>

        </div>

        {/* ================================================================
            SUMMARY
        ================================================================ */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Total Sales
            </p>

            <p className="mt-2 text-2xl font-bold text-[#02337D]">
              {formatCurrency(
                totalSales
              )}
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Items Sold
            </p>

            <p className="mt-2 text-2xl font-bold text-[#02337D]">
              {totalItemsSold.toLocaleString()}
            </p>

          </div>

        </div>

        {/* ================================================================
            FILTERS
        ================================================================ */}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Search Sales
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Product, SKU or sale ID..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Date
              </label>

              <input
                type="date"
                value={
                  dateFilter
                }
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
              My Sales
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Sales recorded using your employee account.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">

                  <th className="px-5 py-4">
                    Sale ID
                  </th>

                  <th className="px-5 py-4">
                    Product
                  </th>

                  <th className="px-5 py-4">
                    Quantity
                  </th>

                  <th className="px-5 py-4">
                    Selling Price
                  </th>

                  <th className="px-5 py-4">
                    Total
                  </th>

                  <th className="px-5 py-4">
                    Payment
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredSales.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="8"
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
                              {
                                sale.id
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
                              SKU:{" "}
                              {
                                sale.sku
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {
                                sale.category
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4 font-semibold">

                            {formatQuantity(
                              sale.quantity,
                              sale.unit
                            )}

                          </td>

                          <td className="px-5 py-4">

                            {formatCurrency(
                              sale.sellingPrice
                            )}

                          </td>

                          <td className="px-5 py-4 font-bold text-[#02337D]">

                            {formatCurrency(
                              total
                            )}

                          </td>

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">

                              {sale.paymentMethod ===
                              "mpesa"
                                ? "M-Pesa"
                                : sale.paymentMethod ===
                                  "split"
                                ? "Split"
                                : "Cash"}

                            </span>

                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500">

                            {
                              sale.soldAt
                            }

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
                FIXED HEADER
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
                  {currentUser.branch ===
                  "Roysambu"
                    ? "Roysambu - Lumumba Drive"
                    : "Rangau"}
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
                SCROLLABLE BODY
            ============================================================ */}

            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">

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
                    Search Product
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
                                      stock <=
                                      5
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
                      NO RESULTS
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
                    SELECTED PRODUCT
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

                              quantity:
                                "",

                              sellingPrice:
                                "",
                            })
                          );

                        }}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Change
                      </button>

                    </div>

                    {/* ====================================================
                        AUTOFILLED PRODUCT DETAILS
                    ==================================================== */}

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
                          Available Stock
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
                      placeholder={`Enter quantity in ${selectedProduct.unit.toLowerCase()}s`}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                      Available:{" "}
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
                      Enter the actual price agreed with the customer.
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
                    CASH
                ======================================================== */}

                {selectedProduct &&
                  saleForm.paymentMethod ===
                    "cash" && (

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

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
                      placeholder="Enter cash amount"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#02337D]"
                    />

                  </div>

                )}

                {/* ========================================================
                    MPESA
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
                        Enter the amount paid through M-Pesa and the amount paid in cash.
                      </p>

                    </div>

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

                    {mpesaAmount >
                      0 && (

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

    </div>
  );
}