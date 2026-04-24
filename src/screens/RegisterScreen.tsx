import { useState, type FormEvent } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useTweaks } from '../context/TweaksContext'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

const TAKEN_PREVIEW = ['admin', 'hanzi', 'dev', 'test']

function pwStrength(password: string): number {
  let s = 0
  if (password.length >= 8) s++
  if (password.length >= 12) s++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++
  if (/\d/.test(password)) s++
  if (/[^A-Za-z0-9]/.test(password)) s++
  return Math.min(s, 4)
}

function Field({
  label, value, onChange, onBlur, error, ok, type = 'text', placeholder, autoFocus, children,
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
  children?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const borderColor = error ? 'var(--bad)' : focused ? 'var(--fg)' : 'var(--border-strong)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <label className="sec-label" style={{ fontSize: 10 }}>{label}</label>
        {ok && (
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--ok)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon name="check" size={9} /> ok
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
      }}>
        <input
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
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--bad)', marginTop: 5, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>→</span>{error}
        </div>
      )}
      {children}
    </div>
  )
}

export default function RegisterScreen() {
  const { tweaks, toggleTheme } = useTweaks()
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) return <Navigate to="/" replace />

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ username: false, password: false })
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const userError = (() => {
    if (!touched.username) return null
    if (!username) return 'username is required'
    if (username.length < 3) return 'must be at least 3 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'letters, numbers, underscore only'
    if (TAKEN_PREVIEW.includes(username.toLowerCase())) return `"${username}" is already taken`
    return null
  })()

  const pwError = (() => {
    if (!touched.password) return null
    if (!password) return 'password is required'
    if (password.length < 8) return `too short · ${password.length}/8 min`
    return null
  })()

  const strength = pwStrength(password)
  const strengthLabel = ['weak', 'weak', 'fair', 'good', 'strong'][strength]
  const strengthColor = strength <= 1 ? 'var(--bad)' : strength <= 2 ? 'var(--warn)' : 'var(--ok)'

  const canSubmit = username.length >= 3 && password.length >= 8 && !userError && !pwError

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ username: true, password: true })
    if (!canSubmit) return
    setSubmitting(true)
    setApiError(null)
    try {
      await register(username, password)
      navigate('/')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`app ${tweaks.theme === 'light' ? 'theme-light' : 'theme-dark'} ${tweaks.gridBg ? 'grid-bg-dots' : ''}`} style={{ overflow: 'auto' }}>
      <div className="auth-topbar">
        <span className="han" style={{ fontSize: 14, color: 'var(--fg)' }}>汉</span>
        <span style={{ color: 'var(--fg)', fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', fontSize: 13 }}>hanzi.repeat</span>
        <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 11 }}>· v0.1.0</span>
        <div style={{ flex: 1 }} />
        <button onClick={toggleTheme} className="auth-theme-btn">
          <Icon name={tweaks.theme === 'dark' ? 'sun' : 'moon'} size={12} />
          <span>{tweaks.theme === 'dark' ? 'light' : 'dark'}</span>
        </button>
      </div>

      <div className="auth-center">
        <div className="auth-form">
          <div style={{ marginBottom: 4 }}>
            <div className="sec-label" style={{ marginBottom: 6 }}>// POST /api/auth/register</div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Create account.</div>
            <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 4 }}>
              Pick a username. Nothing else required.
            </div>
          </div>

          <form className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSubmit}>
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
              ok={touched.password && !pwError && password.length >= 8}
              placeholder="min 8 characters"
            >
              {password.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} style={{
                        flex: 1,
                        height: 3,
                        background: i < strength ? strengthColor : 'var(--bg-sub)',
                        border: '1px solid var(--border)',
                        borderRadius: 1,
                      }} />
                    ))}
                  </div>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--fg-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 44, textAlign: 'right' }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </Field>

            {apiError && (
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--bad)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>→</span>{apiError}
              </div>
            )}

            <button
              type="submit"
              className="btn primary"
              disabled={!canSubmit || submitting}
              style={{ justifyContent: 'center', padding: '12px', opacity: canSubmit && !submitting ? 1 : 0.45, cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed' }}
            >
              {submitting ? 'creating account…' : <>create account <span className="kbd">⏎</span></>}
            </button>
          </form>

          <div className="auth-footer">
            <span>already have an account?</span>
            <Link to="/login" className="link" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
