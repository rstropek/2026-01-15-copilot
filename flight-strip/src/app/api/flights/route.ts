import { drizzle } from 'drizzle-orm/libsql';
import { flightTable } from '@/db/schema';
import { and, inArray, gte, lt } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const runwayIds = searchParams.get('runwayIds')?.split(',').map(Number).filter(n => !isNaN(n));
    const startTime = Number(searchParams.get('startTime'));
    const endTime = Number(searchParams.get('endTime'));

    if (!runwayIds || runwayIds.length === 0) {
      return NextResponse.json(
        { error: 'runwayIds parameter is required' },
        { status: 400 }
      );
    }

    if (isNaN(startTime) || isNaN(endTime)) {
      return NextResponse.json(
        { error: 'startTime and endTime parameters are required and must be valid numbers' },
        { status: 400 }
      );
    }

    const db = drizzle(process.env.DB_FILE_NAME!);
    
    const flights = await db
      .select()
      .from(flightTable)
      .where(
        and(
          inArray(flightTable.runwayId, runwayIds),
          gte(flightTable.scheduledTime, startTime),
          lt(flightTable.scheduledTime, endTime)
        )
      );

    return NextResponse.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}
