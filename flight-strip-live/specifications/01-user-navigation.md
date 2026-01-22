# User Navigation

## Current State

This application does not currently contain any UI. It is a skeleton app.

## Desired State

Your task is to implement user navigation for the application. We will add menu items and pages/components later.

## User Stories & Acceptance Criteria

### US1: General Styling and Navigation

As a user, I want the application to have a consistent and appealing style.

Acceptance criteria:
- Follow the styling guidelines in AGENTS.md
- Add a simple navigation bar to the top of the page
  - Contains a link back to the main page
  - Add a link to the "About" page (see US3) 
  - Add a placeholder link (to demonstrate future navigation)
- The navigation menu only supports a single level of navigation. No dropdowns or nested menus are required.
- Currently, no responsive design is required because the web app will always be used on desktop devices with screen resolutions of at least full HD (1920x1080).

### US2: Implement Main Page

As a user, I want to see a main page when I visit the root URL of the application.

Acceptance criteria:
- When the user visits the root URL ("/"), a main page is displayed
- The main page contains a static welcome message
- The navigation bar is visible. It stays at the top when navigating to other pages (if any are added later).

### US3: Implement About Page

As a user, I want a navigation link to an About page that provides information about the application.

Acceptance criteria:
- When the user clicks on the "About" link in the navigation bar, they are taken to the About page
- The About page contains a brief description of the application (add a "lorem ipsum" placeholder text for now)
