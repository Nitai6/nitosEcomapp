## Google Search

For recording Google Search interactions (typing a query, clicking a result), load the [./rules/google-search-results.md](./rules/google-search-results.md) file for specific selectors and patterns. An example browse plan is available at [./assets/google-search-click-result.json](./assets/google-search-click-result.json).

## Google Properties

When interacting with any Google property (Flights, Maps, YouTube, etc.), load the [./rules/google-properties.md](./rules/google-properties.md) file for general patterns like `force: true`, wait times, and dropdown handling.

## How to use

Read individual rule files for detailed explanations and code examples:

- [rules/google-search-results.md](rules/google-search-results.md) - Recording a Google Search and clicking on an organic result
- [rules/google-properties.md](rules/google-properties.md) - General patterns for all Google properties (force, dropdowns, date pickers)
- [rules/session-lifecycle.md](rules/session-lifecycle.md) - Creating, connecting, recording, and releasing Steel sessions
- [rules/recording-download.md](rules/recording-download.md) - Downloading recordings via HLS endpoint and ffmpeg
- [rules/playwright-connection.md](rules/playwright-connection.md) - Connecting Playwright to Steel via CDP, viewport, context management
- [rules/cursor-injection.md](rules/cursor-injection.md) - Custom macOS-style cursor overlay with click ring effect
- [rules/selectors.md](rules/selectors.md) - Selector strategies for reliable element targeting across sites
- [rules/action-timing.md](rules/action-timing.md) - Wait times, pacing, and timing patterns for smooth recordings

## Assets

Example browse plans for common recording scenarios:

- [assets/google-search-click-result.json](assets/google-search-click-result.json) - Search Google and click the first organic result
