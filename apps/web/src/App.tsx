import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  TrendingUp,
  Upload,
  Users,
  X,
} from 'lucide-react'
import './App.css'

type Ipo = {
  _id: string
  company: { name: string; logo?: { url: string } }
  priceBand: string
  openDate: string
  closeDate: string
  issueSize: string
  issueType?: string
  status: string
  currentReturn?: number
  listingGain?: number
  listingDate?: string
  ipoPrice?: number
  listingPrice?: number
  currentMarketPrice?: number
  documents?: { rhp?: { url: string }; drhp?: { url: string } }
}
type User = { id: string; name: string; email: string; role: string }
type ApiPayload<T> = { success: boolean; message?: string; data: T; meta?: { total: number } }
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:11001/api/v1'

async function api<T>(path: string, options?: RequestInit): Promise<ApiPayload<T>> {
  const response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include', ...options })
  const payload = (await response.json()) as ApiPayload<T>
  if (!response.ok) throw new Error(payload.message ?? 'Something went wrong')
  return payload
}
function token() {
  return localStorage.getItem('bluestock_access_token') ?? ''
}
function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
        new Date(value),
      )
    : '—'
}
function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/market/:id" element={<MarketDetail />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/admin/*" element={<AdminGuard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function PublicNav() {
  return (
    <header className="public-nav">
      <Link className="wordmark" to="/">
        <span className="wordmark-box">B</span>
        <span>
          Bluestock<span className="wordmark-muted"> / IPO</span>
        </span>
      </Link>
      <nav>
        <Link to="/market">Explore IPOs</Link>
        <a href="#how-it-works">How it works</a>
      </nav>
      <div className="nav-actions">
        <Link className="text-link" to="/login">
          Sign in
        </Link>
        <Link className="button button-dark button-small" to="/register">
          Join the desk <ArrowUpRight size={14} />
        </Link>
      </div>
    </header>
  )
}

function MarketDetail() {
  const { id } = useParams()
  const [ipo, setIpo] = useState<Ipo | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!id) return
    api<Ipo>(`/ipos/${id}`)
      .then((payload) => setIpo(payload.data))
      .catch((detailError) =>
        setError(detailError instanceof Error ? detailError.message : 'Unable to load this IPO'),
      )
  }, [id])
  if (error)
    return (
      <div className="detail-shell">
        <PublicNav />
        <div className="empty-state">{error}</div>
      </div>
    )
  if (!ipo)
    return (
      <div className="detail-shell">
        <PublicNav />
        <div className="loading-state">Loading issue profile...</div>
      </div>
    )
  return (
    <div className="detail-shell">
      <PublicNav />
      <main className="detail-content">
        <Link className="back-link static-back" to="/market">
          ← Back to market
        </Link>
        <div className="detail-kicker">
          <span className={`status-badge ${ipo.status}`}>{ipo.status}</span>
          <span>IPO issue profile</span>
        </div>
        <h1>{ipo.company.name}</h1>
        <p className="detail-lede">
          A clear view of the issue window, pricing, and the numbers that matter before you decide.
        </p>
        <div className="detail-grid">
          <section className="detail-card detail-primary">
            <div>
              <span className="detail-label">Price band</span>
              <strong>{ipo.priceBand}</strong>
            </div>
            <div>
              <span className="detail-label">Issue size</span>
              <strong>{ipo.issueSize}</strong>
            </div>
            <div>
              <span className="detail-label">Issue type</span>
              <strong>{ipo.issueType ?? 'Book Built'}</strong>
            </div>
          </section>
          <section className="detail-card">
            <span className="detail-label">Timeline</span>
            <dl className="detail-dl">
              <div>
                <dt>Open</dt>
                <dd>{formatDate(ipo.openDate)}</dd>
              </div>
              <div>
                <dt>Close</dt>
                <dd>{formatDate(ipo.closeDate)}</dd>
              </div>
              <div>
                <dt>Listing</dt>
                <dd>{formatDate(ipo.listingDate)}</dd>
              </div>
            </dl>
          </section>
        </div>
        {ipo.currentReturn !== undefined && (
          <div className="detail-return">
            <TrendingUp size={24} />
            <div>
              <span>Current return</span>
              <strong>+{ipo.currentReturn}%</strong>
            </div>
            <p>Based on the latest available market price versus IPO price.</p>
          </div>
        )}
        <div className="detail-docs">
          <div>
            <FileText size={20} />
            <span>Offer documents</span>
          </div>
          {ipo.documents?.rhp?.url ? (
            <a href={ipo.documents.rhp.url} target="_blank" rel="noreferrer">
              RHP <ArrowUpRight size={15} />
            </a>
          ) : (
            <span className="disabled-doc">RHP pending</span>
          )}
          {ipo.documents?.drhp?.url ? (
            <a href={ipo.documents.drhp.url} target="_blank" rel="noreferrer">
              DRHP <ArrowUpRight size={15} />
            </a>
          ) : (
            <span className="disabled-doc">DRHP pending</span>
          )}
        </div>
      </main>
    </div>
  )
}

function MarketPage() {
  const [ipos, setIpos] = useState<Ipo[]>([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ limit: '20' })
    if (status) params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    fetch(`${apiBaseUrl}/ipos?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load IPO feed')
        return response.json() as Promise<ApiPayload<Ipo[]>>
      })
      .then((payload) => {
        setIpos(payload.data)
        setError('')
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError('The market feed is temporarily unavailable.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [search, status])
  const listed = ipos.filter((ipo) => ipo.status === 'listed').length
  const active = ipos.filter((ipo) => ipo.status === 'ongoing').length
  return (
    <div className="public-shell">
      <PublicNav />
      <main>
        <section className="market-hero">
          <div className="hero-copy-block">
            <div className="live-label">
              <span className="pulse" /> Market data live <span>•</span> 09:41:28 IST
            </div>
            <h1>
              Invest before
              <br />
              <em>the bell rings.</em>
            </h1>
            <p>
              Clear, timely IPO intelligence for people who want to move with conviction. Track
              every issue from filing to listing.
            </p>
            <div className="hero-actions">
              <Link className="button button-orange" to="/register">
                Open your free desk <ArrowUpRight size={16} />
              </Link>
              <a className="quiet-link" href="#market-watch">
                View live market <ChevronDown size={15} />
              </a>
            </div>
          </div>
          <div className="market-signal">
            <div className="signal-orbit orbit-one" />
            <div className="signal-orbit orbit-two" />
            <div className="signal-core">
              <TrendingUp size={28} />
              <strong>
                IPO
                <br />
                INDEX
              </strong>
              <span>+12.84%</span>
            </div>
            <div className="signal-tag tag-a">
              NIFTY 50 <b>+0.68%</b>
            </div>
            <div className="signal-tag tag-b">
              IPO PULSE <b>+12.84%</b>
            </div>
          </div>
        </section>
        <section className="ticker-strip">
          <div>
            <span>MARKET PULSE</span>
            <strong>3 tracked issues</strong>
          </div>
          <div>
            <span>ONGOING</span>
            <strong>{active || 1} live</strong>
          </div>
          <div>
            <span>LISTED RETURN</span>
            <strong className="positive">+22.78%</strong>
          </div>
          <div>
            <span>LISTINGS THIS WEEK</span>
            <strong>{listed + 2}</strong>
          </div>
          <div className="ticker-note">
            <span className="pulse" /> Data refreshed just now
          </div>
        </section>
        <section className="watch-section" id="market-watch">
          <div className="section-intro">
            <div>
              <p className="kicker">The market watch</p>
              <h2>
                Know what is
                <br />
                <em>opening next.</em>
              </h2>
            </div>
            <p>
              Every active, upcoming and recently listed IPO in one clear view. No noise, just the
              numbers that matter.
            </p>
          </div>
          <div className="watch-controls">
            <div className="search-wrap">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search companies or issues"
              />
            </div>
            <div className="segmented">
              <button className={!status ? 'selected' : ''} onClick={() => setStatus('')}>
                All <span>{ipos.length}</span>
              </button>
              <button
                className={status === 'upcoming' ? 'selected' : ''}
                onClick={() => setStatus('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={status === 'ongoing' ? 'selected' : ''}
                onClick={() => setStatus('ongoing')}
              >
                Open now
              </button>
              <button
                className={status === 'listed' ? 'selected' : ''}
                onClick={() => setStatus('listed')}
              >
                Listed
              </button>
            </div>
          </div>
          {loading && <div className="loading-state">Syncing market data...</div>}
          {error && <div className="empty-state">{error}</div>}
          {!loading && !error && (
            <div className="market-table">
              <div className="table-head">
                <span>Company / issue</span>
                <span>Window</span>
                <span>Price band</span>
                <span>Issue size</span>
                <span>Status</span>
                <span />
              </div>
              {ipos.map((ipo, index) => (
                <Link className="market-row" to={`/market/${ipo._id}`} key={ipo._id}>
                  <div className="company-cell">
                    <span className={`company-logo logo-${index}`}>
                      {initials(ipo.company.name)}
                    </span>
                    <span>
                      <strong>{ipo.company.name}</strong>
                      <small>{ipo.issueType ?? 'Book Built'} issue</small>
                    </span>
                  </div>
                  <div>
                    <strong>{formatDate(ipo.openDate)}</strong>
                    <small>to {formatDate(ipo.closeDate)}</small>
                  </div>
                  <strong>{ipo.priceBand}</strong>
                  <strong>{ipo.issueSize}</strong>
                  <span className={`status-badge ${ipo.status}`}>
                    {ipo.status === 'ongoing' ? 'Open now' : ipo.status}
                  </span>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          )}
          {!loading && !error && ipos.length === 0 && (
            <div className="empty-state">No IPOs match this view.</div>
          )}
        </section>
        <section className="trust-band" id="how-it-works">
          <div className="trust-quote">
            “The clearest IPO view I have used. I know exactly what deserves my attention.”
            <span>— A modern investor's note</span>
          </div>
          <div className="trust-points">
            <div>
              <BarChart3 size={20} />
              <strong>Numbers, not noise</strong>
              <span>Every metric has a reason to be here.</span>
            </div>
            <div>
              <ShieldCheck size={20} />
              <strong>Built for clarity</strong>
              <span>From filing to first trade.</span>
            </div>
            <div>
              <Users size={20} />
              <strong>For every investor</strong>
              <span>Start informed. Stay ahead.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isRegister = mode === 'register'
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = await api<{ accessToken: string; user: User }>(`/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      })
      localStorage.setItem('bluestock_access_token', payload.data.accessToken)
      navigate(payload.data.user.role === 'admin' ? '/admin' : '/market')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to continue')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="auth-shell">
      <div className="auth-art">
        <Link className="wordmark wordmark-light" to="/">
          <span className="wordmark-box">B</span>
          <span>
            Bluestock<span className="wordmark-muted"> / IPO</span>
          </span>
        </Link>
        <div className="auth-art-copy">
          <p className="kicker">The modern IPO desk</p>
          <h1>
            Make your next
            <br />
            <em>move count.</em>
          </h1>
          <p>One calm, powerful place to read the market before it moves.</p>
        </div>
        <div className="auth-art-foot">
          <span>01</span>
          <span>01 / 03 — MARKET INTELLIGENCE</span>
        </div>
      </div>
      <div className="auth-form-side">
        <Link className="back-link" to="/">
          ← Back to market
        </Link>
        <div className="auth-form-card">
          <div className="auth-heading">
            <p className="kicker">{isRegister ? 'Create your desk' : 'Welcome back'}</p>
            <h2>{isRegister ? 'Start with clarity.' : 'Good to see you.'}</h2>
            <p>
              {isRegister
                ? 'Build a sharper view of every IPO that matters.'
                : 'Sign in to continue to your market workspace.'}
            </p>
          </div>
          <form onSubmit={submit}>
            {isRegister && (
              <label>
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
                minLength={isRegister ? 8 : undefined}
                required
              />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button className="button button-dark full-button" disabled={loading}>
              {loading ? 'Working...' : isRegister ? 'Create my account' : 'Sign in to desk'}{' '}
              <ArrowUpRight size={16} />
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function AdminGuard() {
  const currentToken = token()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(currentToken))
  useEffect(() => {
    if (!currentToken) return
    api<User>('/auth/me', { headers: { Authorization: `Bearer ${currentToken}` } })
      .then((payload) => setUser(payload.data))
      .catch(() => localStorage.removeItem('bluestock_access_token'))
      .finally(() => setLoading(false))
  }, [currentToken])
  if (loading) return <div className="admin-loading">Loading secure workspace...</div>
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />
  return <AdminApp user={user} />
}

function AdminApp({ user }: { user: User }) {
  const navigate = useNavigate()
  const location = useLocation()
  const section = location.pathname.split('/')[2] || 'dashboard'
  const [navOpen, setNavOpen] = useState(false)
  async function logout() {
    await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' })
    localStorage.removeItem('bluestock_access_token')
    navigate('/login')
  }
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${navOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <span className="wordmark-box">B</span>
          <strong>
            Bluestock<span> Admin</span>
          </strong>
          <button onClick={() => setNavOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="workspace-switch">
          <span>WORKSPACE</span>
          <strong>
            IPO Operations <ChevronDown size={14} />
          </strong>
        </div>
        <nav className="admin-nav">
          <span className="nav-label">Overview</span>
          <Link className={section === 'dashboard' ? 'active' : ''} to="/admin">
            <LayoutDashboard size={17} /> Dashboard
          </Link>
          <Link className={section === 'ipos' ? 'active' : ''} to="/admin/ipos">
            <BarChart3 size={17} /> IPO registry
          </Link>
          <Link className={section === 'users' ? 'active' : ''} to="/admin/users">
            <Users size={17} /> Team access
          </Link>
          <span className="nav-label">Tools</span>
          <Link className={section === 'uploads' ? 'active' : ''} to="/admin/uploads">
            <Upload size={17} /> Media library
          </Link>
          <Link className={section === 'reports' ? 'active' : ''} to="/admin/reports">
            <FileText size={17} /> Reports
          </Link>
        </nav>
        <button className="admin-logout" onClick={logout}>
          <LogOut size={17} /> Sign out
        </button>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="menu-button" onClick={() => setNavOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <span className="admin-breadcrumb">Operations / </span>
            {section[0].toUpperCase() + section.slice(1)}
          </div>
          <div className="admin-top-actions">
            <button>
              <Bell size={18} />
            </button>
            <div className="admin-avatar">{initials(user.name)}</div>
            <span>{user.name}</span>
          </div>
        </header>
        {section !== 'dashboard' && <AdminSectionPreview section={section} />}
        <main className={`admin-content ${section !== 'dashboard' ? 'dashboard-hidden' : ''}`}>
          <div className="admin-page-title">
            <div>
              <p className="kicker">Saturday, 19 September 2026</p>
              <h1>Good morning, {user.name.split(' ')[0]}.</h1>
              <p>Here is what is happening across your IPO desk today.</p>
            </div>
            <Link className="button button-orange" to="/admin/ipos">
              <span>+ Add new IPO</span> <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="admin-metrics">
            <Metric
              label="Total IPOs"
              value="3"
              detail="+1 this month"
              icon={<BarChart3 size={20} />}
            />
            <Metric
              label="Open now"
              value="1"
              detail="33.3% of registry"
              icon={<TrendingUp size={20} />}
              green
            />
            <Metric
              label="Upcoming"
              value="1"
              detail="Next: 05 Oct 2026"
              icon={<Bell size={20} />}
            />
            <Metric
              label="Avg. return"
              value="+22.78%"
              detail="Across listed issues"
              icon={<ArrowUpRight size={20} />}
              green
            />
          </div>
          <div className="admin-grid">
            <section className="admin-card large-card">
              <div className="card-heading">
                <div>
                  <p className="kicker">Live registry</p>
                  <h2>IPO pipeline</h2>
                </div>
                <Link to="/admin/ipos">
                  View all <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="mini-table">
                <div className="mini-head">
                  <span>Company</span>
                  <span>Status</span>
                  <span>Window</span>
                  <span>Return</span>
                </div>
                <AdminRow
                  name="Orbit Fintech"
                  initials="OF"
                  status="Listed"
                  window="12 Aug 2026"
                  returnValue="+22.78%"
                />
                <AdminRow
                  name="Aster Health Systems"
                  initials="AH"
                  status="Ongoing"
                  window="21–23 Sep 2026"
                  returnValue="—"
                  green
                />
                <AdminRow
                  name="Nova Mobility"
                  initials="NM"
                  status="Upcoming"
                  window="05–07 Oct 2026"
                  returnValue="—"
                />
              </div>
            </section>
            <section className="admin-card activity-card">
              <div className="card-heading">
                <div>
                  <p className="kicker">System activity</p>
                  <h2>Recent events</h2>
                </div>
                <button>
                  <span>•••</span>
                </button>
              </div>
              <Activity text="Orbit Fintech" detail="record updated" time="09:28" />
              <Activity text="Media library" detail="awaiting uploads" time="09:11" />
              <Activity
                text="Aster Health Systems"
                detail="status changed to ongoing"
                time="Yesterday"
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function AdminSectionPreview({ section }: { section: string }) {
  if (section === 'ipos')
    return (
      <section className="workspace-view">
        <div className="view-heading">
          <div>
            <p className="kicker">Operations / data room</p>
            <h1>IPO registry.</h1>
            <p>Manage your live pipeline with a single, searchable source of truth.</p>
          </div>
          <button className="button button-orange">
            + Add new IPO <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="preview-table admin-card">
          <div className="preview-table-head">
            <span>Company</span>
            <span>Opening window</span>
            <span>Price band</span>
            <span>Issue size</span>
            <span>Status</span>
          </div>
          <PreviewRow
            mark="OF"
            name="Orbit Fintech"
            window="12–14 Aug 2026"
            price="₹150 – ₹158"
            size="₹410 Cr"
            status="Listed"
          />
          <PreviewRow
            mark="AH"
            name="Aster Health Systems"
            window="21–23 Sep 2026"
            price="₹265 – ₹278"
            size="₹680 Cr"
            status="Ongoing"
            green
          />
          <PreviewRow
            mark="NM"
            name="Nova Mobility"
            window="05–07 Oct 2026"
            price="₹420 – ₹441"
            size="₹1,240 Cr"
            status="Upcoming"
          />
        </div>
      </section>
    )
  if (section === 'uploads')
    return (
      <section className="workspace-view">
        <div className="view-heading">
          <div>
            <p className="kicker">Tools / content control</p>
            <h1>Media library.</h1>
            <p>Offer documents and company identity assets, ready for the public desk.</p>
          </div>
          <button className="button button-orange">
            <Upload size={16} /> Upload asset
          </button>
        </div>
        <div className="asset-grid">
          <AssetPreview
            icon={<FileText size={30} />}
            type="RHP / PDF"
            title="Orbit Fintech prospectus"
            detail="Awaiting upload"
          />
          <AssetPreview
            icon={<FileText size={30} />}
            type="DRHP / PDF"
            title="Aster Health Systems draft"
            detail="Document slot ready"
            mint
          />
          <AssetPreview
            icon={<Upload size={30} />}
            type="Company logos"
            title="3 identity slots"
            detail="All records need a visual mark"
            peach
          />
        </div>
      </section>
    )
  if (section === 'reports')
    return (
      <section className="workspace-view">
        <div className="view-heading">
          <div>
            <p className="kicker">Intelligence / snapshots</p>
            <h1>Desk reports.</h1>
            <p>A quiet read on the performance of your IPO pipeline.</p>
          </div>
          <button className="button button-dark">
            <FileText size={16} /> Export snapshot
          </button>
        </div>
        <div className="report-preview-grid">
          <div className="report-preview">
            <span>LISTED PERFORMANCE</span>
            <strong>+22.78%</strong>
            <small>Orbit Fintech · current return</small>
            <div className="sparkline">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="report-preview">
            <span>PIPELINE MIX</span>
            <strong>1 / 1 / 1</strong>
            <small>Listed / open / upcoming</small>
            <div className="mix-bar">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="report-preview note-preview">
            <span>ANALYST NOTE</span>
            <strong>Attention is moving to mobility.</strong>
            <small>
              Nova Mobility opens 05 Oct 2026. Review offer documents before the window begins.
            </small>
          </div>
        </div>
      </section>
    )
  return (
    <section className="workspace-view">
      <div className="view-heading">
        <div>
          <p className="kicker">Workspace / people</p>
          <h1>Team access.</h1>
          <p>One admin today. Add trusted editors as the desk grows.</p>
        </div>
        <button className="button button-orange">
          <Users size={16} /> Invite member
        </button>
      </div>
      <div className="admin-card team-preview">
        <div className="admin-avatar">BA</div>
        <div>
          <strong>Bluestock Admin</strong>
          <span>admin@example.com · Administrator</span>
        </div>
        <b>Active</b>
      </div>
    </section>
  )
}

function PreviewRow({
  mark,
  name,
  window,
  price,
  size,
  status,
  green = false,
}: {
  mark: string
  name: string
  window: string
  price: string
  size: string
  status: string
  green?: boolean
}) {
  return (
    <div className="preview-row">
      <span className="preview-company">
        <i>{mark}</i>
        <strong>{name}</strong>
      </span>
      <span>{window}</span>
      <strong>{price}</strong>
      <span>{size}</span>
      <span className={`status-badge ${green ? 'ongoing' : status.toLowerCase()}`}>{status}</span>
    </div>
  )
}
function AssetPreview({
  icon,
  type,
  title,
  detail,
  mint = false,
  peach = false,
}: {
  icon: React.ReactNode
  type: string
  title: string
  detail: string
  mint?: boolean
  peach?: boolean
}) {
  return (
    <div
      className={`asset-preview admin-card ${mint ? 'mint-preview' : ''} ${peach ? 'peach-preview' : ''}`}
    >
      <div className="asset-art">{icon}</div>
      <span>{type}</span>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  )
}

function Metric({
  label,
  value,
  detail,
  icon,
  green = false,
}: {
  label: string
  value: string
  detail: string
  icon: React.ReactNode
  green?: boolean
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${green ? 'green' : ''}`}>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={green ? 'positive' : ''}>{detail}</small>
    </div>
  )
}
function AdminRow({
  name,
  initials: mark,
  status,
  window,
  returnValue,
  green = false,
}: {
  name: string
  initials: string
  status: string
  window: string
  returnValue: string
  green?: boolean
}) {
  return (
    <div className="mini-row">
      <span className="mini-company">
        <i>{mark}</i>
        {name}
      </span>
      <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
      <span>{window}</span>
      <strong className={green ? 'positive' : ''}>{returnValue}</strong>
    </div>
  )
}
function Activity({ text, detail, time }: { text: string; detail: string; time: string }) {
  return (
    <div className="activity-row">
      <span className="activity-dot" />
      <div>
        <strong>{text}</strong>
        <span>{detail}</span>
      </div>
      <time>{time}</time>
    </div>
  )
}

export default App
