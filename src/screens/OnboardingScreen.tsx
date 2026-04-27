import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTweaks } from '../context/TweaksContext'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

const HSK_LEVELS = [
  { level: 1, label: 'Beginner', words: '~150 words' },
  { level: 2, label: 'Elementary', words: '~300 words' },
  { level: 3, label: 'Intermediate', words: '~600 words' },
  { level: 4, label: 'Upper-Intermediate', words: '~1,200 words' },
  { level: 5, label: 'Advanced', words: '~2,500 words' },
  { level: 6, label: 'Mastery', words: '~5,000 words' },
]

const OnboardingScreen = () => {
  const { tweaks, toggleTheme } = useTweaks()
  const { user, updateHskLevel } = useAuth()
  const navigate = useNavigate()

  const [selected, setSelected] = useState(user?.hskLevel ?? 1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await updateHskLevel(selected)
      navigate('/')
    } catch {
      setError('Failed to save — please try again')
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
        <div className="auth-form onboarding-form">
          <div>
            <div className="sec-label" style={{ marginBottom: 6 }}>// step 1 of 1</div>
            <div style={{
              fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15,
            }}
            >
              What&apos;s your level?
            </div>
            <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 4 }}>
              We&apos;ll tailor your deck. You can change this anytime.
            </div>
          </div>

          <div className="hsk-grid">
            {HSK_LEVELS.map(({ level, label, words }) => {
              const isSelected = selected === level
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelected(level)}
                  className={`hsk-card${isSelected ? ' selected' : ''}`}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
                  }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: isSelected ? 'var(--accent)' : 'var(--fg-dim)',
                      }}
                    >
                      HSK
                      {' '}
                      {level}
                    </span>
                    {isSelected && <Icon name="check" size={10} />}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{label}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>{words}</div>
                </button>
              )
            })}
          </div>

          {error && (
            <div
              className="mono"
              style={{
                fontSize: 10.5, color: 'var(--bad)', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <span>→</span>
              {error}
            </div>
          )}

          <button
            type="button"
            className="btn primary"
            disabled={submitting}
            onClick={handleSubmit}
            style={{
              justifyContent: 'center',
              padding: '12px',
              opacity: submitting ? 0.45 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'saving…' : 'start learning →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingScreen
