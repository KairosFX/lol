# League Competitive Intelligence

A static Next.js 15 competitive intelligence platform for League of Legends. The app is
generated from a structured JSON dataset synced from Riot Data Dragon and League Wiki data,
with hard validation for all 172 champions and every generated rune, item, matchup, and
coaching section.

## Features

- Next.js 15, React, TypeScript, and Tailwind CSS
- Static export with generated champion routes
- 172 champion validation with duplicate-slug and missing-data protection
- Role, class, difficulty, lane, region, patch, rank, tier, win-rate, popularity, and ban-rate filters
- Official Riot splash art, portrait icons, ability icons, summoner spells, rune icons, and item icons
- Champion pages with full rune pages, item build timelines, item explanations, advanced analytics, matchup statistics, and pro coaching notes
- Responsive dark gaming UI with loading skeletons, empty states, copy/share actions, and dynamic SEO metadata

## Data Sync

```bash
node scripts/sync-riot-data.mjs
```

The sync script writes `data/champion-database.json` and fails if Riot Data Dragon does not
return exactly 172 champions, if any slug is duplicated, or if required competitive fields are
missing.

Optional aggregate provider data can be dropped into `data/meta-overrides.json`. Matching rows
override generated patch-model stats when the row patch matches the current Data Dragon version.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
```

The project is configured for static export, so a production build emits the static site to
`out/`.
