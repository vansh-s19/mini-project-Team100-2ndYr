import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface-900 bg-grid relative">
      {/* Background decorative orbs */}
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />

      <Navbar />

      <main className="relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-sm">🏠</span>
              </div>
              <div>
                <p className="text-sm font-semibold gradient-text">LandChain</p>
                <p className="text-xs text-gray-500">Blockchain Property Registry</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Built with Solidity • React • IPFS • Tesseract OCR
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
