import React from 'react';

export default function OwnershipTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">No ownership history available.</p>
    );
  }

  const truncate = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-purple-500 to-pink-500" />

      <div className="space-y-6">
        {history.map((address, index) => (
          <div key={index} className="relative pl-10 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
            {/* Dot */}
            <div className={`absolute left-2.5 w-3.5 h-3.5 rounded-full border-2 ${
              index === history.length - 1
                ? 'bg-primary-500 border-primary-400 shadow-lg shadow-primary-500/50'
                : 'bg-surface-800 border-gray-600'
            }`} />

            <div className={`glass-card p-4 ${index === history.length - 1 ? 'border-primary-500/30' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {index === 0 ? 'Original Owner' : `Transfer #${index}`}
                  </p>
                  <p className="text-sm font-mono text-gray-300">
                    {truncate(address)}
                  </p>
                </div>
                {index === history.length - 1 && (
                  <span className="badge-verified">Current</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
