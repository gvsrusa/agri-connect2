'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import React, { ChangeEvent, useTransition, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const LanguageSwitcher = () => {
  const t = useTranslations('LanguageSwitcher');
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isSignedIn } = useUser(); // isSignedIn can also be useful
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const getPathWithoutLocale = (path: string, locale: string) => {
    const localePrefix = `/${locale}`;
    if (path.startsWith(localePrefix)) {
      const newPath = path.substring(localePrefix.length);
      return newPath || '/';
    }
    return path;
  };

  const basePath = getPathWithoutLocale(pathname, currentLocale);

  const locales = [
    { code: 'en', name: t('english') },
    { code: 'hi', name: t('hindi') },
    { code: 'mr', name: t('marathi') },
  ];

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    setError(null); // Clear previous errors

    // Set cookie for all users as a fallback or primary for unauthenticated
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`; // 1 year, SameSite for security

    if (isSignedIn && user) {
      try {
        const response = await fetch('/api/user/update-language', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language: newLocale }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to update language preference in DB:', errorData);
          setError(t('Error.generic')); // Show a generic error to the user
          // Optionally, don't switch locale if DB update fails, or revert cookie
        } else {
          console.log(`Language preference updated in DB for user ${user.id} to ${newLocale}`);
        }
      } catch (apiError) {
        console.error('API call failed to update language preference:', apiError);
        setError(t('Error.generic'));
      }
    }

    startTransition(() => {
      router.replace(`/${newLocale}${basePath}`);
    });
  };

  return (
    <div className="flex flex-col items-end space-y-1">
      <div className="flex items-center space-x-2">
        <label htmlFor="language-select" className="sr-only">
          {t('selectLanguage')}
        </label>
        <select
          id="language-select"
          value={currentLocale}
          onChange={handleChange}
          disabled={isPending}
          className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-600 cursor-pointer"
          aria-label={t('selectLanguage')}
        >
          {locales.map((locale) => (
            <option key={locale.code} value={locale.code}>
              {locale.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default LanguageSwitcher;