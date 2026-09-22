"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center"
        >
          <Image
            src="/logo/brightspark-logo.png"
            alt="BrightSpark Electricals & Electronics"
            width={190}
            height={60}
            className="h-auto w-[150px] sm:w-[180px]"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="font-medium text-gray-700 transition hover:text-[#02337D]"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="font-medium text-gray-700 transition hover:text-[#02337D]"
          >
            Products
          </Link>

          <Link
            href="/about"
            className="font-medium text-gray-700 transition hover:text-[#02337D]"
          >
            About Us
          </Link>

          <Link
            href="/contact"
            className="font-medium text-gray-700 transition hover:text-[#02337D]"
          >
            Contact
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/cart"
            className="rounded-lg border border-[#02337D] px-4 py-2 text-sm font-semibold text-[#02337D] transition hover:bg-[#02337D] hover:text-white"
          >
            Cart
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-[#FE7401] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D85F00]"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-lg p-2 text-[#02337D] hover:bg-gray-100 md:hidden"
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
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
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

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-4">

            <Link
              href="/"
              onClick={closeMenu}
              className="border-b border-gray-100 px-2 py-3 font-medium text-gray-700 hover:text-[#02337D]"
            >
              Home
            </Link>

            <Link
              href="/products"
              onClick={closeMenu}
              className="border-b border-gray-100 px-2 py-3 font-medium text-gray-700 hover:text-[#02337D]"
            >
              Products
            </Link>

            <Link
              href="/about"
              onClick={closeMenu}
              className="border-b border-gray-100 px-2 py-3 font-medium text-gray-700 hover:text-[#02337D]"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              onClick={closeMenu}
              className="border-b border-gray-100 px-2 py-3 font-medium text-gray-700 hover:text-[#02337D]"
            >
              Contact
            </Link>

            <div className="flex gap-3 px-2 pt-4">
              <Link
                href="/cart"
                onClick={closeMenu}
                className="flex-1 rounded-lg border border-[#02337D] px-4 py-2 text-center text-sm font-semibold text-[#02337D]"
              >
                Cart
              </Link>

              <Link
                href="/login"
                onClick={closeMenu}
                className="flex-1 rounded-lg bg-[#FE7401] px-4 py-2 text-center text-sm font-semibold text-white"
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