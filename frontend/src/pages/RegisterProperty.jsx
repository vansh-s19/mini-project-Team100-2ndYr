import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import axios from 'axios';
import { HiCheck, HiArrowRight, HiDocument, HiPencil, HiCloudUpload, HiCube } from 'react-icons/hi';

const API_URL = 'http://localhost:5000/api';

const STEPS = [
  { id: 1, title: 'Upload Document', icon: HiDocument },
  { id: 2, title: 'Extract & Edit', icon: HiPencil },
  { id: 3, title: 'IPFS Upload', icon: HiCloudUpload },
  { id: 4, title: 'Register on Chain', icon: HiCube },
];

export default function RegisterProperty() {
  const { contract, isConnected, account } = useWeb3();
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ipfsLoading, setIpfsLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [ipfsResult, setIpfsResult] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [propertyId, setPropertyId] = useState(null);

  const [fields, setFields] = useState({
    ownerName: '',
    plotNumber: '',
    registryId: '',
    area: '',
    address: '',
    date: '',
  });

  // Step 1: Handle file selection
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  // Step 1 → 2: Run OCR
  const handleOCR = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await axios.post(`${API_URL}/ocr/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setOcrResult(response.data);
        setFields({
          ownerName: response.data.fields.ownerName || '',
          plotNumber: response.data.fields.plotNumber || '',
          registryId: response.data.fields.registryId || '',
          area: response.data.fields.area || '',
          address: response.data.fields.address || '',
          date: response.data.fields.date || '',
        });
        setCurrentStep(2);
        toast.success(`OCR complete! Confidence: ${response.data.confidence}%`);
      }
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('OCR processing failed. You can fill in the details manually.');
      setCurrentStep(2);
    } finally {
      setOcrLoading(false);
    }
  };

  // Step 2 → 3: Upload to IPFS
  const handleIPFSUpload = async () => {
    if (!file) {
      toast.error('No file to upload');
      return;
    }

    setIpfsLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await axios.post(`${API_URL}/ipfs/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setIpfsResult(response.data);
        setCurrentStep(3);
        toast.success(`Document uploaded to IPFS!${response.data.mock ? ' (Mock mode)' : ''}`);
      }
    } catch (error) {
      console.error('IPFS error:', error);
      toast.error('IPFS upload failed');
    } finally {
      setIpfsLoading(false);
    }
  };

  // Step 3 → 4: Register on blockchain
  const handleRegister = async () => {
    if (!contract || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!fields.registryId || !ipfsResult?.cid) {
      toast.error('Missing required fields');
      return;
    }

    setRegisterLoading(true);
    try {
      const tx = await contract.registerProperty(
        fields.registryId,
        ipfsResult.cid,
        fields.ownerName,
        fields.plotNumber,
        fields.area,
        fields.address
      );

      toast.loading('Transaction pending...', { id: 'register-tx' });
      const receipt = await tx.wait();
      toast.dismiss('register-tx');

      setTxHash(receipt.transactionHash);

      // Extract property ID from event
      const event = receipt.events?.find(e => e.event === 'PropertyRegistered');
      if (event) {
        setPropertyId(event.args.propertyId.toNumber());
      }

      setCurrentStep(4);
      toast.success('Property registered on blockchain! 🎉');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.reason || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const updateField = (key, value) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Register Property</h1>
      <p className="page-subtitle">Upload a document, extract details via OCR, and register on the blockchain.</p>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                  ${isCompleted
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                    : isActive
                      ? 'bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg shadow-primary-500/30 animate-pulse-glow'
                      : 'bg-white/5 border border-white/10'
                  }
                `}>
                  {isCompleted ? (
                    <HiCheck className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  )}
                </div>
                <p className={`text-xs mt-2 font-medium ${
                  isActive ? 'text-primary-400' : isCompleted ? 'text-emerald-400' : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-6 ${
                  currentStep > step.id ? 'bg-emerald-500' : 'bg-white/10'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto">
        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="animate-fade-in space-y-6">
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-6">Upload Land Registry Document</h2>
              <FileUpload onFileSelect={handleFileSelect} file={file} />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => { setCurrentStep(2); }}
                className="btn-secondary text-sm"
              >
                Skip OCR → Fill Manually
              </button>
              <button
                onClick={handleOCR}
                disabled={!file || ocrLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {ocrLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span>Extract with OCR</span>
                    <HiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {ocrLoading && (
              <div className="glass-card p-8 text-center">
                <LoadingSpinner size="lg" text="Processing document with Tesseract OCR..." />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Edit Fields */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-6">
            {ocrResult && (
              <div className="glass-card p-4 border-primary-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-primary-400 font-medium">OCR Confidence</p>
                  <span className="text-sm font-mono text-white">{ocrResult.confidence}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${ocrResult.confidence}%` }}
                  />
                </div>
              </div>
            )}

            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-6">Property Details</h2>
              <p className="text-sm text-gray-400 mb-6">Review and correct the extracted information.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'ownerName', label: 'Owner Name', placeholder: 'e.g. Rajesh Kumar' },
                  { key: 'plotNumber', label: 'Plot Number', placeholder: 'e.g. 42-A' },
                  { key: 'registryId', label: 'Registry ID', placeholder: 'e.g. REG-2024-0042' },
                  { key: 'area', label: 'Area', placeholder: 'e.g. 2400 sq ft' },
                  { key: 'address', label: 'Property Address', placeholder: 'e.g. Sector 21, Noida' },
                  { key: 'date', label: 'Registration Date', placeholder: 'e.g. 15/03/2024' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-400 mb-1">{label}</label>
                    <input
                      type="text"
                      value={fields[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      placeholder={placeholder}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button
                onClick={handleIPFSUpload}
                disabled={ipfsLoading || !fields.registryId}
                className="btn-primary flex items-center space-x-2"
              >
                {ipfsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span>Upload to IPFS</span>
                    <HiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {ipfsLoading && (
              <div className="glass-card p-8 text-center">
                <LoadingSpinner size="lg" text="Uploading document to IPFS..." />
              </div>
            )}
          </div>
        )}

        {/* Step 3: IPFS Result + Register */}
        {currentStep === 3 && (
          <div className="animate-fade-in space-y-6">
            <div className="glass-card p-8 border-emerald-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <HiCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Document Uploaded to IPFS</h3>
                  <p className="text-sm text-gray-400">
                    {ipfsResult?.mock ? 'Mock Mode — for demo purposes' : 'Stored on Pinata IPFS'}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CID</span>
                  <span className="font-mono text-primary-400 text-xs break-all">{ipfsResult?.cid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">File</span>
                  <span className="text-gray-300">{ipfsResult?.fileName}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-8">
              <h3 className="text-lg font-bold text-white mb-4">Registration Summary</h3>
              <div className="space-y-3">
                {Object.entries(fields).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-gray-300">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(2)} className="btn-secondary">
                ← Back
              </button>
              <button
                onClick={handleRegister}
                disabled={registerLoading || !isConnected}
                className="btn-success flex items-center space-x-2"
              >
                {registerLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <HiCube className="w-5 h-5" />
                    <span>Register on Blockchain</span>
                  </>
                )}
              </button>
            </div>

            {!isConnected && (
              <p className="text-center text-amber-400 text-sm">
                ⚠️ Please connect your wallet to register the property.
              </p>
            )}
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="animate-fade-in">
            <div className="glass-card p-12 text-center border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-green-900/10">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Property Registered! 🎉</h2>
              <p className="text-gray-400 mb-6">
                Your property has been successfully registered on the blockchain.
              </p>

              <div className="bg-white/5 rounded-xl p-6 space-y-3 text-left max-w-md mx-auto">
                {propertyId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Property ID</span>
                    <span className="text-primary-400 font-bold">#{propertyId}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tx Hash</span>
                  <span className="font-mono text-xs text-gray-300 truncate max-w-[200px]">{txHash}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IPFS CID</span>
                  <span className="font-mono text-xs text-gray-300 truncate max-w-[200px]">{ipfsResult?.cid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="badge-pending">Pending Verification</span>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setFile(null);
                    setOcrResult(null);
                    setIpfsResult(null);
                    setTxHash(null);
                    setPropertyId(null);
                    setFields({ ownerName: '', plotNumber: '', registryId: '', area: '', address: '', date: '' });
                  }}
                  className="btn-primary"
                >
                  Register Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
