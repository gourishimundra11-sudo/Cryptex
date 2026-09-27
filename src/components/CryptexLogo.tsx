import React from 'react';

interface CryptexLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const CryptexLogo: React.FC<CryptexLogoProps> = ({
  size = 28,
  className = '',
  glow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-300 ${glow ? 'drop-shadow-[0_0_8px_rgba(0,200,255,0.45)]' : ''}`}
      >
        <defs>
          <linearGradient id="cryptex-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C8FF" />
            <stop offset="100%" stopColor="#536DFF" />
          </linearGradient>
          <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer geometric Letter C arc with circuit node breaks */}
        <path
          d="M 33 11 C 28 8 20 8 14 13 C 8 18 7 28 12 34 C 17 40 27 41 33 37"
          stroke="url(#cryptex-cyan-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Key bit / Circuit teeth extending inside */}
        <path
          d="M 33 11 L 33 17 L 27 17"
          stroke="#00C8FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 33 37 L 33 31 L 27 31"
          stroke="#00C8FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Keyhole / Encryption core */}
        <circle
          cx="24"
          cy="24"
          r="4.5"
          stroke="#F5F7FA"
          strokeWidth="2"
        />
        <path
          d="M 24 28.5 L 24 33"
          stroke="#00C8FF"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Circuit nodes (small dots at endpoints) */}
        <circle cx="33" cy="11" r="1.5" fill="#00C8FF" />
        <circle cx="33" cy="37" r="1.5" fill="#536DFF" />
        <circle cx="27" cy="17" r="1.2" fill="#00C8FF" />
        <circle cx="27" cy="31" r="1.2" fill="#00C8FF" />
      </svg>
    </div>
  );
};
