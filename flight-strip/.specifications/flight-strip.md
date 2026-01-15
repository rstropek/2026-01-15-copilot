# Flight Strip Visualization Specification (Demo App)

## Purpose

Build a simple, demo-ready visualization that shows arrivals and departures as “flight strips” on a UTC timeline, grouped by runway, with runway selection and time zoom controls.

## Scope

In scope
- Runway selection via checkboxes (assumption: max 5 runways)
- Timeline window defaults to "now -> now + 15 minutes"
- Zoom in/out controls (min window 10 minutes, max window 2 hours)
- Side-by-side runway "strips" (one column per selected runway)
- Flight strips rendered as vertical rectangles, use 100% of the width and height of the container
- Each flight rendered as a horizontal line at its scheduled time within the runway strip
- Flight text shown adjacent to that line (no overlap avoidance yet)
- Next.js client-side component
- HTTP API to fetch runways and flights
- UTC display in UI; API timestamps are Unix seconds

## Out of Scope

- No unit tests for now
- Collision/overlap distribution logic (reserved for later)
- Drag/drop editing, runway reassignment, editing flight times
- Real-time updates / websockets
- Authentication/authorization
- Persistence beyond what’s needed for demo

## User Stories & Acceptance Criteria

### US1: Select runways

As a user, I can choose which runways are visible using checkboxes at the top.

- A horizontal list of up to 5 runway checkbox items is shown at the top.
- Checking a runway makes its runway strip appear.
- Unchecking removes that runway strip.
- At least one runway is selected by default (see defaults below).
- If the airport has <= 5 runways, all are listed without scrolling (simple horizontal wrap is fine).

### US2: View flights by time window

As a user, I see flights scheduled in the selected window displayed on the runway strips.

Acceptance criteria
- The UI shows flights whose scheduledTime is within [windowStart, windowEnd] (inclusive start, exclusive end is acceptable if consistent).
- Each selected runway is represented as a vertical rectangular strip.
- Within each strip, each flight is displayed as:
  - a horizontal line at the correct vertical position proportional to time
  - text placed directly beside the line showing the flight’s info (see rendering rules)
  - All visible time labels are in UTC.

### US3: Refreshing

As a user, I expect that the flights are refreshed every 10 seconds.

Acceptance criteria
- The flights are refreshed every 10 seconds.
- Flights are fetched from the API for the selected runways and time range.
- Positions of the flights on the flight strips are updated accordingly.

### US4: Zoom timeline window

As a user, I can zoom the time window in/out using buttons.

Acceptance criteria
- Default window length is 15 minutes starting from “now”.
- Buttons:
  - Zoom in reduces window length (down to minimum 10 minutes).
  - Zoom out increases window length (up to maximum 2 hours).
  - Zooming keeps the window anchored at windowStart (simple rule), OR keeps center anchored (allowed if clearly implemented). Pick one and follow it consistently (see Section 7.3).

### US5: Default Behaviors

- Default runway selection
  - On first load, select all runways returned by the API (assumption: max 5).
  - If none are returned, render an empty state: “No runways configured.”

- Default time window
  - windowStart = floor(currentUtcNowUnixSeconds)
  - windowEnd = windowStart + 15 * 60

### US6: Layout

- Top: runway selector (horizontal checkboxes).
- Below: visualization container.
- Inside container:
  - one column per selected runway
  - columns are rendered side-by-side with equal width
  - each runway column includes a header with runway name (e.g., 27L)

### US7: Flight marker

Each flight within a runway strip:
- Render a horizontal line across a portion of the strip
- Place a text label next to the line.

Text label contents
- callsign
- type (A/D shorthand is ok: “A” for arrival, “D” for departure)
- scheduledTime formatted as HH:mm (UTC)
- Example label: LH123 A 10:05Z
