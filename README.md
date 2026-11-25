# DONT ASK TV

A responsive, installable-style streaming **interface** built with React, TanStack Start and Tailwind. It uses real catalogue data, real artwork, official trailers, free public-domain films, live broadcaster streams and sports data — with no piracy and no DRM bypassing.

## What's included

- **Real movies and series** from TMDB: trending, now playing, upcoming, top rated, classics and TV popular.
- **Official trailers** embedded with YouTube's privacy-enhanced (`youtube-nocookie.com`) player.
- **Free public-domain films** from Internet Archive with direct MP4 playback.
- **Where to watch** links from TMDB watch providers (region-aware where available).
- **Live TV** from official broadcaster YouTube channels, plus your own authorized HLS/MP4 streams added in Admin.
- **Sports** fixtures, TV listings and official highlights from TheSportsDB, with a dedicated `/sports` page and a Sports shortcut in Live TV.
- Search, My List, preferences and custom channels persisted in the browser.
- Web app manifest and icons for home-screen installation.

## Legal boundaries

- All catalogue metadata/artwork comes from TMDB. Attribution is shown in the app footer.
- Public-domain films come from Internet Archive collections. Check each item's licence before use.
- Live streams play on the broadcaster's own platform. Rights remain with the channel owner; geo restrictions may apply.
- Latest and upcoming theatrical titles are shown with metadata, trailers and provider links. Full playback requires a licensed provider.
- DRM-protected or paywalled content is not supported and must not be bypassed.
- Only add streams you are licensed or otherwise authorized to access.

This product uses the TMDB API but is not endorsed or certified by TMDB.

## Setup

1. Copy `.env.example` to `.env`.
2. Add your `TMDB_API_KEY` (server-only; never prefix it with `VITE_`).
3. Optional: add `YOUTUBE_API_KEY` to resolve broadcasters' current live streams into in-app embeds. Without it, live channels open on YouTube.
4. Optional: change `SPORTS_API_KEY` (free shared key `123` works) and `ARCHIVE_COLLECTIONS`.
5. Install and run:

```bash
bun install
bun run dev
```

Tests: `bunx vitest run` (or `bun run test`).

## Key source links

- TMDB: https://www.themoviedb.org
- TMDB API docs: https://developer.themoviedb.org
- Internet Archive: https://archive.org
- TheSportsDB: https://www.thesportsdb.com
- YouTube privacy-enhanced embeds: https://www.youtube-nocookie.com

## Deploy to Netlify

A `netlify.toml` is included. It uses the Nitro Netlify preset, Node 22, build command `npm run build`, and publish directory `dist`.

1. Push this folder to the Git repository connected to your Netlify site.
2. In Netlify, go to **Site configuration → Environment variables** and add:
   - `TMDB_API_KEY` — your server-only TMDB key
   - `SPORTS_API_KEY=123` (optional)
   - `ARCHIVE_COLLECTIONS=feature_films,public_domain,opensource_movies` (optional)
   - `YOUTUBE_API_KEY` (optional, for in-app live embeds)
3. Trigger a deploy. Netlify will build with `npm run build` and publish `dist`.
4. Your site will be available at your Netlify subdomain, e.g. `https://dontasktv.netlify.app`.

Never commit `.env` or API keys to the repository.

## Native packaging

Android APK / Windows packaging is a later step, e.g. Capacitor or a Trusted Web Activity for Android, and Tauri/Electron or PWA install for Windows.
