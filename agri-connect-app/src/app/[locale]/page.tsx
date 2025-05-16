import {useTranslations} from 'next-intl';

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-xl text-gray-600">{t('tagline')}</p>
      {/* Placeholder for additional homepage content */}
      <div className="mt-10 p-6 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold mb-3">Feature Highlights</h2>
        <ul className="list-disc list-inside text-left">
          <li>User Authentication (Sign-up, Sign-in, Sign-out)</li>
          <li>Language Selection (English, Hindi, Marathi)</li>
          <li>Marketplace (Coming Soon)</li>
          <li>Market Prices (Coming Soon)</li>
          <li>Crop Advisory (Coming Soon)</li>
        </ul>
      </div>
    </div>
  );
}