# Peleg Studio - Working Claude CLI Implementation

Real-world production implementation from `/Users/peleg/Peleg/peleg-studio/`.

## Architecture

The peleg-studio Next.js app uses Claude CLI for:
- Image analysis (vision) via `lib/image-analyzer.ts`
- Script generation via `lib/claude-bridge.ts`
- Hebrew translation and copywriting
- Background async processing from API routes

## Key Files

- `lib/image-analyzer.ts` - Production `spawnClaudeCLI()` + `parseClaudeResponse()` + `analyzeImage()`
- `lib/claude-bridge.ts` - Script generation using `execFile("claude", [...])`
- `bin/claude-clean.sh` - Shell wrapper that strips env vars
- `docs/claude-cli-from-nextjs.md` - Full documentation of the pattern

## Core Function: spawnClaudeCLI (TypeScript)

```typescript
export function spawnClaudeCLI(prompt: string, timeoutMs = 120000): Promise<string> {
  const escapedPrompt = prompt.replace(/'/g, "'\\''");

  const shellCmd = [
    "for v in $(env | grep -E '^(CLAUDE|MCP_)' | cut -d= -f1); do unset $v; done;",
    `/usr/local/bin/claude -p '${escapedPrompt}' --output-format json`,
  ].join(" ");

  return new Promise((resolve, reject) => {
    const child = spawn("/bin/bash", ["-c", shellCmd], {
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Claude CLI timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}. stderr: ${stderr}`));
        return;
      }
      resolve(stdout);
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to spawn Claude CLI: ${err.message}`));
    });

    child.unref();
  });
}
```

## Core Function: parseClaudeResponse (TypeScript)

```typescript
export function parseClaudeResponse(stdout: string): Record<string, unknown> {
  let parsed;
  try {
    parsed = JSON.parse(stdout);
    if (parsed.result && typeof parsed.result === "string") {
      const jsonMatch = parsed.result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    }
  } catch {
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error(`Could not parse Claude response`);
    }
  }
  return parsed;
}
```

## Shell Wrapper: claude-clean.sh

```bash
#!/bin/bash
unset CLAUDECODE
unset CLAUDE_AGENT_SDK_VERSION
unset CLAUDE_CODE_ENTRYPOINT
unset CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING
unset CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING
unset CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
for var in $(env | grep -E '^(CLAUDE|MCP_)' | cut -d= -f1); do
  unset "$var"
done
exec /usr/local/bin/claude "$@"
```

## Usage Patterns

### Direct prompt (simple)
```typescript
const stdout = await spawnClaudeCLI("Translate this to Hebrew: Hello world");
```

### Image analysis (vision)
```typescript
const prompt = `Read the image file at "${absolutePath}" and analyze it. Return JSON...`;
const stdout = await spawnClaudeCLI(prompt);
const profile = parseClaudeResponse(stdout);
```

### Background processing (non-blocking)
```typescript
const analyzeInBackground = async () => {
  for (const img of savedImages) {
    const profile = await analyzeImage(img.absolutePath);
    db.prepare("UPDATE post_images SET json_profile = ? WHERE id = ?")
      .run(JSON.stringify(profile), img.id);
  }
};
analyzeInBackground().catch(console.error);
// Return immediately
return NextResponse.json({ status: "ok" });
```

## Key Learnings

1. `spawn` with `detached: true` + `stdio: ["ignore", "pipe", "pipe"]` is the only reliable pattern
2. `execFile` works outside Claude Code sessions but hangs inside them
3. Must strip ALL `CLAUDE*` and `MCP_*` env vars
4. `--output-format json` wraps response in `{type, subtype, result, duration_ms, total_cost_usd}`
5. `--output-format text` returns raw text (simpler for non-JSON responses)
6. Vision works by referencing absolute file paths in the prompt text
7. CLI location: `/usr/local/bin/claude` (hardcoded)
8. Timeout: 120s default, scale up for batch operations
