import { getStore } from '@netlify/blobs';

export default async (req) => {
  try {
    const body = await req.json();
    const { deviceId, subscription } = body;
    if (!deviceId || !subscription) {
      return new Response(JSON.stringify({ error: 'missing deviceId or subscription' }), { status: 400 });
    }
    const store = getStore('push-subscriptions');
    await store.setJSON(deviceId, subscription);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
