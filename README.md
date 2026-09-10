# Study Tracker (with background schedule notifications)

Pomodoro timer, subject-wise time tracking, weekly schedule, to-do list, stats — aur ab **schedule reminders jo browser band hone ke baad bhi aate hain** (push notifications).

## Deploy karna (phone se bhi, GitHub + Netlify)

1. Is poore folder ko GitHub repo mein upload karo (GitHub website/app se "Add file → Upload files", saari files aur folders daal do — `netlify` folder bhi zaroor jaye).
2. [netlify.com](https://netlify.com) pe GitHub se login karo → "Add new site" → "Import an existing project" → apna repo choose karo.
3. Build settings automatically `netlify.toml` se le lega (`npm run build`, publish `dist`). Bas "Deploy" dabao.

## Zaroori: VAPID keys add karo (push ke liye)

Push notification bhejne ke liye ye do "keys" chahiye — maine already generate kar di hain:

```
VAPID_PUBLIC_KEY=BBpo1a_FtZlLCtNq80rb_JV_6ZxhDMimRdJdM5oUcIaPeMkSO7B_EHc6FlnAPYFvNFDsbap7nuxLveu6xnha_VE
VAPID_PRIVATE_KEY=9aOHpBlKZVyfcAA2DZKie4g3cO2DoXIS_zTtp3PAKAY
```

Netlify site deploy hone ke baad:
1. Site ke **Site settings → Environment variables** mein jao
2. Dono keys upar wale naam se add karo (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`)
3. "Deploys" tab se ek baar **"Trigger deploy" → "Clear cache and deploy"** kar do taaki naye env vars function mein aa jaye

(Private key kisi ko mat dena — ye tere server ki "signature" hai push bhejne ke liye.)

## Zaroori: har minute schedule check karwana (external cron)

Netlify khud har minute apna function nahi chalata (free plan mein), isliye ek **free external cron service** use karenge jo har minute tere function ko "ping" karega:

1. [cron-job.org](https://cron-job.org) pe free account banao
2. "Create cronjob" → URL mein daalo:
   ```
   https://TERA-SITE-NAME.netlify.app/.netlify/functions/check-schedule
   ```
   (apni actual Netlify URL daalna, jo deploy ke baad milegi)
3. Schedule: **Every 1 minute**
4. Save kar do — bas, ab ye har minute check karega ki kisi ka schedule time to nahi aaya, aur agar aaya to push notification bhej dega.

## App mein notification on karna

1. Deployed site kholo phone pe
2. "🔔 Notifications on karo" button dabao → "Allow" karo
3. Ab jab bhi schedule ka time aayega, notification aayega — **chahe app/browser band ho, phone lock ho** — jab tak internet chalu hai.

## Kaise kaam karta hai (samajhne ke liye)

- Jab tu schedule set karta hai, wo tere phone (`localStorage`) ke saath-saath **server pe bhi** save hota hai (Netlify Blobs mein) — deviceId ke through, koi login nahi chahiye.
- `cron-job.org` har minute `check-schedule` function ko call karta hai.
- Wo function check karta hai: "abhi IST time + din ke hisaab se kisi ka koi schedule block start ho raha hai?" — agar haan, to us device ko push notification bhejta hai.
- Notification service worker (`public/sw.js`) receive karke dikhata hai, chahe tab band ho.

## Local mein test karna

```bash
npm install
npm run dev
```
(Push notifications sirf **deployed HTTPS site** pe kaam karenge, localhost pe sirf UI test ho sakta hai.)

## Data storage

- Personal data (todos, daily log, stopwatch) — sirf phone ke `localStorage` mein.
- Schedule + subjects — phone ke `localStorage` **aur** server (Netlify Blobs) dono mein, taaki background check ho sake.
