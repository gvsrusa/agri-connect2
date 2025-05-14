import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// This file exports the default config for next-intl

export default getRequestConfig(async ({locale}) => {
  // Define locales for validation within this config scope
  const supportedLocales = ['en', 'hi', 'mr'];

  // Validate that the incoming `locale` parameter is valid
  if (!supportedLocales.includes(locale as any)) {
    notFound();
  }

  return {
    locale: locale as string, // Assert locale as string after validation
    messages: (await import(`./locales/${locale}.json`)).default // Path relative to app/i18n.ts
  };
});

// Export locales for use in other components
export const locales = ['en', 'hi', 'mr'];