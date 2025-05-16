'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export interface Topic {
  topic_key: string;
  title: string;
  category_key?: string;
}

export interface ContentListPageProps {
  /**
   * Function to fetch topics for the content type
   */
  fetchTopicsFunction: (locale: string) => Promise<{ data: Topic[] | null; error: string | null }>;
  
  /**
   * Translation namespace for the content type (e.g., "CropAdvisory", "PostHarvest")
   */
  translationNamespace: string;
  
  /**
   * Path prefix for the detail page (e.g., "crop-advisory", "post-harvest-guidance")
   */
  detailPagePathPrefix: string;
  
  /**
   * Translation key for the page title within the namespace
   */
  pageTitleKey: string;
  
  /**
   * Translation key for the page description within the namespace
   */
  descriptionKey: string;
  
  /**
   * Translation key for the "read more" prompt within the namespace
   */
  readMorePromptKey: string;
  
  /**
   * Translation key for the "view topic" text within the namespace
   */
  viewTopicKey: string;
  
  /**
   * Translation key for the "no topics found" message within the namespace
   */
  noTopicsFoundKey: string;
}

export default function ContentListPage({
  fetchTopicsFunction,
  translationNamespace,
  detailPagePathPrefix,
  pageTitleKey,
  descriptionKey,
  readMorePromptKey,
  viewTopicKey,
  noTopicsFoundKey,
}: ContentListPageProps) {
  const t = useTranslations(translationNamespace);
  const commonT = useTranslations('Common');
  const router = useRouter();
  const locale = useLocale();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const result = await fetchTopicsFunction(locale);
        if (result.error) {
          console.error(`Error fetching ${translationNamespace} topics:`, result.error);
          setError(t('errors.loadingTopics'));
        } else if (result.data) {
          setTopics(result.data);
        } else {
          setTopics([]);
        }
      } catch (err) {
        console.error(`Error in fetchTopics for ${translationNamespace}:`, err);
        setError(t('errors.generalError'));
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [locale, t, fetchTopicsFunction, translationNamespace]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">{t(pageTitleKey)}</h1>
      <p className="mb-8">{t(descriptionKey)}</p>

      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">{commonT('loading')}</p>
        </div>
      ) : error ? (
        <div className="py-4 px-6 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 rounded-lg">
          <p>{t(noTopicsFoundKey)}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Link
              key={topic.topic_key}
              href={`/${locale}/${detailPagePathPrefix}/${topic.topic_key}`}
              className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{topic.title}</h2>
                <p className="text-gray-600 mb-4">{t(readMorePromptKey)}</p>
                <div className="text-blue-600 font-medium">
                  {t(viewTopicKey)} &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}