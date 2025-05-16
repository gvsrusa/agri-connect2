import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatDistance } from 'date-fns';
import type { ProduceListing } from '@/lib/marketplaceActions';

type ListingCardProps = {
  listing: ProduceListing;
};

export default function ListingCard({ listing }: ListingCardProps) {
  const t = useTranslations('Marketplace');
  
  // Format the date to relative time (e.g., "2 days ago")
  const formattedDate = listing.created_at 
    ? formatDistance(new Date(listing.created_at), new Date(), { addSuffix: true })
    : '';
  
  // Format price with 2 decimal places and currency symbol
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(listing.price);
  
  return (
    <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{listing.crop_type}</h3>
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs uppercase">
          {listing.status}
        </div>
      </div>
      
      <div className="mt-2 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">{t('quantity')}:</span>
          <span className="font-medium">
            {listing.quantity} kg
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">{t('price')}:</span>
          <span className="font-medium">
            {formattedPrice}/kg
          </span>
        </div>
        
        {listing.description && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {formattedDate}
        </div>
        <Link 
          href={`./marketplace/listing/${listing.listing_id}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {t('viewDetails')}
        </Link>
      </div>
    </div>
  );
}