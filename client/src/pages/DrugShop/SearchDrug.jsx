import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../utils/axios';

export default function SearchDrug({ onApplyKeyword, resetSignal = 0 }) {
  const inputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [detectedKeyword, setDetectedKeyword] = useState('');
  const [lastUploadedName, setLastUploadedName] = useState(null);
  const isFirstRender = useRef(true);

  const resetState = () => {
    setDetectedKeyword('');
    setError(null);
    setLastUploadedName(null);
    if (typeof onApplyKeyword === 'function') {
      onApplyKeyword('', { keywords: [], rawText: '' });
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setLastUploadedName(file.name);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await axiosInstance.post('/drugs/search-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const extractedKeywords = Array.isArray(data?.keywords) ? data.keywords : [];
      const firstKeyword = extractedKeywords[0] || '';

      setDetectedKeyword(firstKeyword);

      if (typeof onApplyKeyword === 'function') {
        onApplyKeyword(firstKeyword, {
          keywords: extractedKeywords,
          rawText: data?.rawText || '',
        });
      }

      if (!firstKeyword) {
        setError(
          data?.message ||
            'No medicine names were detected. Try a clearer photo or adjust the lighting.',
        );
      }
    } catch (uploadError) {
      console.error('Image search failed:', uploadError);
      const message =
        uploadError?.response?.data?.error ||
        uploadError?.message ||
        'Failed to process the image. Please try again.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resetState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Search by Image</h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload a medicine label or prescription and let AI detect the drug name for you.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
            disabled={isProcessing}
          >
            {isProcessing ? 'Analyzing...' : 'Upload Image'}
          </button>
          {(detectedKeyword || lastUploadedName || error) && (
            <button
              type="button"
              onClick={resetState}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              disabled={isProcessing}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {lastUploadedName && (
        <p className="mt-4 text-sm text-gray-500">
          Uploaded: <span className="font-medium text-gray-700">{lastUploadedName}</span>
        </p>
      )}

      {isProcessing && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></span>
          Processing image with OCR...
        </div>
      )}

      {error && !isProcessing && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {!isProcessing && detectedKeyword && (
        <div className="mt-4 bg-white border border-teal-200 text-teal-700 text-sm rounded-lg p-3">
          Detected medicine name: <span className="font-semibold">{detectedKeyword}</span>
        </div>
      )}

      
    </div>
  );
}
