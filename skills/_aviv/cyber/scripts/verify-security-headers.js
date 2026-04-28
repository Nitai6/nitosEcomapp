// Verify security headers on the current page.
// Execute via browser_evaluate in Playwright MCP.
// Returns an object with security-relevant response headers.
() => {
  return fetch(window.location.href).then(r => {
    const headers = {};
    for (const [k, v] of r.headers.entries()) {
      if (['content-security-policy', 'strict-transport-security', 'x-content-type-options',
           'x-frame-options', 'x-xss-protection', 'referrer-policy', 'permissions-policy'].includes(k.toLowerCase())) {
        headers[k] = v;
      }
    }
    return headers;
  });
}
