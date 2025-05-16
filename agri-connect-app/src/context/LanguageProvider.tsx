'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useUser } from '@clerk/nextjs'; // Added for auth state
import { getLanguages, getUserPreferredLanguage, upsertUserProfile } from '@/lib/supabaseActions';
import type { Language } from '@/lib/supabaseActions'; // Import type

// Removed local Language interface, using imported one

interface LanguageContextType {
  currentLocale: string;
  availableLanguages: Language[];
  changeLanguage: (newLocale: string) => void;
  isLoadingLanguages: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Removed placeholder fetchLanguagesFromDB as we use getLanguages from supabaseActions

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const intlLocale = useLocale(); // from next-intl, renamed to avoid clash
  const { user, isSignedIn, isLoaded: isUserLoaded } = useUser();

  const [currentLocale, setCurrentLocale] = useState<string>(intlLocale);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState<boolean>(true);

  useEffect(() => {
    // Set initial locale from next-intl
    setCurrentLocale(intlLocale);
  }, [intlLocale]);

  useEffect(() => {
    const loadAvailableLanguages = async () => {
      setIsLoadingLanguages(true);
      try {
        const langs = await getLanguages();
        if (langs && langs.length > 0) {
          setAvailableLanguages(langs);
        } else {
          // Fallback if DB returns empty or error handled in getLanguages
          setAvailableLanguages([
            { code: 'en', name: 'English (Default)' },
            { code: 'hi', name: 'Hindi' },
            { code: 'mr', name: 'Marathi' },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch languages for provider:", error);
        setAvailableLanguages([
            { code: 'en', name: 'English (Error Fallback)' },
        ]);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    loadAvailableLanguages();
  }, []);
  
  useEffect(() => {
    if (!isUserLoaded) return; // Wait for Clerk user to be loaded

    const determineInitialLocale = async () => {
      let preferredLocale: string | null = null;
      let userProfileExists = false;

      if (isSignedIn && user?.id) {
        preferredLocale = await getUserPreferredLanguage(user.id);
        if (preferredLocale) {
          userProfileExists = true;
        } else {
          // No preferred language found, profile might not exist or lang is null
          // Let's try to create/update it with a default 'en' if it doesn't exist
          // upsertUserProfile will handle creation with 'en' if no language is passed
          // and it's a new user.
          const profile = await upsertUserProfile(user.id); // Ensure profile exists
          if (profile) {
            preferredLocale = profile.preferred_language_code; // Should be 'en' if newly created
            userProfileExists = true;
          }
        }
      } else {
        preferredLocale = localStorage.getItem('preferredLanguage');
      }

      if (preferredLocale && availableLanguages.some(l => l.code === preferredLocale) && preferredLocale !== intlLocale) {
        // If a valid preference is found (DB or localStorage) and it's different from current intl-locale, change to it.
        // The `skipPersistence` flag in changeLanguage is true here because we've just fetched/ensured it.
        changeLanguage(preferredLocale, true);
      } else if (!preferredLocale && isSignedIn && user?.id && !userProfileExists) {
        // This case should ideally be covered by the upsertUserProfile above.
        // If user is signed in, profile was attempted to be created, and still no locale, default to 'en'.
        // This might happen if upsert failed silently or didn't return a new locale.
        // We ensure 'en' is set as current and persisted.
        const defaultFallbackLocale = 'en';
        if (availableLanguages.some(l => l.code === defaultFallbackLocale) && defaultFallbackLocale !== intlLocale) {
            changeLanguage(defaultFallbackLocale, false); // Persist this default for the new/updated user
        } else {
            setCurrentLocale(intlLocale); // Fallback to intl locale if 'en' is already it or not available
        }
      } else if (intlLocale !== currentLocale) {
        // Sync with next-intl's locale if no other preference is applicable
         setCurrentLocale(intlLocale);
      }
    };

    if (availableLanguages.length > 0) {
        determineInitialLocale();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoaded, isSignedIn, user?.id, intlLocale, availableLanguages]); // Removed currentLocale from deps to avoid loops with setCurrentLocale


  const changeLanguage = async (newLocale: string, skipPersistence: boolean = false) => {
    if (availableLanguages.some(lang => lang.code === newLocale)) {
      setCurrentLocale(newLocale);
      
      const currentPathWithoutLocale = pathname.startsWith(`/${intlLocale}`)
        ? pathname.substring(`/${intlLocale}`.length)
        : pathname;
      const newPath = `/${newLocale}${currentPathWithoutLocale || '/'}`;
      router.push(newPath);

      if (!skipPersistence) {
        if (isSignedIn && user?.id) {
          try {
            await upsertUserProfile(user.id, newLocale);
          } catch (e) {
            console.error("Failed to save language preference to Supabase", e);
          }
        } else {
          localStorage.setItem('preferredLanguage', newLocale);
        }
      }
    } else {
      console.warn(`Attempted to switch to unsupported locale: ${newLocale}`);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLocale, availableLanguages, changeLanguage, isLoadingLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};