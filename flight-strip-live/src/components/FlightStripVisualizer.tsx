'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./FlightStripVisualizer.module.css";

type Runway = {
  id: number;
  name: string;
};

type Flight = {
  id: number;
  callsign: string;
  type: "arrival" | "departure";
  scheduledTime: number; // unix seconds
  runwayId: number;
};

const WINDOW_STEPS_MINUTES = [10, 15, 30, 60, 120] as const;

function formatUtcHHmmZ(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}Z`;
}

function floorUtcNowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function clampToSteps(minutes: number): (typeof WINDOW_STEPS_MINUTES)[number] {
  const closest = WINDOW_STEPS_MINUTES.reduce((best, current) => {
    return Math.abs(current - minutes) < Math.abs(best - minutes) ? current : best;
  }, WINDOW_STEPS_MINUTES[0]);
  return closest;
}

function getTickMinutes(windowMinutes: number): number {
  if (windowMinutes <= 15) return 5;
  if (windowMinutes <= 30) return 10;
  if (windowMinutes <= 60) return 15;
  return 30;
}

function getShorthandType(type: Flight["type"]): "A" | "D" {
  return type === "arrival" ? "A" : "D";
}

export function FlightStripVisualizer() {
  const [runways, setRunways] = useState<Runway[]>([]);
  const [selectedRunwayIds, setSelectedRunwayIds] = useState<number[]>([]);

  const [windowStart] = useState<number>(() => floorUtcNowUnixSeconds());
  const [windowMinutes, setWindowMinutes] = useState<(typeof WINDOW_STEPS_MINUTES)[number]>(() => 15);

  const windowEnd = useMemo(() => windowStart + windowMinutes * 60, [windowStart, windowMinutes]);

  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTimerRef = useRef<number | null>(null);

  const selectedRunways = useMemo(() => {
    const selectedSet = new Set(selectedRunwayIds);
    return runways.filter((r) => selectedSet.has(r.id));
  }, [runways, selectedRunwayIds]);

  const flightsByRunwayId = useMemo(() => {
    const map = new Map<number, Flight[]>();
    for (const f of flights) {
      const list = map.get(f.runwayId) ?? [];
      list.push(f);
      map.set(f.runwayId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.scheduledTime - b.scheduledTime);
    }
    return map;
  }, [flights]);

  const fetchRunways = useCallback(async () => {
    const response = await fetch("/api/runways", { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to fetch runways (${response.status})`);
    const data = (await response.json()) as { runways: Runway[] };
    return data.runways;
  }, []);

  const fetchFlights = useCallback(async () => {
    if (selectedRunwayIds.length === 0) {
      setFlights([]);
      return;
    }

    const runwayIdsParam = selectedRunwayIds.join(",");
    const url = new URL("/api/flights", window.location.origin);
    url.searchParams.set("runwayIds", runwayIdsParam);
    url.searchParams.set("start", String(windowStart));
    url.searchParams.set("end", String(windowEnd));

    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to fetch flights (${response.status})`);
    }

    const data = (await response.json()) as { flights: Flight[] };
    setFlights(data.flights);
  }, [selectedRunwayIds, windowStart, windowEnd]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setIsLoading(true);

        const loadedRunways = await fetchRunways();
        if (cancelled) return;

        setRunways(loadedRunways);
        setSelectedRunwayIds((prev) => {
          if (prev.length > 0) return prev;
          return loadedRunways.map((r) => r.id);
        });
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load runways");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchRunways]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setIsLoading(true);
        await fetchFlights();
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load flights");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    if (refreshTimerRef.current) {
      window.clearInterval(refreshTimerRef.current);
    }

    refreshTimerRef.current = window.setInterval(() => {
      fetchFlights().catch(() => {
        // keep the last good data; error state will update on next successful refresh
      });
    }, 10_000);

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [fetchFlights]);

  const toggleRunway = useCallback((runwayId: number) => {
    setSelectedRunwayIds((prev) => {
      const isSelected = prev.includes(runwayId);
      if (isSelected) {
        const next = prev.filter((id) => id !== runwayId);
        // Keep at least one selected
        return next.length === 0 ? prev : next;
      }
      return [...prev, runwayId];
    });
  }, []);

  const canZoomIn = windowMinutes > WINDOW_STEPS_MINUTES[0];
  const canZoomOut = windowMinutes < WINDOW_STEPS_MINUTES[WINDOW_STEPS_MINUTES.length - 1];

  const zoomIn = useCallback(() => {
    setWindowMinutes((prev) => {
      const current = clampToSteps(prev);
      const index = WINDOW_STEPS_MINUTES.indexOf(current);
      return WINDOW_STEPS_MINUTES[Math.max(0, index - 1)];
    });
  }, []);

  const zoomOut = useCallback(() => {
    setWindowMinutes((prev) => {
      const current = clampToSteps(prev);
      const index = WINDOW_STEPS_MINUTES.indexOf(current);
      return WINDOW_STEPS_MINUTES[Math.min(WINDOW_STEPS_MINUTES.length - 1, index + 1)];
    });
  }, []);

  const ticks = useMemo(() => {
    const tickMinutes = getTickMinutes(windowMinutes);
    const tickSeconds = tickMinutes * 60;

    const firstTick = Math.ceil(windowStart / tickSeconds) * tickSeconds;
    const result: number[] = [];

    for (let t = firstTick; t <= windowEnd; t += tickSeconds) {
      result.push(t);
    }

    return result;
  }, [windowStart, windowEnd, windowMinutes]);

  const gridTemplateColumns = useMemo(() => {
    const count = Math.max(1, selectedRunways.length);
    return `repeat(${count}, minmax(0, 1fr))`;
  }, [selectedRunways.length]);

  if (!isLoading && runways.length === 0) {
    return <p className={styles.empty}>No runways configured.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <div className={styles.runwayPicker} aria-label="Runway selection">
          {runways.map((runway) => (
            <label key={runway.id} className={styles.runwayItem}>
              <input
                type="checkbox"
                checked={selectedRunwayIds.includes(runway.id)}
                onChange={() => toggleRunway(runway.id)}
              />
              <span>{runway.name}</span>
            </label>
          ))}
        </div>

        <div className={styles.toolbar}>
          <div className={styles.buttons}>
            <button className={styles.button} onClick={zoomIn} disabled={!canZoomIn}>
              Zoom in
            </button>
            <button className={styles.button} onClick={zoomOut} disabled={!canZoomOut}>
              Zoom out
            </button>
          </div>

          <div className={styles.windowInfo}>
            Window (UTC): {formatUtcHHmmZ(windowStart)} – {formatUtcHHmmZ(windowEnd)} ({windowMinutes} min)
          </div>
        </div>

        {error && <div className={styles.error}>Error: {error}</div>}
        {isLoading && <div className={styles.loading}>Loading…</div>}
      </div>

      <div className={styles.container}>
        <div className={styles.columns} style={{ gridTemplateColumns }}>
          {selectedRunways.map((runway) => {
            const runwayFlights = flightsByRunwayId.get(runway.id) ?? [];
            return (
              <section key={runway.id} className={styles.column} aria-label={`Runway ${runway.name}`}>
                <header className={styles.columnHeader}>
                  <div className={styles.columnTitle}>Runway {runway.name}</div>
                  <div className={styles.columnMeta}>{runwayFlights.length} flights</div>
                </header>

                <div className={styles.strip}>
                  {ticks.map((t) => {
                    const ratio = (t - windowStart) / (windowEnd - windowStart);
                    const top = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
                    return (
                      <div key={t} className={styles.tick} style={{ top }}>
                        <div className={styles.tickLabel}>{formatUtcHHmmZ(t)}</div>
                      </div>
                    );
                  })}

                  {runwayFlights.map((flight) => {
                    const ratio = (flight.scheduledTime - windowStart) / (windowEnd - windowStart);
                    const topPct = Math.max(0, Math.min(1, ratio)) * 100;

                    return (
                      <div
                        key={flight.id}
                        className={styles.flight}
                        style={{ top: `${topPct}%`, transform: "translateY(-50%)" }}
                      >
                        <div className={styles.flightLine} />
                        <div className={styles.flightLabel}>
                          {flight.callsign} {getShorthandType(flight.type)} {formatUtcHHmmZ(flight.scheduledTime)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
