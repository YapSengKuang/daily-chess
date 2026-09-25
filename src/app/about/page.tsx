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
    </main>
  );
}
