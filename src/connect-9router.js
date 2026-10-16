'use strict';

/**
 * 9Router connector for codiv.ai API keys.
 *
 * Registers codiv.ai as an OpenAI-compatible provider-node in 9Router and
 * attaches API keys as connections to it. The provider prefix `codiv` keeps
 * them separate from every other station in the same router.
 *
 * 9Router: npm install -g 9router && 9router   # dashboard http://localhost:20128
 *
 * The shapes below were exercised against a live 9Router:
 *   POST /api/auth/login        {password}            -> session cookie
 *   GET  /api/provider-nodes                          -> {nodes}
 *   POST /api/provider-nodes    {name,prefix,apiType,type,baseUrl} -> {node}
 *   POST /api/providers         {provider:nodeId,apiKey,name,priority,defaultModel} -> {connection}
 *   POST /api/keys              {name}                -> {key}
 */

const fs = require('fs');
const UA = 'codiv-bulk-9router/1.0';

async function login(base, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ password: password ?? '123456' }),
  });
  const sc = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  const cookie = sc.map((c) => c.split(';')[0]).join('; ');
  return { ok: res.ok, cookie, body: (await res.text()).slice(0, 200) };
}

async function apiCall(base, cookie, pathname, init = {}) {
  const res = await fetch(`${base}${pathname}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': UA,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* non-JSON error body */ }
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 400) };
}

async function ensureProviderNode(base, cookie, { name, prefix, baseUrl }) {
  const list = await apiCall(base, cookie, '/api/provider-nodes');
  const nodes = (list.json && list.json.nodes) || [];
  const existing = nodes.find((n) => n.name === name || n.prefix === prefix);
  if (existing) return { node: existing, created: false };
  const created = await apiCall(base, cookie, '/api/provider-nodes', {
    method: 'POST',
    body: JSON.stringify({ name, prefix, apiType: 'chat', type: 'openai-compatible', baseUrl }),
  });
  if (!created.ok) throw new Error(`create provider-node failed ${created.status}: ${created.text}`);
  return { node: created.json.node, created: true };
}

async function ensureConnection(base, cookie, { nodeId, name, apiKey, defaultModel }) {
  const list = await apiCall(base, cookie, '/api/providers');
  const conns = (list.json && list.json.connections) || [];
  const existing = conns.find((c) => c.provider === nodeId && c.name === name);
  if (existing) return { connection: existing, created: false };
  const created = await apiCall(base, cookie, '/api/providers', {
    method: 'POST',
    body: JSON.stringify({ provider: nodeId, apiKey, name, priority: 1, defaultModel: defaultModel || null }),
  });
  if (!created.ok && created.status !== 409) {
    throw new Error(`create connection failed ${created.status}: ${created.text}`);
  }
  return { connection: created.json && created.json.connection, created: true };
}

async function ensureClientKey(base, cookie, name = 'codiv') {
  const list = await apiCall(base, cookie, '/api/keys');
  const keys = (list.json && list.json.keys) || [];
  const existing = keys.find((k) => k.name === name && k.isActive);
  if (existing) return { key: existing.key, created: false };
  const created = await apiCall(base, cookie, '/api/keys', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  if (!created.ok) throw new Error(`create client key failed ${created.status}: ${created.text}`);
  return { key: created.json.key, created: true };
}

async function connect({
  base = 'http://localhost:20128',
  password = '123456',
  apiKey,
  name = 'codiv',
  prefix = 'codiv',
  baseUrl = 'https://api.codiv.ai/v1',
  defaultModel = 'diffusiongemma-26b',
  clientKeyName = 'codiv',
}) {
  if (!apiKey) throw new Error('connect(): apiKey is required');
  const { ok, cookie, body } = await login(base, password);
  if (!ok && !/already|success|ok/i.test(body)) throw new Error(`9Router login failed: ${body}`);
  const { node } = await ensureProviderNode(base, cookie, { name, prefix, baseUrl });
  const { connection } = await ensureConnection(base, cookie, { nodeId: node.id, name, apiKey, defaultModel });
  const clientKey = await ensureClientKey(base, cookie, clientKeyName);
  return { clientKey: clientKey.key, nodeId: node.id, connectionId: connection && connection.id, baseUrl: `${base}/v1` };
}

async function connectBulk({
  base = 'http://localhost:20128',
  password = '123456',
  keysFile,
  prefix = 'codiv',
  baseUrl = 'https://api.codiv.ai/v1',
  defaultModel = 'diffusiongemma-26b',
}) {
  const keys = fs.readFileSync(keysFile, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/[\s,]+/)[0]);

  console.log(`connecting ${keys.length} keys to 9Router at ${base}`);
  const { ok, cookie, body } = await login(base, password);
  if (!ok && !/already|success|ok/i.test(body)) throw new Error(`9Router login failed: ${body}`);
  const { node } = await ensureProviderNode(base, cookie, { name: 'codiv', prefix, baseUrl });

  const results = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const name = `${prefix}-${String(i + 1).padStart(3, '0')}`;
    try {
      const { connection, created } = await ensureConnection(base, cookie, { nodeId: node.id, name, apiKey: key, defaultModel });
      results.push({ i: i + 1, key: key.slice(0, 16) + '…', connectionId: connection && connection.id, created });
      console.log(`  [${i + 1}/${keys.length}] ${name} -> ${created ? 'created' : 'exists'}`);
    } catch (e) {
      console.error(`  [${i + 1}/${keys.length}] ${name} -> FAILED: ${e.message}`);
      results.push({ i: i + 1, key: key.slice(0, 16) + '…', error: e.message });
    }
  }

  const clientKey = await ensureClientKey(base, cookie, prefix);
  console.log(`\n9Router client key: ${clientKey.key}`);
  console.log(`Endpoint: ${base}/v1`);
  console.log(`Models:   ${prefix}/${defaultModel}`);

  return { clientKey: clientKey.key, nodeId: node.id, results };
}

async function listRouterModels(base, clientKey, { filter = 'codiv/' } = {}) {
  const res = await fetch(`${base}/v1/models`, {
    headers: { Authorization: `Bearer ${clientKey}`, 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`router /v1/models -> ${res.status}`);
  const data = await res.json();
  const ids = (data.data || []).map((m) => m.id);
  return filter ? ids.filter((id) => id.includes(filter)) : ids;
}

module.exports = {
  login,
  apiCall,
  ensureProviderNode,
  ensureConnection,
  ensureClientKey,
  connect,
  connectBulk,
  listRouterModels,
  UA,
};
