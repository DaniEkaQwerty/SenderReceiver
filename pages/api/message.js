import { kv } from '@vercel/kv';

const LATEST_KEY = 'latest_message';
const HISTORY_KEY = 'message_history';
const HISTORY_LIMIT = 30;
const hasKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Fallback in-memory store, only used when Vercel KV is not connected yet
// (useful for local testing, NOT reliable in production on Vercel serverless).
global.__memoryLatest = global.__memoryLatest || null;
global.__memoryHistory = global.__memoryHistory || [];

async function getLatest() {
  return hasKV ? await kv.get(LATEST_KEY) : global.__memoryLatest;
}
async function setLatest(val) {
  if (hasKV) await kv.set(LATEST_KEY, val);
  else global.__memoryLatest = val;
}
async function getHistory() {
  return hasKV ? ((await kv.get(HISTORY_KEY)) || []) : global.__memoryHistory;
}
async function setHistory(val) {
  if (hasKV) await kv.set(HISTORY_KEY, val);
  else global.__memoryHistory = val;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Field "text" wajib diisi dan tidak boleh kosong.' });
    }

    const payload = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      text: text,
      time: Date.now(),
    };

    try {
      await setLatest(payload);
      const history = await getHistory();
      const updated = [payload, ...history].slice(0, HISTORY_LIMIT);
      await setHistory(updated);
      return res.status(200).json({ ok: true, message: payload, history: updated });
    } catch (err) {
      return res.status(500).json({ error: 'Gagal menyimpan pesan.', detail: String(err) });
    }
  }

  if (req.method === 'GET') {
    try {
      const payload = await getLatest();
      const history = await getHistory();
      return res.status(200).json({ message: payload || null, history, storage: hasKV ? 'kv' : 'memory-fallback' });
    } catch (err) {
      return res.status(500).json({ error: 'Gagal mengambil pesan.', detail: String(err) });
    }
  }

  if (req.method === 'DELETE') {
    const clearHistory = req.query.history === '1';
    try {
      await setLatest(null);
      if (clearHistory) await setHistory([]);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'Gagal reset pesan.', detail: String(err) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).json({ error: 'Method not allowed' });
}