# Spawning Claude Code CLI from a Next.js Server

How to call Claude Code CLI from a Next.js API route running inside a Claude Code session.

## The Problem

When the Next.js server runs inside a Claude Code session (started from terminal or VS Code), child processes inherit environment variables like `CLAUDECODE`, `CLAUDE_AGENT_SDK_VERSION`, `CLAUDE_CODE_ENTRYPOINT`, `MCP_CONNECTION_NONBLOCKING`, etc. These cause the CLI to either:
- Refuse to start ("cannot be launched inside another Claude Code session")
- Hang indefinitely with zero output

## What Failed

| Approach | Result |
|----------|--------|
| `execFile("claude", [...])` with env filter | Hangs - 120s timeout, zero output |
| `spawn("claude", [...])` with env filter | Hangs - same |
| `execFile` with `shell: true` | Hangs |
| Shell wrapper script via `execFile` | Hangs |
| Starting server with `env -i` clean env | Hangs (missing auth context) |
| Filtering only `CLAUDECODE` var | CLI error: "nested session" (other CLAUDE_ vars still present) |

## What Works

**`spawn("/bin/bash", ["-c", shellCmd])` with `detached: true` and `stdio: ["ignore", "pipe", "pipe"]`**

Three things are required together:
1. **bash -c** with inline env cleanup - strips ALL `CLAUDE*` and `MCP_*` vars
2. **detached: true** - detaches child from parent process group
3. **stdio: ["ignore", "pipe", "pipe"]** - closes stdin (prevents TTY inheritance blocking)

## Working Implementation (TypeScript/Node.js)

```typescript
import { spawn } from "child_process";

export function callClaudeCLI(prompt: string): Promise<string> {
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

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Claude CLI timed out"));
    }, 120000);

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Exit ${code}: ${stderr}`));
        return;
      }
      resolve(stdout);
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.unref();
  });
}
```

## Working Implementation (Python/asyncio)

```python
import asyncio
import json
import os

async def call_claude_cli(prompt: str, image_paths: list[str] | None = None) -> str:
    escaped_prompt = prompt.replace("'", "'\\''")

    image_args = ""
    if image_paths:
        for path in image_paths:
            image_args += f" --file '{path}'"

    shell_cmd = (
        "for v in $(env | grep -E '^(CLAUDE|MCP_)' | cut -d= -f1); do unset $v; done; "
        f"claude -p '{escaped_prompt}'{image_args} --output-format text 2>/dev/null"
    )

    proc = await asyncio.create_subprocess_exec(
        "/bin/bash", "-c", shell_cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        stdin=asyncio.subprocess.DEVNULL,
    )

    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=180)

    if proc.returncode != 0:
        error_msg = stderr.decode() if stderr else "Unknown error"
        raise RuntimeError(f"Claude CLI failed (exit {proc.returncode}): {error_msg}")

    result = stdout.decode()

    # If JSON output format, extract the result field
    try:
        parsed = json.loads(result)
        if isinstance(parsed, dict) and "result" in parsed:
            return parsed["result"]
    except json.JSONDecodeError:
        pass

    return result
```

## Parsing the Response

Claude CLI with `--output-format json` returns a wrapper object:

```json
{
  "type": "result",
  "subtype": "success",
  "result": "```json\n{...actual JSON...}\n```",
  "duration_ms": 14060,
  "total_cost_usd": 0.34
}
```

The actual content is in `result` field, often wrapped in markdown code fences. Parse like this:

```typescript
let parsed = JSON.parse(stdout);
if (parsed.result && typeof parsed.result === "string") {
  const jsonMatch = parsed.result.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    parsed = JSON.parse(jsonMatch[0]);
  }
}
```

## Key Details

- **CLI location**: `/usr/local/bin/claude` (hardcoded, not relying on PATH)
- **Env vars to strip**: everything starting with `CLAUDE` or `MCP_`
- **Timeout**: 120s is safe for most prompts; image analysis takes ~30s
- **Uses Claude Code credits** - no Anthropic API key needed
- **Skills and CLAUDE.md are available** to the spawned CLI session
- **Vision works** - pass absolute file path in prompt, CLI reads images natively

## Environment Variables That Cause Issues

| Variable | Effect if present |
|----------|------------------|
| `CLAUDECODE=1` | "Cannot be launched inside another session" |
| `CLAUDE_AGENT_SDK_VERSION` | Triggers nested session detection |
| `CLAUDE_CODE_ENTRYPOINT` | Triggers nested session detection |
| `CLAUDE_CODE_ENABLE_*` | Various SDK flags that confuse the CLI |
| `MCP_CONNECTION_NONBLOCKING` | MCP connection interference |
