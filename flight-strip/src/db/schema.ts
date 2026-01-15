import { AnySQLiteColumn, int, sqliteTable as table, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const runwayTable = table("runways", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
}, (table) => [
  uniqueIndex("name_unique_idx").on(table.name),
]);

export const flightTable = table("flights", {
  id: int().primaryKey({ autoIncrement: true }),

  // e.g. "LH123", "OS456"
  callsign: text().notNull(),

  // "arrival" | "departure"
  type: text().$type<"arrival" | "departure">().notNull(),

  // scheduled time (used for the timeline)
  scheduledTime: int("scheduled_time").notNull(), // unix timestamp (seconds)

  // assigned runway
  runwayId: int("runway_id")
    .notNull()
    .references((): AnySQLiteColumn => runwayTable.id),

  // optional metadata for nicer demos
  origin: text(),      // e.g. "EDDF"
  destination: text(), // e.g. "LOWW"
  aircraftType: text("aircraft_type"), // e.g. "A320"
});
