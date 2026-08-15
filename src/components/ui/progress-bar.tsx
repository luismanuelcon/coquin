type ProgressBarProps = {
  value: number;
  color: string;
};

export function ProgressBar({ value, color }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(value, 100));

  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
    >
      <div
        className="progress-fill"
        style={{ width: `${clampedValue}%`, background: color, boxShadow: `0 0 14px ${color}` }}
      />
    </div>
  );
}
