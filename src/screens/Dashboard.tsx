import { useState, useEffect } from 'react'
import { useTweaks } from '../context/TweaksContext'
import type { FlashCard } from '../types'
import { HSK1 } from '../data'
import { api } from '../api/client'
import Icon from '../components/Icon'
import Heatmap from '../components/Heatmap'
import ProgressBar from '../components/ProgressBar'
import Pinyin from '../components/Pinyin'

const WEEKS = 53

function activityToHeatmapData(activity: Record<string, number>): number[] {
  const totalDays = WEEKS * 7
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - (totalDays - 1))

  const data = new Array<number>(totalDays).fill(0)
  for (const [dateStr, reviewCount] of Object.entries(activity)) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    const offset = Math.round((d.getTime() - startDate.getTime()) / 86400000)
    if (offset >= 0 && offset < totalDays) data[offset] = reviewCount
  }
  return data
}

interface StatCellProps {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  icon?: string;
  sub?: string;
}

const StatCell = ({
  label, value, unit = '', accent = false, icon = '', sub = '',
}: StatCellProps) => (
  <div style={{ padding: '20px 22px', borderRight: '1px solid var(--border)' }}>
    <div
      className="sec-label"
      style={{
        marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      {icon && <Icon name={icon} size={10} />}
      {label}
    </div>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', color: accent ? 'var(--accent)' : 'var(--fg)', fontVariantNumeric: 'tabular-nums',
    }}
    >
      {value}
      <span style={{
        fontSize: 14, color: 'var(--fg-dim)', fontWeight: 400, marginLeft: 6,
      }}
      >
        {unit}
      </span>
    </div>
    {sub && <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 6 }}>{sub}</div>}
  </div>
)

interface DueItemProps {
  deck: string;
  count: number;
  when: string;
  tone?: 'bad';
}

const DueItem = ({
  deck, count, when, tone = undefined,
}: DueItemProps) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--bg-elev)', borderRadius: 2, cursor: 'pointer',
  }}
  >
    <div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{deck}</div>
      <div className="mono" style={{ fontSize: 10, color: tone === 'bad' ? 'var(--bad)' : 'var(--fg-dim)', marginTop: 2 }}>{when}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="mono" style={{ fontSize: 16, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      <Icon name="arrow" size={12} />
    </div>
  </div>
)

interface GoalRowProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
}

const GoalRow = ({
  label, value, max, unit = '',
}: GoalRowProps) => {
  const pct = Math.min(1, value / max)
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4,
      }}
      >
        <span>{label}</span>
        <span className="mono" style={{ color: 'var(--fg-muted)', fontSize: 11 }}>
          {value}
          {unit ? ` ${unit}` : ''}
          {' '}
          /
          {' '}
          {max}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <ProgressBar value={pct} />
    </div>
  )
}

interface RecentRowProps {
  card: FlashCard;
  status: 'right' | 'wrong';
}

const RecentRow = ({ card, status }: RecentRowProps) => {
  const { tweaks } = useTweaks()
  return (
    <div className="row">
      <div className="han" style={{ fontSize: 22, color: 'var(--fg)', minWidth: 44 }}>{card[tweaks.script]}</div>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 2,
      }}
      >
        {tweaks.toneColor
          ? <Pinyin pinyin={card.pinyin} tones={card.tones} size={13} />
          : <span style={{ fontSize: 13 }}>{card.pinyin}</span>}
        <span style={{ fontSize: 11.5, color: 'var(--fg-muted)' }}>{card.meaning}</span>
      </div>
      <span className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>{card.deck}</span>
      <span className="badge" style={{ color: status === 'right' ? 'var(--ok)' : 'var(--bad)' }}>
        {status === 'right' ? '✓' : '✕'}
      </span>
    </div>
  )
}

const Dashboard = () => {
  const [heatmapData, setHeatmapData] = useState<number[]>(new Array(WEEKS * 7).fill(0))
  const [totalReviews, setTotalReviews] = useState(0)
  const [activeDays, setActiveDays] = useState(0)

  useEffect(() => {
    api.activity().then(({ activity }) => {
      setHeatmapData(activityToHeatmapData(activity))
      setTotalReviews(Object.values(activity).reduce((s, n) => s + n, 0))
      setActiveDays(Object.keys(activity).length)
    }).catch(() => undefined)
  }, [])

  return (
  <div style={{ flex: 1, overflowY: 'auto' }}>
    <div style={{
      padding: '28px 28px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-end', gap: 24,
    }}
    >
      <div style={{ flex: 1 }}>
        <div className="sec-label" style={{ marginBottom: 8 }}>// Tuesday, Apr 23 · 晚上好</div>
        <div style={{
          fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4,
        }}
        >
          You have
          {' '}
          <span style={{ color: 'var(--accent)' }}>23</span>
          {' '}
          cards due.
        </div>
        <div style={{ color: 'var(--fg-muted)', fontSize: 14 }}>
          ~6 min session · 3 decks · last review 14 hours ago
        </div>
      </div>
      <button type="button" className="btn primary" style={{ padding: '14px 20px' }}>
        <Icon name="play" size={12} />
        {' '}
        start session
        <span className="kbd">⏎</span>
      </button>
    </div>

    <div className="dash-stats-grid">
      <StatCell label="current streak" value="12" unit="days" accent icon="flame" sub="personal best: 18" />
      <StatCell label="words learned" value="87" unit="/ 150" sub="+6 this week" />
      <StatCell label="accuracy" value="84" unit="%" sub="↑ 2.1 pts" />
      <StatCell label="time today" value="0" unit="min" sub="goal · 10 min" />
    </div>

    <div className="dash-main-grid">
      <div style={{ padding: '20px 28px', borderRight: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
        }}
        >
          <div className="sec-label">// activity · last 12 months</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-muted)' }}>
            <span style={{ color: 'var(--fg)' }}>{totalReviews}</span>
            {' '}
            reviews ·
            <span style={{ color: 'var(--fg)' }}>{activeDays}</span>
            {' '}
            days
          </div>
        </div>
        <div className="heatmap-scroll"><Heatmap data={heatmapData} /></div>
      </div>

      <div style={{ padding: '20px 28px' }}>
        <div className="sec-label" style={{ marginBottom: 14 }}>// due_today.queue</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DueItem deck="Verbs" count={8} when="overdue · 2d" tone="bad" />
          <DueItem deck="Pronouns" count={6} when="due today" />
          <DueItem deck="Nouns · Food" count={5} when="due today" />
          <DueItem deck="Time & Dates" count={4} when="due today" />
        </div>
      </div>
    </div>

    <div className="dash-lower-grid">
      <div style={{ padding: '20px 28px', borderRight: '1px solid var(--border)' }}>
        <div className="sec-label" style={{ marginBottom: 14 }}>// pinned · daily mix</div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14,
          }}
          >
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>Daily Mix</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>auto · 20 cards · mixed difficulty</div>
            </div>
            <span className="badge" style={{ color: 'var(--accent)' }}>recommended</span>
          </div>
          <ProgressBar value={0.42} />
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-dim)',
          }}
          >
            <span>42% complete</span>
            <span>12 / 20 due</span>
          </div>
        </div>

        <div className="sec-label" style={{ margin: '20px 0 10px' }}>// goals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <GoalRow label="10 min / day" value={0} max={10} unit="min" />
          <GoalRow label="150 words by Jun 1" value={87} max={150} />
        </div>
      </div>

      <div style={{ padding: '20px 28px' }}>
        <div className="sec-label" style={{ marginBottom: 14 }}>// last_reviewed</div>
        <div className="card">
          {HSK1.slice(0, 5).map((c, i) => (
            <RecentRow key={c.simplified} card={c} status={i % 3 === 1 ? 'wrong' : 'right'} />
          ))}
        </div>
      </div>
    </div>
  </div>
  )
}

export default Dashboard
