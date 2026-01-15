import { drizzle } from 'drizzle-orm/libsql';
import { flightTable, runwayTable } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const db = drizzle(process.env.DB_FILE_NAME!);

    // Clear existing data (flights first due to foreign key constraint)
    await db.delete(flightTable);
    await db.delete(runwayTable);

    // Insert three runways and get their IDs
    const runways = await db.insert(runwayTable)
      .values([
        { name: '09L' },
        { name: '09R' },
        { name: '27' },
      ])
      .returning();

    const runwayIds = runways.map(r => r.id);

    // Demo data arrays
    const airlines = ['LH', 'OS', 'BA', 'AF', 'KL', 'EW', 'U2', 'FR', 'W6', 'LX'];
    const airports = ['EDDF', 'LOWW', 'EGLL', 'LFPG', 'EHAM', 'LSZH', 'EDDM', 'LIRF', 'LEMD', 'LFPO'];
    const aircraftTypes = ['A320', 'A321', 'B737', 'B738', 'E190', 'A319', 'B789', 'A359', 'E195', 'DH8D'];

    // Generate 18 flights (9 arrivals, 9 departures)
    const currentTime = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    const oneHour = 60 * 60; // 60 minutes in seconds
    const flights = [];

    for (let i = 0; i < 18; i++) {
      const type: 'arrival' | 'departure' = i < 9 ? 'arrival' : 'departure';
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = Math.floor(Math.random() * 900) + 100; // 100-999
      const callsign = `${airline}${flightNumber}`;
      const aircraftType = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
      const airport = airports[Math.floor(Math.random() * airports.length)];
      const runwayId = runwayIds[Math.floor(Math.random() * runwayIds.length)];
      
      // Distribute flights across the next hour
      const scheduledTime = currentTime + Math.floor(Math.random() * oneHour);

      flights.push({
        callsign,
        type,
        scheduledTime,
        runwayId,
        origin: type === 'arrival' ? airport : null,
        destination: type === 'departure' ? airport : null,
        aircraftType,
      });
    }

    // Sort flights by scheduled time for better timeline visualization
    flights.sort((a, b) => a.scheduledTime - b.scheduledTime);

    // Insert all flights
    await db.insert(flightTable).values(flights);

    return NextResponse.json({
      success: true,
      runways: runways.length,
      flights: flights.length,
    });
  } catch (error) {
    console.error('Error populating demo data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to populate demo data' },
      { status: 500 }
    );
  }
}
