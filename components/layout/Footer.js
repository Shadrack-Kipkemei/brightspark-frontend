import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#02337D] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Company */}
          <div>
            <Image
              src="/logo/Brightspark-logo.png"
              alt="BrightSpark Electricals & Electronics"
              width={180}
              height={60}
              className="mb-4 rounded bg-white p-2"
            />

            <p className="max-w-sm text-sm leading-6 text-gray-200">
              BrightSpark Electricals & Electronics provides quality phone accessories,
              electrical and electronic products for homes, offices,
              businesses, and other projects.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm text-gray-200">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#FE7401]"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/products"
                  className="hover:text-[#FE7401]"
                >
                  Products
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="hover:text-[#FE7401]"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#FE7401]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Our Branches
            </h3>

            <div className="space-y-4 text-sm text-gray-200">

              <div>
                <p className="font-semibold text-white">
                  Roysambu Branch
                </p>

                <p>
                  Lumumba Drive
                </p>

                <p>
                  Nairobi, Kenya
                </p>
              </div>

              <div>
                <p className="font-semibold text-white">
                  Rongai Branch
                </p>

                <p>
                  Rangau
                </p>

                <p>
                  Nairobi, Kenya
                </p>
              </div>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Contact Us
            </h3>

            <div className="space-y-3 text-sm text-gray-200">

              <p>
                <span className="font-semibold text-white">
                  Phone: 0714256265
                </span>{" "}
                Contact BrightSpark
              </p>

              <p>
                <span className="font-semibold text-white">
                  WhatsApp: 0714256265
                </span>{" "}
                Available for customer inquiries
              </p>

              <p>
                <span className="font-semibold text-white">
                  Email: danstantoel2016@gmail.com
                </span>{" "}
                BrightSpark Support
              </p>

            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-white/20 pt-6 text-center text-sm text-gray-300">
          <p>
            © {new Date().getFullYear()} BrightSpark Electricals &
            Electronics. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}