import { drizzle } from 'drizzle-orm/libsql';
import { flightTable, runwayTable } from '@/db/schema';
import Container from '@/components/Container';

async function populateFlights() {
  const db = drizzle(process.env.DB_FILE_NAME!);

  // Get all runways
  const runways = await db.select().from(runwayTable);
  
  if (runways.length === 0) {
    return {
      success: false,
      error: 'No runways found in database',
    };
  }

  // Remove all existing flights
  await db.delete(flightTable);

  // Sample data for generating realistic flights
  const airlines = ['LH', 'OS', 'BA', 'AF', 'KL', 'EW', 'U2', 'FR', 'W6', 'LX'];
  const origins = ['EDDF', 'LOWW', 'EGLL', 'LFPG', 'EHAM', 'LSZH', 'EDDM', 'LIRF', 'LEMD', 'LFPO'];
  const destinations = ['LOWW', 'EDDF', 'LFPG', 'EGLL', 'EHAM', 'LSZH', 'LIRF', 'EDDM', 'LEMD', 'LFPO'];
  const aircraftTypes = ['A320', 'A321', 'B737', 'B738', 'E190', 'A319', 'B789', 'A359', 'E195', 'DH8D'];

  const now = Math.floor(Date.now() / 1000); // Current time in unix timestamp (seconds)

  // For each runway, add 5 arrivals and 5 departures
  for (const runway of runways) {
    const flights = [];

    // Generate 5 arriving flights
    for (let i = 0; i < 5; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = Math.floor(Math.random() * 900) + 100; // 100-999
      const callsign = `${airline}${flightNumber}`;
      
      // Random time between 5 and 10 minutes from now, spread across the flights
      const minutesOffset = 5 + Math.floor(Math.random() * 6); // 5-10 minutes
      const scheduledTime = now + (minutesOffset * 60) + (i * 60); // Add i minutes to spread them out
      
      flights.push({
        callsign,
        type: 'arrival' as const,
        scheduledTime,
        runwayId: runway.id,
        origin: origins[Math.floor(Math.random() * origins.length)],
        destination: 'LOWW', // Assuming this is the home airport for arrivals
        aircraftType: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
      });
    }

    // Generate 5 departing flights
    for (let i = 0; i < 5; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = Math.floor(Math.random() * 900) + 100; // 100-999
      const callsign = `${airline}${flightNumber}`;
      
      // Random time between 5 and 10 minutes from now, spread across the flights
      const minutesOffset = 5 + Math.floor(Math.random() * 6); // 5-10 minutes
      const scheduledTime = now + (minutesOffset * 60) + (i * 60); // Add i minutes to spread them out
      
      flights.push({
        callsign,
        type: 'departure' as const,
        scheduledTime,
        runwayId: runway.id,
        origin: 'LOWW', // Assuming this is the home airport for departures
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        aircraftType: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
      });
    }

    // Insert all flights for this runway
    await db.insert(flightTable).values(flights);
  }

  // Get the total count of inserted flights
  const allFlights = await db.select().from(flightTable);

  return {
    success: true,
    runways: runways.map(r => r.name),
    flightCount: allFlights.length,
    runwayCount: runways.length,
  };
}

export default async function PopulatePage() {
  const result = await populateFlights();

  return (
    <Container>
      <h1>Populate Flights</h1>
      <div style={{ marginTop: '2rem' }}>
        {result.success ? (
          <div>
            <h2 style={{ color: 'var(--accent-light)', marginBottom: '1rem' }}>
              Success!
            </h2>
            <p style={{ marginBottom: '0.5rem' }}>
              Successfully populated database with <strong>{result.flightCount}</strong> flights 
              across <strong>{result.runwayCount}</strong> runways.
            </p>
            {result.runways && (
              <p style={{ marginTop: '1rem', color: '#aaa' }}>
                Runways: {result.runways.join(', ')}
              </p>
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ color: '#f44336', marginBottom: '1rem' }}>
              Error
            </h2>
            <p>{result.error}</p>
          </div>
        )}
      </div>
    </Container>
  );
}
