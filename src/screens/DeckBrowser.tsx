import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type DeckInfo } from '../api/client'
import Icon from '../components/Icon'

interface DeckCardProps {
  deck: DeckInfo;
  index: number;
}

const DeckCard = ({ deck, index }: DeckCardProps) => {
  const navigate = useNavigate()
  const { wordCount, learnedCount } = deck
  const progress = wordCount > 0 ? learnedCount / wordCount : 0
  const done = progress === 1
  const learnedBg = done ? 'var(--ok)' : 'var(--fg)'
  return (
    <div className="card" role="button" tabIndex={0} onClick={() => navigate('/study/session', { state: { deck: deck.name } })} onKeyDown={(e) => e.key === 'Enter' && navigate('/study/session', { state: { deck: deck.name } })} style={{ position: 'relative', cursor: 'pointer', transition: 'border-color .12s' }}>
      <div className="card-header">
        <span>
          deck_
          {String(index).padStart(2, '0')}
        </span>
        <span style={{ display: 'flex', gap: 6 }}>
          {done && <span className="badge" style={{ color: 'var(--ok)' }}>✓ mastered</span>}
        </span>
      </div>
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{deck.name}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-dim)' }}>
          {learnedCount}
          {' '}
          /
          {wordCount}
          {' '}
          learned
        </div>
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: wordCount }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                background: i < learnedCount ? learnedBg : 'var(--bg-sub)',
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
          {Math.round(progress * 100)}
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

const DeckBrowser = () => {
  const [decks, setDecks] = useState<DeckInfo[]>([])

  useEffect(() => {
    api.decks().then((res) => setDecks(res.decks)).catch(() => undefined)
  }, [])

  const totalCards = decks.reduce((s, d) => s + d.wordCount, 0)
  const totalLearned = decks.reduce((s, d) => s + d.learnedCount, 0)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden',
    }}
    >
<div style={{
        padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 32, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', flexShrink: 0,
      }}
      >
        <span>
          <span style={{ color: 'var(--fg)' }}>{decks.length}</span>
          {' '}
          decks
        </span>
        <span>
          <span style={{ color: 'var(--fg)' }}>{totalCards}</span>
          {' '}
          cards total
        </span>
        <span>
          <span style={{ color: 'var(--fg)' }}>{totalLearned}</span>
          {' '}
          learned
        </span>
        <span style={{ marginLeft: 'auto' }}>HSK level 1</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {decks.map((d, i) => <DeckCard key={d.id} deck={d} index={i} />)}
        </div>
      </div>
    </div>
  )
}

export default DeckBrowser
