import React from 'react';

export default function StatsCard({ icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-500 to-purple-500 shadow-primary-500/20',
    emerald: 'from-emerald-500 to-green-500 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/20',
    rose: 'from-rose-500 to-pink-500 shadow-rose-500/20',
  };

  return (
    <div className="glass-card-hover p-6 group">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
