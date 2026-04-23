import type { Tweaks } from '../types';

interface ToggleProps {
  label: string;
  on: boolean;
  onToggle: () => void;
}

const Toggle = ({ label, on, onToggle }: ToggleProps) => (
  <div
    className="row-t"
    onClick={onToggle}
    role="switch"
    aria-checked={on}
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onToggle()}
    style={{ cursor: 'pointer' }}
  >
    <span style={{ color: 'var(--fg-muted)' }}>{label}</span>
    <span style={{
      width: 26,
      height: 14,
      borderRadius: 2,
      background: on ? 'var(--fg)' : 'var(--bg-sub)',
      border: '1px solid var(--border-strong)',
      position: 'relative',
      transition: 'background .15s',
    }}
    >
      <span style={{
        position: 'absolute',
        top: 1,
        left: on ? 13 : 1,
        width: 10,
        height: 10,
        background: on ? 'var(--bg)' : 'var(--fg-muted)',
        transition: 'left .15s',
      }}
      />
    </span>
  </div>
);

interface TweaksPanelProps {
  tweaks: Tweaks;
  onChange: (next: Tweaks) => void;
  visible: boolean;
}

const TweaksPanel = ({ tweaks, onChange, visible }: TweaksPanelProps) => {
  if (!visible) return null;
  const toggle = (k: keyof Omit<Tweaks, 'theme'>) => onChange({ ...tweaks, [k]: !tweaks[k] });
  return (
    <div className="tweaks-panel">
      <div className="title">tweaks</div>
      <Toggle label="grid background" on={tweaks.gridBg} onToggle={() => toggle('gridBg')} />
      <Toggle label="tone color pinyin" on={tweaks.toneColor} onToggle={() => toggle('toneColor')} />
      <Toggle label="char serif font" on={tweaks.serifHan} onToggle={() => toggle('serifHan')} />
      <Toggle label="show keyboard hints" on={tweaks.kbdHints} onToggle={() => toggle('kbdHints')} />
    </div>
  );
};

export default TweaksPanel;
