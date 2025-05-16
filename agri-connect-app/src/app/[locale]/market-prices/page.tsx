'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getDistinctCropNameKeys, getDistinctMarketNameKeys, getMarketPrice } from '@/lib/marketPriceActions';
import { format } from 'date-fns';

export interface MarketPriceData {
  id: string;
  crop_name_key: string;
  market_name_key: string;
  price: number;
  currency: string;
  unit_key: string;
  price_date: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export default function MarketPricesPage() {
  const t = useTranslations();
  const [crops, setCrops] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [priceData, setPriceData] = useState<MarketPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available crops and markets on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch crops
        const cropsResult = await getDistinctCropNameKeys();
        if (cropsResult.error) {
          console.error('Error fetching crops:', cropsResult.error);
          setError(t('MarketPrices.errors.loadingCrops'));
        } else if (cropsResult.data) {
          setCrops(cropsResult.data);
        }

        // Fetch markets
        const marketsResult = await getDistinctMarketNameKeys();
        if (marketsResult.error) {
          console.error('Error fetching markets:', marketsResult.error);
          setError(t('MarketPrices.errors.loadingMarkets'));
        } else if (marketsResult.data) {
          setMarkets(marketsResult.data);
        }
      } catch (err) {
        console.error('Error in fetchFilters:', err);
        setError(t('MarketPrices.errors.generalError'));
      }
    };

    fetchFilters();
  }, [t]);

  // Fetch price data when both crop and market are selected
  useEffect(() => {
    const fetchPriceData = async () => {
      if (!selectedCrop || !selectedMarket) return;

      setLoading(true);
      setError(null);
      setPriceData(null);

      try {
        const result = await getMarketPrice(selectedCrop, selectedMarket);
        if (result.error) {
          console.error('Error fetching price data:', result.error);
          setError(t('MarketPrices.errors.loadingPrice'));
        } else if (result.data) {
          setPriceData(result.data);
        } else {
          setError(t('MarketPrices.errors.priceNotFound'));
        }
      } catch (err) {
        console.error('Error in fetchPriceData:', err);
        setError(t('MarketPrices.errors.generalError'));
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [selectedCrop, selectedMarket, t]);

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCrop(e.target.value);
  };

  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMarket(e.target.value);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">{t('MarketPrices.title')}</h1>
      <p className="mb-6">{t('MarketPrices.description')}</p>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Crop Selection */}
          <div>
            <label htmlFor="crop-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t('MarketPrices.selectCrop')}
            </label>
            <select
              id="crop-select"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedCrop}
              onChange={handleCropChange}
            >
              <option value="">{t('MarketPrices.chooseCrop')}</option>
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {t(`crops.${crop}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Market Selection */}
          <div>
            <label htmlFor="market-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t('MarketPrices.selectMarket')}
            </label>
            <select
              id="market-select"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedMarket}
              onChange={handleMarketChange}
            >
              <option value="">{t('MarketPrices.chooseMarket')}</option>
              {markets.map((market) => (
                <option key={market} value={market}>
                  {t(`markets.${market}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display price data */}
        <div className="mt-8">
          {loading && (
            <div className="py-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">{t('Common.loading')}</p>
            </div>
          )}

          {error && (
            <div className="py-4 px-4 bg-red-50 text-red-700 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {priceData && !loading && !error && (
            <div className="bg-gray-50 p-6 rounded-md">
              <h2 className="text-xl font-semibold mb-4">
                {t('MarketPrices.priceInformation')}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">{t('MarketPrices.crop')}</p>
                  <p className="font-medium">{t(`crops.${priceData.crop_name_key}`)}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t('MarketPrices.market')}</p>
                  <p className="font-medium">{t(`markets.${priceData.market_name_key}`)}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t('MarketPrices.price')}</p>
                  <p className="font-medium text-lg">
                    {priceData.price} {priceData.currency}/{t(`units.${priceData.unit_key}`)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">{t('MarketPrices.priceDate')}</p>
                  <p className="font-medium">
                    {format(new Date(priceData.price_date), 'PPP')}
                  </p>
                </div>
                {priceData.source && (
                  <div className="col-span-2">
                    <p className="text-gray-600">{t('MarketPrices.source')}</p>
                    <p className="font-medium">{priceData.source}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedCrop && !selectedMarket && !loading && !error && (
            <p className="text-center text-gray-500 py-4">
              {t('MarketPrices.selectBothPrompt')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}