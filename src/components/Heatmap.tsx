interface HeatmapProps {
  data: number[];
  compact?: boolean;
}

export const toBucket = (v: number): number => {
  if (v === 0) return 0
  if (v <= 2) return 1
  if (v <= 4) return 2
  if (v <= 7) return 3
  return 4
}

const Heatmap = ({ data, compact = false }: HeatmapProps) => {
  const cellSize = compact ? 9 : 11
  const gap = 3
  const weeks = Math.ceil(data.length / 7)

  // First cell = today minus (data.length - 1) days
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  startDate.setDate(startDate.getDate() - (data.length - 1))

  // First column of each new month
  const monthLabels: { col: number; label: string }[] = []
  let prevMonth = -1
  for (let col = 0; col < weeks; col += 1) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + col * 7)
    const m = d.getMonth()
    if (m !== prevMonth) {
      monthLabels.push({ col, label: d.toLocaleDateString('en-US', { month: 'short' }) })
      prevMonth = m
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {!compact && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks}, ${cellSize + gap}px)`,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--fg-dim)',
        }}
        >
          {monthLabels.map(({ col, label }) => (
            <span key={col} style={{ gridColumnStart: col + 1 }}>{label}</span>
          ))}
        </div>
      )}
      <div className="heatmap" style={{ gridAutoColumns: `${cellSize}px` }}>
        {Array.from({ length: weeks * 7 }).map((_, i) => {
          const v = data[i] ?? 0
          const b = toBucket(v)
          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className={`cell l${b}`}
              style={{ height: cellSize }}
              title={v ? `${v} reviews` : '0 reviews'}
            />
          )
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
  )
}

export default Heatmap
