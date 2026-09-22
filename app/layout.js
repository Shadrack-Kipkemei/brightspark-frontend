import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export const metadata = {
  title: "BrightSpark Electricals & Electronics",
  description: 
     "BrightSpark Electricals & Electronics - Quality phone accessories, electricals and electronic products.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}