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
import { toAdminFormState, submitableIpoForm, type AdminIpoForm } from './lib/ipoForm'
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
        <div className="detail-branding">
          {ipo.company.logo?.url ? (
            <img
              className="detail-company-logo"
              src={ipo.company.logo.url}
              alt={`${ipo.company.name} logo`}
            />
          ) : (
            <span className="company-logo company-logo-large">{initials(ipo.company.name)}</span>
          )}
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
                    {ipo.company.logo?.url ? (
                      <img
                        className="company-logo-image logo-${index}"
                        src={ipo.company.logo.url}
                        alt={`${ipo.company.name} logo`}
                      />
                    ) : (
                      <span className={`company-logo logo-${index}`}>
                        {initials(ipo.company.name)}
                      </span>
                    )}
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

async function uploadAdminMedia(file: File, kind: 'logo' | 'document') {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${apiBaseUrl}/uploads/${kind}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token()}`,
    },
    body: formData,
  })

  const payload = (await response.json()) as ApiPayload<{
    url: string
    publicId: string
    resourceType?: string
  }>

  if (!response.ok) throw new Error(payload.message ?? 'Media upload failed.')
  return payload.data
}

function AdminApp({ user }: { user: User }) {
  const navigate = useNavigate()
  const location = useLocation()
  const section = location.pathname.split('/')[2] || 'dashboard'
  const [navOpen, setNavOpen] = useState(false)
  const [ipos, setIpos] = useState<Ipo[]>([])
  const [loadingIpos, setLoadingIpos] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AdminIpoForm>(toAdminFormState())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [rhpFile, setRhpFile] = useState<File | null>(null)
  const [drhpFile, setDrhpFile] = useState<File | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  async function loadIpos() {
    try {
      const payload = await api<Ipo[]>('/ipos?limit=50')
      setIpos(payload.data)
    } catch (error) {
      setIpos([])
      console.error(error)
    } finally {
      setLoadingIpos(false)
    }
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const payload = await api<Ipo[]>('/ipos?limit=50')
        if (!active) return
        setIpos(payload.data)
      } catch (error) {
        if (!active) return
        setIpos([])
        console.error(error)
      } finally {
        if (active) setLoadingIpos(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  async function logout() {
    await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' })
    localStorage.removeItem('bluestock_access_token')
    navigate('/login')
  }

  function resetMediaFiles() {
    setLogoFile(null)
    setRhpFile(null)
    setDrhpFile(null)
  }

  function openCreateForm() {
    setEditingId(null)
    setDraft(toAdminFormState())
    setFormError('')
    resetMediaFiles()
    setFormOpen(true)
  }

  function openEditForm(ipo: Ipo) {
    setEditingId(ipo._id)
    setDraft(toAdminFormState(ipo))
    setFormError('')
    resetMediaFiles()
    setFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      const mediaPayload: {
        logo?: { url: string; publicId: string }
        rhp?: { url: string; publicId: string }
        drhp?: { url: string; publicId: string }
      } = {}

      setUploadingMedia(true)
      if (logoFile) mediaPayload.logo = await uploadAdminMedia(logoFile, 'logo')
      if (rhpFile) mediaPayload.rhp = await uploadAdminMedia(rhpFile, 'document')
      if (drhpFile) mediaPayload.drhp = await uploadAdminMedia(drhpFile, 'document')

      const payload = submitableIpoForm(draft, mediaPayload)
      if (!payload.companyName || !payload.priceBand || !payload.issueSize || !payload.issueType) {
        throw new Error('Company, pricing, and issue details are required.')
      }

      const method = editingId ? 'PATCH' : 'POST'
      const endpoint = editingId ? `/ipos/${editingId}` : '/ipos'
      const authHeaders = { Authorization: `Bearer ${token()}` }
      await api<Ipo>(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      })
      setFormOpen(false)
      resetMediaFiles()
      await loadIpos()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save this IPO.')
    } finally {
      setSaving(false)
      setUploadingMedia(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this IPO from the registry?')) return

    try {
      await fetch(`${apiBaseUrl}/ipos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token()}` },
      })
      setIpos((current) => current.filter((ipo) => ipo._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  async function handleMediaUpload(ipoId: string, kind: 'logo' | 'rhp' | 'drhp', file: File) {
    const existingIpo = ipos.find((ipo) => ipo._id === ipoId)
    if (!existingIpo) throw new Error('IPO not found for this asset upload.')

    const uploaded = await uploadAdminMedia(file, kind === 'logo' ? 'logo' : 'document')
    const patchPayload = submitableIpoForm(toAdminFormState(existingIpo), {
      ...(kind === 'logo' ? { logo: uploaded } : {}),
      ...(kind === 'rhp' ? { rhp: uploaded } : {}),
      ...(kind === 'drhp' ? { drhp: uploaded } : {}),
    })

    await api<Ipo>(`/ipos/${ipoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(patchPayload),
    })

    await loadIpos()
  }

  const ongoingCount = ipos.filter((ipo) => ipo.status === 'ongoing').length
  const upcomingCount = ipos.filter((ipo) => ipo.status === 'upcoming').length
  const nextUpcoming = ipos
    .filter((ipo) => ipo.status === 'upcoming')
    .sort((a, b) => new Date(a.openDate).getTime() - new Date(b.openDate).getTime())[0]
  const returnAverage =
    ipos.filter((ipo) => typeof ipo.currentReturn === 'number').length === 0
      ? '—'
      : `${(
          ipos.reduce((sum, ipo) => sum + (ipo.currentReturn ?? 0), 0) /
          ipos.filter((ipo) => typeof ipo.currentReturn === 'number').length
        ).toFixed(2)}%`
  const nextUpcomingLabel = nextUpcoming
    ? new Date(nextUpcoming.openDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'No upcoming IPOs'
  const mediaEntries = ipos.flatMap((ipo) => {
    const entries: Array<{
      id: string
      ipoId: string
      kind: 'logo' | 'rhp' | 'drhp'
      type: string
      title: string
      detail: string
      url?: string
      accent?: 'mint' | 'peach'
    }> = []

    entries.push({
      id: `${ipo._id}-logo`,
      ipoId: ipo._id,
      kind: 'logo',
      type: 'Company logo',
      title: ipo.company.name,
      detail: ipo.company.logo?.url ? 'Identity asset ready' : 'Awaiting logo upload',
      url: ipo.company.logo?.url,
      accent: 'peach',
    })

    if (ipo.documents?.rhp?.url) {
      entries.push({
        id: `${ipo._id}-rhp`,
        ipoId: ipo._id,
        kind: 'rhp',
        type: 'RHP / PDF',
        title: `${ipo.company.name} prospectus`,
        detail: 'Public filing ready',
        url: ipo.documents.rhp.url,
        accent: 'mint',
      })
    } else {
      entries.push({
        id: `${ipo._id}-rhp-pending`,
        ipoId: ipo._id,
        kind: 'rhp',
        type: 'RHP / PDF',
        title: `${ipo.company.name} prospectus`,
        detail: 'Awaiting upload',
        accent: 'mint',
      })
    }

    if (ipo.documents?.drhp?.url) {
      entries.push({
        id: `${ipo._id}-drhp`,
        ipoId: ipo._id,
        kind: 'drhp',
        type: 'DRHP / PDF',
        title: `${ipo.company.name} draft filing`,
        detail: 'Draft document ready',
        url: ipo.documents.drhp.url,
      })
    } else {
      entries.push({
        id: `${ipo._id}-drhp-pending`,
        ipoId: ipo._id,
        kind: 'drhp',
        type: 'DRHP / PDF',
        title: `${ipo.company.name} draft filing`,
        detail: 'Awaiting upload',
      })
    }

    return entries
  })

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
        {section !== 'dashboard' && (
          <AdminSectionPreview
            section={section}
            items={ipos}
            mediaEntries={mediaEntries}
            loading={loadingIpos}
            onCreate={openCreateForm}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onUpload={handleMediaUpload}
          />
        )}
        <main className={`admin-content ${section !== 'dashboard' ? 'dashboard-hidden' : ''}`}>
          <div className="admin-page-title">
            <div>
              <p className="kicker">Saturday, 19 September 2026</p>
              <h1>Good morning, {user.name.split(' ')[0]}.</h1>
              <p>Here is what is happening across your IPO desk today.</p>
            </div>
            <button className="button button-orange" onClick={openCreateForm}>
              <span>+ Add new IPO</span> <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="admin-metrics">
            <Metric
              label="Total IPOs"
              value={String(ipos.length || 0)}
              detail="Live registry"
              icon={<BarChart3 size={20} />}
            />
            <Metric
              label="Open now"
              value={String(ongoingCount)}
              detail={`${ipos.length ? ((ongoingCount / ipos.length) * 100).toFixed(1) : '0.0'}% of registry`}
              icon={<TrendingUp size={20} />}
              green
            />
            <Metric
              label="Upcoming"
              value={String(upcomingCount)}
              detail={upcomingCount ? `Next: ${nextUpcomingLabel}` : 'No upcoming IPOs'}
              icon={<Bell size={20} />}
            />
            <Metric
              label="Avg. return"
              value={returnAverage === '—' ? '—' : `+${returnAverage}`}
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
                {ipos.slice(0, 3).map((ipo) => (
                  <AdminRow
                    key={ipo._id}
                    name={ipo.company.name}
                    initials={initials(ipo.company.name)}
                    logoUrl={ipo.company.logo?.url}
                    status={ipo.status}
                    window={`${formatDate(ipo.openDate)} – ${formatDate(ipo.closeDate)}`}
                    returnValue={
                      typeof ipo.currentReturn === 'number' ? `+${ipo.currentReturn}%` : '—'
                    }
                    green={ipo.status === 'ongoing'}
                  />
                ))}
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
              <Activity text="IPO registry" detail="synced with live backend" time="Now" />
              <Activity text="Media library" detail="awaiting uploads" time="09:11" />
              <Activity text="Desk operations" detail="status updates enabled" time="Today" />
            </section>
          </div>
        </main>
      </div>
      {formOpen && (
        <div className="admin-modal-backdrop" onClick={() => setFormOpen(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <p className="kicker">Operations / registry</p>
                <h2>{editingId ? 'Edit IPO' : 'Add IPO'}</h2>
              </div>
              <button onClick={() => setFormOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form className="ipo-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Company name
                  <input
                    value={draft.companyName}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, companyName: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Company slug
                  <input
                    value={draft.companySlug}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, companySlug: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Price band
                  <input
                    value={draft.priceBand}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, priceBand: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Issue type
                  <input
                    value={draft.issueType}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, issueType: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Open date
                  <input
                    type="date"
                    value={draft.openDate}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, openDate: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Close date
                  <input
                    type="date"
                    value={draft.closeDate}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, closeDate: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Issue size
                  <input
                    value={draft.issueSize}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, issueSize: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Status
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        status: event.target.value as AdminIpoForm['status'],
                      }))
                    }
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="closed">Closed</option>
                    <option value="listed">Listed</option>
                  </select>
                </label>
                <label>
                  Listing date
                  <input
                    type="date"
                    value={draft.listingDate}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, listingDate: event.target.value }))
                    }
                  />
                </label>
                <label>
                  IPO price
                  <input
                    type="number"
                    value={draft.ipoPrice}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        ipoPrice: event.target.value === '' ? '' : Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  Listing price
                  <input
                    type="number"
                    value={draft.listingPrice}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        listingPrice: event.target.value === '' ? '' : Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  Current market price
                  <input
                    type="number"
                    value={draft.currentMarketPrice}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        currentMarketPrice:
                          event.target.value === '' ? '' : Number(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>
              <div className="form-grid media-grid">
                <label>
                  Company logo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                  />
                  {logoFile && <small>{logoFile.name}</small>}
                </label>
                <label>
                  RHP PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => setRhpFile(event.target.files?.[0] ?? null)}
                  />
                  {rhpFile && <small>{rhpFile.name}</small>}
                </label>
                <label>
                  DRHP PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => setDrhpFile(event.target.files?.[0] ?? null)}
                  />
                  {drhpFile && <small>{drhpFile.name}</small>}
                </label>
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-orange"
                  disabled={saving || uploadingMedia}
                >
                  {saving || uploadingMedia
                    ? 'Saving media...'
                    : editingId
                      ? 'Update IPO'
                      : 'Create IPO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminSectionPreview({
  section,
  items,
  mediaEntries,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onUpload,
}: {
  section: string
  items: Ipo[]
  mediaEntries: Array<{
    id: string
    ipoId: string
    kind: 'logo' | 'rhp' | 'drhp'
    type: string
    title: string
    detail: string
    url?: string
    accent?: 'mint' | 'peach'
  }>
  loading: boolean
  onCreate: () => void
  onEdit: (ipo: Ipo) => void
  onDelete: (id: string) => void
  onUpload?: (ipoId: string, kind: 'logo' | 'rhp' | 'drhp', file: File) => Promise<void> | void
}) {
  if (section === 'ipos')
    return (
      <section className="workspace-view">
        <div className="view-heading">
          <div>
            <p className="kicker">Operations / data room</p>
            <h1>IPO registry.</h1>
            <p>Manage your live pipeline with a single, searchable source of truth.</p>
          </div>
          <button className="button button-orange" onClick={onCreate}>
            + Add new IPO <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="preview-table admin-card">
          <div className="preview-table-head registry-table-head">
            <span>Company</span>
            <span>Opening window</span>
            <span>Price band</span>
            <span>Issue size</span>
            <span>Status</span>
            <span aria-hidden="true" />
          </div>
          {loading && <div className="loading-state">Loading registry...</div>}
          {!loading && items.length === 0 && <div className="empty-state">No IPOs yet.</div>}
          {!loading &&
            items.map((ipo) => (
              <div className="preview-row registry-row" key={ipo._id}>
                <span className="preview-company">
                  {ipo.company.logo?.url ? (
                    <img
                      className="admin-company-logo"
                      src={ipo.company.logo.url}
                      alt={`${ipo.company.name} logo`}
                    />
                  ) : (
                    <i>{initials(ipo.company.name)}</i>
                  )}
                  <strong>{ipo.company.name}</strong>
                </span>
                <span>{`${formatDate(ipo.openDate)} – ${formatDate(ipo.closeDate)}`}</span>
                <strong>{ipo.priceBand}</strong>
                <span>{ipo.issueSize}</span>
                <span className={`status-badge ${ipo.status}`}>{ipo.status}</span>
                <span className="registry-actions">
                  <button onClick={() => onEdit(ipo)}>Edit</button>
                  <button className="delete-action" onClick={() => onDelete(ipo._id)}>
                    Delete
                  </button>
                </span>
              </div>
            ))}
        </div>
      </section>
    )
  if (section === 'uploads') {
    const quickUploadTarget = mediaEntries.find((entry) => !entry.url) ?? mediaEntries[0]

    return (
      <section className="workspace-view">
        <div className="view-heading">
          <div>
            <p className="kicker">Tools / content control</p>
            <h1>Media library.</h1>
            <p>Offer documents and company identity assets, ready for the public desk.</p>
          </div>
          {quickUploadTarget && onUpload ? (
            <label className="button button-orange" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> Upload asset
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                style={{ display: 'none' }}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    void onUpload(quickUploadTarget.ipoId, quickUploadTarget.kind, file)
                  }
                  event.target.value = ''
                }}
              />
            </label>
          ) : (
            <button className="button button-orange" type="button">
              <Upload size={16} /> Upload asset
            </button>
          )}
        </div>
        <div className="asset-grid">
          {mediaEntries.slice(0, 6).map((entry) => (
            <AssetPreview
              key={entry.id}
              icon={<FileText size={30} />}
              type={entry.type}
              title={entry.title}
              detail={entry.detail}
              mint={entry.accent === 'mint'}
              peach={entry.accent === 'peach'}
              href={entry.url}
              imageUrl={entry.kind === 'logo' ? entry.url : undefined}
              onUpload={
                onUpload
                  ? (event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void onUpload(entry.ipoId, entry.kind, file)
                      }
                      event.target.value = ''
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </section>
    )
  }
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

function AssetPreview({
  icon,
  type,
  title,
  detail,
  mint = false,
  peach = false,
  href,
  imageUrl,
  onUpload,
}: {
  icon: React.ReactNode
  type: string
  title: string
  detail: string
  mint?: boolean
  peach?: boolean
  href?: string
  imageUrl?: string
  onUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div
      className={`asset-preview admin-card ${mint ? 'mint-preview' : ''} ${peach ? 'peach-preview' : ''}`}
    >
      <div className="asset-art">
        {imageUrl ? <img className="asset-image" src={imageUrl} alt={title} /> : icon}
      </div>
      <span>{type}</span>
      <h3>{title}</h3>
      <p>{detail}</p>
      {href ? (
        <a className="asset-link" href={href} target="_blank" rel="noreferrer">
          Open asset
        </a>
      ) : (
        <span className="asset-placeholder">Awaiting upload</span>
      )}
      {onUpload && (
        <label className="upload-toggle">
          Upload file
          <input
            type="file"
            accept={type.includes('logo') ? 'image/jpeg,image/png,image/webp' : 'application/pdf'}
            onChange={onUpload}
          />
        </label>
      )}
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
  logoUrl,
  status,
  window,
  returnValue,
  green = false,
}: {
  name: string
  initials: string
  logoUrl?: string
  status: string
  window: string
  returnValue: string
  green?: boolean
}) {
  return (
    <div className="mini-row">
      <span className="mini-company">
        {logoUrl ? (
          <img className="admin-company-logo" src={logoUrl} alt={`${name} logo`} />
        ) : (
          <i>{mark}</i>
        )}
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
