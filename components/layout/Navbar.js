"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Products",
      href: "/products",
    },
    {
      name: "About Us",
      href: "/about",
    },
    {
      name: "Contact",
      href: "/contact",
    },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 h-[88px] border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto grid h-full max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-10">

        {/* =========================
            LOGO
        ========================== */}
        <div className="flex items-center">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center"
          >
            <Image
              src="/logo/Brightspark-logo.jpg"
              alt="BrightSpark Electricals & Electronics"
              width={330}
              height={80}
              className="h-[58px] w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-3 text-[16px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#f4f7fc] font-semibold text-[#02337D]"
                    : "text-[#172033] hover:bg-[#f4f7fc] hover:text-[#02337D]"
                }`}
              >
                {link.name}

                {active && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#FE7401]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* =========================
            DESKTOP ACTIONS
        ========================== */}
        <div className="hidden items-center justify-end gap-5 md:flex">

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex h-12 w-16 items-center justify-center rounded-xl border border-[#02337D] bg-white text-[#172033] transition hover:bg-[#f4f7fc]"
            aria-label="Shopping cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-7 w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.085.836l.383 1.45m0 0L6.75 15.75A2.25 2.25 0 0 0 8.934 17.5h8.132a2.25 2.25 0 0 0 2.184-1.75l1.5-6.75H5.104m0 0L4.5 6m4.5 15a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Zm10.5 0a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Z"
              />
            </svg>

            {/* Cart Count */}
            <span className="absolute -right-1.5 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FE7401] px-1.5 text-xs font-bold text-white">
              {cartCount}
            </span>
          </Link>

          {/* Login */}
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl bg-[#FE7401] px-7 text-[16px] font-semibold text-white transition duration-200 hover:bg-[#D85F00]"
          >
            Login
          </Link>
        </div>

        {/* =========================
            MOBILE MENU BUTTON
        ========================== */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="ml-auto rounded-lg p-2 text-[#02337D] hover:bg-gray-100 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-7 w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-7 w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* =========================
          MOBILE NAVIGATION
      ========================== */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white shadow-lg md:hidden">
          <div className="px-5 py-4">

            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block border-b border-gray-100 px-3 py-3 font-medium ${
                    active
                      ? "text-[#02337D]"
                      : "text-gray-700"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="mt-4 flex gap-3">

              {/* Mobile Cart */}
              <Link
                href="/cart"
                onClick={closeMenu}
                className="flex flex-1 items-center justify-center rounded-xl border border-[#02337D] py-3 font-semibold text-[#02337D]"
              >
                Cart
              </Link>

              {/* Mobile Login */}
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex flex-1 items-center justify-center rounded-xl bg-[#FE7401] py-3 font-semibold text-white"
              >
                Login
              </Link>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}