# NextGen AI Coach - MVP

**Completely free to build and run initially.** Built for NextGen Golf Lounge members.

## Quick Start (You do this once)

1. Clone or download this folder.
2. `cd nextgen-ai-coach`
3. `npm install`
4. Create a free Supabase project at https://supabase.com
5. In Supabase:
   - Go to SQL Editor → paste the entire contents of `supabase/schema.sql`
   - Go to Authentication → URL Configuration → add your Vercel/preview URLs later
   - Get your Project URL and anon key → create `.env.local` (see below)
6. `cp .env.example .env.local` and fill in your Supabase keys.
7. `npm run dev`
8. Open http://localhost:3000 — the PWA-ready app.

## Deploy (Free)
- Push to GitHub
- Import repo on https://vercel.com (free)
- Add the same environment variables in Vercel
- Deploy → you get a live URL + automatic PWA install on phones.

## Key Features in this MVP
- Branded with your NextGen Golf Lounge logo
- Low-friction member flow: Check-in → Record video (guided) → Upload GSPro CSV → Instant AI analysis + updated Training Plan
- Training plans that adapt after each session
- Designed to launch to your existing members with minimal effort on their side

## Next Steps After MVP Works
I will add:
- Real auto-sync bridge for GSPro data (you install a tiny script on bay PCs)
- Deeper pose estimation with MediaPipe
- Member progress tracking over time
- Admin dashboard for you

All free.

---

**Logo**: Already included in /public/logo.png

Let me know when you're ready for the next iteration or if you want any screen/flow changed!