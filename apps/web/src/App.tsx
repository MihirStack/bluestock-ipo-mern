import './App.css'

function App() {
  return (
    <main className="app-shell">
      <nav className="topbar">
        <span className="brand-mark">B</span>
        <span>Bluestock IPO</span>
        <span className="topbar-label">MERN implementation</span>
      </nav>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Phase 1 / Foundation</p>
          <h1>IPO intelligence, built one vertical slice at a time.</h1>
          <p className="hero-copy">
            The public experience starts with a reliable API backbone. Next we will add Mongo-backed
            IPO records, then authentication and the admin workflow.
          </p>
        </div>
        <div className="health-card">
          <div className="status-dot" />
          <div>
            <strong>API foundation</strong>
            <span>Health route ready at /api/v1/health</span>
          </div>
        </div>
      </section>
      <section className="section-heading">
        <p className="eyebrow">Build sequence</p>
        <h2>From infrastructure to investor-facing flows</h2>
      </section>
      <section className="phase-grid">
        <article className="phase-card active">
          <span>01</span>
          <h3>Foundation</h3>
          <p>Express API, environment setup, health checks and a clean React shell.</p>
          <b>In progress</b>
        </article>
        <article className="phase-card">
          <span>02</span>
          <h3>IPO domain</h3>
          <p>MongoDB models, deterministic seed data, list/detail endpoints and derived returns.</p>
          <b>Next</b>
        </article>
        <article className="phase-card">
          <span>03</span>
          <h3>Admin control</h3>
          <p>Secure login, protected CRUD, uploads and the Figma-aligned management dashboard.</p>
          <b>Queued</b>
        </article>
      </section>
    </main>
  )
}

export default App
