#!/usr/bin/env node
/**
 * Submagic MCP wrapper.
 *
 * Tools exposed:
 *   - submagic_create_project        — upload video + create caption project
 *   - submagic_get_project           — poll project status
 *   - submagic_list_projects         — list recent projects
 *   - submagic_extract_shorts        — split long-form into Shorts candidates (Path 1 of social-youtube)
 *   - submagic_apply_template        — apply branded caption template by id
 *   - submagic_download_render       — fetch final rendered video URL
 *
 * Auth: SUBMAGIC_API_KEY env var (rotated key after leak).
 * Docs (unofficial): https://submagic.co/api  — adjust endpoints if Submagic publishes a formal spec.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const API_KEY = process.env.SUBMAGIC_API_KEY;
const BASE = process.env.SUBMAGIC_BASE_URL || 'https://api.submagic.co/v1';

if (!API_KEY) {
  console.error('FATAL: SUBMAGIC_API_KEY not set in env');
  process.exit(1);
}

const headers = () => ({
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
});

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: { ...headers(), ...(opts.headers || {}) } });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`Submagic ${res.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body;
}

const TOOLS = [
  {
    name: 'submagic_create_project',
    description: 'Create a new Submagic project from a source video URL. Returns project_id for polling.',
    inputSchema: {
      type: 'object',
      required: ['video_url', 'language'],
      properties: {
        video_url: { type: 'string', description: 'Public URL of source video (mp4)' },
        language: { type: 'string', description: 'BCP-47 lang code (e.g. en, he, en-US)' },
        template_id: { type: 'string', description: 'Optional brand caption template id' },
        title: { type: 'string' },
      },
    },
  },
  {
    name: 'submagic_get_project',
    description: 'Get status + outputs of a Submagic project. Poll until status=done.',
    inputSchema: {
      type: 'object',
      required: ['project_id'],
      properties: { project_id: { type: 'string' } },
    },
  },
  {
    name: 'submagic_list_projects',
    description: 'List recent Submagic projects (last 100).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'submagic_extract_shorts',
    description: 'Path 1 of social-youtube: submit a long-form video and get back N short-clip candidates (15-60s) with hook + retention scores.',
    inputSchema: {
      type: 'object',
      required: ['video_url'],
      properties: {
        video_url: { type: 'string' },
        max_clips: { type: 'number', default: 5 },
        min_duration_sec: { type: 'number', default: 15 },
        max_duration_sec: { type: 'number', default: 60 },
        language: { type: 'string', default: 'en' },
      },
    },
  },
  {
    name: 'submagic_apply_template',
    description: 'Apply a brand caption template to an existing project (font/color/SFX).',
    inputSchema: {
      type: 'object',
      required: ['project_id', 'template_id'],
      properties: {
        project_id: { type: 'string' },
        template_id: { type: 'string' },
      },
    },
  },
  {
    name: 'submagic_download_render',
    description: 'Get the final rendered video URL for a completed project.',
    inputSchema: {
      type: 'object',
      required: ['project_id'],
      properties: { project_id: { type: 'string' } },
    },
  },
];

const server = new Server({ name: 'submagic-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    switch (name) {
      case 'submagic_create_project': {
        const out = await api('/projects', {
          method: 'POST',
          body: JSON.stringify({
            videoUrl: args.video_url,
            language: args.language,
            templateId: args.template_id,
            title: args.title,
          }),
        });
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'submagic_get_project': {
        const out = await api(`/projects/${args.project_id}`);
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'submagic_list_projects': {
        const out = await api(`/projects?limit=100`);
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'submagic_extract_shorts': {
        const out = await api('/extract-shorts', {
          method: 'POST',
          body: JSON.stringify({
            videoUrl: args.video_url,
            maxClips: args.max_clips ?? 5,
            minDurationSec: args.min_duration_sec ?? 15,
            maxDurationSec: args.max_duration_sec ?? 60,
            language: args.language ?? 'en',
          }),
        });
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'submagic_apply_template': {
        const out = await api(`/projects/${args.project_id}/template`, {
          method: 'POST',
          body: JSON.stringify({ templateId: args.template_id }),
        });
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'submagic_download_render': {
        const out = await api(`/projects/${args.project_id}/render`);
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (e) {
    return { content: [{ type: 'text', text: `ERROR: ${e.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('submagic-mcp ready');
