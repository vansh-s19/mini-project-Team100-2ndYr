import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

import ContractABI from '../contracts/LandRegistry.json';
import ContractAddress from '../contracts/contract-address.json';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected! Please install MetaMask.');
      return;
    }

    setIsConnecting(true);
    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await prov.send('eth_requestAccounts', []);
      const sign = prov.getSigner();
      const network = await prov.getNetwork();

      const landRegistry = new ethers.Contract(
        ContractAddress.LandRegistry,
        ContractABI.abi,
        sign
      );

      setProvider(prov);
      setSigner(sign);
      setAccount(accounts[0]);
      setChainId(network.chainId);
      setContract(landRegistry);

      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setChainId(null);
    toast.success('Wallet disconnected');
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        // Recreate contract with new signer
        if (provider) {
          const sign = provider.getSigner();
          setSigner(sign);
          const landRegistry = new ethers.Contract(
            ContractAddress.LandRegistry,
            ContractABI.abi,
            sign
          );
          setContract(landRegistry);
        }
        toast.success('Account changed');
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, provider, disconnectWallet]);

  const value = {
    account,
    provider,
    signer,
    contract,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

export default Web3Context;
