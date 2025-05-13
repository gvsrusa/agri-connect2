import { useTranslations } from 'next-intl';
import Image from 'next/image'; // Keep if a logo or image is desired on the home page

export default function HomePage() {
  const t = useTranslations('HomePage');
  // const tNav = useTranslations('Navigation'); // Navigation is now in Navbar.tsx

  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <Image
        className="dark:invert mb-8" // Basic styling for a logo
        src="/next.svg" // Placeholder, ideally this would be AgriConnect logo
        alt={t('logoAlt')} // Add alt text to translations
        width={180}
        height={38}
        priority
      />
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        {t('welcomeMessage')}
      </p>
      <p className="text-md text-gray-600 dark:text-gray-400">
        {t('getStartedPrompt')}
      </p>
      {/* Add more relevant homepage content here */}
    </div>
  );
}