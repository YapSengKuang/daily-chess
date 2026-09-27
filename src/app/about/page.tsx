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
            Typefaces via{" "}
            <a href="https://fonts.google.com/" target="_blank" rel="noreferrer">
              Google Fonts
            </a>{" "}
            (Fraunces and Source Sans 3).
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
    </main>
  );
}
