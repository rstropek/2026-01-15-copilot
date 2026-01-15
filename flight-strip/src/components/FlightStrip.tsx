'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './FlightStrip.module.css';

interface Runway {
  id: number;
  name: string;
}

interface Flight {
  id: number;
  callsign: string;
  type: 'arrival' | 'departure';
  scheduledTime: number;
  runwayId: number;
  origin?: string | null;
  destination?: string | null;
  aircraftType?: string | null;
}

const REFRESH_INTERVAL = 10000; // 10 seconds
const DEFAULT_WINDOW_MINUTES = 15;
const MIN_WINDOW_MINUTES = 10;
const MAX_WINDOW_MINUTES = 120;
const ZOOM_STEP_MINUTES = 5;

export default function FlightStrip() {
  const [runways, setRunways] = useState<Runway[]>([]);
  const [selectedRunwayIds, setSelectedRunwayIds] = useState<Set<number>>(new Set());
  const [flights, setFlights] = useState<Flight[]>([]);
  const [windowStart, setWindowStart] = useState<number>(0);
  const [windowLengthMinutes, setWindowLengthMinutes] = useState<number>(DEFAULT_WINDOW_MINUTES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize window start time
  useEffect(() => {
    setWindowStart(Math.floor(Date.now() / 1000));
  }, []);

  // Fetch runways on mount
  useEffect(() => {
    const fetchRunways = async () => {
      try {
        const response = await fetch('/api/runways');
        if (!response.ok) throw new Error('Failed to fetch runways');
        const data: Runway[] = await response.json();
        setRunways(data);
        
        // Select all runways by default
        const allIds = new Set(data.map(r => r.id));
        setSelectedRunwayIds(allIds);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchRunways();
  }, []);

  // Fetch flights
  const fetchFlights = useCallback(async () => {
    if (selectedRunwayIds.size === 0 || windowStart === 0) return;

    try {
      const windowEnd = windowStart + (windowLengthMinutes * 60);
      const runwayIdsParam = Array.from(selectedRunwayIds).join(',');
      const response = await fetch(
        `/api/flights?runwayIds=${runwayIdsParam}&startTime=${windowStart}&endTime=${windowEnd}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch flights');
      const data: Flight[] = await response.json();
      setFlights(data);
    } catch (err) {
      console.error('Error fetching flights:', err);
    }
  }, [selectedRunwayIds, windowStart, windowLengthMinutes]);

  // Fetch flights when dependencies change
  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  // Auto-refresh flights every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFlights();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchFlights]);

  // Toggle runway selection
  const toggleRunway = (runwayId: number) => {
    setSelectedRunwayIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(runwayId)) {
        newSet.delete(runwayId);
      } else {
        newSet.add(runwayId);
      }
      return newSet;
    });
  };

  // Zoom controls
  const zoomIn = () => {
    setWindowLengthMinutes(prev => Math.max(MIN_WINDOW_MINUTES, prev - ZOOM_STEP_MINUTES));
  };

  const zoomOut = () => {
    setWindowLengthMinutes(prev => Math.min(MAX_WINDOW_MINUTES, prev + ZOOM_STEP_MINUTES));
  };

  // Format time as HH:mm UTC
  const formatTime = (unixSeconds: number): string => {
    const date = new Date(unixSeconds * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Calculate position percentage within the time window
  const getTimePosition = (scheduledTime: number): number => {
    const windowEnd = windowStart + (windowLengthMinutes * 60);
    const position = ((scheduledTime - windowStart) / (windowEnd - windowStart)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  if (runways.length === 0) {
    return <div className={styles.container}>No runways configured.</div>;
  }

  const selectedRunways = runways.filter(r => selectedRunwayIds.has(r.id));
  const windowEnd = windowStart + (windowLengthMinutes * 60);

  return (
    <div className={styles.container}>
      {/* Runway selector */}
      <div className={styles.runwaySelector}>
        <h2>Select Runways:</h2>
        <div className={styles.checkboxList}>
          {runways.map(runway => (
            <label key={runway.id} className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={selectedRunwayIds.has(runway.id)}
                onChange={() => toggleRunway(runway.id)}
              />
              <span>{runway.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div className={styles.controls}>
        <div className={styles.timeInfo}>
          <span>Window: {formatTime(windowStart)}Z - {formatTime(windowEnd)}Z</span>
          <span className={styles.duration}>({windowLengthMinutes} minutes)</span>
        </div>
        <div className={styles.zoomButtons}>
          <button 
            onClick={zoomIn} 
            disabled={windowLengthMinutes <= MIN_WINDOW_MINUTES}
            className={styles.button}
          >
            Zoom In
          </button>
          <button 
            onClick={zoomOut} 
            disabled={windowLengthMinutes >= MAX_WINDOW_MINUTES}
            className={styles.button}
          >
            Zoom Out
          </button>
        </div>
      </div>

      {/* Flight strips visualization */}
      {selectedRunways.length === 0 ? (
        <div className={styles.emptyState}>
          Please select at least one runway to view flights.
        </div>
      ) : (
        <div className={styles.stripsContainer}>
          {selectedRunways.map(runway => {
            const runwayFlights = flights.filter(f => f.runwayId === runway.id);
            
            return (
              <div key={runway.id} className={styles.runwayStrip}>
                <div className={styles.runwayHeader}>
                  <h3>{runway.name}</h3>
                  <span className={styles.flightCount}>
                    {runwayFlights.length} flight{runwayFlights.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className={styles.stripContent}>
                  {/* Time axis markers */}
                  <div className={styles.timeAxis}>
                    {[0, 25, 50, 75, 100].map(percent => {
                      const time = windowStart + (windowLengthMinutes * 60 * percent / 100);
                      return (
                        <div 
                          key={percent} 
                          className={styles.timeMarker}
                          style={{ top: `${percent}%` }}
                        >
                          <span className={styles.timeLabel}>{formatTime(time)}Z</span>
                          <div className={styles.timeLine} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Flight markers */}
                  {runwayFlights.map(flight => {
                    const position = getTimePosition(flight.scheduledTime);
                    const typeShort = flight.type === 'arrival' ? 'A' : 'D';
                    const label = `${flight.callsign} ${typeShort} ${formatTime(flight.scheduledTime)}Z`;
                    
                    return (
                      <div
                        key={flight.id}
                        className={styles.flightMarker}
                        style={{ top: `${position}%` }}
                      >
                        <div className={styles.flightLine} />
                        <div className={styles.flightLabel}>
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
