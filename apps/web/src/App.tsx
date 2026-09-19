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
  const [showAdmin, setShowAdmin] = useState(false)

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
        <button
          className="admin-link"
          type="button"
          onClick={() => setShowAdmin((visible) => !visible)}
        >
          Admin access
        </button>
      </nav>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
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

type AdminUser = { id: string; name: string; email: string; role: string }

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<AdminUser | undefined>()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const payload = (await response.json()) as {
        success: boolean
        message?: string
        data?: { accessToken: string; user: AdminUser }
      }
      if (!response.ok || !payload.data) throw new Error(payload.message ?? 'Login failed')
      localStorage.setItem('bluestock_access_token', payload.data.accessToken)
      setUser(payload.data.user)
      setPassword('')
    } catch (loginError) {
      setMessage(loginError instanceof Error ? loginError.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function logout() {
    await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' })
    localStorage.removeItem('bluestock_access_token')
    setUser(undefined)
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">Protected workspace</p>
          <h2>Admin access</h2>
        </div>
        <button className="close-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>
      {user ? (
        <div className="admin-session">
          <p className="message">
            Signed in as <strong>{user.name}</strong> ({user.role})
          </p>
          <button className="primary-button" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      ) : (
        <form className="login-form" onSubmit={submitLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message && <p className="message error-message">{message}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      )}
    </section>
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
