"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Package,
  Phone,
  Search,
  ShoppingCart,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import apiRequest from "@/lib/apiClient";
import { useAuth } from "@/components/auth/AuthContext";

export default function AdminOrdersPage() {
  const { user, token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  /*
   * Load all customer orders.
   *
   * Admins can see orders from all branches.
   * The backend still performs the actual authorization.
   */
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      if(!token) {
        throw new Error("Authentication token not available.");
      }

      const response = await apiRequest("/customer-orders", {
        method: "GET",
        token,
      });

      const loadedOrders =
        response?.orders ||
        response?.data ||
        response ||
        [];

      setOrders(Array.isArray(loadedOrders) ? loadedOrders : []);
    } catch (err) {
      console.error("Failed to load customer orders:", err);

      setError(
        err.message ||
          "Failed to load customer orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadOrders();
    }
  }, [user, token]);

  /*
   * Filter orders by status and search term.
   */
  const filteredOrders = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      const searchableText = [
        order.order_reference,
        order.customer_name,
        order.customer_phone,
        order.customer_email,
        order.branch?.name,
        order.branch?.code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }, [orders, search, statusFilter]);

  /*
   * Update order status.
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      await apiRequest(
        `/customer-orders/${orderId}/status`,
        {
          method: "PATCH",
          token,
          body: {
            status: newStatus,
          },
        }
      );

      /*
       * Refresh the order list after the update.
       */
      await loadOrders();

      /*
       * Close the details modal after successfully
       * confirming or rejecting an order.
       */
      setSelectedOrder(null);
    } catch (err) {
      console.error(
        "Failed to update customer order:",
        err
      );

      setError(
        err.message ||
          "Failed to update customer order."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /*
   * Format currency as Kenyan Shillings.
   */
  const formatCurrency = (amount) => {
    const value = Number(amount || 0);

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(value);
  };

  /*
   * Format order date/time.
   */
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /*
   * Display a readable status label.
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending";

      case "CONFIRMED":
        return "Confirmed";

      case "REJECTED":
        return "Rejected";

      case "COMPLETED":
        return "Completed";

      default:
        return status || "Unknown";
    }
  };

  /*
   * Status styling.
   */
  const getStatusClasses = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "CONFIRMED":
        return "bg-green-50 text-green-700 border-green-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  /*
   * Count orders by status.
   */
  const pendingCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const confirmedCount = orders.filter(
    (order) => order.status === "CONFIRMED"
  ).length;

  const rejectedCount = orders.filter(
    (order) => order.status === "REJECTED"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#02337D] text-white">
              <ShoppingCart size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#02337D] sm:text-3xl">
                Customer Orders
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer orders from all BrightSpark branches.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Total Orders"
            value={orders.length}
            icon={ShoppingCart}
            iconClass="bg-blue-50 text-[#02337D]"
          />

          <SummaryCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Confirmed"
            value={confirmedCount}
            icon={CheckCircle}
            iconClass="bg-green-50 text-green-600"
          />

          <SummaryCard
            title="Rejected"
            value={rejectedCount}
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
          />

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order, customer or phone..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                ["ALL", "All"],
                ["PENDING", "Pending"],
                ["CONFIRMED", "Confirmed"],
                ["REJECTED", "Rejected"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    statusFilter === value
                      ? "bg-[#02337D] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Orders */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {loading ? (
            <LoadingState />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              search={search}
              statusFilter={statusFilter}
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Branch
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Total
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
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

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-700">
                          {order.branch?.name ||
                            order.branch?.code ||
                            "—"}
                        </p>

                        {order.branch?.location && (
                          <p className="mt-1 text-xs text-gray-500">
                            {order.branch.location}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-800">
                          {formatCurrency(
                            order.total_amount
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) === 1
                            ? ""
                            : "s"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#02337D] hover:text-[#02337D]"
                        >
                          <Eye size={16} />
                          View
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          updating={updatingOrderId === selectedOrder.id}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusLabel={getStatusLabel}
          getStatusClasses={getStatusClasses}
        />
      )}

    </main>
  );
}

/*
 * Summary card component.
 */
function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-800">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
}

/*
 * Loading state.
 */
function LoadingState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-8">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#02337D]" />

      <p className="mt-4 text-sm font-medium text-gray-500">
        Loading customer orders...
      </p>
    </div>
  );
}

/*
 * Empty state.
 */
function EmptyState({
  search,
  statusFilter,
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <ShoppingCart size={25} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-gray-800">
        No orders found
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        {search || statusFilter !== "ALL"
          ? "Try changing your search or status filter."
          : "Customer orders will appear here when customers place orders."}
      </p>

    </div>
  );
}

/*
 * Order details modal.
 */
function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  updating,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusClasses,
}) {
  const isPending = order.status === "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#FE7401]">
              Customer Order
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">

              <h2 className="text-xl font-bold text-[#02337D]">
                {order.order_reference}
              </h2>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                  order.status
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close order details"
          >
            <XCircle size={22} />
          </button>

        </div>

        {/* Modal Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

          {/* Customer + Order Information */}
          <div className="grid gap-5 lg:grid-cols-2">

            <InfoSection
              title="Customer Information"
              icon={User}
            >
              <InfoRow
                label="Name"
                value={order.customer_name}
              />

              <InfoRow
                label="Phone"
                value={order.customer_phone}
                icon={Phone}
              />

              <InfoRow
                label="Email"
                value={order.customer_email || "Not provided"}
              />
            </InfoSection>

            <InfoSection
              title="Order Information"
              icon={Package}
            >
              <InfoRow
                label="Branch"
                value={
                  order.branch?.name ||
                  order.branch?.code ||
                  "—"
                }
                icon={MapPin}
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
                icon={
                  order.fulfilment_method === "DELIVERY"
                    ? Truck
                    : MapPin
                }
              />
            </InfoSection>

          </div>

          {/* Delivery Address */}
          {order.fulfilment_method === "DELIVERY" &&
            order.delivery_address && (
              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">

                <div className="flex items-center gap-2">
                  <MapPin
                    size={18}
                    className="text-[#FE7401]"
                  />

                  <p className="font-bold text-gray-800">
                    Delivery Address
                  </p>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {order.delivery_address}
                </p>

              </div>
            )}

          {/* Customer Notes */}
          {order.customer_notes && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

              <p className="font-bold text-[#02337D]">
                Customer Notes
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {order.customer_notes}
              </p>

            </div>
          )}

          {/* Products */}
          <div className="mt-6">

            <div className="mb-3 flex items-center gap-2">
              <Package
                size={19}
                className="text-[#02337D]"
              />

              <h3 className="font-bold text-gray-800">
                Ordered Products
              </h3>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">

              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                        Quantity
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                        Unit Price
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                        Total
                      </th>
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
                            Unit: {item.unit || "Piece"}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.product_sku || "—"}
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-semibold text-gray-700">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-4 text-right text-sm text-gray-600">
                          {formatCurrency(item.unit_price)}
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-bold text-gray-800">
                          {formatCurrency(item.line_total)}
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* Total */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">

                <div className="flex items-center justify-between">

                  <span className="font-bold text-gray-700">
                    Order Total
                  </span>

                  <span className="text-xl font-bold text-[#02337D]">
                    {formatCurrency(order.total_amount)}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>

          {isPending && (
            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  onUpdateStatus(
                    order.id,
                    "REJECTED"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={18} />

                {updating
                  ? "Updating..."
                  : "Reject Order"}
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  onUpdateStatus(
                    order.id,
                    "CONFIRMED"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#02337D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#01275f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle size={18} />

                {updating
                  ? "Updating..."
                  : "Confirm Order"}
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

/*
 * Information section.
 */
function InfoSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">

      <div className="mb-4 flex items-center gap-2">

        <Icon
          size={18}
          className="text-[#02337D]"
        />

        <h3 className="font-bold text-gray-800">
          {title}
        </h3>

      </div>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  );
}

/*
 * Information row.
 */
function InfoRow({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">

      <span className="flex items-center gap-2 text-gray-500">
        {Icon && <Icon size={15} />}
        {label}
      </span>

      <span className="text-right font-semibold text-gray-700">
        {value}
      </span>

    </div>
  );
}