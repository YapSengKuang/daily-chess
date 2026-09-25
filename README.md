# Daily Chess

One Lichess puzzle a day. Each position is 3–6 player moves and always has a unique solution. Share a Wordle-style result from this browser.

## Stack

- Next.js
- chess.js
- react-chessboard
- Lichess puzzle database (daily set) and Lichess API (random puzzles)

## Setup

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). No accounts or env files are required.

Optional: set `NEXT_PUBLIC_SITE_URL` in `.env.local` for share-preview images when you deploy.

## Deploy on Vercel

Import [YapSengKuang/daily-chess](https://github.com/YapSengKuang/daily-chess). Framework: Next.js. You can leave environment variables empty unless you want a custom `NEXT_PUBLIC_SITE_URL`.

## How play works

- A new puzzle is chosen from the Lichess set each UTC day.
- Random pulls a live puzzle from Lichess on every load. It does not change the streak.
- Drag or click the only winning move. Opponent replies are played automatically.
- Hints highlight the piece, then the destination. Legal moves show as dots.
- Three lives. After a finish you can replay the solution and share a block like:

```
Daily Chess #262 2026-09-18
5/5  🟩🟩🟨🟩🟩
Streak: 4 🔥
```

Streaks and stats are stored in this browser only.
