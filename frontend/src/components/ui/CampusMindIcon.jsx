import React from 'react';

export default function CampusMindIcon({ size = 32, className = '', animate = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="CampusMind AI"
    >
      {/* The Open Knowledge Loop (Stunning geometric open ring) */}
      <path
        d="M 27 16 A 11 11 0 1 1 16 5"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* The AI Spark (Solid circle dot in upper right notch) */}
      <circle
        cx="23.5"
        cy="8.5"
        r="3.8"
        fill="currentColor"
        className={animate ? 'animate-pulse origin-center' : ''}
        style={{ animationDuration: '1.5s' }}
      />
    </svg>
  );
}
