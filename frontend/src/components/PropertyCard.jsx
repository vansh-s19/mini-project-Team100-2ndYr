import React from 'react';
import StatusBadge from './StatusBadge';
import { HiLocationMarker, HiIdentification, HiDocument } from 'react-icons/hi';

export default function PropertyCard({ property, onClick, children }) {
  return (
    <div
      onClick={onClick}
      className="glass-card-hover p-6 cursor-pointer group animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
            <span className="text-xl">🏗️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Property #{property.id?.toString()}
            </h3>
            <p className="text-sm text-gray-400">{property.ownerName || 'Unknown Owner'}</p>
          </div>
        </div>
        <StatusBadge status={property.verified ? 'verified' : 'pending'} />
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <HiIdentification className="w-4 h-4 text-primary-400" />
          <span className="text-gray-500">Plot:</span>
          <span>{property.plotNumber || 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <HiDocument className="w-4 h-4 text-primary-400" />
          <span className="text-gray-500">Registry:</span>
          <span>{property.registryId || 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <HiLocationMarker className="w-4 h-4 text-primary-400" />
          <span className="text-gray-500">Area:</span>
          <span>{property.area || 'N/A'}</span>
        </div>
      </div>

      {/* Owner Address */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-xs text-gray-500">Owner</p>
        <p className="text-xs font-mono text-gray-400 truncate">
          {property.owner}
        </p>
      </div>

      {/* Extra actions slot */}
      {children && (
        <div className="mt-4 pt-4 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}
