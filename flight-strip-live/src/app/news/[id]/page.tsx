import { Card } from "@/components/Card";
import { renderMarkdownToSafeHtml } from "@/lib/markdown";
import { newsTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

export default async function NewsDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const parsedId = Number(id);

  if (!Number.isFinite(parsedId)) {
    notFound();
  }

  const db = getDb();
  const rows = await db
    .select({
      id: newsTable.id,
      title: newsTable.title,
      content: newsTable.content,
      validFrom: newsTable.validFrom,
    })
    .from(newsTable)
    .where(eq(newsTable.id, parsedId))
    .limit(1);

  const article = rows[0];
  if (!article) {
    notFound();
  }

  const safeHtml = renderMarkdownToSafeHtml(article.content);

  return (
    <Card>
      <header className={styles.header}>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.meta}>Valid from: {formatDateTimeFromSeconds(article.validFrom)}</p>
      </header>

      <article className={styles.content} dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </Card>
  );
}
