// Inspect cookie attributes visible to JavaScript.
// Execute via browser_evaluate in Playwright MCP.
// HttpOnly cookies will NOT appear (which is correct - auth cookies should be HttpOnly).
// If auth cookies DO appear, flag as a vulnerability.
() => {
  return document.cookie.split(';').map(c => c.trim());
}
