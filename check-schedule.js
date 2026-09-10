import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export default async (req) => {
  const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), { status: 500 });
  }
  webpush.setVapidDetails('mailto:study-tracker@example.com', VAPID_PUBLIC, VAPID_PRIVATE);

  const subStore = getStore('push-subscriptions');
  const schedStore = getStore('schedules');

  // Current wall-clock time in IST, computed from server UTC time.
  const nowUtc = new Date();
  const ist = new Date(nowUtc.getTime() + IST_OFFSET_MS);
  const dayName = DAY_NAMES[ist.getUTCDay()];
  const hhmm = `${ist.getUTCHours().toString().padStart(2, '0')}:${ist.getUTCMinutes().toString().padStart(2, '0')}`;

  const { blobs } = await schedStore.list();
  let sent = 0;

  for (const blob of blobs) {
    const deviceId = blob.key;
    let data;
    try {
      data = await schedStore.get(deviceId, { type: 'json' });
    } catch (e) {
      continue;
    }
    if (!data || !data.schedule) continue;

    const dayBlocks = data.schedule[dayName] || [];
    const matching = dayBlocks.filter((b) => b.start === hhmm);
    if (matching.length === 0) continue;

    let sub;
    try {
      sub = await subStore.get(deviceId, { type: 'json' });
    } catch (e) {
      continue;
    }
    if (!sub) continue;

    for (const block of matching) {
      const subj = (data.subjects || []).find((s) => s.id === block.subjectId);
      const payload = JSON.stringify({
        title: 'Schedule reminder',
        body: `${subj ? subj.name : 'Study'} ka time ho gaya hai`,
      });
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          try { await subStore.delete(deviceId); } catch (e2) {}
        }
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, dayName, hhmm, checked: blobs.length, sent }), { status: 200 });
};
