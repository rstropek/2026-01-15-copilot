import { flightTable } from "@/db/schema";
import { and, gte, inArray, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getDb() {
  return drizzle(process.env.DB_FILE_NAME!);
}

function parseUnixSeconds(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed);
}

function parseRunwayIds(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isFinite(x));
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const start = parseUnixSeconds(url.searchParams.get("start"));
  const end = parseUnixSeconds(url.searchParams.get("end"));
  const runwayIds = parseRunwayIds(url.searchParams.get("runwayIds"));

  if (start === null || end === null) {
    return NextResponse.json(
      { error: "Missing or invalid 'start'/'end' query params (unix seconds)." },
      { status: 400 }
    );
  }

  if (end <= start) {
    return NextResponse.json(
      { error: "Invalid range: 'end' must be > 'start'." },
      { status: 400 }
    );
  }

  const db = getDb();

  const where = runwayIds.length > 0
    ? and(
        inArray(flightTable.runwayId, runwayIds),
        gte(flightTable.scheduledTime, start),
        lt(flightTable.scheduledTime, end)
      )
    : and(gte(flightTable.scheduledTime, start), lt(flightTable.scheduledTime, end));

  const flights = await db
    .select({
      id: flightTable.id,
      callsign: flightTable.callsign,
      type: flightTable.type,
      scheduledTime: flightTable.scheduledTime,
      runwayId: flightTable.runwayId,
    })
    .from(flightTable)
    .where(where);

  return NextResponse.json({ flights });
}
