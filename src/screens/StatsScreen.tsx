import { useState, useEffect, useRef } from 'react'
import { useTweaks } from '../context/TweaksContext'
import Pinyin from '../components/Pinyin'
import { api } from '../api/client'

interface KPIProps {
  label: string;
  value: string;
}

const KPI = ({ label, value }: KPIProps) => (
  <div className="stat">
    <div className="label">{label}</div>
    <div className="value">{value}</div>
  </div>
)

const LPAD = 30; const RPAD = 10; const TPAD = 8; const BPAD = 20

const AccuracyChart = ({ points }: { points: number[] }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 560, h: 160 })

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      setSize({ w: Math.round(el.clientWidth), h: Math.round(el.clientHeight) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { w, h } = size
  const chartW = w - LPAD - RPAD
  const chartH = h - TPAD - BPAD
  const n = points.length
  const TOTAL = 30

  const xOf = (i: number) => LPAD + 4 + (i / (TOTAL - 1)) * (chartW - 8)
  const yOf = (v: number) => TPAD + (1 - v / 100) * chartH

  const pathD = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(v)}`).join(' ')
  const areaD = n > 0
    ? `${pathD} L ${xOf(n - 1)} ${TPAD + chartH} L ${xOf(0)} ${TPAD + chartH} Z`
    : ''

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {[0, 20, 40, 60, 80, 100].map((y) => {
        const yy = yOf(y)
        return (
          <g key={y}>
            <text x={LPAD - 5} y={yy + 3} fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)" textAnchor="end">{y}</text>
            <line x1={LPAD} x2={w - RPAD} y1={yy} y2={yy} stroke="var(--border)" strokeDasharray="2 3" />
          </g>
        )
      })}
      {n === 0 && (
        <text x={w / 2} y={h / 2 + 3} fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)" textAnchor="middle">no data yet</text>
      )}
      {n > 0 && <path d={areaD} fill="var(--fg)" opacity="0.08" />}
      {n > 0 && <path d={pathD} stroke="var(--fg)" strokeWidth="1.5" fill="none" />}
      {points.map((v, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(v)} r={3} fill={i === n - 1 ? 'var(--accent)' : 'var(--fg-dim)'} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <text key={i} x={xOf(i)} y={h - 4} fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)" textAnchor="middle">{i + 1}</text>
      ))}
    </svg>
  )
}

interface ToneRowProps { tone: number; label: string; acc: number | null; }
const ToneRow = ({ tone, label, acc }: ToneRowProps) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span
      className={`t${tone}`}
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, width: 26,
      }}
    >
      ·
      {tone}
    </span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginBottom: 4 }}>{label}</div>
      <div className="progress" style={{ height: 6 }}>
        <div className="fill" style={{ width: acc !== null ? `${acc}%` : '0%', background: `var(--tone${tone})` }} />
      </div>
    </div>
    <span
      className="mono"
      style={{
        fontSize: 11.5, fontVariantNumeric: 'tabular-nums', color: acc !== null ? 'var(--fg)' : 'var(--fg-dim)', width: 34, textAlign: 'right',
      }}
    >
      {acc !== null ? `${acc}%` : '—'}
    </span>
  </div>
)


function fmtMinutes(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return '< 1 min'
  if (s === 0) return `${m} min`
  return `${m}:${String(s).padStart(2, '0')}`
}

const StatsScreen = () => {
  const { tweaks } = useTweaks()
  type Struggle = { simplified: string; traditional: string; pinyin: string; tones: number[]; meaning: string; deck: string; lapseRate: number }

  const [reviews, setReviews] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [wordsLearned, setWordsLearned] = useState<number | null>(null)
  const [avgSessionSeconds, setAvgSessionSeconds] = useState<number | null>(null)
  const [trendPoints, setTrendPoints] = useState<number[]>([])
  const [struggles, setStruggles] = useState<Struggle[]>([])
  const [toneAcc, setToneAcc] = useState<Record<number, number>>({})

  useEffect(() => {
    api.stats30().then(({
      reviews: r, accuracy: a, wordsLearned: w, avgSessionSeconds: s,
    }) => {
      setReviews(r)
      setAccuracy(a)
      setWordsLearned(w)
      setAvgSessionSeconds(s)
    }).catch(() => undefined)

    api.accuracyTrend().then(({ points }) => setTrendPoints(points)).catch(() => undefined)
    api.topStruggles().then(({ struggles: s }) => setStruggles(s)).catch(() => undefined)
    api.toneAccuracy().then(({ byTone }) => setToneAcc(byTone)).catch(() => undefined)
  }, [])

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20,
    }}
    >
      <div>
        <div className="sec-label" style={{ marginBottom: 6 }}>// progress_report.md</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>Your progress · 30 days</div>
      </div>

      <div className="kpi-grid">
        <KPI label="reviews" value={reviews !== null ? String(reviews) : '—'} />
        <KPI label="avg accuracy" value={accuracy !== null ? `${accuracy}%` : '—'} />
        <KPI label="words learned" value={wordsLearned !== null ? String(wordsLearned) : '—'} />
        <KPI label="avg session" value={avgSessionSeconds !== null ? fmtMinutes(avgSessionSeconds) : '—'} />
      </div>

      <div className="stats-charts-grid">
        <div className="card stats-line-chart">
          <div className="card-header">
            <span>accuracy trend</span>
          </div>
          <div style={{ padding: 18, height: 200 }}>
            <AccuracyChart points={trendPoints.length > 0 ? trendPoints : (accuracy !== null ? [accuracy] : [])} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span>accuracy by tone</span>
          </div>
          <div style={{
            padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
          }}
          >
            <ToneRow tone={1} label="1st · high flat" acc={toneAcc[1] ?? null} />
            <ToneRow tone={2} label="2nd · rising" acc={toneAcc[2] ?? null} />
            <ToneRow tone={3} label="3rd · dipping" acc={toneAcc[3] ?? null} />
            <ToneRow tone={4} label="4th · falling" acc={toneAcc[4] ?? null} />
            <ToneRow tone={5} label="neutral" acc={toneAcc[5] ?? null} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span>top struggles</span>
          <span className="mono" style={{ fontSize: 10 }}>
            {struggles.length}
            {' '}
            {struggles.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        {struggles.length === 0
          ? <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)', padding: '14px 16px' }}>no struggle data yet</div>
          : struggles.map((r, i) => (
            <div className="row" key={`${r.simplified}-${r.deck}`}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-dim)', width: 24 }}>{String(i + 1).padStart(2, '0')}</span>
              <div className="han" style={{ fontSize: 24, minWidth: 52 }}>{tweaks.script === 'traditional' ? r.traditional : r.simplified}</div>
              <div style={{ flex: 1 }}>
                {tweaks.toneColor
                  ? <Pinyin pinyin={r.pinyin} tones={r.tones} size={13} />
                  : <span style={{ fontSize: 13 }}>{r.pinyin}</span>}
                <span style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginLeft: 10 }}>{r.meaning}</span>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-dim)', width: 70 }}>{r.deck}</span>
              <div style={{ width: 100 }}>
                <div className="progress"><div className="fill" style={{ width: `${r.lapseRate * 100}%`, background: 'var(--bad)' }} /></div>
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 11, color: 'var(--bad)', width: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round(r.lapseRate * 100)}
                %
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default StatsScreen
