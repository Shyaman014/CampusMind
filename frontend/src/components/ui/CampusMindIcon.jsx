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
      {/* The Open Knowledge Loop */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M16 2 A 14 14 0 1 0 30 16 H 22 A 6 6 0 1 1 16 10 V 2 Z" 
        fill="currentColor" 
      />
      {/* The AI Spark (Node) */}
      <circle 
        cx="23" 
        cy="9" 
        r="4" 
        fill="currentColor" 
        className={animate ? 'animate-pulse origin-center' : ''} 
        style={{ animationDuration: '1.5s' }}
      />
    </svg>
  );
}
