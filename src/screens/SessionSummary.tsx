import Icon from '../components/Icon';

const TIMELINE_HEIGHTS = [3, 5, 2, 6, 4, 7, 3, 5, 8, 4, 6, 3, 5, 7, 4, 6, 5, 3, 5, 4];

interface StatTileProps {
  label: string;
  value: number;
  accent?: 'ok' | 'bad';
  icon?: string;
}

const StatTile = ({
  label, value, accent, icon,
}: StatTileProps) => {
  const color = accent === 'ok' ? 'var(--ok)' : accent === 'bad' ? 'var(--bad)' : 'var(--fg)';
  return (
    <div style={{
      border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 2, background: 'var(--bg)',
    }}
    >
      <div
        className="mono"
        style={{
          fontSize: 9.5, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        {icon && <Icon name={icon} size={9} />}
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color, fontVariantNumeric: 'tabular-nums',
      }}
      >
        {value}
      </div>
    </div>
  );
};

interface SessionSummaryProps {
  reviewed: number;
  correct: number;
  wrong: number;
  streak: number;
  onReset: () => void;
}

const SessionSummary = ({
  reviewed, correct, wrong, streak, onReset,
}: SessionSummaryProps) => {
  const acc = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflowY: 'auto',
    }}
    >
      <div style={{
        width: 520, display: 'flex', flexDirection: 'column', gap: 20,
      }}
      >
        <div>
          <div className="sec-label" style={{ marginBottom: 6 }}>// session_complete.log</div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>Nice work.</div>
          <div style={{ color: 'var(--fg-muted)', fontSize: 14, marginTop: 4 }}>
            Daily Mix ·
            {' '}
            {reviewed}
            {' '}
            cards reviewed in 6m 12s
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 24, display: 'flex', alignItems: 'center', gap: 20,
          }}
        >
          <div style={{ flex: '0 0 120px' }}>
            <div
              className="mono"
              style={{
                fontSize: 9.5, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6,
              }}
            >
              accuracy
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 56, fontWeight: 500, lineHeight: 1, color: 'var(--ok)', letterSpacing: '-0.03em',
            }}
            >
              {acc}
              <span style={{ fontSize: 24, color: 'var(--fg-muted)' }}>%</span>
            </div>
          </div>
          <div style={{
            flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          }}
          >
            <StatTile label="cards" value={reviewed} />
            <StatTile label="peak streak" value={streak} icon="flame" />
            <StatTile label="right" value={correct} accent="ok" />
            <StatTile label="wrong" value={wrong} accent="bad" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>// review_timeline</span>
            <span className="mono" style={{ fontSize: 9, color: 'var(--fg-dim)' }}>6m 12s</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 3, padding: 14, height: 60,
          }}
          >
            {TIMELINE_HEIGHTS.map((h, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div
                key={i}
                style={{
                  flex: 1, height: `${h * 6}px`, background: i % 7 === 2 ? 'var(--bad)' : 'var(--ok)', opacity: 0.8,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn primary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }} onClick={onReset}>
            <Icon name="play" size={11} />
            {' '}
            start next session
          </button>
          <button type="button" className="btn ghost" style={{ padding: '12px 16px' }}>
            <Icon name="chart" size={11} />
            {' '}
            view stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
