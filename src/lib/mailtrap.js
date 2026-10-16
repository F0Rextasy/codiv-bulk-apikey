'use strict';

/**
 * Mailtrap inbound inboxes — one fresh address per account.
 *
 * codiv.ai only needs an address that can receive its verification mail; Mailtrap's
 * inbound testing service (the free `inbound-mailtrap.io` domain) mints however many
 * it needs over its public API, so the whole lane runs on the operator's own
 * Mailtrap account with no extra service.
 *
 * Token: `--mailtrap-token` or the `MAILTRAP_TOKEN` environment variable
 * (Mailtrap dashboard → Settings → API Tokens; inbound read access is enough).
 */

const API = 'https://mailtrap.io/api';

function resolveToken(explicit) {
  const token = explicit || process.env.MAILTRAP_TOKEN;
  if (!token || !String(token).trim()) {
    throw new Error('no Mailtrap token: pass --mailtrap-token or set MAILTRAP_TOKEN');
  }
  return String(token).trim();
}

async function mailtrap(token, method, endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* non-JSON error body */ }
  // Mailtrap answers errors as JSON too (rate limits, quota, bad token): an
  // object carrying an `errors` array is NOT a success payload.
  if (json && Array.isArray(json.errors) && json.errors.length) {
    throw new Error(`mailtrap ${method} ${endpoint} -> ${typeof json.errors[0] === 'string' ? json.errors[0] : JSON.stringify(json.errors[0])}`);
  }
  if (!res.ok) throw new Error(`mailtrap ${method} ${endpoint} -> ${res.status} ${text.slice(0, 160)}`);
  return json;
}

/** Find-or-create a provider-scoped folder so campaigns stay separated in the dashboard. */
async function ensureFolder(token, name) {
  const folders = await mailtrap(token, 'GET', '/inbound/folders');
  const list = Array.isArray(folders) ? folders : folders.folders || [];
  const found = list.find((f) => f.name === name);
  if (found) return found.id;
  const created = await mailtrap(token, 'POST', '/inbound/folders', { name });
  return created.id;
}

/** Create one inbox; returns `{ address, id }` — `id` is the token for the rest. */
async function createInbox({ token, folder = 'codiv', tag = 'codiv' } = {}) {
  const auth = resolveToken(token);
  const folderId = await ensureFolder(auth, folder);
  const name = `${tag ? `${tag}-` : ''}${Math.random().toString(36).slice(2, 8)}`;
  const inbox = await mailtrap(auth, 'POST', `/inbound/folders/${folderId}/inboxes`, { name });
  if (!inbox || !inbox.address || inbox.id === undefined) {
    throw new Error(`mailtrap inbox create returned no address/id: ${JSON.stringify(inbox).slice(0, 140)}`);
  }
  return { address: inbox.address, id: String(inbox.id) };
}

/** List the messages in an inbox (newest first, as the API returns them). */
async function listMessages(token, inboxId) {
  const data = await mailtrap(resolveToken(token), 'GET', `/inbound/inboxes/${inboxId}/messages`);
  const rows = Array.isArray(data) ? data : data.data || [];
  return rows.map((m) => ({
    id: String(m.id),
    subject: m.subject || '',
    from: m.from_email || m.from || '',
    receivedAt: m.created_at || null,
    text: m.text_body || '',
    html: m.html_body || '',
  }));
}

/** Read one message in full (subject/text/html) — the verification link lives here. */
async function readMessage(token, inboxId, id) {
  const m = await mailtrap(resolveToken(token), 'GET', `/inbound/inboxes/${inboxId}/messages/${id}`);
  return {
    id: String(m.id),
    subject: m.subject || '',
    from: m.from_email || m.from || '',
    text: m.text_body || '',
    html: m.html_body || '',
  };
}

module.exports = { createInbox, listMessages, readMessage };
