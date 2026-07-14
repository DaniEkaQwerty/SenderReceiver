import { kv } from '@vercel/kv';

const KEY = 'latest_message';
const hasKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Fallback in-memory store, only used when Vercel KV is not connected yet
// (useful for local testing, NOT reliable in production on Vercel serverless).
global.__memoryFallback = global.__memoryFallback || null;

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
      if (hasKV) {
        await kv.set(KEY, payload);
      } else {
        global.__memoryFallback = payload;
      }
      return res.status(200).json({ ok: true, message: payload });
    } catch (err) {
      return res.status(500).json({ error: 'Gagal menyimpan pesan.', detail: String(err) });
    }
  }

  if (req.method === 'GET') {
    try {
      const payload = hasKV ? await kv.get(KEY) : global.__memoryFallback;
      return res.status(200).json({ message: payload || null, storage: hasKV ? 'kv' : 'memory-fallback' });
    } catch (err) {
      return res.status(500).json({ error: 'Gagal mengambil pesan.', detail: String(err) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: 'Method not allowed' });
}
