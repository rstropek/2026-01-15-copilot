import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight Strip Demo",
  description: "A demo of the Flight Strip app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
