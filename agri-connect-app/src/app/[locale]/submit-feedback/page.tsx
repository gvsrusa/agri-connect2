'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@clerk/nextjs';
import { submitUserFeedback } from '@/lib/feedbackActions';

type FormData = {
  rating: number | null;
  comments: string;
  page_context: string;
};

type FormErrors = {
  rating?: string;
  comments?: string;
};

export default function SubmitFeedbackPage() {
  const t = useTranslations('Feedback');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const { userId, isSignedIn } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    rating: null,
    comments: '',
    page_context: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (formData.rating !== null && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = t('errors.ratingInvalid');
    }
    
    if (!formData.comments.trim()) {
      newErrors.comments = t('errors.commentsRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRatingChange = (rating: number) => {
    setFormData({
      ...formData,
      rating,
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await submitUserFeedback({
        user_id: isSignedIn ? userId : undefined,
        rating: formData.rating !== null ? formData.rating : undefined,
        comments: formData.comments,
        page_context: formData.page_context || undefined,
      });
      
      if (error) {
        throw new Error(error);
      }
      
      // Reset form and redirect to success page
      setFormData({
        rating: null,
        comments: '',
        page_context: '',
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
  
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p className="font-bold">{t('successMessage')}</p>
        </div>
        <a 
          href="./submit-feedback" 
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
      
      {!isSignedIn && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{t('anonymousFeedbackNote')}</p>
        </div>
      )}
      
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {t('ratingLabel')}
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingChange(rating)}
                className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none ${
                  formData.rating === rating
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label={`${rating} ${t('starRating')}`}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <span>{t('rating1Label')}</span>
            <span>{t('rating5Label')}</span>
          </div>
          {errors.rating && (
            <p className="text-red-500 text-xs italic mt-1">{errors.rating}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comments">
            {t('commentsLabel')}
          </label>
          <textarea 
            className={`shadow appearance-none border ${
              errors.comments ? 'border-red-500' : 'border-gray-300'
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="comments" 
            name="comments" 
            rows={4}
            placeholder={t('commentsPlaceholder')}
            value={formData.comments}
            onChange={handleChange}
            required
          />
          {errors.comments && (
            <p className="text-red-500 text-xs italic">{errors.comments}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="page_context">
            {t('pageContextLabel')}
          </label>
          <input 
            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="page_context" 
            name="page_context" 
            type="text" 
            placeholder={t('pageContextPlaceholder')}
            value={formData.page_context}
            onChange={handleChange}
          />
          <p className="text-gray-500 text-xs italic mt-1">{t('pageContextHelp')}</p>
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