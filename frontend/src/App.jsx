import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import Layout from './components/Layout';
import Home from './pages/Home';
import RegisterProperty from './pages/RegisterProperty';
import AuthorityDashboard from './pages/AuthorityDashboard';
import MyProperties from './pages/MyProperties';
import TransferProperty from './pages/TransferProperty';
import VerifyProperty from './pages/VerifyProperty';

export default function App() {
  return (
    <Web3Provider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#1e293b',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1e293b',
              },
            },
          }}
        />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterProperty />} />
            <Route path="/authority" element={<AuthorityDashboard />} />
            <Route path="/my-properties" element={<MyProperties />} />
            <Route path="/transfer" element={<TransferProperty />} />
            <Route path="/verify" element={<VerifyProperty />} />
          </Route>
        </Routes>
      </Router>
    </Web3Provider>
  );
}
