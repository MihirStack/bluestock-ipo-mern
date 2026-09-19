import { useEffect, useState } from 'react'
import './App.css'

type Ipo = {
  _id: string
  company: { name: string }
  priceBand: string
  openDate: string
  closeDate: string
  issueSize: string
  status: string
  currentReturn?: number
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:11001/api/v1'

function App() {
  const [ipos, setIpos] = useState<Ipo[]>([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ limit: '20' })
    if (status) params.set('status', status)
    if (search.trim()) params.set('search', search.trim())

    fetch(`${apiBaseUrl}/ipos?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load IPO data.')
        return response.json() as Promise<{ data: Ipo[] }>
      })
      .then((payload) => {
        setIpos(payload.data)
        setError('')
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError('The IPO service is unavailable. Start the API on port 11001 and try again.')
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [search, status])

  return (
    <main className="app-shell">
      <nav className="topbar">
        <span className="brand-mark">B</span>
        <span>Bluestock IPO</span>
        <span className="topbar-label">MERN implementation</span>
      </nav>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Public IPO market</p>
          <h1>Track the next market move.</h1>
          <p className="hero-copy">
            Browse upcoming, ongoing, and listed IPOs from the public API. Search by company, then
            open the details when you are ready to go deeper.
          </p>
        </div>
        <div className="health-card">
          <div className="status-dot" />
          <div>
            <strong>Live IPO feed</strong>
            <span>Connected to the Phase 2 public API</span>
          </div>
        </div>
      </section>
      <section className="market-section">
        <div className="section-heading">
          <p className="eyebrow">Market watch</p>
          <h2>Find an IPO</h2>
        </div>
        <div className="controls">
          <label>
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Company or price band"
            />
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All IPOs</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="listed">Listed</option>
            </select>
          </label>
        </div>
        {isLoading && <p className="message">Loading IPOs...</p>}
        {error && <p className="message error-message">{error}</p>}
        {!isLoading && !error && ipos.length === 0 && (
          <p className="message">No IPOs match these filters.</p>
        )}
        <div className="ipo-grid">
          {ipos.map((ipo) => (
            <article className="ipo-card" key={ipo._id}>
              <div className="ipo-card-top">
                <span className={`status status-${ipo.status}`}>{ipo.status}</span>
                <span>{ipo.issueSize}</span>
              </div>
              <h3>{ipo.company.name}</h3>
              <p className="price-band">{ipo.priceBand}</p>
              <dl>
                <div>
                  <dt>Open</dt>
                  <dd>{formatDate(ipo.openDate)}</dd>
                </div>
                <div>
                  <dt>Close</dt>
                  <dd>{formatDate(ipo.closeDate)}</dd>
                </div>
              </dl>
              {ipo.currentReturn !== undefined && (
                <p className="return">
                  Current return <strong>+{ipo.currentReturn}%</strong>
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default App
