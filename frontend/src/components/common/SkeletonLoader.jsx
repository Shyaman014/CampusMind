import React from 'react';

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-6 rounded-2xl glass-card border border-slate-800 animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-800 rounded-full"></div>
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-slate-800 rounded w-1/4"></div>
              <div className="h-3 bg-slate-800/60 rounded w-1/6"></div>
            </div>
          </div>
          <div className="h-5 bg-slate-800 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-800/80 rounded w-full"></div>
            <div className="h-3.5 bg-slate-800/80 rounded w-5/6"></div>
          </div>
          <div className="flex space-x-2 pt-2">
            <div className="h-6 bg-slate-800 rounded-full w-16"></div>
            <div className="h-6 bg-slate-800 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
