import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiShieldCheck, HiX, HiEye, HiExternalLink } from 'react-icons/hi';

export default function AuthorityDashboard() {
  const { contract, isConnected, account } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [isAuthority, setIsAuthority] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [contract, account]);

  async function fetchProperties() {
    if (!contract) {
      setLoading(false);
      return;
    }

    try {
      // Check if current user is authority
      const authority = await contract.governmentAuthority();
      setIsAuthority(authority.toLowerCase() === account?.toLowerCase());

      const count = await contract.getPropertyCount();
      const totalCount = count.toNumber();
      const props = [];

      for (let i = 1; i <= totalCount; i++) {
        try {
          const prop = await contract.getProperty(i);
          if (prop.exists) {
            props.push({
              id: prop.id.toNumber(),
              owner: prop.owner,
              registryId: prop.registryId,
              ipfsHash: prop.ipfsHash,
              verified: prop.verified,
              timestamp: prop.timestamp.toNumber(),
              ownerName: prop.ownerName,
              plotNumber: prop.plotNumber,
              area: prop.area,
              propertyAddress: prop.propertyAddress,
            });
          }
        } catch (e) { /* skip */ }
      }

      setProperties(props);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(propertyId) {
    setActionLoading(propertyId);
    try {
      const tx = await contract.verifyProperty(propertyId);
      toast.loading('Verifying property...', { id: `verify-${propertyId}` });
      await tx.wait();
      toast.dismiss(`verify-${propertyId}`);
      toast.success(`Property #${propertyId} verified! ✅`);
      fetchProperties();
    } catch (error) {
      toast.error(error.reason || 'Verification failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(propertyId) {
    setActionLoading(propertyId);
    try {
      const tx = await contract.rejectProperty(propertyId);
      toast.loading('Rejecting property...', { id: `reject-${propertyId}` });
      await tx.wait();
      toast.dismiss(`reject-${propertyId}`);
      toast.success(`Property #${propertyId} rejected`);
      fetchProperties();
    } catch (error) {
      toast.error(error.reason || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  }

  const pendingProps = properties.filter(p => !p.verified);
  const verifiedProps = properties.filter(p => p.verified);

  const truncate = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="glass-card p-12 text-center max-w-md mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Wallet Required</h2>
          <p className="text-gray-400">Please connect your wallet to access the Authority Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Authority Dashboard</h1>
          <p className="text-gray-400">
            {isAuthority
              ? 'Review and verify pending property registrations.'
              : '⚠️ You are not the designated authority. View-only mode.'}
          </p>
        </div>
        {isAuthority && (
          <div className="badge-verified text-sm">
            <HiShieldCheck className="w-4 h-4 mr-1" />
            Authorized
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatsCard icon="📋" label="Total Properties" value={properties.length} color="primary" />
        <StatsCard icon="⏳" label="Pending" value={pendingProps.length} color="amber" />
        <StatsCard icon="✅" label="Verified" value={verifiedProps.length} color="emerald" />
      </div>

      {loading ? (
        <div className="glass-card p-12">
          <LoadingSpinner size="lg" text="Loading properties from blockchain..." />
        </div>
      ) : (
        <>
          {/* Pending Properties */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              <span>Pending Verification ({pendingProps.length})</span>
            </h2>

            {pendingProps.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-500">No pending properties. All caught up! 🎉</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Owner</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Plot</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Registry ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Area</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingProps.map((prop) => (
                        <tr key={prop.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-primary-400">#{prop.id}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-white">{prop.ownerName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 font-mono">{truncate(prop.owner)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{prop.plotNumber || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-300 font-mono">{prop.registryId}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{prop.area || 'N/A'}</td>
                          <td className="px-6 py-4"><StatusBadge status="pending" /></td>
                          <td className="px-6 py-4">
                            {isAuthority ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleVerify(prop.id)}
                                  disabled={actionLoading === prop.id}
                                  className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                                  title="Verify"
                                >
                                  {actionLoading === prop.id ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <HiShieldCheck className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(prop.id)}
                                  disabled={actionLoading === prop.id}
                                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                  title="Reject"
                                >
                                  <HiX className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setSelectedProperty(selectedProperty?.id === prop.id ? null : prop)}
                                  className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"
                                  title="View Details"
                                >
                                  <HiEye className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-600">View only</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Selected Property Detail Panel */}
          {selectedProperty && (
            <div className="glass-card p-6 mb-8 animate-slide-up border-primary-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Property #{selectedProperty.id} — Details
                </h3>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  ['Owner Name', selectedProperty.ownerName],
                  ['Plot Number', selectedProperty.plotNumber],
                  ['Registry ID', selectedProperty.registryId],
                  ['Area', selectedProperty.area],
                  ['Address', selectedProperty.propertyAddress],
                  ['IPFS Hash', selectedProperty.ipfsHash],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm text-gray-300 break-all">{value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Properties */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span>Verified Properties ({verifiedProps.length})</span>
            </h2>

            {verifiedProps.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-500">No verified properties yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {verifiedProps.map((prop) => (
                  <div key={prop.id} className="glass-card-hover p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-white">#{prop.id}</span>
                      <StatusBadge status="verified" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">{prop.ownerName || 'Unknown'}</p>
                      <p className="text-gray-500 font-mono text-xs">{truncate(prop.owner)}</p>
                      <p className="text-gray-500">Plot: {prop.plotNumber || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
