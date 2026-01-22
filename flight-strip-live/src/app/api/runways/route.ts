import { runwayTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/libsql";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getDb() {
  return drizzle(process.env.DB_FILE_NAME!);
}

export async function GET() {
  const db = getDb();

  const runways = await db
    .select({
      id: runwayTable.id,
      name: runwayTable.name,
    })
    .from(runwayTable)
    .orderBy(asc(runwayTable.name));

  return NextResponse.json({ runways });
}
