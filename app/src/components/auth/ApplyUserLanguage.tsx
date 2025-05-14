'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { locales } from '../../../i18n'; // Import from app/i18n.ts

export function ApplyUserLanguage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const [languageApplied, setLanguageApplied] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && user.id && !languageApplied) {
      const fetchAndApplyLanguage = async () => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('preferred_language')
            .eq('clerk_user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user language preference:', error.message);
            setLanguageApplied(true); // Mark as applied to prevent retries on error
            return;
          }

          if (data && data.preferred_language) {
            const preferredLang = data.preferred_language;

            if (locales.includes(preferredLang) && preferredLang !== currentLocale) {
              const newPathname = pathname.replace(`/${currentLocale}`, `/${preferredLang}`);
              console.log(`User preference: ${preferredLang}, current: ${currentLocale}. Redirecting to ${newPathname}`);
              router.replace(newPathname);
              // setLanguageApplied(true) will be handled by re-render or if language is already correct
            } else {
              setLanguageApplied(true);
            }
          } else {
            setLanguageApplied(true);
          }
        } catch (e) {
          console.error('Exception fetching user language preference:', e);
          setLanguageApplied(true);
        }
      };

      fetchAndApplyLanguage();
    }
  }, [isLoaded, isSignedIn, user, currentLocale, pathname, router, languageApplied]);

  return null; // This component does not render anything
}