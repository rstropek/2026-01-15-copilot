# Convert to Server-Side Component

## Current State

Currently, this app contains an API to populate a database with sample data (see [Populate API](../src/app/api/populate/route.ts)).

## Desired State

You task is to convert this API into a server-side component.

## User Stories & Acceptance Criteria

### US1: Add Populate Server-Side Component to Navigation

As a user, I want to navigate to the Populate Server-Side Component from the main navigation.

### US2: Show current data population status

As a user, I want to see whether the database contains sample data when the component loads.

Acceptance criteria:
- When the component loads, show the number of records in each table

### US3: Populate database with sample data

As a user, I want to be able to populate the database with sample data by clicking a button.

Acceptance criteria:
- A button labeled "Populate Database" is shown
- After clicking the button, a warning message is shown (in HTML, do not use a JS alert or confirm). The message asks the user to confirm the action.
- The user must type in "DELETE" (case insensitive) and press a confirm button to proceed
- After confirmation, existing data in the database is deleted and replaced with new sample data
- The data generation logic is the same as in the current API implementation
- Data generation

### US4: Show success/failure message

As a user, I want to see a message indicating whether the population was successful or if there was an error.

## Quality Criteria

- The entire process, including deletion and insertion, must be done in the scope of a single transaction
- If any error occurs during the process, all changes must be rolled back and the database must remain unchanged
- Use appropriate error handling to catch and display errors to the user (see US3)
