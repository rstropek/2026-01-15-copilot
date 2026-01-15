import { drizzle } from 'drizzle-orm/libsql';
import { runwayTable } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = drizzle(process.env.DB_FILE_NAME!);
    const runways = await db.select().from(runwayTable);
    
    return NextResponse.json(runways);
  } catch (error) {
    console.error('Error fetching runways:', error);
    return NextResponse.json(
      { error: 'Failed to fetch runways' },
      { status: 500 }
    );
  }
}
