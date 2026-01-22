import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";

import { Navbar } from "../components/Navbar";
import { Container } from "../components/Container";

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
        <Navbar />
        <main className={styles.main}>
          <Container>{children}</Container>
        </main>
      </body>
    </html>
  );
}
