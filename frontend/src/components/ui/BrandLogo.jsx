import React from 'react';
import CampusMindIcon from './CampusMindIcon';

export default function BrandLogo({ size = 36, iconSize = 22, className = '', animate = false }) {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-brandGlow flex-shrink-0 border border-white/10 select-none ${className}`}
    >
      <CampusMindIcon size={iconSize} animate={animate} />
    </div>
  );
}
