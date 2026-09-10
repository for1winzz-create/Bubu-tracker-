import { getStore } from '@netlify/blobs';

export default async (req) => {
  try {
    const body = await req.json();
    const { deviceId, schedule, subjects } = body;
    if (!deviceId) {
      return new Response(JSON.stringify({ error: 'missing deviceId' }), { status: 400 });
    }
    const store = getStore('schedules');
    await store.setJSON(deviceId, { schedule: schedule || {}, subjects: subjects || [], updatedAt: Date.now() });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
