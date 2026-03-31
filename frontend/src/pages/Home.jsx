import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import StatsCard from '../components/StatsCard';
import {
  HiDocumentAdd,
  HiSearch,
  HiShieldCheck,
  HiSwitchHorizontal,
} from 'react-icons/hi';

export default function Home() {
  const { contract, isConnected } = useWeb3();
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });

  useEffect(() => {
    async function fetchStats() {
      if (!contract) return;
      try {
        const total = await contract.getPropertyCount();
        const totalNum = total.toNumber();
        let verified = 0;
        for (let i = 1; i <= totalNum; i++) {
          try {
            const prop = await contract.getProperty(i);
            if (prop.verified) verified++;
          } catch (e) { /* property may not exist if rejected */ }
        }
        setStats({ total: totalNum, verified, pending: totalNum - verified });
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }
    }
    fetchStats();
  }, [contract]);

  const features = [
    {
      icon: '📄',
      title: 'AI-Powered OCR',
      desc: 'Upload land registry documents and extract details automatically using Tesseract OCR engine.',
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/20',
    },
    {
      icon: '⛓️',
      title: 'Blockchain Records',
      desc: 'Immutable property records on Ethereum blockchain. Tamper-proof and transparent.',
      color: 'from-primary-500/20 to-purple-500/20',
      border: 'border-primary-500/20',
    },
    {
      icon: '📦',
      title: 'IPFS Storage',
      desc: 'Documents stored on decentralized IPFS network via Pinata. Permanent and censorship-resistant.',
      color: 'from-emerald-500/20 to-green-500/20',
      border: 'border-emerald-500/20',
    },
    {
      icon: '🔍',
      title: 'Public Verification',
      desc: 'Anyone can verify property ownership, status, and entire ownership history on the blockchain.',
      color: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-surface-900 to-purple-900/30" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 page-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 glass-card rounded-full mb-8 animate-fade-in">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Powered by Ethereum & IPFS</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 animate-slide-up">
              <span className="text-white">Decentralized</span>
              <br />
              <span className="gradient-text">Property Registry</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Register, verify, and transfer real estate properties on the blockchain.
              AI-powered document extraction meets immutable land records.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/register" className="btn-primary text-lg !px-8 !py-4 flex items-center space-x-2">
                <HiDocumentAdd className="w-5 h-5" />
                <span>Register Property</span>
              </Link>
              <Link to="/verify" className="btn-secondary text-lg !px-8 !py-4 flex items-center space-x-2">
                <HiSearch className="w-5 h-5" />
                <span>Verify Property</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isConnected && (
        <section className="page-container -mt-10 mb-16 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatsCard icon="🏠" label="Total Properties" value={stats.total} color="primary" />
            <StatsCard icon="✅" label="Verified" value={stats.verified} color="emerald" />
            <StatsCard icon="⏳" label="Pending Verification" value={stats.pending} color="amber" />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="page-container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why <span className="gradient-text">LandChain</span>?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A complete solution for transparent, secure, and verifiable property management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-stagger">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`glass-card-hover p-8 bg-gradient-to-br ${feature.color} border ${feature.border}`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Flow Section */}
      <section className="page-container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { step: '1', title: 'Upload', desc: 'Upload land document', icon: '📤' },
            { step: '2', title: 'OCR Extract', desc: 'AI reads document', icon: '🤖' },
            { step: '3', title: 'Register', desc: 'Save on blockchain', icon: '⛓️' },
            { step: '4', title: 'Verify', desc: 'Authority approves', icon: '✅' },
            { step: '5', title: 'Transfer', desc: 'Change ownership', icon: '🔄' },
            { step: '6', title: 'Public View', desc: 'Anyone can verify', icon: '🔍' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 text-center group hover:bg-white/10 transition-all duration-300">
              <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="w-6 h-6 bg-primary-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xs font-bold text-primary-400">{item.step}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="page-container py-20">
        <div className="glass-card p-12 text-center bg-gradient-to-br from-primary-900/30 to-purple-900/30 border-primary-500/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Secure Your Property?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Connect your wallet and start registering properties on the blockchain today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center space-x-2">
              <HiDocumentAdd className="w-5 h-5" />
              <span>Register Now</span>
            </Link>
            <Link to="/authority" className="btn-secondary flex items-center space-x-2">
              <HiShieldCheck className="w-5 h-5" />
              <span>Authority Panel</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
