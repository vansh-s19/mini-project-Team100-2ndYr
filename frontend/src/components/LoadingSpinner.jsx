import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <div className={`${sizes[size]} border-2 border-white/10 rounded-full`} />
        <div className={`${sizes[size]} border-2 border-transparent border-t-primary-500 rounded-full animate-spin absolute top-0 left-0`} />
      </div>
      {text && <p className="text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  );
}
