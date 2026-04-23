interface HeatmapProps {
  data: number[];
  compact?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKS = 53;

const toBucket = (v: number): number => {
  if (v === 0) return 0;
  if (v <= 2) return 1;
  if (v <= 4) return 2;
  if (v <= 7) return 3;
  return 4;
};

const Heatmap = ({ data, compact = false }: HeatmapProps) => {
  const cellSize = compact ? 9 : 11;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {!compact && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)',
        }}
        >
          {MONTHS.map((m) => <span key={m}>{m}</span>)}
        </div>
      )}
      <div className="heatmap" style={{ gridAutoColumns: `${cellSize}px` }}>
        {Array.from({ length: WEEKS * 7 }).map((_, i) => {
          const v = data[i] ?? 0;
          const b = toBucket(v);
          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className={`cell l${b}`}
              style={{ height: cellSize }}
              title={v ? `${v} reviews` : '0 reviews'}
            />
          );
        })}
      </div>
      {!compact && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--fg-dim)',
        }}
        >
          <span>less</span>
          <div className="heatmap" style={{ gridTemplateRows: '1fr', gridAutoFlow: 'column', gridAutoColumns: '11px' }}>
            {[0, 1, 2, 3, 4].map((l) => <div key={l} className={`cell l${l}`} />)}
          </div>
          <span>more</span>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
