import { useTweaks } from '../context/TweaksContext';
import { HSK1, HEATMAP_DATA } from '../data';
import Heatmap from '../components/Heatmap';
import Pinyin from '../components/Pinyin';

interface KPIProps {
  label: string;
  value: string;
  delta: string;
  down?: boolean;
}

const KPI = ({
  label, value, delta, down = false,
}: KPIProps) => (
  <div className="stat">
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    <div className="delta" style={{ color: down ? 'var(--bad)' : 'var(--ok)' }}>
      <span>{down ? '↓' : '↑'}</span>
      {' '}
      {delta}
    </div>
  </div>
);

const LINE_PTS = [
  68, 70, 72, 69, 74, 76, 73, 78, 77, 80,
  79, 82, 81, 83, 80, 85, 83, 86, 84, 87,
  85, 88, 86, 90, 88, 89, 86, 90, 88, 91,
];
const W = 560; const H = 160; const PAD = 16;

const LineChart = () => {
  const xs = LINE_PTS.map((_, i) => PAD + (i * (W - PAD * 2)) / (LINE_PTS.length - 1));
  const ys = LINE_PTS.map((v) => H - PAD - ((v - 60) / 40) * (H - PAD * 2));
  const d = xs.map((x, i) => `${i ? 'L' : 'M'} ${x} ${ys[i]}`).join(' ');
  const area = `${d} L ${xs[xs.length - 1]} ${H - PAD} L ${xs[0]} ${H - PAD} Z`;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {[60, 70, 80, 90, 100].map((y) => {
        const yy = H - PAD - ((y - 60) / 40) * (H - PAD * 2);
        return (
          <g key={y}>
            <line x1={PAD} x2={W - PAD} y1={yy} y2={yy} stroke="var(--border)" strokeDasharray="2 3" />
            <text x={W - PAD + 4} y={yy + 3} fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)">{y}</text>
          </g>
        );
      })}
      <path d={area} fill="var(--fg)" opacity="0.08" />
      <path d={d} stroke="var(--fg)" strokeWidth="1.5" fill="none" />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r={i === LINE_PTS.length - 1 ? 3 : 1.6} fill="var(--accent)" />)}
    </svg>
  );
};

interface ToneRowProps { tone: number; label: string; acc: number; }
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
        <div className="fill" style={{ width: `${acc}%`, background: `var(--tone${tone})` }} />
      </div>
    </div>
    <span
      className="mono"
      style={{
        fontSize: 11.5, fontVariantNumeric: 'tabular-nums', color: 'var(--fg)', width: 34, textAlign: 'right',
      }}
    >
      {acc}
      %
    </span>
  </div>
);

const STRUGGLES = [
  { c: HSK1[11], lapse: 0.62 },
  { c: HSK1[14], lapse: 0.50 },
  { c: HSK1[18], lapse: 0.45 },
  { c: HSK1[21], lapse: 0.40 },
];

const StatsScreen = () => {
  const { tweaks } = useTweaks();
  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20,
    }}
    >
      <div>
        <div className="sec-label" style={{ marginBottom: 6 }}>// progress_report.md</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>Your progress · 30 days</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <KPI label="reviews" value="214" delta="+32%" />
        <KPI label="accuracy" value="84%" delta="+2.1 pts" />
        <KPI label="retention · 7d" value="91%" delta="+4 pts" />
        <KPI label="avg session" value="6:12" delta="-0:48" down />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <span>// accuracy_trend · 30d</span>
            <span className="mono" style={{ fontSize: 10 }}>y · %</span>
          </div>
          <div style={{ padding: 18, height: 200 }}><LineChart /></div>
        </div>
        <div className="card">
          <div className="card-header">
            <span>// accuracy_by_tone</span>
          </div>
          <div style={{
            padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
          }}
          >
            <ToneRow tone={1} label="1st · high flat" acc={88} />
            <ToneRow tone={2} label="2nd · rising" acc={79} />
            <ToneRow tone={3} label="3rd · dipping" acc={68} />
            <ToneRow tone={4} label="4th · falling" acc={91} />
            <ToneRow tone={5} label="neutral" acc={86} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span>// contributions · 52w</span>
          <span className="mono" style={{ fontSize: 10 }}>214 reviews · 89 active days · longest streak 18d</span>
        </div>
        <div style={{ padding: 18 }}><Heatmap data={HEATMAP_DATA} /></div>
      </div>

      <div className="card">
        <div className="card-header">
          <span>// top_struggles · sorted by lapse rate</span>
          <span className="mono" style={{ fontSize: 10 }}>
            {STRUGGLES.length}
            {' '}
            items
          </span>
        </div>
        {STRUGGLES.map((r, i) => (
          <div className="row" key={r.c.simplified}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-dim)', width: 24 }}>{String(i + 1).padStart(2, '0')}</span>
            <div className="han" style={{ fontSize: 24, minWidth: 52 }}>{r.c[tweaks.script]}</div>
            <div style={{ flex: 1 }}>
              {tweaks.toneColor
                ? <Pinyin pinyin={r.c.pinyin} tones={r.c.tones} size={13} />
                : <span style={{ fontSize: 13 }}>{r.c.pinyin}</span>}
              <span style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginLeft: 10 }}>{r.c.meaning}</span>
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-dim)', width: 70 }}>{r.c.deck}</span>
            <div style={{ width: 100 }}>
              <div className="progress"><div className="fill" style={{ width: `${r.lapse * 100}%`, background: 'var(--bad)' }} /></div>
            </div>
            <span
              className="mono"
              style={{
                fontSize: 11, color: 'var(--bad)', width: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.round(r.lapse * 100)}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsScreen;
