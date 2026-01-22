import { Card } from "@/components/Card";
import { FlightStripVisualizer } from "@/components/FlightStripVisualizer";

export const dynamic = "force-dynamic";

export default function FlightStripsPage() {
  return (
    <Card>
      <h1>Flight Strips</h1>
      <p>Arrivals and departures on a UTC timeline grouped by runway.</p>
      <FlightStripVisualizer />
    </Card>
  );
}
