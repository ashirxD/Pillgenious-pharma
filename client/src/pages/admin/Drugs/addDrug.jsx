import React, { useState, useEffect, useRef } from 'react';
import { useCreateDrug, useUpdateDrug } from '../../../hooks/api/useDrugs';

const DRUG_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Ointment', 'Other'];
const DRUG_CATEGORIES = [
  'Pain Relief',
  'Antibiotics',
  'Digestive',
  'Allergy',
  'Diabetes',
  'Cardiovascular',
  'Respiratory',
  'Vitamins & Supplements',
  'Mental Health',
  'Other'
];

export default function AddDrug({ isOpen, onClose, editingDrug = null }) {
  const [formData, setFormData] = useState({
    drugName: '',
    sideEffects: [],
    type: 'Tablet',
    price: '',
    category: '',
    description: '',
    stockQuantity: '',
    prescriptionRequired: false,
    images: [],
    isActive: true
  });

  const [sideEffectInput, setSideEffectInput] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);
  const createMutation = useCreateDrug();
  const updateMutation = useUpdateDrug();

  const isEditing = !!editingDrug;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingDrug) {
      setFormData({
        drugName: editingDrug.drugName || '',
        sideEffects: editingDrug.sideEffects || [],
        type: editingDrug.type || 'Tablet',
        price: editingDrug.price?.toString() || '',
        category: editingDrug.category || '',
        description: editingDrug.description || '',
        stockQuantity: editingDrug.stockQuantity?.toString() || '',
        prescriptionRequired: editingDrug.prescriptionRequired || false,
        images: editingDrug.images || [],
        isActive: editingDrug.isActive !== undefined ? editingDrug.isActive : true
      });
      setImageError('');
    } else if (isOpen && !editingDrug) {
      // Reset form for new drug
      setFormData({
        drugName: '',
        sideEffects: [],
        type: 'Tablet',
        price: '',
        category: '',
        description: '',
        stockQuantity: '',
        prescriptionRequired: false,
        images: [],
        isActive: true
      });
      setSideEffectInput('');
      setImageError('');
    }
  }, [isOpen, editingDrug]);

  // Close modal on success
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      onClose();
      createMutation.reset();
      updateMutation.reset();
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, onClose, createMutation, updateMutation]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSideEffect = () => {
    if (sideEffectInput.trim()) {
      setFormData(prev => ({
        ...prev,
        sideEffects: [...prev.sideEffects, sideEffectInput.trim()]
      }));
      setSideEffectInput('');
    }
  };

  const handleRemoveSideEffect = (index) => {
    setFormData(prev => ({
      ...prev,
      sideEffects: prev.sideEffects.filter((_, i) => i !== index)
    }));
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFormData(prev => ({ ...prev, images: [] }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file.');
       e.target.value = '';
      return;
    }

    const maxSizeInMB = 4;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setImageError(`Image must be smaller than ${maxSizeInMB}MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        images: reader.result ? [reader.result] : []
      }));
      setImageError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      images: []
    }));
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const drugData = {
      drugName: formData.drugName.trim(),
      sideEffects: formData.sideEffects,
      type: formData.type,
      price: parseFloat(formData.price),
      category: formData.category || undefined,
      description: formData.description.trim() || undefined,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      prescriptionRequired: formData.prescriptionRequired,
      images: formData.images?.filter(Boolean) || [],
      isActive: formData.isActive
    };

    if (isEditing) {
      updateMutation.mutate({ id: editingDrug._id, drugData });
    } else {
      createMutation.mutate(drugData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Edit Drug' : 'Add New Drug'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Drug Name */}
            <div>
              <label htmlFor="drugName" className="block text-sm font-medium text-gray-700 mb-2">
                Drug Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="drugName"
                name="drugName"
                value={formData.drugName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Paracetamol 500mg"
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                >
                  {DRUG_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  {DRUG_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drug Image
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div
                  onClick={triggerFileSelect}
                  className={`relative flex items-center justify-center rounded-lg border-2 border-dashed ${
                    formData.images && formData.images.length > 0
                      ? 'border-transparent bg-white'
                      : 'border-purple-300 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50'
                  } cursor-pointer transition-colors duration-200 min-h-[12rem] overflow-hidden`}
                >
                  {formData.images && formData.images.length > 0 ? (
                    <>
                      <img
                        src={formData.images[0]}
                        alt="Drug preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="absolute top-3 right-3 bg-white bg-opacity-90 text-gray-700 rounded-full p-2 shadow hover:text-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center px-6">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white text-purple-600 shadow mb-3">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-purple-700">Add image</p>
                      <p className="mt-1 text-xs text-purple-500">
                        Click to upload. JPG, PNG or WEBP. Max 4MB.
                      </p>
                    </div>
                  )}
                </div>
                {imageError && (
                  <p className="text-sm text-red-500">
                    {imageError}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter drug description..."
              />
            </div>

            {/* Side Effects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Side Effects
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sideEffectInput}
                  onChange={(e) => setSideEffectInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSideEffect();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter side effect and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddSideEffect}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.sideEffects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.sideEffects.map((effect, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                    >
                      {effect}
                      <button
                        type="button"
                        onClick={() => handleRemoveSideEffect(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="prescriptionRequired"
                  checked={formData.prescriptionRequired}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Prescription Required</span>
              </label>

              {isEditing && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active (Available for purchase)</span>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.drugName.trim() || !formData.price}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Drug' : 'Add Drug'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

