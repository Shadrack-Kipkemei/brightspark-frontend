
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [orderReference, setOrderReference] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referenceFromUrl = params.get("reference");

    const savedReference = sessionStorage.getItem(
      "brightspark-last-order-reference"
    );

    setOrderReference(
      referenceFromUrl || savedReference || ""
    );
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[#FE7401]">
          BrightSpark Electricals & Electronics
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#02337D]">
          Order Received
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          Thank you for your order. We have received your
          request and will contact you using the phone
          number you provided. Your order is pending
          confirmation by our team.
        </p>

        <div className="mt-8 rounded-xl bg-gray-50 p-5 text-left">
          <p className="text-sm text-gray-500">
            Order Reference
          </p>

          <p className="mt-1 break-all text-lg font-bold text-[#02337D]">
            {orderReference || "Reference unavailable"}
          </p>

          <p className="mt-4 text-xs text-gray-500">
            Keep this reference for enquiries about your order.
            Your order is not yet a completed sale or payment.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="rounded-xl bg-[#02337D] px-6 py-3 font-semibold text-white hover:bg-[#01265C]"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
