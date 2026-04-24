---
name: claude-cli
description: Replace Anthropic/OpenAI API SDK calls with Claude Code CLI subprocess calls to use subscription credits instead of API keys. This skill should be used when the user wants to modify any app to use Claude CLI instead of paying for API credits, or when integrating Claude into apps without an API key.
---

# Claude CLI Integration

Replace direct Anthropic/OpenAI SDK API calls with Claude Code CLI subprocess calls, enabling apps to use Claude Code subscription credits instead of requiring API keys.

## When to Use

- Modifying an app that uses `anthropic` or `@anthropic-ai/sdk` to use CLI credits instead
- Adding Claude capabilities to an app without an Anthropic API key
- Calling Claude from a Next.js API route, Python backend, or any server-side code
- The user mentions "use Claude Code credits", "no API key", or "use my subscription"

## Critical: Nested Session Prevention

When calling Claude CLI from code running inside a Claude Code session, inherited environment variables cause the CLI to either refuse to start or hang indefinitely. The solution requires stripping ALL `CLAUDE*` and `MCP_*` env vars before spawning the CLI process.

**This is the #1 failure mode.** Always include env var stripping in CLI calls.

## Integration Procedure

### Step 1: Identify API Call Points

Search the target codebase for:
- Python: `from anthropic import`, `AsyncAnthropic`, `Anthropic`, `client.messages.create`, `client.messages.stream`
- TypeScript/Node: `import Anthropic from`, `@anthropic-ai/sdk`, `anthropic.messages.create`
- Environment: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`

### Step 2: Choose the Right Pattern

**Simple prompt-response (no streaming needed):**
Use the subprocess pattern from `references/claude-cli-from-nextjs.md`. Call CLI with `-p` flag, parse response.

**Streaming responses (WebSocket/SSE apps):**
CLI does not natively stream to callers. Return full response at once (simplest - CLI returns complete response, emit as single delta).

**Image/vision analysis:**
Save base64 images to temp files, pass absolute paths in the prompt text. CLI reads images natively.

**Multi-turn conversations:**
Build conversation context into a single prompt with XML role tags (`<system>`, `<user>`, `<assistant>`).

### Step 3: Implement the CLI Wrapper

For reference implementations, read:
- `references/claude-cli-from-nextjs.md` - Full documentation with TypeScript and Python code patterns, debugging history, and env var details
- `references/peleg-studio-implementation.md` - Production TypeScript implementation with vision, translation, background processing, and JSON parsing

**Required elements for every CLI wrapper:**

1. **Env var stripping** - Strip ALL `CLAUDE*` and `MCP_*` vars:
   ```bash
   for v in $(env | grep -E '^(CLAUDE|MCP_)' | cut -d= -f1); do unset $v; done;
   ```

2. **Hardcoded CLI path** - Use `/usr/local/bin/claude`, not PATH lookup

3. **Detached process** (Node.js only) - `detached: true` + `stdio: ["ignore", "pipe", "pipe"]`

4. **Closed stdin** - Always close stdin to prevent TTY inheritance blocking

5. **Timeout** - 120s default, scale up for image analysis or batch operations

6. **Output format** - Use `--output-format json` for structured data, `--output-format text` for raw content

### Step 4: Modify the Factory/Provider

Replace the SDK client initialization with CLI wrapper. For apps with a provider/factory pattern, create a new provider class that implements the same interface but uses CLI subprocess calls internally.

Add a toggle via environment variable (e.g., `USE_CLAUDE_CLI=true`) so the app can switch between SDK and CLI modes.

### Step 5: Configure and Test

1. Set environment variable: `USE_CLAUDE_CLI=true` (or equivalent toggle)
2. Remove or leave blank the `ANTHROPIC_API_KEY`
3. Verify Claude CLI is authenticated: `claude --version`
4. Test with a simple prompt first before complex flows

## CLI Flags Reference

| Flag | Purpose |
|------|---------|
| `-p 'prompt'` | Non-interactive single prompt mode |
| `--output-format json` | Returns `{type, subtype, result, duration_ms, total_cost_usd}` |
| `--output-format text` | Returns raw text response |
| `--file path` | Attach a file (image, PDF, etc.) |

## Limitations

- No real-time streaming (CLI returns complete response)
- No native tool_use protocol (must simulate via prompt instructions)
- Slightly higher latency than direct SDK (subprocess overhead)
- Must be on a machine with authenticated Claude Code CLI
- Only works with macOS/Linux (bash subprocess pattern)

## Resources

### references/
- `claude-cli-from-nextjs.md` - Complete documentation: what works, what failed, working TypeScript and Python implementations, env var table, JSON parsing patterns
- `peleg-studio-implementation.md` - Production code from peleg-studio: `spawnClaudeCLI()`, `parseClaudeResponse()`, `analyzeImage()`, background processing, Hebrew translation, shell wrapper script
