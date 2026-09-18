# Daily Chess

One Lichess puzzle a day. Each position is 3–6 player moves and always has a unique solution. Share a Wordle-style result from this browser.

## Stack

- Next.js
- chess.js
- react-chessboard
- Lichess puzzle database (filtered public set, 3–6 player moves)

## Setup

```bash
npm install
npm run dev
```

## How play works

- A new puzzle is chosen from the Lichess set each UTC day.
- Drag or click the only winning move. Opponent replies are played automatically.
- Three lives. After a finish you get a share block like:

```
Daily Chess #262 2026-09-18
5/5  🟩🟩🟨🟩🟩
Streak: 4 🔥
```

Streaks are stored in this browser only.
