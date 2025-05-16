'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@clerk/nextjs';
import { createTransportRequest } from '@/lib/transportActions';

type FormData = {
  produce_type: string;
  quantity: string;
  pickup_location: string;
  destination_location: string;
  date_needed: string;
};

type FormErrors = {
  produce_type?: string;
  quantity?: string;
  pickup_location?: string;
  destination_location?: string;
  date_needed?: string;
};

export default function RequestTransportationPage() {
  const t = useTranslations('TransportRequest');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const { userId } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    produce_type: '',
    quantity: '',
    pickup_location: '',
    destination_location: '',
    date_needed: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.produce_type.trim()) {
      newErrors.produce_type = t('errors.produceTypeRequired');
    }
    
    if (!formData.quantity.trim()) {
      newErrors.quantity = t('errors.quantityRequired');
    }
    
    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = t('errors.pickupLocationRequired');
    }
    
    if (!formData.destination_location.trim()) {
      newErrors.destination_location = t('errors.destinationLocationRequired');
    }
    
    if (!formData.date_needed) {
      newErrors.date_needed = t('errors.dateNeededRequired');
    } else {
      // Check if date is in the past
      const selectedDate = new Date(formData.date_needed);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date_needed = t('errors.dateInPast');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
      const { data, error } = await createTransportRequest({
        farmer_user_id: userId,
        produce_type: formData.produce_type,
        quantity: formData.quantity,
        pickup_location: formData.pickup_location,
        destination_location: formData.destination_location,
        date_needed: formData.date_needed,
      });
      
      if (error) {
        throw new Error(error);
      }
      
      // Reset form and redirect to success page
      setFormData({
        produce_type: '',
        quantity: '',
        pickup_location: '',
        destination_location: '',
        date_needed: '',
      });
      
      router.push('?success=true');
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
  
  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{t('errors.notAuthenticated')}</p>
          <a 
            href="./sign-in" 
            className="mt-2 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {t('signIn')}
          </a>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p className="font-bold">{t('successMessage')}</p>
        </div>
        <a 
          href="./request-transportation" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {t('submitAnother')}
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <p className="mb-6">{t('instructions')}</p>
      
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="produce_type">
            {t('produceTypeLabel')}
          </label>
          <input 
            className={`shadow appearance-none border ${
              errors.produce_type ? 'border-red-500' : 'border-gray-300'
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="produce_type" 
            name="produce_type" 
            type="text" 
            placeholder={t('produceTypePlaceholder')}
            value={formData.produce_type}
            onChange={handleChange}
            required
          />
          {errors.produce_type && (
            <p className="text-red-500 text-xs italic">{errors.produce_type}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
            {t('quantityLabel')}
          </label>
          <input 
            className={`shadow appearance-none border ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="quantity" 
            name="quantity" 
            type="text" 
            placeholder={t('quantityPlaceholder')}
            value={formData.quantity}
            onChange={handleChange}
            required
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs italic">{errors.quantity}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pickup_location">
            {t('pickupLocationLabel')}
          </label>
          <input 
            className={`shadow appearance-none border ${
              errors.pickup_location ? 'border-red-500' : 'border-gray-300'
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="pickup_location" 
            name="pickup_location" 
            type="text" 
            placeholder={t('pickupLocationPlaceholder')}
            value={formData.pickup_location}
            onChange={handleChange}
            required
          />
          {errors.pickup_location && (
            <p className="text-red-500 text-xs italic">{errors.pickup_location}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination_location">
            {t('destinationLocationLabel')}
          </label>
          <input 
            className={`shadow appearance-none border ${
              errors.destination_location ? 'border-red-500' : 'border-gray-300'
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="destination_location" 
            name="destination_location" 
            type="text" 
            placeholder={t('destinationLocationPlaceholder')}
            value={formData.destination_location}
            onChange={handleChange}
            required
          />
          {errors.destination_location && (
            <p className="text-red-500 text-xs italic">{errors.destination_location}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date_needed">
            {t('dateNeededLabel')}
          </label>
          <input 
            className={`shadow appearance-none border ${
              errors.date_needed ? 'border-red-500' : 'border-gray-300'
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="date_needed" 
            name="date_needed" 
            type="date" 
            value={formData.date_needed}
            onChange={handleChange}
            required
          />
          {errors.date_needed && (
            <p className="text-red-500 text-xs italic">{errors.date_needed}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}