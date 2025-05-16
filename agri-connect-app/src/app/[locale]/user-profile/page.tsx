'use client';

import { UserProfile as ClerkUserProfile } from "@clerk/nextjs";
import { useTranslations } from 'next-intl';
import { useLanguage } from "@/context/LanguageProvider"; // To display current language

export default function UserProfilePage() {
  const t = useTranslations('UserProfile');
  const { currentLocale, availableLanguages } = useLanguage();

  const currentLanguageDetails = availableLanguages.find(lang => lang.code === currentLocale);

  return (
    <div className="flex flex-col items-center justify-start py-12 px-4">
      <h1 className="text-3xl font-semibold mb-4">{t('title')}</h1>
      <p className="mb-2">{t('welcome')}</p>
      {currentLanguageDetails && (
        <p className="mb-6 text-sm text-gray-600">
          Your current language preference is set to: {currentLanguageDetails.name} ({currentLanguageDetails.code})
        </p>
      )}
      <div className="w-full max-w-4xl">
        <ClerkUserProfile path="/user-profile" routing="path" />
      </div>
    </div>
  );
}