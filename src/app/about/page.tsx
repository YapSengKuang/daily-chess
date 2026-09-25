export default function AboutPage() {
  return (
    <main className="page">
      <h1 className="page-title">About</h1>
      <section className="panel">
        <p>
          Daily Chess is a simple Wordle-style chess puzzle. Each UTC day has one 3–6 move Lichess
          puzzle with a unique solution. Play, share a colour-block result, and keep a streak.
          Random mode pulls a live puzzle from Lichess whenever you want extra practice. Sign in to
          sync progress; guests can still play in this browser.
        </p>
        <p>Built by Seng Kuang Yap.</p>
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
