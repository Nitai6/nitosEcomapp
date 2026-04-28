// Test unauthenticated access to API endpoints that should require auth.
// Execute via browser_evaluate in Playwright MCP.
// Returns status codes for each probed endpoint.
() => {
  const endpoints = [
    '/api/presence?groupId=test',
    '/api/stats',
  ];
  return Promise.all(endpoints.map(ep =>
    fetch(ep).then(r => ({ endpoint: ep, status: r.status }))
  ));
}
