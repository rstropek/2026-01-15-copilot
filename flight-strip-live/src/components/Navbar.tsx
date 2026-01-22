import Link from "next/link";

import styles from "./Navbar.module.css";
import { Container } from "./Container";

export function Navbar() {
  return (
    <header className={styles.header}>
      <Container>
        <nav className={styles.nav} aria-label="Primary">
          <Link className={styles.brand} href="/">
            Flight Strip Demo
          </Link>

          <div className={styles.links}>
            <Link className={styles.link} href="/">
              Home
            </Link>
            <Link className={styles.link} href="/about">
              About
            </Link>
            <Link className={styles.link} href="/placeholder">
              Placeholder
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}
