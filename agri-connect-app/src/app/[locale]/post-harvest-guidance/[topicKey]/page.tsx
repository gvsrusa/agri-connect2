'use client';

import { getPostHarvestContent } from '@/lib/contentActions';
import ContentDetailPage from '@/components/content/ContentDetailPage';

interface PostHarvestDetailPageProps {
  params: {
    topicKey: string;
  };
}

export default function PostHarvestDetailPage({ params }: PostHarvestDetailPageProps) {
  const { topicKey } = params;
  
  return (
    <ContentDetailPage
      topicKey={topicKey}
      fetchContentFunction={getPostHarvestContent}
      translationNamespace="PostHarvest"
      backButtonTextKey="backToTopics"
      backLinkPath="/post-harvest-guidance"
      categoryBadgeClassName="bg-green-100 text-green-800"
      viewAllTopicsKey="viewAllTopics"
    />
  );
}