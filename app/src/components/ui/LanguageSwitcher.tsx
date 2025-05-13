'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation'; // Standard Next.js pathname
import Link from 'next-intl/link'; // next-intl's Link for locale-aware navigation
import React from 'react';

const LanguageSwitcher = () => {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('LanguageSwitcher'); // For potential translated labels

  // Function to remove current locale from pathname if present
  const getPathWithoutLocale = (path: string, locale: string) => {
    const localePrefix = `/${locale}`;
    if (path.startsWith(localePrefix)) {
      return path.substring(localePrefix.length) || '/';
    }
    return path;
  };

  const basePath = getPathWithoutLocale(pathname, currentLocale);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-300">{t('selectLanguage')}:</span>
      {currentLocale !== 'en' && (
        <Link href={basePath} locale="en" className="text-white hover:text-gray-300">
          EN
        </Link>
      )}
      {currentLocale !== 'hi' && (
        <Link href={basePath} locale="hi" className="text-white hover:text-gray-300">
          HI
        </Link>
      )}
    </div>
  );
};

export default LanguageSwitcher;