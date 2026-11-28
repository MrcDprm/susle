English | [Türkçe](README.tr.md)

# Süsle

Open your own New Year tree and share the link. The people you love hang ornaments with a message on it, and every message stays sealed until midnight on 1 January, Türkiye time. The tree stays online afterwards as a keepsake.

Live: https://susle.miracdeprem.com

## Features

- **Open a tree without an account:** pick a name and one of six trees: pine, snowy pine, fir, spruce, silver and white, each with its own shape, shading and drooping branch tips.
- **Share right away:** right after the tree opens, a sheet with the share menu, WhatsApp, X, the Instagram story and the private owner link comes up. It stays until you copy or confirm the owner link, because that link is the only key to the tree.
- **Hang an ornament:** choose one of 12 ornaments, including a pomegranate, an evil eye bead, a tea glass and a tangerine, write a message of up to 500 characters, sign it or stay anonymous, and decide whether everyone may read it once it opens.
- **Sealed until New Year:** before midnight on 1 January nobody can read a message, the owner included. The server never sends message text before that moment; afterwards the owner reads everything and visitors read only the public ones.
- **Live countdown** to the second, and the page refreshes by itself when the messages open.
- **Live tree:** while the page is open it checks for new ornaments every 20 seconds; a new one drops onto a branch with a short note at the top.
- **New Year reminder:** one tap adds a calendar event with an alarm at 00:00 on 1 January and the tree link inside it, as a phone calendar file or in Google Calendar.
- **Midnight greeting:** whoever opens the tree in the first days of the new year gets a short greeting and a burst of snow.
- **Winter scene built for phones:** falling snow, twinkling stars, a moon and a shooting star, a snowy village with lit windows and chimney smoke, a cat that walks by, blinking string lights, swaying ornaments, and presents under the tree that grow with the number of ornaments. Tapping the tree shakes snow off its branches.
- **Music box:** Jingle Bells on synthesized bells with Web Audio, no audio files. It starts on the first tap because browsers block autoplay, and a button turns it off for good.
- **Sharing:** copy the link, WhatsApp, X, a generated link preview image, and a 1080×1920 Instagram story image that opens the phone share sheet.
- **Owner tools:** rename the tree, stop accepting ornaments, remove an ornament, delete the tree.
- **Pages of 24 ornaments** per branch, up to 480 per tree.
- **Turkish and English.**

## Screenshots

<p>
  <img src="docs/screenshots/home.png" width="200" alt="Home page with a tree in a snowy village">
  <img src="docs/screenshots/tree.png" width="200" alt="A tree with ornaments and a countdown">
  <img src="docs/screenshots/welcome.png" width="200" alt="Share sheet that opens right after the tree is created">
</p>
<p>
  <img src="docs/screenshots/hang.png" width="200" alt="Picking an ornament and writing a message">
<p>
  <img src="docs/screenshots/card.png" width="200" alt="Reading a message after it opened">
  <img src="docs/screenshots/story.png" width="200" alt="Generated Instagram story image">
</p>
<p>
  <img src="docs/screenshots/messages.png" width="200" alt="All messages after midnight">
</p>

## Tech Stack

| Part | Choice |
|---|---|
| App | Next.js 16 App Router, React 19, TypeScript |
| Database | Neon Postgres with Drizzle ORM; PGlite for local development and tests |
| Bot protection | Cloudflare Turnstile |
| Validation | Zod on the server |
| Images | `next/og` for the link preview and the story image |
| Sound | Web Audio API |
| Tests | Vitest |
| Hosting | Vercel |

## Installation

```bash
git clone https://github.com/MrcDprm/susle.git
cd susle
npm install
cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:3300. Without `DATABASE_URL` it opens an embedded Postgres in the `.pglite` folder, and the Turnstile test keys in `.env.example` always pass, so nothing else is needed locally.

```bash
npm test
npm run typecheck
```

For production, create a Neon database, put its address into `DATABASE_URL`, create the tables once with `node --env-file=.env.local scripts/migrate.mjs`, and set real Turnstile keys, a random `IP_HASH_SALT` and `NEXT_PUBLIC_SITE_URL` in Vercel.

## What I Learned

- I kept the lock on the server. Before midnight the query does not even select the message column, so hiding it in the browser was never the protection. I broke this rule on purpose twice and the tests caught both.
- There are no accounts. The owner gets a random 32 byte key; the database stores only its SHA-256 hash, the browser keeps it in an HttpOnly `__Host-` cookie, and the owner link sets that cookie on another device.
- I wrote race-safe SQL: an ornament gets its slot, and the tree is checked for being open, not yet revealed and not full, in a single `INSERT ... SELECT`. The rate limiter is one upsert, so parallel requests cannot slip past it.
- I learned how a strict Content Security Policy with a nonce works in Next.js, and why the page then has to be rendered per request.
- The same drawing code produces both the interactive SVG in React and the SVG string that `next/og` turns into share images, so the tree looks the same everywhere.
- I synthesized bells with Web Audio oscillators and a lookahead scheduler instead of shipping an audio file, and learned how browser autoplay rules shape when sound may start.
- I wrote a calendar file by hand following RFC 5545, escaping commas, semicolons and line breaks so a tree name cannot add fields to the event.
- I designed for the phone first: the tree page is one screen, forms open as bottom sheets, and every animation stops when the system asks for reduced motion.
