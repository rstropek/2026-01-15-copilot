import Link from 'next/link';
import styles from './TopNav.module.css';

export default function TopNav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">Flight Strip Demo</Link>
        </div>
        <div className={styles.menu}>
          <Link href="/" className={styles.menuItem}>
            Home
          </Link>
          <Link href="/populate" className={styles.menuItem}>
            Populate Flights
          </Link>
        </div>
      </div>
    </nav>
  );
}
