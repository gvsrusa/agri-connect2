'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useLanguage } from '@/context/LanguageProvider';
import { useTranslations } from 'next-intl';

export default function Header() {
  const t = useTranslations('Header');
  const { currentLocale, availableLanguages, changeLanguage, isLoadingLanguages } = useLanguage();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(event.target.value);
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={`/${currentLocale}`} className="text-xl font-bold">
          AgriConnect {/* Site title might not need translation or could be a global one */}
        </Link>
        <nav className="space-x-4">
          <Link href={`/${currentLocale}/marketplace`} className="hover:text-gray-300">{t('marketplace')}</Link>
          <Link href={`/${currentLocale}/market-prices`} className="hover:text-gray-300">{t('marketPrices')}</Link>
          <Link href={`/${currentLocale}/crop-advisory`} className="hover:text-gray-300">{t('cropAdvisory')}</Link>
          <Link href={`/${currentLocale}/post-harvest-guidance`} className="hover:text-gray-300">{t('postHarvestGuidance')}</Link>
          <Link href={`/${currentLocale}/request-transportation`} className="hover:text-gray-300">{t('requestTransportation')}</Link>
          <Link href={`/${currentLocale}/browse-transporters`} className="hover:text-gray-300">{t('browseTransporters')}</Link>
          <Link href={`/${currentLocale}/submit-feedback`} className="hover:text-gray-300">{t('submitFeedback')}</Link>
        </nav>
        <div className="flex items-center space-x-4">
          {isLoadingLanguages ? (
            <div className="text-sm">Loading langs...</div>
          ) : (
            <select
              value={currentLocale}
              onChange={handleLanguageChange}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
              aria-label="Select language"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native_name || lang.name}
                </option>
              ))}
            </select>
          )}
          <div className="space-x-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  {t('signIn')}
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  {t('signUp')}
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              <Link href={`/${currentLocale}/user-profile`} className="ml-2">
                <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                  {t('profile')}
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}