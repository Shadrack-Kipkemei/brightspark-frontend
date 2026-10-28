
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingCart,
  Truck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthContext";
import apiRequest from "@/lib/apiClient";

const STATUS_FILTERS = [
  { value: "ALL", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClasses(status) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return styles[status] || "bg-gray-50 text-gray-600 border-gray-200";
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        statusClasses(status)
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default function EmployeeOrdersPage() {
  const { user, token, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /*
   * Load orders through the existing authenticated API client.
   * The backend restricts employee results to their own branch.
   */
  const loadOrders = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/customer-orders", {
        method: "GET",
        token,
      });

      const data =
        response?.orders ??
        response?.data ??
        response;

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load employee orders:", err);
      setError(err.message || "Could not load customer orders.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;

    if (!token || !user) {
      setLoading(false);
      return;
    }

    loadOrders();
  }, [authLoading, token, user, loadOrders]);

  /*
   * Search and filter the orders returned by the backend.
   */
  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (
        statusFilter !== "ALL" &&
        order.status !== statusFilter
      ) {
        return false;
      }

      if (!term) return true;

      const searchableText = [
        order.order_reference,
        order.customer_name,
        order.customer_phone,
        order.customer_email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [orders, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
      rejected: orders.filter((o) => o.status === "REJECTED").length,
    }),
    [orders]
  );

  /*
   * Confirm or reject a pending order.
   * This changes the order status only; it does not create a sale
   * or deduct inventory.
   */
  const updateOrderStatus = async (order, newStatus) => {
    try {
      setUpdatingId(order.id);
      setError("");

      await apiRequest(
        `/customer-orders/${order.id}/status`,
        {
          method: "PATCH",
          token,
          body: { status: newStatus },
        }
      );

      setSelectedOrder(null);
      await loadOrders();
    } catch (err) {
      console.error("Failed to update order:", err);
      setError(err.message || "Could not update the order.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-[#02337D]"
          />
          <p className="mt-3 text-sm text-gray-500">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#02337D] text-white">
              <ShoppingCart size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#02337D] sm:text-3xl">
                Customer Orders
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Review and manage orders for your branch.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#02337D] hover:text-[#02337D] disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Orders
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Orders"
            value={counts.total}
            icon={ShoppingCart}
            color="blue"
          />
          <SummaryCard
            title="Pending"
            value={counts.pending}
            icon={Clock}
            color="amber"
          />
          <SummaryCard
            title="Confirmed"
            value={counts.confirmed}
            icon={CheckCircle}
            color="green"
          />
          <SummaryCard
            title="Rejected"
            value={counts.rejected}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Search and filters */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, customer or phone..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    statusFilter === filter.value
                      ? "bg-[#02337D] text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Orders table */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8">
              <RefreshCw
                size={30}
                className="animate-spin text-[#02337D]"
              />
              <p className="mt-4 text-sm text-gray-500">
                Loading customer orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <Package size={38} className="text-gray-300" />
              <h2 className="mt-4 font-bold text-gray-800">
                No orders found
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {search || statusFilter !== "ALL"
                  ? "Try another search term or status filter."
                  : "Orders for your branch will appear here."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {[
                        "Order",
                        "Customer",
                        "Fulfilment",
                        "Total",
                        "Status",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-bold text-[#02337D]">
                            {order.order_reference}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">
                            {order.customer_name}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Phone size={13} />
                            {order.customer_phone}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            {order.fulfilment_method === "DELIVERY" ? (
                              <Truck size={16} />
                            ) : (
                              <MapPin size={16} />
                            )}
                            {order.fulfilment_method === "DELIVERY"
                              ? "Delivery"
                              : "Pickup"}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-bold text-gray-800">
                          {formatCurrency(order.total_amount)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-[#02337D] hover:text-[#02337D]"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </>
          )}
        </section>
      </div>

      {/* Order details dialog */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          updating={updatingId === selectedOrder.id}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
        />
      )}
    </main>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-[#02337D]",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, updating, onClose, onUpdateStatus }) {
  const isPending = order.status === "PENDING";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !updating) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-order-title"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Fixed modal header */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FE7401]">
              Order Details
            </p>
            <h2
              id="employee-order-title"
              className="mt-1 break-all text-lg font-bold text-[#02337D] sm:text-xl"
            >
              {order.order_reference}
            </h2>
            <div className="mt-2">
              <StatusBadge status={order.status} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            aria-label="Close order details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </header>

        {/* Scrollable modal body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="Customer Information" icon={UserRound}>
              <InfoRow label="Name" value={order.customer_name} />
              <InfoRow label="Phone" value={order.customer_phone} />
              <InfoRow
                label="Email"
                value={order.customer_email || "Not provided"}
              />
            </InfoCard>

            <InfoCard title="Order Information" icon={Package}>
              <InfoRow
                label="Branch"
                value={
                  order.branch?.name ||
                  order.branch?.code ||
                  "Your branch"
                }
              />
              <InfoRow
                label="Order date"
                value={formatDate(order.created_at)}
              />
              <InfoRow
                label="Fulfilment"
                value={
                  order.fulfilment_method === "DELIVERY"
                    ? "Delivery"
                    : "Pickup"
                }
              />
            </InfoCard>
          </div>

          {order.fulfilment_method === "DELIVERY" &&
            order.delivery_address && (
              <InfoCard title="Delivery Address" icon={MapPin}>
                <p className="break-words text-sm text-gray-600">
                  {order.delivery_address}
                </p>
              </InfoCard>
            )}

          {order.customer_notes && (
            <InfoCard title="Customer Notes" icon={UserRound}>
              <p className="whitespace-pre-wrap break-words text-sm text-gray-600">
                {order.customer_notes}
              </p>
            </InfoCard>
          )}

          <section>
            <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
              <Package size={19} className="text-[#02337D]" />
              Ordered Products
            </h3>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Product", "Quantity", "Unit Price", "Total"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(order.items || []).map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-800">
                            {item.product_name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            SKU: {item.product_sku || "—"} · Unit:{" "}
                            {item.unit || "Piece"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-800">
                          {formatCurrency(item.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-4 py-4">
                <span className="font-bold text-gray-700">Order Total</span>
                <span className="text-lg font-bold text-[#02337D]">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Fixed modal footer */}
        <footer className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Close
          </button>

          {isPending && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={updating}
                onClick={() => onUpdateStatus(order, "REJECTED")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={18} />
                {updating ? "Updating..." : "Reject Order"}
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => onUpdateStatus(order, "CONFIRMED")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#02337D] px-5 py-3 text-sm font-bold text-white hover:bg-[#01275f] disabled:opacity-50"
              >
                <CheckCircle size={18} />
                {updating ? "Updating..." : "Confirm Order"}
              </button>
            </div>
          )}
        </footer>
      </section>
    </div>
  );
}

function InfoCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-gray-200 p-4">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-800">
        <Icon size={18} className="text-[#02337D]" />
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="break-words text-right font-semibold text-gray-700">
        {value || "—"}
      </span>
    </div>
  );
}
