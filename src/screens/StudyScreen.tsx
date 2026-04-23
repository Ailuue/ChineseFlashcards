import { useState, useEffect, useCallback } from 'react';
import { useTweaks } from '../context/TweaksContext';
import type { SessionCard } from '../types';
import { SESSION_DECK } from '../data';
import Icon from '../components/Icon';
import Pinyin from '../components/Pinyin';
import SessionSummary from './SessionSummary';

const makeQueue = (): SessionCard[] => SESSION_DECK.map((c, i) => ({ ...c, id: i, attempts: 0 }));

const StudyScreen = () => {
  const { tweaks } = useTweaks();
  const [queue, setQueue] = useState<SessionCard[]>(makeQueue);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [celebrate, setCelebrate] = useState<{ t: number } | null>(null);
  const [done, setDone] = useState(false);

  const resetSession = useCallback(() => {
    setQueue(makeQueue());
    setFlipped(false);
    setReviewed(0);
    setCorrect(0);
    setWrong(0);
    setStreak(0);
    setCelebrate(null);
    setDone(false);
  }, []);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const rate = useCallback((got: boolean) => {
    setReviewed((n) => n + 1);

    setQueue((prev) => {
      const next = prev.slice();
      const card = next[0];
      if (!got) {
        const updated = { ...card, attempts: card.attempts + 1 };
        next.splice(0, 1);
        next.splice(Math.min(2, next.length), 0, updated);
      } else {
        next.splice(0, 1);
      }
      if (next.length === 0) setTimeout(() => setDone(true), 250);
      return next;
    });

    if (got) {
      setCorrect((n) => n + 1);
      setStreak((s) => { if (s + 1 >= 3) setCelebrate({ t: Date.now() }); return s + 1; });
    } else {
      setWrong((n) => n + 1);
      setStreak(0);
    }

    setTimeout(() => setFlipped(false), 200);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === ' ') { e.preventDefault(); flip(); } else if (e.key === '1' && flipped) rate(false);
      else if (e.key === '2' && flipped) rate(true);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [done, flipped, flip, rate]);

  useEffect(() => {
    if (!celebrate) return undefined;
    const t = setTimeout(() => setCelebrate(null), 900);
    return () => clearTimeout(t);
  }, [celebrate]);

  if (done) {
    return (
      <SessionSummary
        reviewed={reviewed}
        correct={correct}
        wrong={wrong}
        streak={streak}
        onReset={resetSession}
      />
    );
  }

  const card = queue[0];
  const total = SESSION_DECK.length;
  const position = total - queue.length + 1;
  const hanFont = tweaks.serifHan ? 'var(--font-han)' : '"Noto Sans SC", "PingFang SC", sans-serif';

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}
    >
      {/* Progress bar + session stats */}
      <div style={{
        padding: '18px 28px 14px', display: 'flex', alignItems: 'center', gap: 20, borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}
      >
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 14,
        }}
        >
          <span
            className="mono"
            style={{
              fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            {String(position).padStart(2, '0')}
            {' '}
            /
            {String(total).padStart(2, '0')}
          </span>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <div className="progress">
              <div className="fill" style={{ width: `${(reviewed / total) * 100}%` }} />
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 22, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)',
        }}
        >
          <span>
            <span style={{ color: 'var(--ok)' }}>●</span>
            {' '}
            {correct}
            {' '}
            right
          </span>
          <span>
            <span style={{ color: 'var(--bad)' }}>●</span>
            {' '}
            {wrong}
            {' '}
            wrong
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="flame" size={11} />
            {' '}
            {streak}
            {' '}
            streak
          </span>
        </div>
      </div>

      {/* Flip card stage */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative',
      }}
      >
        <div style={{ width: 520, height: 360, position: 'relative' }}>
          {/* stacked shadow cards */}
          <div style={{
            position: 'absolute', inset: 0, transform: 'translate(8px, 8px)', border: '1px solid var(--border)', background: 'var(--bg-sub)', borderRadius: 2,
          }}
          />
          <div style={{
            position: 'absolute', inset: 0, transform: 'translate(4px, 4px)', border: '1px solid var(--border)', background: 'var(--bg-elev)', borderRadius: 2,
          }}
          />

          <div
            className="flip-wrap"
            onClick={flip}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === ' ' && flip()}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <div className={`flip-inner ${flipped ? 'flipped' : ''}`}>
              {/* FRONT */}
              <div className="flip-face card" style={{ justifyContent: 'space-between' }}>
                <div className="card-header">
                  <span>
                    // card
                    {String(position).padStart(2, '0')}
                  </span>
                  <span className="badge" style={{ color: 'var(--fg-dim)' }}>{card?.deck}</span>
                </div>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                }}
                >
                  <div style={{
                    fontFamily: hanFont,
                    fontSize: card && card.hanzi.length > 1 ? 160 : 220,
                    lineHeight: 1,
                    color: 'var(--fg)',
                    fontWeight: 400,
                    letterSpacing: card && card.hanzi.length > 1 ? '0.06em' : 0,
                  }}
                  >
                    {card?.hanzi}
                  </div>
                </div>
                <div style={{
                  padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between',
                }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}
                  >
                    click · or press
                    {' '}
                    <span style={{ border: '1px solid var(--border-strong)', padding: '1px 4px', margin: '0 3px' }}>space</span>
                    {' '}
                    · to reveal
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>
                    {card?.hanzi.length}
                    {' '}
                    chars
                  </span>
                </div>
              </div>

              {/* BACK */}
              <div className="flip-face back card" style={{ justifyContent: 'space-between' }}>
                <div className="card-header">
                  <span>// reveal</span>
                  <span className="badge" style={{ color: 'var(--fg-dim)' }}>{card?.deck}</span>
                </div>
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14,
                }}
                >
                  <div style={{
                    fontFamily: hanFont, fontSize: 56, lineHeight: 1, color: 'var(--fg-muted)',
                  }}
                  >
                    {card?.hanzi}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {tweaks.toneColor
                      ? <Pinyin pinyin={card?.pinyin ?? ''} tones={card?.tones ?? []} size={30} />
                      : <span style={{ fontSize: 30, fontWeight: 500, color: 'var(--fg)' }}>{card?.pinyin}</span>}
                    <button type="button" className="btn ghost" style={{ padding: '6px 8px' }} onClick={(e) => e.stopPropagation()}>
                      <Icon name="speaker" size={12} />
                    </button>
                  </div>
                  <div style={{ fontSize: 16, color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                    &ldquo;
                    {card?.meaning}
                    &rdquo;
                  </div>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
                  <button type="button" className="rate wrong" onClick={(e) => { e.stopPropagation(); rate(false); }} style={{ border: 'none', borderRight: '1px solid var(--border)', background: 'transparent' }}>
                    <span className="glyph"><Icon name="x" size={16} stroke={2} /></span>
                    <span>Got it Wrong</span>
                    {tweaks.kbdHints && <span className="sub">press 1</span>}
                  </button>
                  <button type="button" className="rate right" onClick={(e) => { e.stopPropagation(); rate(true); }} style={{ border: 'none', background: 'transparent' }}>
                    <span className="glyph"><Icon name="check" size={16} stroke={2} /></span>
                    <span>Got it Right</span>
                    {tweaks.kbdHints && <span className="sub">press 2</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {celebrate && Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div
                key={`${i}-${celebrate.t}`}
                className="sparkle"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * 140}px)`,
                  top: `calc(50% + ${Math.sin(angle) * 100}px)`,
                  animationDelay: `${i * 40}ms`,
                  fontSize: 18,
                }}
              >
                +
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer shortcuts */}
      <div style={{
        display: 'flex', padding: '10px 28px', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-dim)', letterSpacing: '0.05em', justifyContent: 'space-between', flexShrink: 0,
      }}
      >
        <span>
          shortcuts ·
          {' '}
          <span style={{ color: 'var(--fg-muted)' }}>space</span>
          {' '}
          flip ·
          {' '}
          <span style={{ color: 'var(--bad)' }}>1</span>
          {' '}
          wrong ·
          {' '}
          <span style={{ color: 'var(--ok)' }}>2</span>
          {' '}
          right
        </span>
        <span>srs: wrong cards reappear in 2 turns</span>
      </div>
    </div>
  );
};

export default StudyScreen;
