# League Guide Codex

A modern Next.js knowledge base for League of Legends champion guides. The app scans
`data/lol_detailed_guide` for `.txt` files, converts each file into a champion page, and
provides a fast searchable index.

## Features

- Next.js 15, React, TypeScript, and Tailwind CSS
- Automatic `.txt` guide discovery, slug generation, and static champion routes
- Fuzzy client-side search with keyboard navigation
- Dark gaming-inspired responsive UI
- Sticky guide table of contents, copy/share actions, loading skeletons, and empty states
- Dynamic SEO metadata for each champion page

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```

## Guide Data

Add or update champion `.txt` files in `data/lol_detailed_guide`. The app excludes
`README.txt` and automatically formats champion filenames such as `aurelion_sol.txt`,
`dr._mundo.txt`, and `nunu_&_willump.txt`.
