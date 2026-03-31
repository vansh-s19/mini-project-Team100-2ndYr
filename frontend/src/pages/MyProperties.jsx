import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import PropertyCard from '../components/PropertyCard';
import OwnershipTimeline from '../components/OwnershipTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';
import { HiX } from 'react-icons/hi';

export default function MyProperties() {
  const { contract, isConnected, account } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchMyProperties();
  }, [contract, account]);

  async function fetchMyProperties() {
    if (!contract || !account) {
      setLoading(false);
      return;
    }

    try {
      const propIds = await contract.getPropertiesByOwner(account);
      const props = [];

      for (const id of propIds) {
        try {
          const prop = await contract.getProperty(id);
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

  async function handleSelect(prop) {
    setSelectedProp(prop);
    try {
      const hist = await contract.getOwnershipHistory(prop.id);
      setHistory(hist);
    } catch (e) {
      setHistory([]);
    }
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="glass-card p-12 text-center max-w-md mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Connect your MetaMask wallet to view your properties.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">My Properties</h1>
      <p className="page-subtitle">Properties registered under your wallet address.</p>

      {loading ? (
        <div className="glass-card p-12">
          <LoadingSpinner size="lg" text="Loading your properties..." />
        </div>
      ) : properties.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-lg mx-auto">
          <div className="text-5xl mb-4">🏘️</div>
          <h2 className="text-xl font-bold text-white mb-2">No Properties Found</h2>
          <p className="text-gray-400 mb-6">You haven't registered any properties yet.</p>
          <a href="/register" className="btn-primary inline-block">
            Register Your First Property
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Grid */}
          <div className={`${selectedProp ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onClick={() => handleSelect(prop)}
                />
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedProp && (
            <div className="lg:col-span-1 animate-slide-in-left">
              <div className="glass-card p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">
                    Property #{selectedProp.id}
                  </h3>
                  <button
                    onClick={() => setSelectedProp(null)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                      value={`${window.location.origin}/verify?id=${selectedProp.id}`}
                      size={150}
                      level="H"
                    />
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mb-6">
                  Scan to verify this property
                </p>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  {[
                    ['Owner', selectedProp.ownerName],
                    ['Plot', selectedProp.plotNumber],
                    ['Registry ID', selectedProp.registryId],
                    ['Area', selectedProp.area],
                    ['Address', selectedProp.propertyAddress],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-gray-300">{value || 'N/A'}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">IPFS</span>
                    <span className="text-primary-400 text-xs font-mono truncate max-w-[150px]">
                      {selectedProp.ipfsHash}
                    </span>
                  </div>
                </div>

                {/* Ownership Timeline */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-4">Ownership History</h4>
                  <OwnershipTimeline history={history} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
