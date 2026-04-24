import {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Icon from '../components/Icon'

const PRESETS = [10, 20, 50, 100]

const StudySetupScreen = () => {
  const navigate = useNavigate()

  const [totalWords, setTotalWords] = useState<number | null>(null)
  const [choice, setChoice] = useState<number | 'custom'>(20)
  const [custom, setCustom] = useState(35)

  const maxCards = totalWords ?? 500
  const active = choice === 'custom' ? custom : choice
  const valid = active >= 1 && active <= maxCards

  useEffect(() => {
    api.words({ limit: 1 }).then((res) => setTotalWords(res.total)).catch(() => undefined)
  }, [])

  const handleStart = useCallback(() => {
    if (!valid) return
    navigate('/study/session', { state: { count: active } })
  }, [valid, active, navigate])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT') return
      if (e.key === '1') setChoice(PRESETS[0])
      else if (e.key === '2') setChoice(PRESETS[1])
      else if (e.key === '3') setChoice(PRESETS[2])
      else if (e.key === '4') setChoice(PRESETS[3])
      else if (e.key === 'c') setChoice('custom')
      else if (e.key === 'Enter') handleStart()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [handleStart])

  const estMin = Math.max(1, Math.round(active * 0.3))

  const handleCustomChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChoice('custom')
    setCustom(Math.max(1, Math.min(maxCards, Number(e.target.value) || 1)))
  }

  const stepCustom = (delta: number) => {
    setChoice('custom')
    setCustom((n) => Math.max(1, Math.min(maxCards, n + delta)))
  }

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 18px',
    }}
    >
      <div style={{
        width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20,
      }}
      >

        {/* Header */}
        <div>
          <div className="sec-label" style={{ marginBottom: 6 }}>// new_session · config</div>
          <div style={{
            fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15,
          }}
          >
            How many cards?
          </div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 4 }}>
            Daily Mix · HSK 1 · mixed difficulty
          </div>
        </div>

        {/* Preset grid */}
        <div className="preset-grid">
          {PRESETS.map((n) => {
            const on = choice === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => setChoice(n)}
                style={{
                  padding: '22px 14px',
                  background: on ? 'var(--fg)' : 'var(--bg-elev)',
                  color: on ? 'var(--bg)' : 'var(--fg)',
                  border: `1px solid ${on ? 'var(--fg)' : 'var(--border-strong)'}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background .12s, color .12s, border-color .12s',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em',
                }}
                >
                  {n}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.65,
                  }}
                >
                  cards
                </span>
              </button>
            )
          })}
        </div>

        {/* Custom row */}
        <div style={{
          padding: 18,
          border: `1px solid ${choice === 'custom' ? 'var(--fg)' : 'var(--border)'}`,
          background: 'var(--bg-elev)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          transition: 'border-color .12s',
        }}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => setChoice('custom')}
            onKeyDown={(e) => e.key === 'Enter' && setChoice('custom')}
            style={{
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flex: 1,
            }}
          >
            <span style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: `1.5px solid ${choice === 'custom' ? 'var(--fg)' : 'var(--border-strong)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            >
              {choice === 'custom' && (
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: 'var(--fg)',
              }}
              />
              )}
            </span>
            <div>
              <div
                className="mono"
                style={{
                  fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2,
                }}
              >
                custom
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
                any number from 1 to
                {' '}
                {maxCards}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border-strong)',
            borderRadius: 2,
            background: 'var(--bg)',
            overflow: 'hidden',
          }}
          >
            <button
              type="button"
              onClick={() => stepCustom(-5)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--fg-muted)',
                padding: '8px 10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
              }}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={maxCards}
              value={custom}
              onChange={handleCustomChange}
              onFocus={() => setChoice('custom')}
              style={{
                width: 56,
                border: 'none',
                background: 'transparent',
                textAlign: 'center',
                color: 'var(--fg)',
                fontFamily: 'var(--font-mono)',
                fontSize: 16,
                fontWeight: 500,
                outline: 'none',
                borderLeft: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                padding: '8px 0',
                fontVariantNumeric: 'tabular-nums',
              }}
            />
            <button
              type="button"
              onClick={() => stepCustom(5)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--fg-muted)',
                padding: '8px 10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div
          className="card"
          style={{
            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            // estimated_time
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)',
          }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="clock" size={10} />
              {' '}
              ~
              {estMin}
              {' '}
              min
            </span>
            <span>
              <span style={{ color: 'var(--fg)' }}>{active}</span>
              {' '}
              cards
            </span>
          </div>
        </div>

        {/* Start button */}
        <button
          type="button"
          className="btn primary"
          disabled={!valid}
          onClick={handleStart}
          style={{
            justifyContent: 'center',
            padding: 16,
            opacity: valid ? 1 : 0.45,
            cursor: valid ? 'pointer' : 'not-allowed',
            gap: 8,
            fontSize: 12,
          }}
        >
          <Icon name="play" size={11} />
          {' '}
          start session ·
          {' '}
          {active}
          {' '}
          cards
          {' '}
          <span className="kbd">⏎</span>
        </button>

        {/* Keyboard shortcuts hint */}
        <div
          className="mono setup-shortcuts"
          style={{
            fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.05em', textAlign: 'center',
          }}
        >
          shortcuts ·
          {' '}
          <span style={{ color: 'var(--fg-muted)' }}>1–4</span>
          {' '}
          preset ·
          {' '}
          <span style={{ color: 'var(--fg-muted)' }}>c</span>
          {' '}
          custom ·
          {' '}
          <span style={{ color: 'var(--fg-muted)' }}>⏎</span>
          {' '}
          start
        </div>

      </div>
    </div>
  )
}

export default StudySetupScreen
