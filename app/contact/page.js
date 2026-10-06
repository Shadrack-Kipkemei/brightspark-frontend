"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  Store,
  Send,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Temporary frontend submission.
    // Connect this to the Flask API later.
    console.log("Contact form submitted:", formData);

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const contactDetails = [
    {
      title: "Call Us",
      description: "Speak directly with our team",
      value: "Contact BrightSpark",
      icon: <Phone className="h-6 w-6" />,
      href: "tel:",
    },
    {
      title: "Email Us",
      description: "Send us your questions",
      value: "info@brightspark.co.ke",
      icon: <Mail className="h-6 w-6" />,
      href: "mailto:info@brightspark.co.ke",
    },
    {
      title: "Visit Us",
      description: "Come to one of our branches",
      value: "Roysambu & Rangau",
      icon: <MapPin className="h-6 w-6" />,
      href: "#locations",
    },
  ];

  const branches = [
    {
      name: "Roysambu Branch",
      label: "Main Shop",
      location: "Lumumba Drive, Roysambu",
      description:
        "Visit our main shop for electrical appliances, electronics, and phone accessories.",
    },
    {
      name: "Rangau Branch",
      label: "Branch",
      location: "Rangau",
      description:
        "Our Rangau branch provides convenient access to BrightSpark products and services.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="relative overflow-hidden bg-[#02337D]">
        {/* Decorative background elements */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FE7401]/20 blur-3xl" />

        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <MessageCircle className="h-4 w-4 text-[#FE7401]" />
              <span>Get In Touch</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              We&apos;d Love to
              <span className="block text-[#FE7401]">
                Hear From You
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Have a question about our products, need assistance, or want to
              know more about BrightSpark? Get in touch with our team and
              we&apos;ll be happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          CONTACT DETAILS
      ========================== */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-6 md:grid-cols-3">
            {contactDetails.map((contact) => (
              <a
                key={contact.title}
                href={contact.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#02337D] text-white transition group-hover:bg-[#FE7401]">
                  {contact.icon}
                </div>

                <h2 className="mt-5 text-lg font-bold text-[#02337D]">
                  {contact.title}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {contact.description}
                </p>

                <p className="mt-3 font-semibold text-[#FE7401]">
                  {contact.value}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          CONTACT FORM + HOURS
      ========================== */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            {/* Contact form */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[#FE7401]">
                  Send Us a Message
                </p>

                <h2 className="text-3xl font-bold text-[#02337D]">
                  How Can We Help?
                </h2>

                <p className="mt-3 leading-7 text-gray-600">
                  Fill in the form below and our team will get back to you.
                </p>
              </div>

              {submitted && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                  <div>
                    <p className="font-semibold text-green-800">
                      Message received
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      Thank you for contacting BrightSpark. We&apos;ll get back
                      to you as soon as possible.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name + Email */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                    />
                  </div>

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
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                    />
                  </div>
                </div>

                {/* Phone + Subject */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="07XX XXX XXX"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Subject
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    required
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#02337D] px-6 py-3.5 font-semibold text-white transition hover:bg-[#FE7401] sm:w-auto"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Business hours */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#02337D] p-7 text-white shadow-lg sm:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FE7401]">
                  <Clock3 className="h-7 w-7" />
                </div>

                <h2 className="mt-6 text-2xl font-bold">
                  Business Hours
                </h2>

                <p className="mt-3 leading-7 text-blue-100">
                  Visit us during our business hours or get in touch with our
                  team for assistance.
                </p>

                <div className="mt-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-blue-100">Sunday - Thursday</span>
                    <span className="font-semibold">8:00 AM - 8:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-blue-100">Friday</span>
                    <span className="font-semibold">8:00 AM - 6:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Saturday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick help card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#FE7401]">
                  <MessageCircle className="h-6 w-6" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-[#02337D]">
                  Need Product Assistance?
                </h2>

                <p className="mt-3 leading-7 text-gray-600">
                  If you are looking for a particular electrical appliance,
                  electronic product, or phone accessory, browse our products
                  or contact our team.
                </p>

                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 font-semibold text-[#FE7401] transition hover:text-[#02337D]"
                >
                  View Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          BRANCH LOCATIONS
      ========================== */}
      <section
        id="locations"
        className="bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FE7401]">
              Visit Us
            </p>

            <h2 className="text-3xl font-bold text-[#02337D] sm:text-4xl">
              Our Branch Locations
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Choose the BrightSpark location that is most convenient for you.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {branches.map((branch) => (
              <div
                key={branch.name}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-2 bg-[#FE7401]" />

                <div className="p-7 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#02337D] text-white transition group-hover:bg-[#FE7401]">
                      <Store className="h-7 w-7" />
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#02337D]">
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

                  <button
                    type="button"
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-[#FE7401] transition hover:text-[#02337D]"
                  >
                    Get Directions
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          FINAL CTA
      ========================== */}
      <section className="bg-[#02337D] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FE7401] text-white">
            <Phone className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Have More Questions?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
            Our team is ready to help you find the right electrical,
            electronic, or phone accessory products for your needs.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FE7401] px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              <ShoppingBag className="h-5 w-5" />
              Browse Products
            </Link>

            <a
              href="mailto:info@brightspark.co.ke"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              <Mail className="h-5 w-5" />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}