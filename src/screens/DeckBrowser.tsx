import type { DeckSummary } from '../types'
import { DECKS } from '../data'
import Icon from '../components/Icon'

interface DeckCardProps {
  deck: DeckSummary;
  index: number;
}

const DeckCard = ({ deck, index }: DeckCardProps) => {
  const done = deck.progress === 1
  const learnedBg = done ? 'var(--ok)' : 'var(--fg)'
  return (
    <div className="card" style={{ position: 'relative', cursor: 'pointer', transition: 'border-color .12s' }}>
      <div className="card-header">
        <span>
          deck_
          {String(index).padStart(2, '0')}
        </span>
        <span style={{ display: 'flex', gap: 6 }}>
          {deck.due > 0 && (
          <span className="badge" style={{ color: 'var(--accent)' }}>
            {deck.due}
            {' '}
            due
          </span>
          )}
          {done && <span className="badge" style={{ color: 'var(--ok)' }}>✓ mastered</span>}
        </span>
      </div>
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{deck.name}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-dim)' }}>
          {deck.learned}
          {' '}
          /
          {deck.total}
          {' '}
          learned
        </div>
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: deck.total }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                background: i < deck.learned ? learnedBg : 'var(--bg-sub)',
                border: '1px solid var(--border)',
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{
        borderTop: '1px solid var(--border)', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)',
      }}
      >
        <span>
          {Math.round(deck.progress * 100)}
          %
        </span>
        <span style={{
          display: 'flex', gap: 4, alignItems: 'center', color: 'var(--fg-muted)',
        }}
        >
          study
          {' '}
          <Icon name="arrow" size={10} />
        </span>
      </div>
    </div>
  )
}

const DeckBrowser = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden',
  }}
  >
    <div style={{
      padding: '14px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-strong)', padding: '6px 10px', borderRadius: 2, flex: 1, maxWidth: 360, background: 'var(--bg-elev)',
      }}
      >
        <Icon name="search" size={12} />
        <input
          placeholder="search decks · vocab · pinyin…"
          style={{
            border: 'none', background: 'transparent', outline: 'none', color: 'var(--fg)', fontFamily: 'var(--font-mono)', fontSize: 11.5, flex: 1,
          }}
          defaultValue=""
        />
        <span className="mono" style={{ fontSize: 9, color: 'var(--fg-dim)' }}>⌘K</span>
      </div>
      <button type="button" className="btn ghost">
        <Icon name="shuffle" size={11} />
        {' '}
        sort · due
      </button>
      <button type="button" className="btn ghost">
        <Icon name="grid" size={11} />
        {' '}
        grid
      </button>
      <button type="button" className="btn primary">
        <Icon name="plus" size={11} />
        {' '}
        new deck
      </button>
    </div>

    <div style={{
      padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 32, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', flexShrink: 0,
    }}
    >
      <span>
        <span style={{ color: 'var(--fg)' }}>10</span>
        {' '}
        decks
      </span>
      <span>
        <span style={{ color: 'var(--fg)' }}>138</span>
        {' '}
        cards total
      </span>
      <span>
        <span style={{ color: 'var(--fg)' }}>64</span>
        {' '}
        learned
      </span>
      <span>
        <span style={{ color: 'var(--accent)' }}>23</span>
        {' '}
        due
      </span>
      <span style={{ marginLeft: 'auto' }}>HSK level 1</span>
    </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {DECKS.map((d, i) => <DeckCard key={d.name} deck={d} index={i} />)}
        <div
          className="ph-stripes"
          style={{
            minHeight: 176, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', borderRadius: 2,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Icon name="plus" size={16} />
            <div style={{ marginTop: 6 }}>new deck</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default DeckBrowser
