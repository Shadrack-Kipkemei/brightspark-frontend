import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";


export const metadata = {
  title: "BrightSpark Electricals & Electronics",
  description:
    "BrightSpark Electricals & Electronics - Quality phone accessories, electricals and electronic products.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Navbar />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </CartProvider>

      </body>
    </html>
  );
}