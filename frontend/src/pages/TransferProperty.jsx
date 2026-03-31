import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { HiSwitchHorizontal, HiCheck, HiExclamation } from 'react-icons/hi';

export default function TransferProperty() {
  const { contract, isConnected, account } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [txResult, setTxResult] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [contract, account]);

  async function fetchProperties() {
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
          if (prop.exists && prop.verified) {
            props.push({
              id: prop.id.toNumber(),
              registryId: prop.registryId,
              ownerName: prop.ownerName,
              plotNumber: prop.plotNumber,
              verified: prop.verified,
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

  const selectedProperty = properties.find(p => p.id === parseInt(selectedPropertyId));

  async function handleTransfer() {
    if (!contract || !selectedPropertyId || !newOwnerAddress) return;

    setTransferLoading(true);
    try {
      const tx = await contract.transferProperty(
        parseInt(selectedPropertyId),
        newOwnerAddress
      );

      toast.loading('Processing transfer...', { id: 'transfer-tx' });
      const receipt = await tx.wait();
      toast.dismiss('transfer-tx');

      setTxResult({
        hash: receipt.transactionHash,
        propertyId: selectedPropertyId,
        newOwner: newOwnerAddress,
      });

      setShowConfirm(false);
      toast.success('Property transferred successfully! 🎉');
      fetchProperties();
    } catch (error) {
      toast.error(error.reason || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="glass-card p-12 text-center max-w-md mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Connect your MetaMask wallet to transfer properties.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Transfer Property</h1>
      <p className="page-subtitle">Transfer ownership of a verified property to another address.</p>

      <div className="max-w-xl mx-auto">
        {txResult ? (
          /* Success State */
          <div className="glass-card p-12 text-center border-emerald-500/20 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Transfer Complete! 🎉</h2>
            <p className="text-gray-400 mb-6">Property ownership has been updated on the blockchain.</p>

            <div className="bg-white/5 rounded-xl p-4 space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Property ID</span>
                <span className="text-primary-400">#{txResult.propertyId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Owner</span>
                <span className="text-gray-300 font-mono text-xs truncate max-w-[200px]">{txResult.newOwner}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tx Hash</span>
                <span className="text-gray-300 font-mono text-xs truncate max-w-[200px]">{txResult.hash}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setTxResult(null);
                setSelectedPropertyId('');
                setNewOwnerAddress('');
              }}
              className="btn-primary mt-8"
            >
              Transfer Another
            </button>
          </div>
        ) : loading ? (
          <div className="glass-card p-12">
            <LoadingSpinner size="lg" text="Loading your verified properties..." />
          </div>
        ) : (
          /* Transfer Form */
          <div className="space-y-6 animate-fade-in">
            {properties.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-white mb-2">No Transferable Properties</h3>
                <p className="text-gray-400 text-sm">
                  You need verified properties to initiate a transfer.
                </p>
              </div>
            ) : (
              <>
                {/* Select Property */}
                <div className="glass-card p-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Select Property to Transfer
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">— Choose a property —</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id} className="bg-surface-800">
                        #{prop.id} - {prop.plotNumber || prop.registryId} ({prop.ownerName || 'Unknown'})
                      </option>
                    ))}
                  </select>

                  {selectedProperty && (
                    <div className="mt-4 bg-white/5 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Owner</span>
                        <span className="text-gray-300">{selectedProperty.ownerName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Plot</span>
                        <span className="text-gray-300">{selectedProperty.plotNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <StatusBadge status="verified" />
                      </div>
                    </div>
                  )}
                </div>

                {/* New Owner Address */}
                <div className="glass-card p-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    New Owner Address
                  </label>
                  <input
                    type="text"
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    placeholder="0x..."
                    className="input-field font-mono"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Enter the Ethereum address of the new property owner.
                  </p>
                </div>

                {/* Transfer Button */}
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!selectedPropertyId || !newOwnerAddress || transferLoading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <HiSwitchHorizontal className="w-5 h-5" />
                  <span>Transfer Ownership</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="glass-card p-8 max-w-md w-full mx-4 border-amber-500/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <HiExclamation className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Confirm Transfer</h3>
              </div>

              <p className="text-gray-400 text-sm mb-6">
                This action is irreversible. The property ownership will be permanently
                transferred on the blockchain.
              </p>

              <div className="bg-white/5 rounded-xl p-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Property</span>
                  <span className="text-primary-400">#{selectedPropertyId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">New Owner</span>
                  <span className="text-gray-300 font-mono text-xs truncate max-w-[200px]">{newOwnerAddress}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={transferLoading}
                  className="btn-danger flex-1 flex items-center justify-center space-x-2"
                >
                  {transferLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <HiSwitchHorizontal className="w-4 h-4" />
                      <span>Confirm Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
