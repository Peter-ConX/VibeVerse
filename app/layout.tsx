import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Silicon - Social Entertainment Platform",
  description: "A Gen-Z style entertainment social platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#2B014D',
              color: '#FFD84D',
              border: '1px solid #FFD84D',
            },
          }}
        />
      </body>
    </html>
  );
}

