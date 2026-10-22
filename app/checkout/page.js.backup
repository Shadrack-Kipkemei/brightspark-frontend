"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cartItems,
    cartSubtotal,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    branch: "",
    orderType: "pickup",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.branch) {
      newErrors.branch = "Please select a branch.";
    }

    if (
      formData.orderType === "delivery" &&
      !formData.address.trim()
    ) {
      newErrors.address =
        "Delivery address is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    /*
      For now we are only demonstrating the frontend flow.

      Later this data will be sent to:

      Next.js
          ↓
      Flask REST API
          ↓
      PostgreSQL
    */

    const orderData = {
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
      },

      branch: formData.branch,

      orderType: formData.orderType,

      address:
        formData.orderType === "delivery"
          ? formData.address
          : null,

      notes: formData.notes,

      items: cartItems,

      subtotal: cartSubtotal,
    };

    console.log("Order data:", orderData);

    router.push("/checkout/success");
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">

          <div className="text-6xl">
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#02337D]">
            Your Cart is Empty
          </h1>

          <p className="mt-3 text-gray-600">
            Add products to your cart before proceeding
            to checkout.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-xl bg-[#FE7401] px-7 py-3 font-semibold text-white hover:bg-[#D85F00]"
          >
            Browse Products
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">

          <Link
            href="/cart"
            className="text-sm font-semibold text-[#02337D] hover:underline"
          >
            ← Back to Cart
          </Link>

          <h1 className="mt-4 text-4xl font-bold text-[#02337D]">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Enter your details and choose how you would
            like to receive your order.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_380px]"
        >

          {/* Left Side */}
          <div className="space-y-8">

            {/* Customer Information */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-[#02337D]">
                Customer Information
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* Full Name */}
                <div className="md:col-span-2">

                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Name *
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20 ${
                      errors.fullName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />

                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullName}
                    </p>
                  )}

                </div>

                {/* Phone */}
                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XX XXX XXX"
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20 ${
                      errors.phone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />

                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone}
                    </p>
                  )}

                </div>

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
                  />

                </div>

              </div>

            </section>

            {/* Branch Selection */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-[#02337D]">
                Select Branch
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Select the BrightSpark branch where you
                would like to collect your order.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                {/* Roysambu */}
                <label
                  className={`cursor-pointer rounded-xl border p-5 transition ${
                    formData.branch === "roysambu"
                      ? "border-[#02337D] bg-[#02337D]/5 ring-2 ring-[#02337D]/20"
                      : "border-gray-300 hover:border-[#02337D]"
                  }`}
                >

                  <input
                    type="radio"
                    name="branch"
                    value="roysambu"
                    checked={
                      formData.branch === "roysambu"
                    }
                    onChange={handleChange}
                    className="sr-only"
                  />

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#02337D] text-xl text-white">
                      📍
                    </div>

                    <div>

                      <h3 className="font-bold text-[#172033]">
                        Roysambu Branch
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Lumumba Drive
                      </p>

                    </div>

                  </div>

                </label>

                {/* Rangau */}
                <label
                  className={`cursor-pointer rounded-xl border p-5 transition ${
                    formData.branch === "rangau"
                      ? "border-[#02337D] bg-[#02337D]/5 ring-2 ring-[#02337D]/20"
                      : "border-gray-300 hover:border-[#02337D]"
                  }`}
                >

                  <input
                    type="radio"
                    name="branch"
                    value="rangau"
                    checked={
                      formData.branch === "rangau"
                    }
                    onChange={handleChange}
                    className="sr-only"
                  />

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#02337D] text-xl text-white">
                      📍
                    </div>

                    <div>

                      <h3 className="font-bold text-[#172033]">
                        Rangau Branch
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Rangau
                      </p>

                    </div>

                  </div>

                </label>

              </div>

              {errors.branch && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.branch}
                </p>
              )}

            </section>

            {/* Order Type */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-[#02337D]">
                Order Method
              </h2>

              <div className="mt-6 space-y-4">

                {/* Pickup */}
                <label
                  className={`block cursor-pointer rounded-xl border p-5 transition ${
                    formData.orderType === "pickup"
                      ? "border-[#FE7401] bg-[#FE7401]/5"
                      : "border-gray-300"
                  }`}
                >

                  <input
                    type="radio"
                    name="orderType"
                    value="pickup"
                    checked={
                      formData.orderType === "pickup"
                    }
                    onChange={handleChange}
                    className="mr-3"
                  />

                  <span className="font-semibold text-[#172033]">
                    Pick up from branch
                  </span>

                  <p className="ml-6 mt-1 text-sm text-gray-500">
                    Collect your order from the selected
                    BrightSpark branch.
                  </p>

                </label>

                {/* Delivery */}
                <label
                  className={`block cursor-pointer rounded-xl border p-5 transition ${
                    formData.orderType === "delivery"
                      ? "border-[#FE7401] bg-[#FE7401]/5"
                      : "border-gray-300"
                  }`}
                >

                  <input
                    type="radio"
                    name="orderType"
                    value="delivery"
                    checked={
                      formData.orderType === "delivery"
                    }
                    onChange={handleChange}
                    className="mr-3"
                  />

                  <span className="font-semibold text-[#172033]">
                    Delivery
                  </span>

                  <p className="ml-6 mt-1 text-sm text-gray-500">
                    Have your order delivered to your
                    location.
                  </p>

                </label>

              </div>

              {/* Delivery Address */}
              {formData.orderType === "delivery" && (
                <div className="mt-6">

                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Delivery Address *
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your delivery address"
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20 ${
                      errors.address
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />

                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}

                </div>
              )}

            </section>

            {/* Notes */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-[#02337D]">
                Additional Notes
              </h2>

              <textarea
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information about your order..."
                className="mt-5 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/20"
              />

            </section>

          </div>

          {/* Right Side */}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-[#02337D]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-5">

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4"
                >

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                    {item.icon}
                  </div>

                  <div className="flex-1">

                    <h3 className="text-sm font-semibold text-[#172033]">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>

                  </div>

                  <p className="text-sm font-bold text-[#02337D]">
                    KSh{" "}
                    {(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </p>

                </div>
              ))}

            </div>

            <div className="mt-6 border-t border-gray-200 pt-5">

              <div className="flex justify-between">

                <span className="font-semibold text-gray-700">
                  Subtotal
                </span>

                <span className="font-bold text-[#02337D]">
                  KSh {cartSubtotal.toLocaleString()}
                </span>

              </div>

              <p className="mt-2 text-xs text-gray-500">
                Delivery charges will be confirmed before
                final payment.
              </p>

            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-[#FE7401] py-4 font-bold text-white transition hover:bg-[#D85F00]"
            >
              Place Order
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              By placing your order, you confirm that the
              information provided is correct.
            </p>

          </aside>

        </form>

      </div>

    </main>
  );
}