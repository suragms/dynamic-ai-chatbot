import React from 'react';

interface GeminiLogoProps {
  size?: number;
  className?: string;
}

export const GeminiLogo: React.FC<GeminiLogoProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14 0C14 7.73199 7.73199 14 0 14C7.73199 14 14 20.268 14 28C14 20.268 20.268 14 28 14C20.268 14 14 7.73199 14 0Z"
        fill="url(#gemini-sparkle-gradient)"
      />
      <defs>
        <linearGradient
          id="gemini-sparkle-gradient"
          x1="0"
          y1="0"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="35%" stopColor="#9B72CB" />
          <stop offset="70%" stopColor="#D96570" />
          <stop offset="100%" stopColor="#FFA07A" />
        </linearGradient>
      </defs>
    </svg>
  );
};
