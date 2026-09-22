type PigMascotProps = {
  size?: number;
  className?: string;
};

// Coquín mascot: a friendly piglet wearing round glasses.
export function PigMascot({ size = 88, className }: PigMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="Coquín, el cerdito"
    >
      <defs>
        <linearGradient id="pig-skin" x1="12" y1="8" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff9db8" />
          <stop offset="0.55" stopColor="#ff7fa3" />
          <stop offset="1" stopColor="#ffb877" />
        </linearGradient>
      </defs>
      {/* Ears */}
      <path d="M16 16c-3-4-8-5-9-2-1 4 3 9 8 11z" fill="url(#pig-skin)" />
      <path d="M48 16c3-4 8-5 9-2 1 4-3 9-8 11z" fill="url(#pig-skin)" />
      {/* Head */}
      <ellipse cx="32" cy="34" rx="22" ry="20" fill="url(#pig-skin)" />
      {/* Glasses */}
      <g stroke="#2a1420" strokeWidth="2.4" fill="none">
        <circle cx="23" cy="30" r="7" fill="#2a1420" fillOpacity="0.12" />
        <circle cx="41" cy="30" r="7" fill="#2a1420" fillOpacity="0.12" />
        <path d="M30 30h4" />
        <path d="M16 28l-4-2" />
        <path d="M48 28l4-2" />
      </g>
      {/* Eyes */}
      <circle cx="23" cy="30" r="2.2" fill="#2a1420" />
      <circle cx="41" cy="30" r="2.2" fill="#2a1420" />
      {/* Snout */}
      <ellipse cx="32" cy="42" rx="9" ry="6.5" fill="#ff8fb0" stroke="#e86f95" strokeWidth="1.4" />
      <ellipse cx="28.5" cy="42" rx="1.7" ry="2.4" fill="#7a3350" />
      <ellipse cx="35.5" cy="42" rx="1.7" ry="2.4" fill="#7a3350" />
    </svg>
  );
}
