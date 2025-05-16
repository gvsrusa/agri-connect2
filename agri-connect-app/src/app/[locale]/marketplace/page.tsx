import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getAllProduceListings } from '@/lib/marketplaceActions';
import ListingCard from '@/components/marketplace/ListingCard';

export default async function MarketplacePage() {
  const t = useTranslations('Marketplace');
  
  // Fetch all produce listings
  const { data: listings, error } = await getAllProduceListings();
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-gray-600">{t('welcome')}</p>
        </div>
        <Link 
          href="./marketplace/list-crop" 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          {t('listCrop')}
        </Link>
      </div>
      
      {/* Placeholder for filters and sorting */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="crop-filter" className="block text-sm font-medium text-gray-700 mb-1">
              {t('filterByCrop')}
            </label>
            <select 
              id="crop-filter"
              className="p-2 border border-gray-300 rounded"
              defaultValue="all"
            >
              <option value="all">{t('all')}</option>
              {/* Ideally, this would be populated from a list of unique crop types */}
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Tomatoes">Tomatoes</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              {t('sort')}
            </label>
            <select 
              id="sort"
              className="p-2 border border-gray-300 rounded"
              defaultValue="newest"
            >
              <option value="newest">{t('sortByDate')}</option>
              <option value="price-low">{t('sortByPrice')} (Low to High)</option>
              <option value="price-high">{t('sortByPrice')} (High to Low)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Listings display */}
      {error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {t('errorLoading')}
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {t('noListings')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.listing_id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}