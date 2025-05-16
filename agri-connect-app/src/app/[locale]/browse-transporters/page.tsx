'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getTransporters } from '@/lib/transportActions';
import Link from 'next/link';
import { Transporter } from '@/lib/transportActions';

export default function BrowseTransportersPage() {
  const t = useTranslations('BrowseTransporters');
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransporters() {
      try {
        const { data, error } = await getTransporters();
        
        if (error) {
          throw new Error(error);
        }
        
        setTransporters(data || []);
      } catch (err) {
        console.error('Error fetching transporters:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : t('errors.loadingTransporters')
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTransporters();
  }, [t]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <p className="text-gray-600 mb-8">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('description')}</p>
      
      {transporters.length === 0 ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{t('noTransporters')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transporters.map((transporter) => (
            <div 
              key={transporter.transporter_id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">{transporter.name}</h2>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700">{t('serviceAreasLabel')}</h3>
                  <p>{transporter.service_areas || t('notSpecified')}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700">{t('capacityLabel')}</h3>
                  <p>{transporter.capacity || t('notSpecified')}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700">{t('contactInfoLabel')}</h3>
                  {transporter.contact_info ? (
                    <p>{transporter.contact_info}</p>
                  ) : (
                    <p className="text-gray-500 italic">{t('contactInfoProtected')}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{t('contactInfoNote')}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4">
                <Link 
                  href="./request-transportation" 
                  className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {t('requestTransportCTA')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}