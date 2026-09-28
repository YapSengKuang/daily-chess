export default function AboutPage() {
  return (
    <main className="page">
      <h1 className="page-title">About</h1>
      <section className="panel">
        <div className="about-copy">
          <p>
            Daily Chess is basically Wordle, but for chess puzzles. Every day there&apos;s one puzzle
            (3-6 moves, always a unique solution) pulled from Lichess. Solve it, share your
            colour-block result like a chess nerd, and keep your streak alive.
          </p>
          <p>
            Want more? Random mode grabs a fresh live puzzle from Lichess anytime you&apos;re itching
            for extra practice.
          </p>
          <p>
            Sign in if you want your progress synced across devices — or just play as a guest right
            in your browser, no strings attached.
          </p>
          <p>Made by Seng Kuang Yap.</p>
        </div>
        <ul className="about-links">
          <li>
            <a href="https://github.com/YapSengKuang" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/seng-kuang-yap" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href="https://sengkuangyap.com" target="_blank" rel="noreferrer">
              Portfolio
            </a>
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>Credits</h2>
        <p className="kicker">APIs, services, and art</p>
        <ul className="about-credits">
          <li>
            Pixel chess pieces from{" "}
            <a href="https://segnah.itch.io/cartoon-chess" target="_blank" rel="noreferrer">
              Pixel-art Cartoon Chess
            </a>{" "}
            by{" "}
            <a href="https://segnah.itch.io/" target="_blank" rel="noreferrer">
              Segnah
            </a>
            .
          </li>
          <li>
            Daily and random puzzles from the{" "}
            <a href="https://lichess.org/api" target="_blank" rel="noreferrer">
              Lichess API
            </a>
            .
          </li>
          <li>
            Today&apos;s fun fact from the{" "}
            <a href="https://uselessfacts.jsph.pl/" target="_blank" rel="noreferrer">
              Useless Facts API
            </a>
            .
          </li>
          <li>
            Sign-in and synced progress via{" "}
            <a href="https://firebase.google.com/" target="_blank" rel="noreferrer">
              Firebase
            </a>{" "}
            Authentication and Firestore.
          </li>
          <li>
            Hosting and deploys on{" "}
            <a href="https://vercel.com/" target="_blank" rel="noreferrer">
              Vercel
            </a>
            .
          </li>
          <li>
            Typeface{" "}
            <a href="https://www.fontshare.com/fonts/cabinet-grotesk" target="_blank" rel="noreferrer">
              Cabinet Grotesk
            </a>{" "}
            by{" "}
            <a href="https://www.indiantypefoundry.com/" target="_blank" rel="noreferrer">
              Indian Type Foundry
            </a>
            , via{" "}
            <a href="https://www.fontshare.com/" target="_blank" rel="noreferrer">
              Fontshare
            </a>
            , under the ITF Free Font License.
          </li>
          <li>
            Board UI with{" "}
            <a href="https://www.npmjs.com/package/react-chessboard" target="_blank" rel="noreferrer">
              react-chessboard
            </a>
            , move rules with{" "}
            <a href="https://github.com/jhlywa/chess.js" target="_blank" rel="noreferrer">
              chess.js
            </a>
            , app framework{" "}
            <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
              Next.js
            </a>
            , and motion from{" "}
            <a href="https://motion.dev/" target="_blank" rel="noreferrer">
              Motion
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>Use of AI</h2>
        <div className="about-copy">
          <p>
            Daily Chess was built with help from AI coding tools, including Cursor. Seng directed
            the product, reviewed the code, and is responsible for what ships. AI did not play the
            puzzles, invent Lichess content, or replace the artists and services credited above.
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>Privacy and data</h2>
        <p className="kicker">What we store, and why</p>
        <div className="about-copy">
          <p>
            Daily Chess is a hobby project. We only keep what we need to run the game, remember
            your settings, and (if you sign in) sync your streak across devices.
          </p>
          <h3>If you play as a guest</h3>
          <p>
            Progress, theme, sound, and chess-set preference stay in this browser&apos;s local
            storage. Nothing is uploaded unless you later create an account and we copy local
            attempts into your cloud profile.
          </p>
          <h3>If you sign in</h3>
          <p>
            Firebase Authentication stores your sign-in method (email/password or Google) and a
            user id. We save a username you choose, plus each completed daily/archive attempt
            (date, whether you solved or failed, move results, lives left, and an updated time) in
            Cloud Firestore, scoped to your account. That is so streaks and stats work on another
            phone or laptop.
          </p>
          <h3>Third parties</h3>
          <p>
            Puzzles come from Lichess. Fun facts come from the Useless Facts API. The site is
            hosted on Vercel, which may process request logs. Firebase may collect optional
            Analytics events in supported browsers. Google sign-in is handled by Google. We do not
            sell your data.
          </p>
          <h3>Your choices</h3>
          <p>
            You can sign out anytime. Delete account (in the menu, when signed in) removes your
            Firebase user, username document, and stored attempts, and clears local progress on
            this device. Hosting logs are not something we can fully erase after the fact.
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>Terms of use</h2>
        <p className="kicker">Using Daily Chess</p>
        <div className="about-copy">
          <p>
            By using this site you agree to these terms. Daily Chess is provided free, as-is, for
            personal play. It is not affiliated with Lichess, Wordle, Fontshare, or Firebase. Puzzle
            quality and availability depend on those upstream services.
          </p>
          <p>
            Do not abuse the site or its APIs (scraping at scale, attempting to break other
            people&apos;s accounts, or interfering with the service). Cheating only spoils your own
            streak. You are responsible for keeping your password private.
          </p>
          <p>
            We may change, pause, or shut down the game. To the extent Australian law allows, Seng
            Kuang Yap is not liable for lost streaks, downtime, or anything you do with a shared
            result. If a term cannot be enforced, the rest still apply.
          </p>
          <p>
            Questions: use the contact links above. These notes are written in plain language for a
            small personal site; they are not legal advice.
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>Typeface licence</h2>
        <p className="kicker">Cabinet Grotesk · ITF Free Font License</p>
        <div className="about-copy">
          <p>
            This site self-hosts the official Cabinet Grotesk variable webfont from Fontshare. The
            font software is designed, produced, and owned by Indian Type Foundry (ITF). Fonts on
            Fontshare identified as licensed under the ITF Free Font License are free for personal
            and commercial use, worldwide, in any media, subject to that licence.
          </p>
          <p>
            You may not take the font files from this website and redistribute, resell, or host
            them for other people to pick as a font in their own tools. If you want Cabinet Grotesk
            for your own project, download it from{" "}
            <a href="https://www.fontshare.com/fonts/cabinet-grotesk" target="_blank" rel="noreferrer">
              Fontshare
            </a>{" "}
            and agree to ITF&apos;s terms there. We have not modified the font files.
          </p>
          <p>
            Full licence:{" "}
            <a href="https://www.fontshare.com/licenses/ffl" target="_blank" rel="noreferrer">
              ITF Free Font License (FFL)
            </a>
            . Credit is optional under the FFL; we credit ITF and Fontshare because they made a
            great typeface.
          </p>
        </div>
      </section>
    </main>
  );
}
