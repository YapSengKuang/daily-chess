# Daily Chess

One Lichess puzzle a day. Each position is 3–6 player moves and always has a unique solution.

## Stack

- Next.js
- Firebase Auth (Google and email/password) + Firestore
- chess.js
- react-chessboard
- Lichess puzzle database (daily set) and Lichess API (random puzzles)

## Setup

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Firebase web config lives in `.env.local` (`NEXT_PUBLIC_FIREBASE_*`). In the Firebase console you still need:

1. **Authentication → Sign-in method:** enable **Google** and **Email/Password**
2. **Firestore Database** created, with `firestore.rules` pasted in
3. **Authentication → Settings → Authorized domains:** `localhost`, `127.0.0.1`, and your Vercel host

## Deploy on Vercel

Import the GitHub repo. Add the same `NEXT_PUBLIC_FIREBASE_*` values as in `.env.local`, plus optional `NEXT_PUBLIC_SITE_URL` for your Vercel URL.

## How play works

- A new puzzle is chosen from the Lichess set each UTC day.
- Random pulls a live puzzle from Lichess on every load. It does not change the streak.
- Daily/archive finishes save in this browser. If you are signed in, they also save to Firestore. Replays do not change stats.
- Sign in with Google or email/password to keep the same streak on another device.

Streak is consecutive UTC days you solved, counted from today or yesterday.
