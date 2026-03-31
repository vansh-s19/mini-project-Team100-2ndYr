import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ethers } from 'ethers';
import OwnershipTimeline from '../components/OwnershipTimeline';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';
import { HiSearch, HiExternalLink, HiDocument, HiLocationMarker } from 'react-icons/hi';

import ContractABI from '../contracts/LandRegistry.json';
import ContractAddress from '../contracts/contract-address.json';

export default function VerifyProperty() {
  const [searchParams] = useSearchParams();
  const [propertyId, setPropertyId] = useState(searchParams.get('id') || '');
  const [property, setProperty] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Auto-search if ID is in URL params
  useEffect(() => {
    if (searchParams.get('id')) {
      handleSearch();
    }
  }, []);

  async function handleSearch() {
    if (!propertyId) {
      setError('Please enter a Property ID');
      return;
    }

    setLoading(true);
    setError('');
    setProperty(null);
    setSearched(true);

    try {
      // Connect directly to provider (no wallet needed for public verification)
      let provider;
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
      }

      const contract = new ethers.Contract(
        ContractAddress.LandRegistry,
        ContractABI.abi,
        provider
      );

      const prop = await contract.getProperty(parseInt(propertyId));
      const hist = await contract.getOwnershipHistory(parseInt(propertyId));

      setProperty({
        id: prop.id.toNumber(),
        owner: prop.owner,
        registryId: prop.registryId,
        ipfsHash: prop.ipfsHash,
        verified: prop.verified,
        exists: prop.exists,
        timestamp: prop.timestamp.toNumber(),
        ownerName: prop.ownerName,
        plotNumber: prop.plotNumber,
        area: prop.area,
        propertyAddress: prop.propertyAddress,
      });
      setHistory(hist);
    } catch (err) {
      console.error('Verification error:', err);
      setError('Property not found or blockchain connection failed. Make sure the Hardhat node is running.');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Verify Property</h1>
      <p className="page-subtitle">
        Public verification — no wallet connection required.
      </p>

      {/* Search Box */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="glass-card p-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="number"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter Property ID (e.g. 1)"
                className="input-field text-lg"
                min="1"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <HiSearch className="w-5 h-5" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-xl mx-auto mb-8">
          <div className="glass-card p-6 border-red-500/20 bg-red-500/5 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="max-w-xl mx-auto">
          <div className="glass-card p-12">
            <LoadingSpinner size="lg" text="Fetching property data from blockchain..." />
          </div>
        </div>
      )}

      {/* No results */}
      {searched && !loading && !property && !error && (
        <div className="max-w-xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Property Not Found</h3>
            <p className="text-gray-400">No property exists with this ID on the blockchain.</p>
          </div>
        </div>
      )}

      {/* Property Details */}
      {property && (
        <div className="max-w-4xl mx-auto animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className={`glass-card p-8 border ${
                property.verified ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      property.verified
                        ? 'bg-emerald-500/20'
                        : 'bg-amber-500/20'
                    }`}>
                      <span className="text-2xl">{property.verified ? '✅' : '⏳'}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Property #{property.id}
                      </h2>
                      <StatusBadge status={property.verified ? 'verified' : 'pending'} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Owner Name', property.ownerName, '👤'],
                    ['Plot Number', property.plotNumber, '📍'],
                    ['Registry ID', property.registryId, '📋'],
                    ['Area', property.area, '📐'],
                  ].map(([label, value, icon]) => (
                    <div key={label} className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">{icon} {label}</p>
                      <p className="text-sm font-semibold text-white">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address & IPFS */}
              <div className="glass-card p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <HiLocationMarker className="w-5 h-5 text-primary-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Property Address</p>
                      <p className="text-sm text-white">{property.propertyAddress || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <HiDocument className="w-5 h-5 text-primary-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">IPFS Document</p>
                      <a
                        href={`https://ipfs.io/ipfs/${property.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-400 hover:text-primary-300 flex items-center space-x-1 break-all"
                      >
                        <span>{property.ipfsHash}</span>
                        <HiExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Current Owner</p>
                    <p className="text-sm font-mono text-gray-300 break-all">{property.owner}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Registered On</p>
                    <p className="text-sm text-gray-300">{formatDate(property.timestamp)}</p>
                  </div>
                </div>
              </div>

              {/* Ownership Timeline */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Ownership History</h3>
                <OwnershipTimeline history={history} />
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* QR Code */}
              <div className="glass-card p-6 text-center">
                <h4 className="text-sm font-semibold text-gray-400 mb-4">Verification QR Code</h4>
                <div className="flex justify-center mb-3">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                      value={`${window.location.origin}/verify?id=${property.id}`}
                      size={180}
                      level="H"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Share this QR code for instant property verification
                </p>
              </div>

              {/* Blockchain Info */}
              <div className="glass-card p-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-4">Blockchain Record</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Contract Address</p>
                    <p className="text-xs font-mono text-gray-400 break-all">
                      {ContractAddress.LandRegistry}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Network</p>
                    <p className="text-xs text-gray-400">Hardhat Local (Chain 31337)</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Property ID</p>
                    <p className="text-xs text-primary-400 font-bold">#{property.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
