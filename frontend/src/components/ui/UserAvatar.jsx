import React, { useState, useEffect } from 'react';

export default function UserAvatar({ user, className = 'w-8 h-8 text-xs', rounded = 'rounded-full' }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.avatar]);

  const name = user?.name || 'User';
  const avatarUrl = user?.avatar || '';

  // Check if avatar is a real uploaded photo or Google profile photo (not default placeholders)
  const isRealPhoto =
    avatarUrl &&
    !avatarUrl.includes('images.unsplash.com/photo-1535713875002') &&
    !avatarUrl.includes('api.dicebear.com');

  const getInitials = (str) => {
    const parts = str.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isRealPhoto && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${className} ${rounded} object-cover ring-1 ring-[#2A2A2A] shadow-sm flex-shrink-0 select-none`}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <div
      className={`${className} ${rounded} bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center ring-1 ring-[#2A2A2A]/80 shadow-sm flex-shrink-0 select-none tracking-wider`}
      title={name}
    >
      {initials}
    </div>
  );
}
