interface ProgressBarProps {
  value: number;
  max?: number;
}

const ProgressBar = ({ value, max = 1 }: ProgressBarProps) => {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div className="progress">
      <div className="fill" style={{ width: `${pct}%` }} />
    </div>
  );
};

export default ProgressBar;
