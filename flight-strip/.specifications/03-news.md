# News on Main Page

## Current State

The current application contains a main page with a static welcome message.

## Desired State

Your task is to enhance the main page by adding a news section that displays the latest news articles.

## User Stories & Acceptance Criteria

### US1: News Table

Add a `news` table to the database with the following fields:

- `id` (integer, primary key, auto-increment)
- `title` (string, not null)
- `content` (text, not null)
- `valid_from` (datetime, not null, default to current timestamp)
- `valid_to` (datetime, nullable)

### US2: Populate News Table

As a user, I want that the `news` table is populated with 5 demo entries when the populate script is run (server-side component).

### US3: Display Latest News on Main Page

As a user, I want to see the latest news articles on the main page.

Acceptance criteria:
- The main page displays a "Latest News" section below the welcome message
- The "Latest News" section lists all news articles where the current date is between `valid_from` and `valid_to` (or `valid_to` is null)
- The news articles are sorted by `valid_from` in descending order (most recent first)
- Each news article displays the `title` and the `valid_from` date in a human-readable format

### US4: News Article Details

As a user, I want to read the full content of a news article.

Acceptance criteria:
- Each news article title in the "Latest News" section is a clickable link
- When a user clicks on a news article title, they are taken to a dedicated server-side component page that displays the full news article
- The news article page displays the `title`, `valid_from` date, and the full `content` of the article

### US5: Support Markdown

As a user, I want the news article content to support Markdown formatting.

Acceptance criteria:
- The `content` field in the `news` table can contain Markdown syntax
- When displaying the news article content on the dedicated page, the Markdown syntax is rendered as HTML

Technical Notes:
- Use the `marked` library to convert Markdown to HTML.
- Purify the HTML output to prevent XSS attacks. Use the `dompurify` library for this purpose.
- Before you add the libraries, make sure to read https://github.com/markedjs/marked and https://github.com/cure53/DOMPurify for installation and usage instructions.
