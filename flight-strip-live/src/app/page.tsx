import { Card } from "../components/Card";
import { newsTable } from "@/db/schema";
import { and, desc, gte, isNull, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import Link from "next/link";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getDb() {
  return drizzle(process.env.DB_FILE_NAME!);
}

function formatDateTimeFromSeconds(seconds: number): string {
  const date = new Date(seconds * 1000);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function getLatestNews() {
  const db = getDb();
  const nowSeconds = Math.floor(Date.now() / 1000);

  return db
    .select({
      id: newsTable.id,
      title: newsTable.title,
      validFrom: newsTable.validFrom,
    })
    .from(newsTable)
    .where(
      and(
        lte(newsTable.validFrom, nowSeconds),
        or(isNull(newsTable.validTo), gte(newsTable.validTo, nowSeconds))
      )
    )
    .orderBy(desc(newsTable.validFrom));
}

export default async function Home() {
  const news = await getLatestNews();

  return (
    <Card>
      <h1>Welcome</h1>
      <p>
        This demo simulates an air traffic control flight strip environment. More features and
        pages will be added in later steps.
      </p>

      <h2 className={styles.sectionTitle}>Latest News</h2>

      {news.length === 0 && (
        <p className={styles.muted}>No news available right now.</p>
      )}

      {news.length > 0 && (
        <ul className={styles.newsList}>
          {news.map((item) => (
            <li key={item.id} className={styles.newsItem}>
              <Link className={styles.newsLink} href={`/news/${item.id}`}>
                {item.title}
              </Link>
              <span className={styles.newsMeta}>{formatDateTimeFromSeconds(item.validFrom)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
