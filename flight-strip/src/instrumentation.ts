import { drizzle } from 'drizzle-orm/libsql';
import { runwayTable } from './db/schema';

export async function register() {
    const db = drizzle(process.env.DB_FILE_NAME!);

    // Define required runways
    const requiredRunways = ['Runway 09', 'Runway 18', 'Runway 27'];

    // Check which runways exist in the database
    const existingRunways = await db.select().from(runwayTable);
    const existingRunwayNames = new Set(existingRunways.map(r => r.name));

    // Find missing runways
    const missingRunways = requiredRunways.filter(name => !existingRunwayNames.has(name));

    // Add missing runways
    for (const runwayName of missingRunways) {
        await db.insert(runwayTable).values({ name: runwayName });
        console.log(`Added missing runway: ${runwayName}`);
    }

    if (missingRunways.length === 0) {
        console.log('All required runways already exist in the database.');
    }
}
