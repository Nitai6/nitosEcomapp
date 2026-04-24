// Test SSRF protection by attempting to create a webhook with a blocked internal URL.
// Execute via browser_evaluate in Playwright MCP while logged in as admin.
// Replace TEST_GROUP_ID with the actual group ID before running.
() => {
  return fetch('/api/groups/TEST_GROUP_ID/webhook', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://localhost:3000/internal',
      events: ['member.joined'],
      isActive: true
    })
  }).then(r => r.json());
}
