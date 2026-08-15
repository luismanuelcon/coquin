type ProgressBarProps = {
  value: number;
  color: string;
};

export function ProgressBar({ value, color }: ProgressBarProps) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[var(--panel-raised)]">
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, background: color, boxShadow: `0 0 14px ${color}` }}
      />
    </div>
  );
}
