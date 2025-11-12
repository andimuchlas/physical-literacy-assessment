import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Physical Literacy Assessment",
  description: "Assessment system for physical literacy in children",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
