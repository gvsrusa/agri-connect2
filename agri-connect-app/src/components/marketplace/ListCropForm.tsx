'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@clerk/nextjs';
import { createProduceListing } from '@/lib/marketplaceActions';

type FormData = {
  crop_type: string;
  quantity: number;
  price: number;
  description: string;
};

type FormErrors = {
  crop_type?: string;
  quantity?: string;
  price?: string;
  description?: string;
};

export default function ListCropForm() {
  const t = useTranslations('ListCropForm');
  const router = useRouter();
  const { userId } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    crop_type: '',
    quantity: 0,
    price: 0,
    description: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.crop_type.trim()) {
      newErrors.crop_type = t('errors.cropTypeRequired');
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = t('errors.quantityRequired');
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = t('errors.priceRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' || name === 'price' 
        ? parseFloat(value) || 0 
        : value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) return;
    if (!userId) {
      setSubmitError(t('errors.notAuthenticated'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await createProduceListing({
        crop_type: formData.crop_type,
        quantity: formData.quantity,
        price: formData.price,
        description: formData.description,
        status: 'available',
      });
      
      if (error) {
        throw new Error(error);
      }
      
      // Reset form and redirect to marketplace
      setFormData({
        crop_type: '',
        quantity: 0,
        price: 0,
        description: '',
      });
      
      router.push('./marketplace');
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error 
          ? err.message 
          : t('errors.submissionFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{t('title')}</h2>
      
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="crop_type" className="block text-sm font-medium text-gray-700 mb-1">
            {t('cropTypeLabel')} *
          </label>
          <input
            type="text"
            id="crop_type"
            name="crop_type"
            value={formData.crop_type}
            onChange={handleChange}
            className={`w-full rounded-md border ${
              errors.crop_type ? 'border-red-500' : 'border-gray-300'
            } p-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200`}
          />
          {errors.crop_type && (
            <p className="mt-1 text-sm text-red-600">{errors.crop_type}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            {t('quantityLabel')} (kg) *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="0"
            step="0.01"
            value={formData.quantity || ''}
            onChange={handleChange}
            className={`w-full rounded-md border ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            } p-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200`}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            {t('priceLabel')} (₹/kg) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="0.01"
            value={formData.price || ''}
            onChange={handleChange}
            className={`w-full rounded-md border ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            } p-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200`}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {t('descriptionLabel')}
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}