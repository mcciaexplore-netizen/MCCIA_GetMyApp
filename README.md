# MCCIA GetMyApp

Animated AI Studio welcome page, fifteen-application catalog, application detail pages, two-step booking, and a protected availability editor.

## Visitor and editor access

Visitors open `/` and can explore applications, choose a session, and generate a downloadable PNG session card without an editor credential. The current visitor flow does not submit a booking or send emails: contact details remain in page memory until refresh/close. The card includes name, phone, email, optional company, application, date, and time and is explicitly marked as not submitted or reserved. The booking API remains available for future integration; its database schema must be extended for phone numbers before reconnecting this flow. The editor page is `/#/editor`. Editors sign in with the server-configured `EDITOR_ACCESS_KEY`; the key must be a randomly generated secret of at least 32 characters. It is held only in page memory and cleared on sign-out/reload. No default or hardcoded key is shipped. This is a shared editor credential, not individual email accounts.

Editors can show/hide and activate/deactivate each of the three one-hour slots for a scheduled date. Hiding all three slots removes that day from visitor choices. Inactive visible slots cannot be booked. Changes apply across all fifteen apps. Existing bookings are never deleted. The booking endpoint rechecks availability at insertion time.

The official AI Studio artwork has not been supplied; the header currently uses a temporary text-based AI Studio mark. The supplied MCCIA logo is unchanged.

## Vercel setup (required once)

1. Create a Supabase project, or use your existing project's SQL editor.
2. Run `supabase/schema.sql`. It creates bookings and availability tables, enables row-level security, and restricts database access to the server role. The booking/save functions use a transaction lock to serialize competing schedule changes and bookings.
3. Add these **server-side** environment variables in Vercel (Production and Preview as appropriate):
   - `SUPABASE_URL`: your project URL.
   - `SUPABASE_SECRET_KEY`: a Supabase secret API key (or legacy service-role key). Never expose this through a public/client environment variable.
   - `EDITOR_ACCESS_KEY`: a unique random secret, at least 32 characters. Share it only with the studio editor. Generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
4. Redeploy the latest GitHub commit. `vercel.json` publishes `dist/client`; the Vercel API function at `api/[...path].js` serves bookings and editor actions.
5. Open `/#/editor` and sign in with your editor key. Select a scheduled date, adjust Display/Active checkboxes, and save.

Until these variables and the SQL schema are configured, the API returns a clear unavailable message and does not pretend to save bookings. The Supabase database starts empty; existing Sites/D1 bookings are not migrated automatically. Do not run both public booking systems as independent authorities for the same studio schedule.

References: [Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js), [Supabase Data API](https://supabase.com/docs/guides/api).

## Local development

Requires Node.js 22.18 or newer. Copy `.env.example` to `.env` and set `EDITOR_ACCESS_KEY` for local editor access (Supabase is not needed locally).

```sh
npm install
npm run build
npm run dev
npm test
```

Local preview: http://127.0.0.1:4174. The SQLite test database is stored under ignored `.local/`. The developer preview applies the two known migrations without deleting existing records.

## Existing Sites deployment

The build continues to emit the Cloudflare Worker and generated D1 migrations. Sites uses its own D1 binding and needs `EDITOR_ACCESS_KEY` as a server secret for editor access. Vercel uses Supabase instead. Neither system stores authoritative bookings in browser storage.

Landing motion plays automatically and honors reduced-motion preferences. The original landing composition fits the viewport on desktop, mobile, and landscape screens. Each application displays only its assigned dates and the three daily session times; the booking layout is compact and allows natural overflow on unusually short displays or enlarged text rather than clipping controls.

## Current schedule

All sessions are in **2026**. The first week uses 28, 29, and 30 September plus 1 and 3 October; the second week uses every weekday from 5 to 9 October. Each application that appears in both weeks changes both weekday and time slot. The schedule assigns 2, 3, 2, 3, and 3 applications across the first week’s five dates, then 3 applications on each weekday of the second week. When the database cannot be reached, the UI displays the assigned planned dates and slots; visitors can still generate their local session card, which does not reserve the selected slot.

## Application trailers

Fifteen MP4 trailers are stored in dist/trailers and copied to the Vercel public build. The trailers mapping in dist/app.js selects the video for each application; add future files and mapping entries there. Only applications with a supplied video display a Trailer button. Playback opens in a keyboard-accessible dialog and stops when closed or navigating away. Local development supports video range requests for seeking. These binary assets are served by Vercel; the legacy embedded Sites worker does not bundle videos.

Payment Followup Agent is the current public name. The internal mr-wasooli ID is retained to preserve existing links and booking records.
