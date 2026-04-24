import { useState, type FormEvent } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useTweaks } from '../context/TweaksContext'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

const Field = ({
  label,
  value,
  onChange,
  onBlur = undefined,
  error,
  ok,
  type = 'text',
  placeholder = undefined,
  autoFocus = undefined,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  error: string | null
  ok: boolean
  type?: string
  placeholder?: string
  autoFocus?: boolean
}) => {
  const [focused, setFocused] = useState(false)
  let borderColor = 'var(--border-strong)'
  if (error) borderColor = 'var(--bad)'
  else if (focused) borderColor = 'var(--fg)'

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6,
      }}
      >
        <label
          htmlFor={label}
          className="sec-label"
          style={{ fontSize: 10 }}
        >
          {label}
        </label>
        {ok && (
          <span
            className="mono"
            style={{
              fontSize: 9.5, color: 'var(--ok)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 3,
            }}
          >
            <Icon name="check" size={9} />
            {' '}
            ok
          </span>
        )}
      </div>
      <div style={{
        border: `1px solid ${borderColor}`,
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        borderRadius: 2,
        transition: 'border-color .12s',
      }}
      >
        <input
          id={label}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.() }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--fg)',
            fontFamily: type === 'password' ? 'var(--font-mono)' : 'var(--font-sans)',
            fontSize: 14,
            letterSpacing: type === 'password' ? '0.15em' : 0,
          }}
        />
        {error && <Icon name="x" size={13} />}
      </div>
      {error && (
        <div
          className="mono"
          style={{
            fontSize: 10.5, color: 'var(--bad)', marginTop: 5, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <span>→</span>
          {error}
        </div>
      )}
    </div>
  )
}

const LoginScreen = () => {
  const { tweaks, toggleTheme } = useTweaks()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ username: false, password: false })
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const userError = (() => {
    if (!touched.username) return null
    if (!username) return 'username is required'
    return null
  })()

  const pwError = (() => {
    if (!touched.password) return null
    if (!password) return 'password is required'
    return null
  })()

  const canSubmit = username && password && !userError && !pwError

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ username: true, password: true })
    if (!canSubmit) return
    setSubmitting(true)
    setApiError(null)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={`app ${tweaks.theme === 'light' ? 'theme-light' : 'theme-dark'} ${tweaks.gridBg ? 'grid-bg-dots' : ''}`}
      style={{ overflow: 'auto' }}
    >
      <div className="auth-topbar">
        <span className="han" style={{ fontSize: 14, color: 'var(--fg)' }}>汉</span>
        <span style={{
          color: 'var(--fg)', fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', fontSize: 13,
        }}
        >
          hanzi.repeat
        </span>
        <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 11 }}>· v0.1.0</span>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={toggleTheme} className="auth-theme-btn">
          <Icon name={tweaks.theme === 'dark' ? 'sun' : 'moon'} size={12} />
          <span>{tweaks.theme === 'dark' ? 'light' : 'dark'}</span>
        </button>
      </div>

      <div className="auth-center">
        <div className="auth-form">
          <div style={{ marginBottom: 4 }}>
            <div className="sec-label" style={{ marginBottom: 6 }}>// POST /api/auth/login</div>
            <div style={{
              fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15,
            }}
            >
              Welcome back.
            </div>
            <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 4 }}>
              Sign in to continue.
            </div>
          </div>

          <form
            className="card"
            style={{
              padding: 22, display: 'flex', flexDirection: 'column', gap: 16,
            }}
            onSubmit={handleSubmit}
          >
            <Field
              label="username"
              value={username}
              onChange={(v) => { setUsername(v); setApiError(null) }}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              error={userError}
              ok={touched.username && !userError && username.length >= 3}
              placeholder="your_username"
              autoFocus
            />
            <Field
              label="password"
              type="password"
              value={password}
              onChange={(v) => { setPassword(v); setApiError(null) }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={pwError}
              ok={touched.password && !pwError && password.length > 0}
              placeholder="••••••••"
            />

            {apiError && (
              <div
                className="mono"
                style={{
                  fontSize: 10.5, color: 'var(--bad)', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span>→</span>
                {apiError}
              </div>
            )}

            <button
              type="submit"
              className="btn primary"
              disabled={!canSubmit || submitting}
              style={{
                justifyContent: 'center',
                padding: '12px',
                opacity: canSubmit && !submitting ? 1 : 0.45,
                cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
              }}
            >
              {submitting ? 'signing in…' : (
                <>
                  sign in
                  <span className="kbd">⏎</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>new here?</span>
            <Link to="/register" className="link" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              create account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
