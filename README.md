# Daily Chess

One Lichess puzzle a day. Each position is 3–6 player moves and always has a unique solution. Sign in with Google so streak and stats follow your account.

## Stack

- Next.js
- Auth.js (Google)
- Supabase (Postgres)
- chess.js
- react-chessboard
- Lichess puzzle database (filtered public set, 3–6 player moves)

## Setup

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Create a Google OAuth client (Web application). Authorized JavaScript origins: `http://127.0.0.1:3000` and `http://localhost:3000`. Authorized redirect URIs:
   - `http://127.0.0.1:3000/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
3. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor. Put the project URL and **service role** key in `.env.local`.
4. Generate `AUTH_SECRET` (`openssl rand -base64 32`). Set `AUTH_URL` to the same origin you open in the browser (prefer `http://127.0.0.1:3000`).

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open the same host you put in `AUTH_URL`.

## Deploy on Vercel

1. Push this repo to GitHub (the `main` branch is what Vercel builds by default).
2. Open [vercel.com/new](https://vercel.com/new), import `YapSengKuang/daily-chess`, and deploy. Framework preset: Next.js.
3. In the Vercel project: **Settings → Environment Variables**. Add these for Production (and Preview if you want preview logins):

| Name | Value |
|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://YOUR-PROJECT.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-PROJECT.vercel.app` |
| `GOOGLE_CLIENT_ID` | same as local |
| `GOOGLE_CLIENT_SECRET` | same as local |
| `SUPABASE_URL` | same as local |
| `SUPABASE_SERVICE_ROLE_KEY` | same as local |

4. Redeploy after saving env vars (**Deployments → ⋮ → Redeploy**).
5. In Google Cloud → OAuth client, add:
   - Origin: `https://YOUR-PROJECT.vercel.app`
   - Redirect: `https://YOUR-PROJECT.vercel.app/api/auth/callback/google`

Use the exact Vercel domain from the deployment, including any custom domain later.

## How play works

- A new puzzle is chosen from the Lichess set each UTC day.
- Daily and archive puzzles require Google sign-in. Attempts are stored per account in Supabase.
- Practice puzzles do not change the streak.
- Browser-only progress from before accounts is imported once if the account is empty, then discarded.
- Drag or click the only winning move. Opponent replies are played automatically.
- Hints highlight the piece, then the destination. Legal moves show as dots.
- Three lives. After a finish you can replay the solution and share a block like:

```
Daily Chess #262 2026-09-18
5/5  🟩🟩🟨🟩🟩
Streak: 4 🔥
```

Streak is consecutive UTC days you solved, counted from today or yesterday.
