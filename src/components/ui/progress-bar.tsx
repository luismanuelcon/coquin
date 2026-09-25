type ProgressBarProps = {
  value: number;
  color?: string;
  gradient?: string;
  ariaLabel?: string;
  className?: string;
};

export function ProgressBar({ value, color, gradient, ariaLabel, className }: ProgressBarProps) {
  const safe = Math.max(0, Math.min(100, value));
  const fillStyle: React.CSSProperties = {
    width: `${safe}%`,
  };
  if (gradient) {
    fillStyle.background = gradient;
    fillStyle.boxShadow = "0 0 12px rgb(255 185 85 / 45%)";
  } else if (color) {
    fillStyle.background = color;
    fillStyle.boxShadow = `0 0 8px color-mix(in srgb, ${color} 40%, transparent)`;
  }

  return (
    <div
      className={`progress-track${className ? " " + className : ""}`}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safe}
    >
      <span className="progress-fill" style={fillStyle} />
    </div>
  );
}
