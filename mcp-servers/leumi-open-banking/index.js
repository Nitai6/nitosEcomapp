#!/usr/bin/env node
/**
 * Bank Leumi Open Banking MCP wrapper.
 *
 * Tools exposed:
 *   - leumi_oauth_url             — get owner-consent URL (one-time + 90-day refresh)
 *   - leumi_exchange_code         — exchange auth code → access+refresh tokens
 *   - leumi_get_accounts          — list business accounts
 *   - leumi_get_balances          — current balances per account
 *   - leumi_get_transactions      — transaction history (used by Phase A reconciliation)
 *   - leumi_initiate_payment      — outbound payment init (Phase C.3 tax + BL deposits)
 *   - leumi_get_payment_status    — poll payment outcome
 *
 * Auth flow (PSD2 / OAuth2):
 *   1. Owner runs leumi_oauth_url → opens URL in browser → signs into Leumi → consents
 *   2. Leumi redirects to LEUMI_OPEN_BANKING_REDIRECT_URI with ?code=...
 *   3. Owner pastes code; we call leumi_exchange_code → store refresh_token in state/secrets/.env
 *   4. All subsequent calls auto-refresh access_token using refresh_token
 *
 * Docs: https://www.leumiopenbanking.co.il/apis  (TPP registration required for production)
 *
 * SAFETY: leumi_initiate_payment requires explicit `confirm: true` and `idempotency_key` to prevent dup-pays.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import fs from 'node:fs';
import path from 'node:path';

const CLIENT_ID = process.env.LEUMI_OPEN_BANKING_CLIENT_ID;
const CLIENT_SECRET = process.env.LEUMI_OPEN_BANKING_CLIENT_SECRET;
const REDIRECT_URI = process.env.LEUMI_OPEN_BANKING_REDIRECT_URI || 'http://localhost:3000/leumi/callback';
const ENV = process.env.LEUMI_ENV || 'sandbox'; // 'sandbox' | 'prod'

const BASE = ENV === 'prod'
  ? 'https://openapi.leumi.co.il/api'
  : 'https://openapi-sandbox.leumi.co.il/api';

const TOKEN_CACHE_PATH = path.resolve(process.cwd(), 'state/secrets/.leumi-tokens.json');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('FATAL: LEUMI_OPEN_BANKING_CLIENT_ID and CLIENT_SECRET must be set');
  process.exit(1);
}

function loadTokens() {
  try { return JSON.parse(fs.readFileSync(TOKEN_CACHE_PATH, 'utf8')); }
  catch { return null; }
}

function saveTokens(tokens) {
  fs.mkdirSync(path.dirname(TOKEN_CACHE_PATH), { recursive: true });
  fs.writeFileSync(TOKEN_CACHE_PATH, JSON.stringify({ ...tokens, saved_at: new Date().toISOString() }, null, 2));
}

async function refreshAccessToken(refresh_token) {
  const res = await fetch(`${BASE}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status} ${await res.text()}`);
  const tokens = await res.json();
  saveTokens(tokens);
  return tokens;
}

async function getAccessToken() {
  let tokens = loadTokens();
  if (!tokens?.access_token) throw new Error('No tokens cached. Run leumi_oauth_url + leumi_exchange_code first.');
  // Refresh if older than 50 min (Leumi tokens typically last 60 min)
  const ageMin = (Date.now() - new Date(tokens.saved_at).getTime()) / 60000;
  if (ageMin > 50 && tokens.refresh_token) tokens = await refreshAccessToken(tokens.refresh_token);
  return tokens.access_token;
}

async function api(path, opts = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-ibm-client-id': CLIENT_ID,
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`Leumi ${res.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body;
}

const TOOLS = [
  {
    name: 'leumi_oauth_url',
    description: 'Get the consent URL the owner opens once to authorize paidads. Required scopes: accounts, balances, transactions, payments-initiation.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'leumi_exchange_code',
    description: 'Exchange the OAuth code (from redirect URL) for access+refresh tokens. Caches to state/secrets/.leumi-tokens.json.',
    inputSchema: {
      type: 'object',
      required: ['code'],
      properties: { code: { type: 'string' } },
    },
  },
  {
    name: 'leumi_get_accounts',
    description: 'List business accounts owner has consented to.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'leumi_get_balances',
    description: 'Current balances for an account.',
    inputSchema: {
      type: 'object',
      required: ['account_id'],
      properties: { account_id: { type: 'string' } },
    },
  },
  {
    name: 'leumi_get_transactions',
    description: 'Transaction history for an account in a date range. Used by finance-il Phase A daily reconciliation.',
    inputSchema: {
      type: 'object',
      required: ['account_id', 'from_date', 'to_date'],
      properties: {
        account_id: { type: 'string' },
        from_date: { type: 'string', description: 'YYYY-MM-DD' },
        to_date: { type: 'string', description: 'YYYY-MM-DD' },
      },
    },
  },
  {
    name: 'leumi_initiate_payment',
    description: 'Initiate an outbound payment (tax authority / ביטוח לאומי / VAT). REQUIRES confirm:true. SAFETY: agent must NOT call without idempotency_key + Phase-C-3 gating per finance-il SKILL.',
    inputSchema: {
      type: 'object',
      required: ['from_account_id', 'beneficiary_id', 'amount_ils', 'reference', 'idempotency_key', 'confirm'],
      properties: {
        from_account_id: { type: 'string' },
        beneficiary_id: { type: 'string', description: 'Pre-registered beneficiary (רשות המסים / ביטוח לאומי / מע"מ accounts must be in Leumi beneficiary list first)' },
        amount_ils: { type: 'number' },
        reference: { type: 'string', description: 'Tax period e.g. MAS-2026-Q2' },
        idempotency_key: { type: 'string', description: 'UUID — agent generates once per intended payment to prevent double-pay on retry' },
        confirm: { type: 'boolean', description: 'Must be true. Safety guard.' },
      },
    },
  },
  {
    name: 'leumi_get_payment_status',
    description: 'Poll payment outcome.',
    inputSchema: {
      type: 'object',
      required: ['payment_id'],
      properties: { payment_id: { type: 'string' } },
    },
  },
];

const server = new Server({ name: 'leumi-open-banking-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    switch (name) {
      case 'leumi_oauth_url': {
        const url = `${BASE}/oauth2/authorize?` + new URLSearchParams({
          response_type: 'code',
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          scope: 'accounts balances transactions payments-initiation',
          state: 'paidads',
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              consent_url: url,
              instructions: 'Owner: open this URL, sign into Leumi, consent. The redirect URL will contain ?code=XXXX in the query string. Paste that code into leumi_exchange_code.',
            }, null, 2),
          }],
        };
      }
      case 'leumi_exchange_code': {
        const res = await fetch(`${BASE}/oauth2/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: args.code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
          }),
        });
        if (!res.ok) throw new Error(`Exchange failed: ${res.status} ${await res.text()}`);
        const tokens = await res.json();
        saveTokens(tokens);
        return { content: [{ type: 'text', text: 'Tokens saved. Leumi MCP is now authorized for ~90 days; auto-refresh handles the rest.' }] };
      }
      case 'leumi_get_accounts': {
        const out = await api('/v1/accounts');
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'leumi_get_balances': {
        const out = await api(`/v1/accounts/${args.account_id}/balances`);
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'leumi_get_transactions': {
        const qs = new URLSearchParams({ fromDate: args.from_date, toDate: args.to_date });
        const out = await api(`/v1/accounts/${args.account_id}/transactions?${qs}`);
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'leumi_initiate_payment': {
        if (args.confirm !== true) throw new Error('SAFETY: confirm must be true to initiate payment.');
        if (!args.idempotency_key) throw new Error('SAFETY: idempotency_key required.');
        const out = await api('/v1/payments', {
          method: 'POST',
          headers: { 'X-Idempotency-Key': args.idempotency_key },
          body: JSON.stringify({
            fromAccountId: args.from_account_id,
            beneficiaryId: args.beneficiary_id,
            amount: { amount: args.amount_ils, currency: 'ILS' },
            reference: args.reference,
          }),
        });
        return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      }
      case 'leumi_get_payment_status': {
        const out = await api(`/v1/payments/${args.payment_id}`);
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
console.error(`leumi-open-banking-mcp ready (env: ${ENV})`);
