import React from 'react';
import { useTranslations } from 'next-intl';
import ListCropForm from '@/components/marketplace/ListCropForm';

// This route is protected by middleware.ts which redirects unauthenticated users
export default function ListCropPage() {
  const t = useTranslations('ListCropForm');
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <ListCropForm />
    </div>
  );
}