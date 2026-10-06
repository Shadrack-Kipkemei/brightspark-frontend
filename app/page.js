"use client";

import Link from "next/link";
import {
  Zap,
  Store,
  ShoppingCart,
  MapPin,
  ArrowRight,
  Phone,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <>
      {/* =========================
          HERO
      ========================== */}
      <section className="bg-[#02337D] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#FE7401]">
            BrightSpark Electricals &amp; Electronics
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Powering Your Home,
            <span className="text-[#FE7401]">
              {" "}Business &amp; Future
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200">
            Discover quality phone accessories, electrical and electronic
            products for your home, office, business, and everyday needs.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {/* Shop Products */}
            <Link href="/products">
              <Button variant="secondary">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shop Products
                </span>
              </Button>
            </Link>

            {/* Contact Us */}
            <Link href="/contact">
              <Button variant="outline">
                <span className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Us
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURES
      ========================== */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              Why BrightSpark
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#02337D]">
              Everything You Need
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              We&apos;re building a convenient platform where customers can
              discover products and interact with BrightSpark easily.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Quality Products */}
            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#02337D] text-white">
                <Zap className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-bold text-[#02337D]">
                Quality Products
              </h3>

              <p className="mt-3 leading-6 text-gray-600">
                Browse electrical and electronic products suitable for homes,
                offices, and businesses.
              </p>

              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 font-semibold text-[#FE7401] transition hover:text-[#02337D]"
              >
                Explore Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            {/* Multiple Branches */}
            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FE7401] text-white">
                <Store className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-bold text-[#02337D]">
                Multiple Branches
              </h3>

              <p className="mt-3 leading-6 text-gray-600">
                BrightSpark operates from its Roysambu and Rangau branches,
                making our products more accessible to customers.
              </p>

              <Link
                href="/contact#locations"
                className="mt-5 inline-flex items-center gap-2 font-semibold text-[#FE7401] transition hover:text-[#02337D]"
              >
                View Locations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            {/* Easy Shopping */}
            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#02337D] text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-bold text-[#02337D]">
                Easy Shopping
              </h3>

              <p className="mt-3 leading-6 text-gray-600">
                Customers can browse products, add items to their cart, and
                place orders online.
              </p>

              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 font-semibold text-[#FE7401] transition hover:text-[#02337D]"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================
          BRANCHES
      ========================== */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              Find Us
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#02337D]">
              Visit Our Branches
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Visit one of our BrightSpark locations for electrical appliances,
              electronics, and phone accessories.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Roysambu */}
            <div className="rounded-2xl bg-[#02337D] p-8 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FE7401]">
                <Store className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[#FE7401]">
                Main Shop
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Roysambu Branch
              </h2>

              <div className="mt-4 flex items-start gap-2 text-gray-200">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#FE7401]" />

                <p>
                  Lumumba Drive, Roysambu, Nairobi.
                </p>
              </div>

              <Link
                href="/contact#locations"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-white transition hover:text-[#FE7401]"
              >
                View Location
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Rangau */}
            <div className="rounded-2xl border-2 border-[#02337D] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#02337D] text-white">
                <Store className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[#FE7401]">
                Branch
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#02337D]">
                Rangau Branch
              </h2>

              <div className="mt-4 flex items-start gap-2 text-gray-600">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#FE7401]" />

                <p>
                  Rangau Shopping Center, Rangau.
                </p>
              </div>

              <Link
                href="/contact#locations"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-[#FE7401] transition hover:text-[#02337D]"
              >
                View Location
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FINAL CTA
      ========================== */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-[#02337D] px-6 py-12 text-center text-white sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FE7401]">
            <ShoppingCart className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Ready to Shop?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
            Explore our products and find the electrical, electronic, and
            phone accessories you need.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/products">
              <Button variant="secondary">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Browse Products
                </span>
              </Button>
            </Link>

            <Link href="/contact">
              <Button variant="outline">
                <span className="flex items-center gap-2">
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}