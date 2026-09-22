import "./globals.css";

export const metadata = {
  title: "BrightSpark Electricals & Electronics",
  description: 
     "BrightSpark Electricals & Electronics - Quality phone accessories, electricals and electronic products.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}