"use client";

import { useMemo, useState } from "react";

const BRAND = {
  navy: "#02337D",
  orange: "#FE7401",
};

const CURRENT_EMPLOYEE = {
  id: "EMP-001",
  name: "John Employee",
  branch: "Roysambu",
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
  },
  {
    id: 2,
    name: "LED Bulb 12W",
    sku: "LED-12W-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 220,
    stock: 20,
  },
  {
    id: 3,
    name: "Electrical Extension Cable",
    sku: "CAB-EXT-001",
    category: "Electrical",
    unit: "Metre",
    costPrice: 55,
    stock: 50,
  },
  {
    id: 4,
    name: "Rechargeable Emergency Lamp",
    sku: "LMP-EMG-001",
    category: "Lighting",
    unit: "Piece",
    costPrice: 1200,
    stock: 4,
  },
  {
    id: 5,
    name: "Phone Charger",
    sku: "CHR-001",
    category: "Phone Accessories",
    unit: "Piece",
    costPrice: 500,
    stock: 15,
  },
  {
    id: 6,
    name: "Digital Multimeter",
    sku: "ELC-MUL-001",
    category: "Electrical",
    unit: "Piece",
    costPrice: 1800,
    stock: 6,
  },
  {
    id: 7,
    name: "Electrical Socket",
    sku: "SOC-001",
    category: "Electrical",
    unit: "Piece",
    costPrice: 280,
    stock: 25,
  },
  {
    id: 8,
    name: "Bluetooth Speaker",
    sku: "SPK-BT-001",
    category: "Electronics",
    unit: "Piece",
    costPrice: 2500,
    stock: 3,
  },
];

const INITIAL_SALES = [
  {
    id: "SALE-001",
    invoiceNumber: "BS-2026-0001",
    branch: "Roysambu",
    employee: "John Employee",
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
          <h2
            className="text-xl font-bold"
            style={{ color: BRAND.navy }}
          >
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
  const [sales, setSales] = useState(INITIAL_SALES);

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const [selectedSale, setSelectedSale] = useState(null);

  const [search, setSearch] = useState("");

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

  const filteredProducts = useMemo(() => {
    const query = saleForm.productSearch.trim().toLowerCase();

    if (!query) return [];

    return DEMO_PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [saleForm.productSearch]);

  const employeeSales = sales.filter(
    (sale) => sale.employee === CURRENT_EMPLOYEE.name
  );

  const visibleSales = employeeSales.filter((sale) =>
    `${sale.invoiceNumber} ${sale.items
      .map((item) => item.productName)
      .join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const saleQuantity = Number(saleForm.quantity || 0);
  const salePrice = Number(saleForm.actualSellingPrice || 0);

  const saleTotal = saleQuantity * salePrice;

  const saleCost =
    saleForm.product && saleQuantity
      ? saleQuantity * saleForm.product.costPrice
      : 0;

  const saleGrossProfit = saleTotal - saleCost;

  const paymentTotal =
    saleForm.paymentMethod === "Cash"
      ? Number(saleForm.cashAmount || 0)
      : saleForm.paymentMethod === "M-Pesa"
        ? Number(saleForm.mpesaAmount || 0)
        : Number(saleForm.cashAmount || 0) +
          Number(saleForm.mpesaAmount || 0);

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
  }

  function selectProduct(product) {
    setSaleForm((prev) => ({
      ...prev,
      product,
      productSearch: product.name,
    }));
  }

  function changePaymentMethod(method) {
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
      alert("Quantity exceeds available stock.");
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
      invoiceNumber: `BS-2026-${String(
        sales.length + 1
      ).padStart(4, "0")}`,
      branch: CURRENT_EMPLOYEE.branch,
      employee: CURRENT_EMPLOYEE.name,
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
      alert("Refund quantity cannot exceed the original quantity.");
      return;
    }

    if (!refundForm.reason.trim()) {
      alert("Enter the refund reason.");
      return;
    }

    const refundAmount =
      quantity * item.actualSellingPrice;

    const paymentTotal =
      refundForm.paymentMethod === "Cash"
        ? Number(refundForm.cashAmount || 0)
        : refundForm.paymentMethod === "M-Pesa"
          ? Number(refundForm.mpesaAmount || 0)
          : Number(refundForm.cashAmount || 0) +
            Number(refundForm.mpesaAmount || 0);

    if (Math.abs(paymentTotal - refundAmount) > 0.01) {
      alert("Refund payment amounts must equal refund amount.");
      return;
    }

    setSales((prev) =>
      prev.map((sale) => {
        if (sale.id !== selectedSale.id) {
          return sale;
        }

        const remainingQuantity =
          item.quantity - quantity;

        const newTotal =
          sale.totalAmount - refundAmount;

        const reversedCost =
          quantity * item.costPrice;

        const newCost =
          sale.totalCost - reversedCost;

        return {
          ...sale,
          totalAmount: newTotal,
          totalCost: newCost,
          grossProfit: newTotal - newCost,
          status:
            remainingQuantity === 0
              ? "REFUNDED"
              : sale.status,
          items:
            remainingQuantity === 0
              ? []
              : [
                  {
                    ...item,
                    quantity: remainingQuantity,
                    total:
                      remainingQuantity *
                      item.actualSellingPrice,
                  },
                ],
        };
      })
    );

    setShowRefundModal(false);
    setSelectedSale(null);
  }

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
                {CURRENT_EMPLOYEE.name}
              </p>

              <p className="text-sm text-gray-500">
                Branch: {CURRENT_EMPLOYEE.branch}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="My Sales"
            value={employeeSales.length}
          />

          <SummaryCard
            title="Sales Value"
            value={money(
              employeeSales.reduce(
                (sum, sale) =>
                  sum + sale.totalAmount,
                0
              )
            )}
          />

          <SummaryCard
            title="Gross Profit"
            value={money(
              employeeSales.reduce(
                (sum, sale) =>
                  sum + sale.grossProfit,
                0
              )
            )}
          />
        </div>

        <div className="mb-5 flex flex-col gap-4 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or product..."
            className="flex-1 rounded-xl border bg-white px-4 py-3"
          />

          <button
            onClick={() => setShowSaleModal(true)}
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
                  <th className="px-5 py-4 text-left">
                    Invoice
                  </th>

                  <th className="px-5 py-4 text-left">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left">
                    Quantity
                  </th>

                  <th className="px-5 py-4 text-left">
                    Total
                  </th>

                  <th className="px-5 py-4 text-left">
                    Profit
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
                {visibleSales.map((sale) => {
                  const item = sale.items[0];

                  return (
                    <tr
                      key={sale.id}
                      className="border-t"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {sale.invoiceNumber}
                      </td>

                      <td className="px-5 py-4">
                        {item?.productName || "Refunded"}
                      </td>

                      <td className="px-5 py-4">
                        {item
                          ? `${item.quantity} ${item.unit}`
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        {money(sale.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        {money(sale.grossProfit)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={sale.status}
                        />
                      </td>

                      <td className="px-5 py-4 text-right">
                        {sale.status !== "REFUNDED" &&
                          sale.status !== "VOIDED" && (
                            <button
                              onClick={() =>
                                openRefund(sale)
                              }
                              className="rounded-lg border px-3 py-2 text-sm"
                            >
                              Refund
                            </button>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
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
                style={{
                  backgroundColor: BRAND.orange,
                }}
              >
                Record Sale
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-gray-500">
                Sale Branch
              </p>

              <p
                className="text-lg font-bold"
                style={{ color: BRAND.navy }}
              >
                {CURRENT_EMPLOYEE.branch}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Your branch is assigned by your account.
              </p>
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
                placeholder="Search by product name, SKU or category..."
                className="w-full rounded-xl border px-4 py-3"
              />

              {filteredProducts.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() =>
                        selectProduct(product)
                      }
                      className="block w-full border-b p-4 text-left last:border-b-0 hover:bg-gray-50"
                    >
                      <p className="font-semibold">
                        {product.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {product.sku} ·{" "}
                        {product.category}
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
                  style={{
                    color: BRAND.navy,
                  }}
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
                    value={money(
                      saleForm.product.costPrice
                    )}
                  />
                </div>

                <div className="mt-4 rounded-lg bg-white p-3">
                  <p className="text-sm text-gray-500">
                    Available Stock
                  </p>

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
                placeholder="Enter actual negotiated price"
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
                {[
                  "Cash",
                  "M-Pesa",
                  "Split Payment",
                ].map((method) => (
                  <button
                    key={method}
                    onClick={() =>
                      changePaymentMethod(method)
                    }
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                      saleForm.paymentMethod === method
                        ? "text-white"
                        : ""
                    }`}
                    style={
                      saleForm.paymentMethod === method
                        ? {
                            backgroundColor:
                              BRAND.navy,
                          }
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

            {saleForm.paymentMethod ===
              "Split Payment" && (
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
                onClick={() =>
                  setShowRefundModal(false)
                }
                className="rounded-xl border px-5 py-3"
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
                const quantity = Number(
                  refundForm.quantity || 0
                );

                const refundAmount =
                  quantity *
                  item.actualSellingPrice;

                return (
                  <div key={item.productId}>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="font-bold">
                        {item.productName}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.sku} · {item.unit}
                      </p>

                      <p className="mt-2 text-sm">
                        Original quantity:{" "}
                        <strong>
                          {item.quantity}{" "}
                          {item.unit}
                        </strong>
                      </p>

                      <p className="text-sm">
                        Actual selling price:{" "}
                        <strong>
                          {money(
                            item.actualSellingPrice
                          )}
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
                label="Refund Reason"
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
                      stockDestination:
                        e.target.value,
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
                  {[
                    "Cash",
                    "M-Pesa",
                    "Split Payment",
                  ].map((method) => (
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
                        refundForm.paymentMethod ===
                        method
                          ? "text-white"
                          : ""
                      }`}
                      style={
                        refundForm.paymentMethod ===
                        method
                          ? {
                              backgroundColor:
                                BRAND.navy,
                            }
                          : {}
                      }
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {refundForm.paymentMethod ===
                "Cash" && (
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

              {refundForm.paymentMethod ===
                "M-Pesa" && (
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

              {refundForm.paymentMethod ===
                "Split Payment" && (
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
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        classes[status] ||
        "bg-gray-100 text-gray-600"
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

function PaymentValidation({
  paymentTotal,
  saleTotal,
}) {
  const difference =
    paymentTotal - saleTotal;

  const balanced =
    Math.abs(difference) <= 0.01;

  return (
    <div
      className={`rounded-xl p-4 ${
        balanced
          ? "bg-green-50"
          : "bg-red-50"
      }`}
    >
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">
          Payment Total
        </span>

        <strong>
          {money(paymentTotal)}
        </strong>
      </div>

      <div className="mt-1 flex justify-between">
        <span className="text-sm text-gray-600">
          Sale Total
        </span>

        <strong>
          {money(saleTotal)}
        </strong>
      </div>

      <p
        className={`mt-2 text-sm font-semibold ${
          balanced
            ? "text-green-700"
            : "text-red-700"
        }`}
      >
        {balanced
          ? "Payment is balanced."
          : `Difference: ${money(
              Math.abs(difference)
            )}`}
      </p>
    </div>
  );
}