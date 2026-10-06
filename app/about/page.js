"use client";

import Link from "next/link";
import {
  BadgeCheck,
  ShieldCheck,
  HeartHandshake,
  Lightbulb,
  Zap,
  Smartphone,
  MonitorSmartphone,
  Store,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Phone,
} from "lucide-react";

export default function AboutPage() {
  const services = [
    {
      title: "Electrical Appliances",
      description:
        "Reliable electrical appliances and essential solutions for homes, offices, and businesses.",
      icon: <Zap className="h-7 w-7" />,
    },
    {
      title: "Electronic Appliances",
      description:
        "Quality electronic products designed to make everyday life more convenient and connected.",
      icon: <MonitorSmartphone className="h-7 w-7" />,
    },
    {
      title: "Phone Accessories",
      description:
        "Practical phone accessories and essential mobile products for your everyday needs.",
      icon: <Smartphone className="h-7 w-7" />,
    },
  ];

  const values = [
    {
      title: "Quality",
      description:
        "We strive to provide reliable products that deliver value and dependable performance.",
      icon: <BadgeCheck className="h-7 w-7" />,
    },
    {
      title: "Trust",
      description:
        "We believe in honest service, transparent dealings, and building lasting customer relationships.",
      icon: <ShieldCheck className="h-7 w-7" />,
    },
    {
      title: "Customer Focus",
      description:
        "Our customers are at the heart of what we do. We aim to make every shopping experience simple and satisfying.",
      icon: <HeartHandshake className="h-7 w-7" />,
    },
    {
      title: "Innovation",
      description:
        "We continuously look for better products and smarter solutions for modern lifestyles.",
      icon: <Lightbulb className="h-7 w-7" />,
    },
  ];

  const branches = [
    {
      name: "Roysambu Branch",
      location: "Lumumba Drive",
      description:
        "Our main shop serving customers with electrical appliances, electronics, and phone accessories.",
      label: "Main Shop",
    },
    {
      name: "Rangau Branch",
      location: "Rangau",
      description:
        "Our branch serving the Rangau area with convenient access to BrightSpark products and services.",
      label: "Branch",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="relative overflow-hidden bg-[#02337D]">
        {/* Decorative elements */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FE7401]/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Store className="h-4 w-4 text-[#FE7401]" />
              <span>About BrightSpark</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Powering Your
              <span className="block text-[#FE7401]">
                Everyday Life
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              BrightSpark Electricals &amp; Electronics provides electrical
              appliances, electronic products, and phone accessories designed
              to meet the needs of modern homes, offices, and businesses.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FE7401] px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                <ShoppingBag className="h-5 w-5" />
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                <Phone className="h-5 w-5" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          WHO WE ARE
      ========================== */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FE7401]">
                Who We Are
              </p>

              <h2 className="text-3xl font-bold text-[#02337D] sm:text-4xl">
                Your Partner for Electrical &amp; Electronic Solutions
              </h2>

              <div className="mt-6 space-y-4 text-base leading-7 text-gray-600">
                <p>
                  BrightSpark Electricals &amp; Electronics is a retail
                  business focused on providing electrical appliances,
                  electronic products, and phone accessories to our customers.
                </p>

                <p>
                  We understand that reliable electrical and electronic
                  products are an important part of everyday life. Our goal is
                  to make it easier for customers to find products that meet
                  their needs while receiving friendly and dependable service.
                </p>

                <p>
                  With our locations in Roysambu and Rangau, we are committed
                  to making BrightSpark products accessible to customers in the
                  communities we serve.
                </p>
              </div>
            </div>

            {/* Brand highlight card */}
            <div className="relative">
              <div className="rounded-2xl bg-[#02337D] p-8 shadow-xl sm:p-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FE7401] text-white">
                  <Zap className="h-8 w-8" />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white">
                  BrightSpark
                </h3>

                <p className="mt-4 leading-7 text-blue-100">
                  Bringing together electrical solutions, modern electronics,
                  and essential phone accessories under one trusted brand.
                </p>

                <div className="mt-8 h-1 w-16 rounded-full bg-[#FE7401]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          WHAT WE OFFER
      ========================== */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              What We Offer
            </p>

            <h2 className="text-3xl font-bold text-[#02337D] sm:text-4xl">
              Products for Everyday Needs
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Explore our range of products designed to support your home,
              office, business, and everyday technology needs.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#02337D] text-white transition group-hover:bg-[#FE7401]">
                  {service.icon}
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#02337D]">
                  {service.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {service.description}
                </p>

                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#FE7401] hover:text-[#02337D]"
                >
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          OUR VALUES
      ========================== */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              What Guides Us
            </p>

            <h2 className="text-3xl font-bold text-[#02337D] sm:text-4xl">
              Our Core Values
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              These principles guide how we serve our customers and operate
              our business.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#02337D] text-white">
                  {value.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#02337D]">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          OUR BRANCHES
      ========================== */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              Find Us
            </p>

            <h2 className="text-3xl font-bold text-[#02337D] sm:text-4xl">
              Our Branches
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Visit one of our BrightSpark locations for electrical,
              electronic, and phone accessory products.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {branches.map((branch) => (
              <div
                key={branch.name}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-2 bg-[#FE7401]" />

                <div className="p-7 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#02337D] text-white">
                      <Store className="h-7 w-7" />
                    </div>

                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#FE7401]">
                      {branch.label}
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-[#02337D]">
                    {branch.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5 shrink-0 text-[#FE7401]" />
                    <span>{branch.location}</span>
                  </div>

                  <p className="mt-4 leading-7 text-gray-600">
                    {branch.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          CALL TO ACTION
      ========================== */}
      <section className="bg-[#02337D] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FE7401] text-white">
            <ShoppingBag className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Ready to Find What You Need?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
            Browse our products and discover electrical appliances, electronics,
            and phone accessories available from BrightSpark.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FE7401] px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Browse Products
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              <Phone className="h-5 w-5" />
              Contact BrightSpark
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}