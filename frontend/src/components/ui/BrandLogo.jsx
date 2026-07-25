import React from 'react';
import CampusMindIcon from './CampusMindIcon';

export default function BrandLogo({ size = 36, iconSize = 22, className = '', animate = false }) {
  // Render exact original black-and-white logo without background gradient box, slightly larger for visibility
  const displaySize = Math.round(Math.max(size * 0.9, iconSize * 1.45));
  return (
    <div className={`inline-flex items-center justify-center flex-shrink-0 select-none text-white ${className}`}>
      <CampusMindIcon size={displaySize} animate={animate} />
    </div>
  );
}
