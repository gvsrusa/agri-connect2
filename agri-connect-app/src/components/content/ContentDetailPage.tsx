'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ContentItem } from '@/lib/contentActions';

export interface ContentDetailPageProps {
  /**
   * The topic key from the URL params
   */
  topicKey: string;
  
  /**
   * Function to fetch content for the specific topic
   */
  fetchContentFunction: (topicKey: string, locale: string) => Promise<{ data: ContentItem | null; error: string | null }>;
  
  /**
   * Translation namespace for the content type (e.g., "CropAdvisory", "PostHarvest")
   */
  translationNamespace: string;
  
  /**
   * Translation key for the back button text within the namespace
   */
  backButtonTextKey: string;
  
  /**
   * Path for the back link (e.g., "/crop-advisory", "/post-harvest-guidance")
   */
  backLinkPath: string;
  
  /**
   * Optional CSS class for the category badge
   */
  categoryBadgeClassName?: string;
  
  /**
   * Translation key for the view all topics link text within the namespace
   */
  viewAllTopicsKey: string;
}

export default function ContentDetailPage({
  topicKey,
  fetchContentFunction,
  translationNamespace,
  backButtonTextKey,
  backLinkPath,
  categoryBadgeClassName = "bg-blue-100 text-blue-800",
  viewAllTopicsKey,
}: ContentDetailPageProps) {
  const t = useTranslations(translationNamespace);
  const commonT = useTranslations('Common');
  const categoriesT = useTranslations('categories');
  const locale = useLocale();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContentData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchContentFunction(topicKey, locale);
        if (result.error) {
          console.error(`Error fetching content for topic ${topicKey}:`, result.error);
          setError(t('errors.loadingContent'));
        } else if (result.data) {
          setContent(result.data);
        } else {
          setError(t('errors.contentNotFound'));
        }
      } catch (err) {
        console.error('Error in fetchContentData:', err);
        setError(t('errors.generalError'));
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [topicKey, locale, t, fetchContentFunction]);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <button
        onClick={handleBackClick}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <span className="mr-2">&larr;</span> {t(backButtonTextKey)}
      </button>

      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">{commonT('loading')}</p>
        </div>
      ) : error ? (
        <div className="py-4 px-6 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      ) : content ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {content.image_url && (
            <div className="relative w-full h-64 md:h-96">
              <Image
                src={content.image_url}
                alt={content.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
            {content.category_key && (
              <div className="mb-4">
                <span className={`${categoryBadgeClassName} text-xs font-medium px-2.5 py-0.5 rounded`}>
                  {categoriesT(content.category_key)}
                </span>
              </div>
            )}
            <div className="prose max-w-none">
              {content.body_text.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <Link
                href={`/${locale}${backLinkPath}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t(viewAllTopicsKey)} &rarr;
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-lg">
          <p>{t('contentNotFound')}</p>
        </div>
      )}
    </div>
  );
}