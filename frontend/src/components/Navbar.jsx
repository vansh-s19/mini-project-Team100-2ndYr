import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import {
  HiHome,
  HiDocumentAdd,
  HiShieldCheck,
  HiCollection,
  HiSwitchHorizontal,
  HiSearch,
  HiMenu,
  HiX,
} from 'react-icons/hi';

const navLinks = [
  { path: '/', label: 'Home', icon: HiHome },
  { path: '/register', label: 'Register Property', icon: HiDocumentAdd },
  { path: '/authority', label: 'Authority Dashboard', icon: HiShieldCheck },
  { path: '/my-properties', label: 'My Properties', icon: HiCollection },
  { path: '/transfer', label: 'Transfer Property', icon: HiSwitchHorizontal },
  { path: '/verify', label: 'Verify Property', icon: HiSearch },
];

export default function Navbar() {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWeb3();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
              <span className="text-white font-bold text-lg">🏠</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold gradient-text">LandChain</h1>
              <p className="text-[10px] text-gray-500 -mt-1">Property Registry</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Button */}
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 glass-card rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300 font-mono">
                    {truncateAddress(account)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm !px-4 !py-2"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary text-sm !px-4 !py-2"
              >
                {isConnecting ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Connecting...</span>
                  </span>
                ) : (
                  '🦊 Connect Wallet'
                )}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-surface-800/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
