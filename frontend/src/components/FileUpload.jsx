import React, { useCallback } from 'react';
import { HiCloudUpload, HiDocument, HiPhotograph } from 'react-icons/hi';

export default function FileUpload({ onFileSelect, file, accept = "image/*,.pdf", disabled = false }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileSelect(droppedFile);
  }, [onFileSelect, disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) onFileSelect(selectedFile);
  }, [onFileSelect]);

  const getFileIcon = () => {
    if (!file) return <HiCloudUpload className="w-12 h-12 text-primary-400" />;
    if (file.type?.startsWith('image/')) return <HiPhotograph className="w-12 h-12 text-emerald-400" />;
    return <HiDocument className="w-12 h-12 text-amber-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${file
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-white/10 hover:border-primary-500/40 hover:bg-primary-500/5'
        }
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center space-y-4">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
          file ? 'bg-emerald-500/10' : 'bg-primary-500/10'
        }`}>
          {getFileIcon()}
        </div>

        {file ? (
          <div>
            <p className="text-lg font-semibold text-white">{file.name}</p>
            <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
            <p className="text-xs text-emerald-400 mt-2">✓ File selected — click to change</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-white">
              Drop your document here
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or <span className="text-primary-400 underline">browse files</span>
            </p>
            <p className="text-xs text-gray-600 mt-3">
              Supports PNG, JPG, TIFF, BMP, PDF (max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
