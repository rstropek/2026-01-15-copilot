import { Card } from "@/components/Card";
import { flightTable, runwayTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchParams = Record<string, string | string[] | undefined>;

function getStringParam(searchParams: SearchParams | undefined, key: string): string | undefined {
  const value = searchParams?.[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function getDb() {
  return drizzle(process.env.DB_FILE_NAME!);
}

async function getTableCounts() {
  const db = getDb();

  const [{ count: runwayCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(runwayTable);

  const [{ count: flightCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(flightTable);

  return {
    runways: Number(runwayCount ?? 0),
    flights: Number(flightCount ?? 0),
  };
}

async function populateDemoDataInSingleTransaction() {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.delete(flightTable);
    await tx.delete(runwayTable);

    const runways = await tx
      .insert(runwayTable)
      .values([{ name: "09L" }, { name: "09R" }, { name: "27" }])
      .returning();

    const runwayIds = runways.map((r) => r.id);

    const airlines = ["LH", "OS", "BA", "AF", "KL", "EW", "U2", "FR", "W6", "LX"];
    const airports = ["EDDF", "LOWW", "EGLL", "LFPG", "EHAM", "LSZH", "EDDM", "LIRF", "LEMD", "LFPO"];
    const aircraftTypes = ["A320", "A321", "B737", "B738", "E190", "A319", "B789", "A359", "E195", "DH8D"];

    const currentTime = Math.floor(Date.now() / 1000);
    const oneHour = 60 * 60;
    const flights: Array<
      typeof flightTable.$inferInsert & {
        type: "arrival" | "departure";
      }
    > = [];

    for (let i = 0; i < 18; i++) {
      const type: "arrival" | "departure" = i < 9 ? "arrival" : "departure";
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = Math.floor(Math.random() * 900) + 100;
      const callsign = `${airline}${flightNumber}`;
      const aircraftType = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
      const airport = airports[Math.floor(Math.random() * airports.length)];
      const runwayId = runwayIds[Math.floor(Math.random() * runwayIds.length)];
      const scheduledTime = currentTime + Math.floor(Math.random() * oneHour);

      flights.push({
        callsign,
        type,
        scheduledTime,
        runwayId,
        origin: type === "arrival" ? airport : null,
        destination: type === "departure" ? airport : null,
        aircraftType,
      });
    }

    flights.sort((a, b) => a.scheduledTime - b.scheduledTime);
    await tx.insert(flightTable).values(flights);
  });
}

async function populateDatabaseAction(formData: FormData) {
  "use server";

  const isNextRedirectError = (error: unknown): boolean => {
    if (typeof error !== "object" || error === null) return false;
    if (!("digest" in error)) return false;
    const digest = (error as { digest?: unknown }).digest;
    return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
  };

  const confirmText = String(formData.get("confirmText") ?? "").trim();
  if (confirmText.toLowerCase() !== "delete") {
    redirect(
      `/populate?confirm=1&status=error&message=${encodeURIComponent(
        'Confirmation failed. Please type "DELETE" to proceed.'
      )}`
    );
  }

  try {
    await populateDemoDataInSingleTransaction();
    revalidatePath("/populate");
    redirect("/populate?status=success");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    console.error("Error populating demo data:", error);
    redirect(
      `/populate?confirm=1&status=error&message=${encodeURIComponent(
        "Failed to populate demo data. The database was not modified."
      )}`
    );
  }
}

export default async function PopulatePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const counts = await getTableCounts();

  const isConfirmStep = getStringParam(resolvedSearchParams, "confirm") === "1";
  const status = getStringParam(resolvedSearchParams, "status");
  const message = getStringParam(resolvedSearchParams, "message");

  return (
    <Card>
      <div className={styles.grid}>
        <h1>Populate Database</h1>
        <p>Shows the current sample-data status and lets you regenerate demo data.</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Runways</p>
            <p className={styles.statValue}>{counts.runways}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Flights</p>
            <p className={styles.statValue}>{counts.flights}</p>
          </div>
        </div>

        {status === "success" && (
          <div className={`${styles.message} ${styles.success}`} role="status">
            <p>Database populated successfully.</p>
          </div>
        )}

        {status === "error" && (
          <div className={`${styles.message} ${styles.error}`} role="alert">
            <p>{message ?? "Something went wrong."}</p>
          </div>
        )}

        {!isConfirmStep && (
          <form method="get" action="/populate" className={styles.actions}>
            <input type="hidden" name="confirm" value="1" />
            <button type="submit" className={styles.button}>
              Populate Database
            </button>
          </form>
        )}

        {isConfirmStep && (
          <>
            <div className={`${styles.message} ${styles.warning}`} role="alert">
              <p>
                Warning: this will delete all existing runways and flights and replace them with new
                sample data.
              </p>
            </div>

            <form action={populateDatabaseAction} className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmText">
                  Type DELETE to confirm (case-insensitive)
                </label>
                <input
                  id="confirmText"
                  name="confirmText"
                  className={styles.input}
                  required
                  autoComplete="off"
                />
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.button}>
                  Confirm
                </button>
                <a className={styles.buttonSecondary} href="/populate">
                  Cancel
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </Card>
  );
}
