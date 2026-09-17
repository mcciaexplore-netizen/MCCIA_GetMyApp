# MCCIA GetMyApp

A ten-application catalog with detail pages and app-development bookings.

## Vercel deployment

The repository's `vercel.json` configures the framework as Other, runs `npm run build`, and publishes `dist/client`. The build copies only HTML, CSS, JavaScript, and the supplied logo into this public directory. Do not publish the entire `dist` directory: it also contains the Cloudflare Worker and database migration metadata.

Redeploy the latest `main` commit after pulling this configuration. The deprecation and install-script warnings in the original log were not the missing-output-directory error.

### Booking backend limitation

Vercel currently serves the catalog and detail pages only. The existing `/api/availability` and `/api/bookings` handlers are Cloudflare Worker routes using a D1 `DB` binding; they are not Vercel Functions and are not deployed by this static output configuration. Booking on Vercel needs a compatible server API and a persistent database connection. Do not use a local file or browser storage as the production booking database. Until that backend is configured, use the existing Sites-hosted application for working bookings.

## Existing Cloudflare/Sites deployment

The build continues to emit `dist/server/index.js` and the existing D1 migrations for Sites. Its booking API and data are unchanged by the Vercel output-directory fix.

## Local development

Requires Node.js 22.18 or newer for the local SQLite preview.

```sh
npm install
npm run build
npm run dev
```

The local preview starts at http://127.0.0.1:4174 and keeps its test database under ignored `.local/`. Run `npm test` for booking validation and double-booking checks.
