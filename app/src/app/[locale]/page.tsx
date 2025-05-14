"use client";

import Image from 'next/image'; // Keep if a logo or image is desired on the home page
import { useParams } from 'next/navigation';

// Direct import of translation files to avoid useTranslations issues
const translations = {
  en: {
    HomePage: {
      logoAlt: 'AgriConnect Logo',
      title: 'Welcome to AgriConnect',
      welcomeMessage: 'Connecting farmers, buyers, and agricultural experts in one place.',
      getStartedPrompt: 'Sign in to get started with your agricultural journey.'
    }
  },
  hi: {
    HomePage: {
      logoAlt: 'एग्रीकनेक्ट लोगो',
      title: 'एग्रीकनेक्ट में आपका स्वागत है',
      welcomeMessage: 'किसानों, खरीदारों और कृषि विशेषज्ञों को एक ही स्थान पर जोड़ना।',
      getStartedPrompt: 'अपनी कृषि यात्रा शुरू करने के लिए साइन इन करें।'
    }
  },
  mr: {
    HomePage: {
      logoAlt: 'अॅग्रीकनेक्ट लोगो',
      title: 'अॅग्रीकनेक्टमध्ये आपले स्वागत आहे',
      welcomeMessage: 'शेतकरी, खरेदीदार आणि कृषी तज्ञांना एकाच ठिकाणी जोडणे.',
      getStartedPrompt: 'आपल्या कृषी प्रवासास सुरुवात करण्यासाठी साइन इन करा.'
    }
  }
};

export default function HomePage() {
  const params = useParams();
  // Default to English if locale not found
  const locale = (params.locale as string) || 'en';
  
  // Simpler translation function with type safety
  const t = (key: string) => {
    const currentTranslations = translations[locale as keyof typeof translations] || translations.en;
    return (currentTranslations.HomePage as Record<string, string>)[key] || key;
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <Image
        className="dark:invert mb-8" // Basic styling for a logo
        src="/next.svg" // Placeholder, ideally this would be AgriConnect logo
        alt={t('logoAlt')}
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